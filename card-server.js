const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3003;
const CARDS_FILE = path.join(__dirname, 'data', 'CardList.json');

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 确保数据目录存在
async function ensureDataDirectory() {
    try {
        await fs.access(path.dirname(CARDS_FILE));
    } catch (error) {
        await fs.mkdir(path.dirname(CARDS_FILE), { recursive: true });
    }
}

// 读取卡片数据
async function readCards() {
    try {
        const data = await fs.readFile(CARDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // 文件不存在，返回空数组
            return [];
        }
        throw error;
    }
}

// 写入卡片数据
async function writeCards(cards) {
    await ensureDataDirectory();
    await fs.writeFile(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf8');
}

// API路由

// 获取所有卡片
app.get('/api/cards', async (req, res) => {
    try {
        const cards = await readCards();
        res.json(cards);
    } catch (error) {
        console.error('读取卡片数据失败:', error);
        res.status(500).json({ error: '读取卡片数据失败' });
    }
});

// 保存所有卡片
app.post('/api/cards', async (req, res) => {
    try {
        const cards = req.body;
        if (!Array.isArray(cards)) {
            return res.status(400).json({ error: '数据格式错误，需要数组格式' });
        }
        
        await writeCards(cards);
        res.json({ success: true, message: '卡片数据保存成功' });
    } catch (error) {
        console.error('保存卡片数据失败:', error);
        res.status(500).json({ error: '保存卡片数据失败' });
    }
});

// 获取单个卡片
app.get('/api/cards/:id', async (req, res) => {
    try {
        const cards = await readCards();
        const card = cards.find(c => c.id === req.params.id);
        
        if (!card) {
            return res.status(404).json({ error: '卡片不存在' });
        }
        
        res.json(card);
    } catch (error) {
        console.error('读取卡片失败:', error);
        res.status(500).json({ error: '读取卡片失败' });
    }
});

// 创建新卡片
app.post('/api/cards/create', async (req, res) => {
    try {
        const newCard = req.body;
        
        // 验证必填字段
        if (!newCard.id || !newCard.name || !newCard.type) {
            return res.status(400).json({ error: '缺少必填字段：id, name, type' });
        }
        
        const cards = await readCards();
        
        // 检查ID是否已存在
        if (cards.find(c => c.id === newCard.id)) {
            return res.status(400).json({ error: '卡片ID已存在' });
        }
        
        cards.push(newCard);
        await writeCards(cards);
        
        res.json({ success: true, message: '卡片创建成功', card: newCard });
    } catch (error) {
        console.error('创建卡片失败:', error);
        res.status(500).json({ error: '创建卡片失败' });
    }
});

// 更新卡片
app.put('/api/cards/:id', async (req, res) => {
    try {
        const cardId = req.params.id;
        const updatedCard = req.body;
        
        const cards = await readCards();
        const index = cards.findIndex(c => c.id === cardId);
        
        if (index === -1) {
            return res.status(404).json({ error: '卡片不存在' });
        }
        
        // 如果ID发生变化，检查新ID是否已存在
        if (updatedCard.id !== cardId && cards.find(c => c.id === updatedCard.id)) {
            return res.status(400).json({ error: '新的卡片ID已存在' });
        }
        
        cards[index] = updatedCard;
        await writeCards(cards);
        
        res.json({ success: true, message: '卡片更新成功', card: updatedCard });
    } catch (error) {
        console.error('更新卡片失败:', error);
        res.status(500).json({ error: '更新卡片失败' });
    }
});

// 删除卡片
app.delete('/api/cards/:id', async (req, res) => {
    try {
        const cardId = req.params.id;
        const cards = await readCards();
        const index = cards.findIndex(c => c.id === cardId);
        
        if (index === -1) {
            return res.status(404).json({ error: '卡片不存在' });
        }
        
        const deletedCard = cards.splice(index, 1)[0];
        await writeCards(cards);
        
        res.json({ success: true, message: '卡片删除成功', card: deletedCard });
    } catch (error) {
        console.error('删除卡片失败:', error);
        res.status(500).json({ error: '删除卡片失败' });
    }
});

// 按类型筛选卡片
app.get('/api/cards/type/:type', async (req, res) => {
    try {
        const cardType = req.params.type;
        const cards = await readCards();
        const filteredCards = cards.filter(c => c.type === cardType);
        
        res.json(filteredCards);
    } catch (error) {
        console.error('筛选卡片失败:', error);
        res.status(500).json({ error: '筛选卡片失败' });
    }
});

// 按特殊效果类型筛选卡片
app.get('/api/cards/effectType/:effectType', async (req, res) => {
    try {
        const effectType = req.params.effectType;
        const cards = await readCards();
        const filteredCards = cards.filter(c => c.specialEffectType === effectType);
        
        res.json(filteredCards);
    } catch (error) {
        console.error('按特殊效果类型筛选卡片失败:', error);
        res.status(500).json({ error: '按特殊效果类型筛选卡片失败' });
    }
});

// 按五行属性筛选卡片
app.get('/api/cards/element/:element', async (req, res) => {
    try {
        const element = req.params.element;
        const cards = await readCards();
        const filteredCards = cards.filter(c => c.elements && c.elements.includes(element));
        
        res.json(filteredCards);
    } catch (error) {
        console.error('按五行属性筛选卡片失败:', error);
        res.status(500).json({ error: '按五行属性筛选卡片失败' });
    }
});

// 按作用目标类型筛选卡片
app.get('/api/cards/targetType/:targetType', async (req, res) => {
    try {
        const targetType = req.params.targetType;
        const cards = await readCards();
        const filteredCards = cards.filter(c => c.targetType === targetType);
        
        res.json(filteredCards);
    } catch (error) {
        console.error('按目标类型筛选卡片失败:', error);
        res.status(500).json({ error: '按目标类型筛选卡片失败' });
    }
});

// 搜索卡片
app.get('/api/cards/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword.toLowerCase();
        const cards = await readCards();
        const searchResults = cards.filter(card => 
            card.name.toLowerCase().includes(keyword) ||
            card.id.toLowerCase().includes(keyword) ||
            (card.specialEffect && card.specialEffect.toLowerCase().includes(keyword)) ||
            (card.specialEffectDesc && card.specialEffectDesc.toLowerCase().includes(keyword))
        );
        
        res.json(searchResults);
    } catch (error) {
        console.error('搜索卡片失败:', error);
        res.status(500).json({ error: '搜索卡片失败' });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`卡片管理服务器运行在 http://localhost:${PORT}`);
    console.log(`访问卡片管理界面: http://localhost:${PORT}/card-management.html`);
});

module.exports = app;