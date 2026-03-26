const { User, InsuranceRecord, Transaction } = require('../models');
const { PayOS } = require('@payos/node');
const crypto = require('crypto');

// Initialize PayOS
const payos = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

const getMyInsurance = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const user = await User.findByPk(userId, { include: ['position'] });
        const baseSalary = user && user.position ? parseFloat(user.position.base_salary || 0) : 0;
        const dynamicFee = baseSalary * 0.105;

        // Find or Create record for this month
        let [record, created] = await InsuranceRecord.findOrCreate({
            where: { user_id: userId, month: currentMonth, year: currentYear },
            defaults: {
                monthly_fee: dynamicFee,
                old_debt: 0,
                status: 'Unpaid'
            }
        });

        // Fetch history
        const history = await InsuranceRecord.findAll({
            where: { user_id: userId },
            order: [['year', 'DESC'], ['month', 'DESC']]
        });

        return res.status(200).json({
            currentRecord: {
                id: record.id,
                monthly_fee: record.monthly_fee,
                old_debt: record.old_debt,
                total_amount: parseFloat(record.monthly_fee) + parseFloat(record.old_debt),
                status: record.status
            },
            history
        });
    } catch (error) {
        console.error('Error fetching insurance:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const createPaymentLink = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const user = await User.findByPk(userId, { include: ['position'] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const baseSalary = user.position ? parseFloat(user.position.base_salary || 0) : 0;
        const dynamicFee = baseSalary * 0.105;

        const [record, created] = await InsuranceRecord.findOrCreate({
            where: { user_id: userId, month: currentMonth, year: currentYear },
            defaults: {
                monthly_fee: dynamicFee,
                old_debt: 0,
                status: 'Unpaid'
            }
        });

        if (record.status === 'Paid') return res.status(400).json({ message: 'Insurance already paid' });

        const totalAmount = parseFloat(record.monthly_fee) + parseFloat(record.old_debt);
        if (totalAmount <= 0) return res.status(400).json({ message: 'No amount to pay' });
        if (totalAmount < 2000) return res.status(400).json({ message: 'Minimum transaction amount is 2000 VND' });

        // PayOS v2 requires unique orderCode. Using 13-digit timestamp is safer.
        const orderCode = Number(Date.now());
        const description = `Bao hiem T${currentMonth} ${user.employee_code}`;

        // Verify PayOS Keys (Common cause of 500 on Render)
        if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
            console.error('❌ PayOS Environment Variables are MISSING!');
            return res.status(500).json({ 
                message: 'Internal configuration error: Missing PayOS keys on server.',
                error: 'Please check Render Dashboard Environment Variables.'
            });
        }

        const body = {
            orderCode: orderCode,
            amount: totalAmount,
            description: description.substring(0, 25), // PayOS strictly <= 25 chars
            cancelUrl: `https://workly-app.com/cancel`, // Placeholder
            returnUrl: `https://workly-app.com/success` // Placeholder
        };

        const paymentLinkData = await payos.paymentRequests.create(body);
        console.log('=== PayOS Full Response ===', JSON.stringify(paymentLinkData, null, 2));

        // Save transaction as pending
        await Transaction.create({
            transaction_code: orderCode.toString(),
            user_id: user.id,
            insurance_record_id: record.id,
            amount: totalAmount,
            description: description,
            status: 'Pending',
            transaction_time: new Date()
        });

        return res.status(200).json({
            checkoutUrl: paymentLinkData.checkoutUrl,
            qrCode: paymentLinkData.qrCode,
            paymentLinkData: paymentLinkData, 
            orderCode: orderCode
        });

    } catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).json({ 
            message: 'Failed to create payment link', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const handlePayOSWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        
        let verifiedData;
        try {
             verifiedData = await payos.webhooks.verify(webhookData);
        } catch (e) {
            console.error('Webhook signature verification failed', e);
            return res.status(400).json({ message: 'Invalid signature' });
        }

        if (verifiedData.code !== '00') {
             return res.json({ message: 'Ignore if not success' });
        }

        const orderCode = verifiedData.orderCode;
        const amount = verifiedData.amount;

        const transaction = await Transaction.findOne({ where: { transaction_code: orderCode.toString() } });
        if (!transaction || transaction.status === 'Success') {
            return res.json({ message: 'Transaction not found or already processed' });
        }

        // Update transaction status
        transaction.status = 'Success';
        transaction.payos_webhook_data = verifiedData;
        await transaction.save();

        // Update InsuranceRecord
        const record = await InsuranceRecord.findByPk(transaction.insurance_record_id);
        if (record) {
            record.status = 'Paid';
            record.old_debt = 0; // Reset debt
            await record.save();
        }

        return res.status(200).json({
            success: true,
            message: "Ok"
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAdminDashboard = async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const records = await InsuranceRecord.findAll({
            where: { month: currentMonth, year: currentYear },
            include: [{ model: User, as: 'user', attributes: ['full_name', 'employee_code', 'department_id'] }]
        });

        let totalToCollect = 0;
        let totalCollected = 0;
        const unpaidEmployees = [];

        records.forEach(r => {
            const amount = parseFloat(r.monthly_fee) + parseFloat(r.old_debt);
            totalToCollect += amount;
            if (r.status === 'Paid') {
                totalCollected += amount;
            } else {
                unpaidEmployees.push({
                    user: r.user,
                    amount: amount
                });
            }
        });

        const collectionPercentage = totalToCollect > 0 ? ((totalCollected / totalToCollect) * 100).toFixed(2) : 0;

        return res.status(200).json({
            totalToCollect,
            totalCollected,
            collectionPercentage,
            unpaidEmployees
        });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAdminTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{ model: User, as: 'user', attributes: ['full_name', 'employee_code'] }],
            order: [['transaction_time', 'DESC']]
        });
        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching admin transactions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getMyInsurance,
    createPaymentLink,
    handlePayOSWebhook,
    getAdminDashboard,
    getAdminTransactions
};
