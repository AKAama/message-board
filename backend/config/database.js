const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: true,
        timezone: '+08:00',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timezone: '+08:00'
        }
    }
);

// 测试数据库连接
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功！');
    } catch (error) {
        console.error('数据库连接失败:', error);
        // 打印详细的错误信息
        console.error('错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

testConnection();

module.exports = sequelize; 