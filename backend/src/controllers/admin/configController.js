const { SystemConfig } = require('../../models');

const getOfficeConfigs = async (req, res, next) => {
    try {
        const configs = await SystemConfig.findAll();
        // Transform array into an object for easier frontend consumption
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });
        res.status(200).json({ success: true, data: configMap });
    } catch (error) {
        next(error);
    }
};

const updateOfficeConfigs = async (req, res, next) => {
    try {
        const updates = req.body; // e.g. { OFFICE_ADDRESS: '...', OFFICE_LATITUDE: '...' }
        
        for (const [key, value] of Object.entries(updates)) {
            // Update if exists, or create
            await SystemConfig.upsert({
                key: key,
                value: String(value)
            });
        }
        
        res.status(200).json({ success: true, message: 'Configs updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOfficeConfigs,
    updateOfficeConfigs
};
