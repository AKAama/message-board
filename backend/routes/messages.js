const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// 获取所有留言
router.get('/', async (req, res) => {
    try {
        const messages = await Message.findAll({
            order: [['timestamp', 'DESC']]
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 添加新留言
router.post('/', async (req, res) => {
    try {
        // 打印完整的请求体
        console.log('完整请求体:', {
            ...req.body,
            imagePreview: req.body.image ? req.body.image.substring(0, 100) + '...' : null
        });

        const newMessage = await Message.create({
            author: req.body.author,
            content: req.body.content,
            isFeatured: req.body.isFeatured,
            image: req.body.image
        });

        // 打印创建的消息
        console.log('创建的消息:', {
            id: newMessage.id,
            author: newMessage.author,
            hasImage: !!newMessage.image,
            imagePreview: newMessage.image ? newMessage.image.substring(0, 100) + '...' : null
        });

        // 验证保存的数据
        const savedMessage = await Message.findByPk(newMessage.id);
        console.log('从数据库读取的消息:', {
            id: savedMessage.id,
            hasImage: !!savedMessage.image,
            imagePreview: savedMessage.image ? savedMessage.image.substring(0, 100) + '...' : null
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('保存消息时出错:', err);
        console.error('错误详情:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.status(400).json({ 
            message: err.message,
            details: err.errors
        });
    }
});

// 删除留言
router.delete('/:id', async (req, res) => {
    try {
        const result = await Message.destroy({
            where: { id: req.params.id }
        });
        if (result) {
            res.json({ message: '留言已删除' });
        } else {
            res.status(404).json({ message: '留言不存在' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 