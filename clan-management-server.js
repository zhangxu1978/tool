/**
 * 门派管理系统服务器模块
 * 提供门派数据的增删改查和随机生成功能
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
const jsonFilePath = path.join(__dirname, 'data', 'clans.json');
const configFilePath = path.join(__dirname, 'data', 'clan-config.json');

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
        // 根据文件路径确定默认内容
        if (filePath === configFilePath) {
            fs.writeFileSync(filePath, JSON.stringify({ specialties: ['符箓', '剑法', '炼丹', '炼器', '御兽', '阵法', '幻术', '毒术', '体修', '雷法', '冰法', '火法'] }));
        } else {
            fs.writeFileSync(filePath, JSON.stringify({ clans: [] }));
        }
    }
}

/**
 * 获取配置数据
 */
router.get('/api/clan-config', (req, res) => {
    try {
        ensureFileExists(configFilePath);
        
        const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        
        res.json(configData);
    } catch (error) {
        console.error('读取配置数据失败:', error);
        res.status(500).json({ error: '读取配置数据失败' });
    }
});

/**
 * 获取所有门派数据
 */
router.get('/api/clans', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // 确保clans数组存在
        if (!jsonData.clans || !Array.isArray(jsonData.clans)) {
            jsonData.clans = [];
        }
        
        res.json(jsonData.clans);
    } catch (error) {
        console.error('读取门派数据失败:', error);
        res.status(500).json({ error: '读取门派数据失败' });
    }
});

/**
 * 生成随机门派数据
 */
router.get('/api/clans/generate', (req, res) => {
    try {
        ensureFileExists(configFilePath);
        const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        const specialties = configData.specialties || ['符箓', '剑法', '炼丹', '炼器', '御兽', '阵法', '幻术', '毒术', '体修', '雷法', '冰法', '火法'];
        
        // 门派名称前缀和后缀
        const prefixes = ['青云', '紫霄', '玄元', '太初', '万剑', '御灵', '丹霞', '碧游', '青冥', '玉虚'];
        const suffixes = ['派', '宗', '门', '教', '宫', '阁', '殿', '山', '谷', '洞'];
        
        // 修士级别
        const levels = ['练气期', '筑基期', '金丹期', '元婴期', '化神期'];
        
        // 随机选择前缀和后缀生成宗门名称
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const clanName = prefix + suffix;
        
        // 随机选择最高修士级别
        const cultivationLevel = levels[Math.floor(Math.random() * levels.length)];
        
        // 根据级别计算其他属性基础值
        const levelIndex = levels.indexOf(cultivationLevel);
        const baseValue = (levelIndex + 1) * 100;
        
        // 随机生成各项属性
        const spiritVein = Math.floor(Math.random() * 5) + 1; // 1-5
        const spiritEnergy = Math.floor(Math.random() * 60 + 80); // 80-140
        const spiritStone = Math.floor(Math.random() * baseValue * 2 + baseValue);
        const spiritMine = Math.floor(Math.random() * baseValue * 1.5 + baseValue * 0.5);
        const spiritField = Math.floor(Math.random() * baseValue * 1.5 + baseValue * 0.5);
        const spiritPlant = Math.floor(Math.random() * baseValue * 1.5 + baseValue * 0.5);
        const defense = Math.floor(Math.random() * 50 + 50); // 50-100
        
        // 根据宗门规模确定人口和修士数量
        const scale = spiritVein * (levelIndex + 1);
        const population = Math.floor(scale * (Math.random() * 1000 + 1500));
        const cultivatorCount = Math.floor(population * (Math.random() * 0.1 + 0.15)); // 人口的 15%-25%
        const masterCount = Math.floor(cultivatorCount * (Math.random() * 0.02 + 0.01) * (levelIndex + 1)); // 修士的 1%-3% 乘以级别系数
        const ruleDegree = Math.floor(Math.random() * 30 + 70); // 70-100
        
        // 随机选择 1-3 个宗门擅长
        const selectedSpecialties = [];
        const specialtyCount = Math.floor(Math.random() * 3) + 1;
        const usedSpecialties = new Set();
        while (selectedSpecialties.length < specialtyCount) {
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];
            if (!usedSpecialties.has(specialty)) {
                selectedSpecialties.push(specialty);
                usedSpecialties.add(specialty);
            }
        }
        
        // 创建随机门派数据
        const randomClan = {
            clanName,
            cultivationLevel,
            spiritStone,
            spiritMine,
            spiritField,
            spiritPlant,
            spiritEnergy,
            spiritVein,
            defense,
            population,
            cultivatorCount,
            masterCount,
            ruleDegree,
            specialties: selectedSpecialties
        };
        
        res.json(randomClan);
    } catch (error) {
        console.error('生成随机门派数据失败:', error);
        res.status(500).json({ error: '生成随机门派数据失败' });
    }
});

/**
 * 获取单个门派数据
 */
router.get('/api/clans/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const clanId = parseInt(req.params.id);
        
        // 确保clans数组存在
        if (!jsonData.clans || !Array.isArray(jsonData.clans)) {
            jsonData.clans = [];
        }
        
        const clan = jsonData.clans.find(clan => clan.ID === clanId);
        
        if (clan) {
            res.json(clan);
        } else {
            res.status(404).json({ error: '未找到指定门派' });
        }
    } catch (error) {
        console.error('读取门派数据失败:', error);
        res.status(500).json({ error: '读取门派数据失败' });
    }
});

/**
 * 添加新门派
 */
router.post('/api/clans', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const newClan = req.body;
        
        // 确保clans数组存在
        if (!jsonData.clans || !Array.isArray(jsonData.clans)) {
            jsonData.clans = [];
        }
        
        // 生成唯一ID
        const maxId = jsonData.clans.length > 0 ? Math.max(...jsonData.clans.map(clan => clan.ID)) : 0;
        newClan.ID = maxId + 1;
        
        // 添加新门派
        jsonData.clans.push(newClan);
        
        // 保存数据
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        
        res.json(newClan);
    } catch (error) {
        console.error('添加门派失败:', error);
        res.status(500).json({ error: '添加门派失败' });
    }
});

/**
 * 更新门派数据
 */
router.put('/api/clans/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const clanId = parseInt(req.params.id);
        const updatedClan = req.body;
        
        // 确保clans数组存在
        if (!jsonData.clans || !Array.isArray(jsonData.clans)) {
            jsonData.clans = [];
        }
        
        // 查找并更新门派
        const clanIndex = jsonData.clans.findIndex(clan => clan.ID === clanId);
        
        if (clanIndex !== -1) {
            // 保留原始ID
            updatedClan.ID = clanId;
            jsonData.clans[clanIndex] = updatedClan;
            
            // 保存数据
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
            
            res.json(updatedClan);
        } else {
            res.status(404).json({ error: '未找到指定门派' });
        }
    } catch (error) {
        console.error('更新门派失败:', error);
        res.status(500).json({ error: '更新门派失败' });
    }
});

/**
 * 删除门派
 */
router.delete('/api/clans/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const clanId = parseInt(req.params.id);
        
        // 确保clans数组存在
        if (!jsonData.clans || !Array.isArray(jsonData.clans)) {
            jsonData.clans = [];
        }
        
        // 查找并删除门派
        const initialLength = jsonData.clans.length;
        jsonData.clans = jsonData.clans.filter(clan => clan.ID !== clanId);
        
        if (jsonData.clans.length < initialLength) {
            // 保存数据
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
            
            res.json({ success: true, message: '门派删除成功' });
        } else {
            res.status(404).json({ error: '未找到指定门派' });
        }
    } catch (error) {
        console.error('删除门派失败:', error);
        res.status(500).json({ error: '删除门派失败' });
    }
});

// 导出路由器
module.exports = router;