/**
 * 角色管理系统服务器模块
 * 提供角色数据的增删改查功能
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
const jsonFilePath = path.join(__dirname, 'data', 'PlayerList.json');

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
        // 创建空的角色列表文件
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
}

/**
 * 获取所有角色数据
 */
router.get('/api/players', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // 过滤掉空对象
        const players = Array.isArray(jsonData) ? 
            jsonData.filter(player => player && player.Name) : [];
        
        res.json(players);
    } catch (error) {
        console.error('读取角色数据失败:', error);
        res.status(500).json({ error: '读取角色数据失败' });
    }
});

/**
 * 获取单个角色数据
 */
router.get('/api/players/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        if (!Array.isArray(jsonData)) {
            res.status(404).json({ error: '角色数据格式错误' });
            return;
        }
        
        const player = jsonData.find(item => item && item.Id === req.params.id);
        
        if (!player) {
            res.status(404).json({ error: '找不到该角色' });
            return;
        }
        
        res.json(player);
    } catch (error) {
        console.error('读取角色数据失败:', error);
        res.status(500).json({ error: '读取角色数据失败' });
    }
});

/**
 * 创建新角色
 */
router.post('/api/players', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const players = Array.isArray(jsonData) ? jsonData : [];
        
        // 验证请求数据
        const newPlayer = req.body;
        if (!newPlayer || !newPlayer.Name) {
            res.status(400).json({ error: '角色名称是必需的' });
            return;
        }
        
        // 生成新ID
        const maxId = players.reduce((max, player) => {
            const id = parseInt(player.Id || '0');
            return id > max ? id : max;
        }, 0);
        newPlayer.Id = (maxId + 1).toString();
        
        // 确保所有必需字段存在
        newPlayer.Age = newPlayer.Age || '';
        newPlayer.Team = newPlayer.Team || '无门无派';
        newPlayer.Type = newPlayer.Type || '人类';
        newPlayer.Gender = newPlayer.Gender || '';
        newPlayer.Image = newPlayer.Image || '';
        newPlayer.Money = newPlayer.Money || '';
        newPlayer.Level = newPlayer.Level || '0';
        newPlayer.Experience = newPlayer.Experience || '0';
        newPlayer.Strength = newPlayer.Strength || '100';
        newPlayer.Agility = newPlayer.Agility || '100';
        newPlayer.Intelligence = newPlayer.Intelligence || '100';
        newPlayer.Constitution = newPlayer.Constitution || '100';
        newPlayer.Spirit = newPlayer.Spirit || '100';
        newPlayer.Luck = newPlayer.Luck || '100';
        newPlayer.Reputation = newPlayer.Reputation || '0';
        newPlayer.Props = newPlayer.Props || [];
        newPlayer.Skills = newPlayer.Skills || [];
        
        // 添加新角色
        players.push(newPlayer);
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(players, null, 2));
        
        res.status(201).json(newPlayer);
    } catch (error) {
        console.error('创建角色失败:', error);
        res.status(500).json({ error: '创建角色失败' });
    }
});

/**
 * 更新角色
 */
router.put('/api/players/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const players = Array.isArray(jsonData) ? jsonData : [];
        
        const index = players.findIndex(player => player && player.Id === req.params.id);
        
        if (index === -1) {
            res.status(404).json({ error: '找不到该角色' });
            return;
        }
        
        // 验证请求数据
        const updatedPlayer = req.body;
        if (!updatedPlayer || !updatedPlayer.Name) {
            res.status(400).json({ error: '角色名称是必需的' });
            return;
        }
        
        // 保留原ID
        updatedPlayer.Id = req.params.id;
        
        // 确保所有必需字段存在
        updatedPlayer.Age = updatedPlayer.Age || '';
        updatedPlayer.Team = updatedPlayer.Team || '无门无派';
        updatedPlayer.Type = updatedPlayer.Type || '人类';
        updatedPlayer.Gender = updatedPlayer.Gender || '';
        updatedPlayer.Image = updatedPlayer.Image || '';
        updatedPlayer.Props = updatedPlayer.Props || [];
        updatedPlayer.Skills = updatedPlayer.Skills || [];
        
        // 更新角色
        players[index] = updatedPlayer;
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(players, null, 2));
        
        res.json(updatedPlayer);
    } catch (error) {
        console.error('更新角色失败:', error);
        res.status(500).json({ error: '更新角色失败' });
    }
});

/**
 * 删除角色
 */
router.delete('/api/players/:id', (req, res) => {
    try {
        ensureFileExists(jsonFilePath);
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        const players = Array.isArray(jsonData) ? jsonData : [];
        
        const filteredPlayers = players.filter(player => player && player.Id !== req.params.id);
        
        if (filteredPlayers.length === players.length) {
            res.status(404).json({ error: '找不到该角色' });
            return;
        }
        
        // 保存到文件
        fs.writeFileSync(jsonFilePath, JSON.stringify(filteredPlayers, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除角色失败:', error);
        res.status(500).json({ error: '删除角色失败' });
    }
});

module.exports = router;