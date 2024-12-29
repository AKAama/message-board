const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const Message = require('./models/message');
const bodyParser = require('body-parser');

const app = express();

// CORS中间件
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));

// Express原生解析器设置
app.use(express.json({limit: process.env.PAYLOAD_LIMIT || '50mb'}));
app.use(express.urlencoded({
    limit: process.env.PAYLOAD_LIMIT || '50mb',
    extended: true
}));

// Body-parser解析器设置
app.use(bodyParser.json({limit: process.env.PAYLOAD_LIMIT || '50mb'}));
app.use(bodyParser.urlencoded({
    limit: process.env.PAYLOAD_LIMIT || '50mb',
    extended: true,
    parameterLimit: 50000
}));

// 路由
app.use('/api/messages', require('./routes/messages'));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('错误:', err);
    
    // 处理请求体过大的错误
    if (err instanceof SyntaxError && err.type === 'entity.too.large') {
        return res.status(413).json({
            message: '请求数据过大',
            error: '上传的数据超出服务器限制',
            limit: process.env.PAYLOAD_LIMIT || '50mb'
        });
    }
    
    // 处理其他错误
    res.status(500).json({
        message: '服务器错误',
        error: err.message
    });
});

// 数据库初始化函数
async function initializeDatabase() {
    try {
        console.log('开始同步数据库...');
        await sequelize.sync();
        console.log('数据库同步完成！');
    } catch (error) {
        console.error('数据库同步失败:', error);
        // 数据库同步失败时退出程序
        process.exit(1);
    }
}

// 启动服务器
const startServer = async () => {
    try {
        // 先初始化数据库
        await initializeDatabase();
        
        // 然后启动服务器
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`服务器已启动，运行在端口 ${PORT}`);
            console.log(`允许的请求体大小限制: ${process.env.PAYLOAD_LIMIT || '50mb'}`);
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

// 启动应用
startServer();