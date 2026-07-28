const { Department, Position, SystemConfig } = require('../models');

// GET /api/metadata/departments
const getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
};

// GET /api/metadata/positions
const getPositions = async (req, res, next) => {
    try {
        const positions = await Position.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.status(200).json({ success: true, data: positions });
    } catch (error) {
        next(error);
    }
};

// GET /api/metadata/office
const getOfficeInfo = async (req, res, next) => {
    try {
        const config = await SystemConfig.findOne({ where: { key: 'OFFICE_ADDRESS' } });
        res.status(200).json({ success: true, data: config ? config.value : 'Văn phòng Cầu Giấy, Hà Nội' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDepartments,
    getPositions,
    getOfficeInfo
};
