const { sequelize, SystemConfig } = require('./src/models');

const setup = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Create table if not exists
        await SystemConfig.sync({ alter: true });
        console.log('SystemConfigs table synced.');

        // Default configs
        const defaults = [
            { key: 'OFFICE_ADDRESS', value: 'Văn phòng Cầu Giấy, Hà Nội', description: 'Địa chỉ hiển thị trên app' },
            { key: 'OFFICE_LATITUDE', value: '21.028511', description: 'Vĩ độ (Latitude)' },
            { key: 'OFFICE_LONGITUDE', value: '105.804817', description: 'Kinh độ (Longitude)' },
            { key: 'OFFICE_RADIUS_METERS', value: '100', description: 'Bán kính hợp lệ (mét)' },
        ];

        for (const item of defaults) {
            const [record, created] = await SystemConfig.findOrCreate({
                where: { key: item.key },
                defaults: { value: item.value, description: item.description }
            });
            if (created) {
                console.log(`Created config: ${item.key}`);
            } else {
                console.log(`Config ${item.key} already exists.`);
            }
        }
        
        console.log('Setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setup();
