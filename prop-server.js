/**
 * 道具管理系统服务器模块
 * 提供道具数据的增删改查功能
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// 创建路由器
const router = express.Router();

// 添加日志中间件以便调试
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] 收到请求: ${req.method} ${req.path}`);
    next();
});

// 定义文件路径
const jsonFilePath = path.join(__dirname, 'jsonData', 'PropList.json');

/**
 * 确保JSON文件存在
 */
function ensureFileExists(filePath) {
    if (!fs.existsSync(filePath)) {
        // 确保目录存在
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        // 创建空的道具列表文件
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
}

/**
 * 获取所有道具数据
 */
router.get('/api/props', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // 过滤掉空对象
        const props = Array.isArray(jsonData) ? 
            jsonData.filter(prop => prop && prop.Name) : [];
        
        res.json(props);
    } catch (error) {
        console.error('读取道具数据失败:', error);
        res.status(500).json({ error: '读取道具数据失败' });
    }
});

/**
 * 获取单个道具数据
 */
router.get('/api/props/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        if (!Array.isArray(jsonData)) {
            res.status(404).json({ error: '道具数据格式错误' });
            return;
        }
        
        const prop = jsonData.find(item => item && item.Id === req.params.id);
        
        if (!prop) {
            res.status(404).json({ error: '找不到该道具' });
            return;
        }
        
        res.json(prop);
    } catch (error) {
        console.error('读取道具数据失败:', error);
        res.status(500).json({ error: '读取道具数据失败' });
    }
});

/**
 * 创建新道具
 */
router.post('/api/props', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const props = Array.isArray(jsonData) ? jsonData : [];
        
        // 验证请求数据
        const newProp = req.body;
        if (!newProp || !newProp.Name || !newProp.Type) {
            res.status(400).json({ error: '道具名称和类型是必需的' });
            return;
        }
        
        // 生成新ID
        const maxId = props.reduce((max, prop) => {
            const id = parseInt(prop.Id || '0');
            return id > max ? id : max;
        }, 0);
        newProp.Id = (maxId + 1).toString();
        
        // 确保所有必需字段存在
        newProp.MiniImage = newProp.MiniImage || '';
        newProp.BagImage = newProp.BagImage || '';
        newProp.Quantity = newProp.Quantity || '';
        
        // 添加新道具
        props.push(newProp);
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(props, null, 2));
        
        res.status(201).json(newProp);
    } catch (error) {
        console.error('创建道具失败:', error);
        res.status(500).json({ error: '创建道具失败' });
    }
});

/**
 * 更新道具
 */
router.put('/api/props/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const props = Array.isArray(jsonData) ? jsonData : [];
        
        const index = props.findIndex(prop => prop && prop.Id === req.params.id);
        
        if (index === -1) {
            res.status(404).json({ error: '找不到该道具' });
            return;
        }
        
        // 验证请求数据
        const updatedProp = req.body;
        if (!updatedProp || !updatedProp.Name || !updatedProp.Type) {
            res.status(400).json({ error: '道具名称和类型是必需的' });
            return;
        }
        
        // 保留原ID
        updatedProp.Id = req.params.id;
        
        // 确保所有必需字段存在
        updatedProp.MiniImage = updatedProp.MiniImage || '';
        updatedProp.BagImage = updatedProp.BagImage || '';
        updatedProp.Quantity = updatedProp.Quantity || '';
        
        // 更新道具
        props[index] = updatedProp;
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(props, null, 2));
        
        res.json(updatedProp);
    } catch (error) {
        console.error('更新道具失败:', error);
        res.status(500).json({ error: '更新道具失败' });
    }
});

/**
 * 删除道具
 */
router.delete('/api/props/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const props = Array.isArray(jsonData) ? jsonData : [];
        
        const filteredProps = props.filter(prop => prop && prop.Id !== req.params.id);
        
        if (filteredProps.length === props.length) {
            res.status(404).json({ error: '找不到该道具' });
            return;
        }
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(filteredProps, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除道具失败:', error);
        res.status(500).json({ error: '删除道具失败' });
    }
});

module.exports = router;