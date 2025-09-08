/**
 * 灵脉模板管理系统服务器模块
 * 提供灵脉模板数据的增删改查和随机生成功能
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
const jsonFilePath = path.join(__dirname, 'jsonData', 'spiritVeins.json');

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
        // 创建默认内容
        fs.writeFileSync(filePath, JSON.stringify({ spiritVeins: [] }));
    }
}

/**
 * 获取所有灵脉模板数据
 */
router.get('/api/spirit-veins', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // 确保spiritVeins数组存在
        if (!jsonData.spiritVeins || !Array.isArray(jsonData.spiritVeins)) {
            jsonData.spiritVeins = [];
        }
        
        res.json(jsonData.spiritVeins);
    } catch (error) {
        console.error('读取灵脉模板数据失败:', error);
        res.status(500).json({ error: '读取灵脉模板数据失败' });
    }
});

/**
 * 生成随机灵脉模板数据
 * 随机生成的灵脉模板参考灵脉等级，等级高的灵脉数值高
 */
router.get('/api/spirit-veins/generate', (req, res) => {
    try {
        // 灵脉名称前缀和后缀
        const prefixes = ['玄黄', '混沌', '紫霄', '青冥', '太初', '空灵', '碧血', '丹霞', '玄冰', '炽焰'];
        const suffixes = ['灵脉', '地脉', '龙脉', '仙脉', '神脉', '道脉', '圣脉', '天脉', '元脉', '真脉'];
        
        // 随机选择前缀和后缀生成灵脉名称
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const name = prefix + suffix;
        
        // 随机选择灵脉等级 (1-10)
        const level = Math.floor(Math.random() * 10) + 1;
        
        // 根据等级计算其他属性值，等级越高，数值越高
        const baseMultiplier = level;
        const spiritEnergyEffect = Math.floor(Math.random() * 20 * baseMultiplier + 10 * baseMultiplier);
        const spiritMineEffect = Math.floor(Math.random() * 15 * baseMultiplier + 5 * baseMultiplier);
        const spiritFieldEffect = Math.floor(Math.random() * 15 * baseMultiplier + 5 * baseMultiplier);
        
        // 创建随机灵脉模板数据
        const randomSpiritVein = {
            name,
            level,
            spiritEnergyEffect,
            spiritMineEffect,
            spiritFieldEffect
        };
        
        res.json(randomSpiritVein);
    } catch (error) {
        console.error('生成随机灵脉模板数据失败:', error);
        res.status(500).json({ error: '生成随机灵脉模板数据失败' });
    }
});

/**
 * 获取单个灵脉模板数据
 */
router.get('/api/spirit-veins/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const veinId = parseInt(req.params.id);
        
        // 确保spiritVeins数组存在
        if (!jsonData.spiritVeins || !Array.isArray(jsonData.spiritVeins)) {
            jsonData.spiritVeins = [];
        }
        
        const spiritVein = jsonData.spiritVeins.find(vein => vein.id === veinId);
        
        if (spiritVein) {
            res.json(spiritVein);
        } else {
            res.status(404).json({ error: '未找到指定灵脉模板' });
        }
    } catch (error) {
        console.error('读取灵脉模板数据失败:', error);
        res.status(500).json({ error: '读取灵脉模板数据失败' });
    }
});

/**
 * 添加新灵脉模板
 */
router.post('/api/spirit-veins', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const newSpiritVein = req.body;
        
        // 确保spiritVeins数组存在
        if (!jsonData.spiritVeins || !Array.isArray(jsonData.spiritVeins)) {
            jsonData.spiritVeins = [];
        }
        
        // 生成唯一ID
        const maxId = jsonData.spiritVeins.length > 0 ? Math.max(...jsonData.spiritVeins.map(vein => vein.id)) : 0;
        newSpiritVein.id = maxId + 1;
        
        // 添加新灵脉模板
        jsonData.spiritVeins.push(newSpiritVein);
        
        // 保存数据
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        
        res.json(newSpiritVein);
    } catch (error) {
        console.error('添加灵脉模板失败:', error);
        res.status(500).json({ error: '添加灵脉模板失败' });
    }
});

/**
 * 更新灵脉模板数据
 */
router.put('/api/spirit-veins/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const veinId = parseInt(req.params.id);
        const updatedSpiritVein = req.body;
        
        // 确保spiritVeins数组存在
        if (!jsonData.spiritVeins || !Array.isArray(jsonData.spiritVeins)) {
            jsonData.spiritVeins = [];
        }
        
        // 查找并更新灵脉模板
        const veinIndex = jsonData.spiritVeins.findIndex(vein => vein.id === veinId);
        
        if (veinIndex !== -1) {
            // 保留原始ID
            updatedSpiritVein.id = veinId;
            jsonData.spiritVeins[veinIndex] = updatedSpiritVein;
            
            // 保存数据
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
            
            res.json(updatedSpiritVein);
        } else {
            res.status(404).json({ error: '未找到指定灵脉模板' });
        }
    } catch (error) {
        console.error('更新灵脉模板失败:', error);
        res.status(500).json({ error: '更新灵脉模板失败' });
    }
});

/**
 * 删除灵脉模板
 */
router.delete('/api/spirit-veins/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const veinId = parseInt(req.params.id);
        
        // 确保spiritVeins数组存在
        if (!jsonData.spiritVeins || !Array.isArray(jsonData.spiritVeins)) {
            jsonData.spiritVeins = [];
        }
        
        // 查找并删除灵脉模板
        const initialLength = jsonData.spiritVeins.length;
        jsonData.spiritVeins = jsonData.spiritVeins.filter(vein => vein.id !== veinId);
        
        if (jsonData.spiritVeins.length < initialLength) {
            // 保存数据
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
            
            res.json({ success: true, message: '灵脉模板删除成功' });
        } else {
            res.status(404).json({ error: '未找到指定灵脉模板' });
        }
    } catch (error) {
        console.error('删除灵脉模板失败:', error);
        res.status(500).json({ error: '删除灵脉模板失败' });
    }
});

// 导出路由器
module.exports = router;