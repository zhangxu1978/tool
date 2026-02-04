// 卡片管理系统常量配置
const CARD_CONFIG = {
    // 卡片类型
    CARD_TYPES: ['法器', '法术', '丹药', '符箓', '召唤物', '阵法'],
    
    // 消耗费用类型
    COST_TYPES: ['', '生命', '法力'],
    
    // 作用目标
    TARGETS: ['无', '指定一个', '指定多个', '随机', '全部', '敌方全部', '我方全部'],
    
    // 作用目标类型
    TARGET_TYPES: ['', '场上卡牌', '手中卡牌', '牌库卡牌', '主将'],
    
    // 特殊效果类型
    SPECIAL_EFFECT_TYPES: ['无', '赋值', '状态赋予', '连杀', '复制卡片', '抽卡', '删除卡片', '修改卡片', '组合', '分解', '封印', '移入手牌', '移入牌库'],
    
    // 五行属性
    ELEMENTS: ['金', '木', '水', '火', '土', '阴', '阳'],
    
    // 效果触发方式
    TRIGGER_METHODS: ['登场', '退场', '使用', '驻场', '指定目标', '战斗开始', '抽卡', '受到伤害', '受到攻击', '恢复生命', '恢复法力'],
    
    // 卡片状态
    CARD_STATUS: ['普通', '封印', '冷却', '绝灵', '叠加', '混乱', '隐身', '嘲讽', '中毒', '腐蚀', '无敌', '无视反击','反击']
};

class CardManager {
    constructor() {
        this.cards = [];
        this.currentEditingCard = null;
        this.init();
    }

    async init() {
        await this.loadCards();
        this.initializeFormOptions();
        this.renderCards();
    }

    // 初始化表单选项
    initializeFormOptions() {
        // 初始化卡片类型选项
        this.populateSelect('cardType', CARD_CONFIG.CARD_TYPES);
        
        // 初始化消耗费用类型选项
        this.populateSelect('cardCostType', CARD_CONFIG.COST_TYPES);
        
        // 初始化作用目标选项
        this.populateSelect('cardTarget', CARD_CONFIG.TARGETS);
        
        // 初始化作用目标类型选项
        this.populateSelect('cardTargetType', CARD_CONFIG.TARGET_TYPES);
        
        // 初始化特殊效果类型选项
        this.populateSelect('cardSpecialEffectType', CARD_CONFIG.SPECIAL_EFFECT_TYPES);
        
        // 初始化卡片状态选项
        this.populateSelect('cardStatus', CARD_CONFIG.CARD_STATUS);
        
        // 初始化五行属性复选框
        this.initializeElementCheckboxes();
        
        // 初始化效果触发方式复选框
        this.initializeTriggerMethodCheckboxes();
    }

    // 填充下拉选择框
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    // 初始化五行属性复选框
    initializeElementCheckboxes() {
        const container = document.getElementById('elementCheckboxes');
        if (!container) return;
        
        container.innerHTML = '';
        CARD_CONFIG.ELEMENTS.forEach(element => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${element}"> ${element}`;
            container.appendChild(label);
        });
    }

    // 初始化效果触发方式复选框
    initializeTriggerMethodCheckboxes() {
        const container = document.getElementById('triggerMethodCheckboxes');
        if (!container) return;
        
        container.innerHTML = '';
        CARD_CONFIG.TRIGGER_METHODS.forEach(method => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${method}"> ${method}`;
            container.appendChild(label);
        });
    }

    // 加载卡片数据
    async loadCards() {
        try {
            const response = await fetch('/api/cards');
            if (response.ok) {
                this.cards = await response.json();
            } else {
                console.log('未找到卡片数据，使用空数组');
                this.cards = [];
            }
        } catch (error) {
            console.error('加载卡片数据失败:', error);
            this.cards = [];
        }
    }

    // 保存卡片数据到服务器
    async saveCards() {
        try {
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.cards)
            });
            
            if (response.ok) {
                console.log('卡片数据保存成功');
                return true;
            } else {
                console.error('保存失败');
                return false;
            }
        } catch (error) {
            console.error('保存卡片数据失败:', error);
            return false;
        }
    }

    // 渲染卡片列表
    renderCards(cardsToRender = this.cards) {
        const container = document.getElementById('cards-display');
        container.innerHTML = '';

        if (cardsToRender.length === 0) {
            container.innerHTML = '<div class="no-cards">暂无卡片数据</div>';
            return;
        }

        cardsToRender.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    }

    // 创建卡片元素
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.innerHTML = `
            <div class="card-header">
                <h3>${card.name}</h3>
                <span class="card-type ${card.type}">${card.type}</span>
            </div>
            <div class="card-body">
                <div class="card-stats">
                    <span>ID: ${card.id}</span>
                    ${card.attack !== undefined ? `<span>攻击: ${card.attack}</span>` : ''}
                    ${card.durability !== undefined ? `<span>耐久: ${card.durability}</span>` : ''}
                </div>
                ${card.costValue ? `<div class="card-cost">消耗: ${card.costValue} ${card.costType || ''}</div>` : ''}
                ${card.target ? `<div class="card-target">目标: ${card.target}</div>` : ''}
                ${card.targetType ? `<div class="card-target-type">目标类型: ${card.targetType}</div>` : ''}
                ${card.specialEffectType ? `<div class="card-special-effect-type">效果类型: ${card.specialEffectType}</div>` : ''}
                ${card.elements && card.elements.length > 0 ? `<div class="card-elements">五行: ${card.elements.join(', ')}</div>` : ''}
                ${card.specialEffect ? `<div class="card-effect">${card.specialEffect}</div>` : ''}
                ${card.specialEffectDesc ? `<div class="card-effect-desc">${card.specialEffectDesc}</div>` : ''}
                ${card.triggerMethods && card.triggerMethods.length > 0 ? `<div class="card-triggers">触发: ${card.triggerMethods.join(', ')}</div>` : ''}
                <div class="card-status">状态: ${card.status || '普通'}</div>
            </div>
            <div class="card-actions">
                <button onclick="cardManager.editCard('${card.id}')">编辑</button>
                <button onclick="cardManager.deleteCard('${card.id}')" class="delete-btn">删除</button>
            </div>
        `;
        return cardDiv;
    }

    // 新增卡片
    addCard(cardData) {
        // 检查ID是否已存在
        if (this.cards.find(card => card.id === cardData.id)) {
            alert('卡片ID已存在，请使用其他ID');
            return false;
        }

        this.cards.push(cardData);
        this.saveCards();
        this.renderCards();
        return true;
    }

    // 编辑卡片
    editCard(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) {
            alert('未找到指定卡片');
            return;
        }

        this.currentEditingCard = card;
        this.fillForm(card);
        document.getElementById('modalTitle').textContent = '编辑卡片';
        document.getElementById('cardModal').style.display = 'block';
    }

    // 更新卡片
    updateCard(cardId, cardData) {
        const index = this.cards.findIndex(c => c.id === cardId);
        if (index === -1) {
            alert('未找到指定卡片');
            return false;
        }

        // 如果ID发生变化，检查新ID是否已存在
        if (cardData.id !== cardId && this.cards.find(card => card.id === cardData.id)) {
            alert('新的卡片ID已存在，请使用其他ID');
            return false;
        }

        this.cards[index] = cardData;
        this.saveCards();
        this.renderCards();
        return true;
    }

    // 删除卡片
    deleteCard(cardId) {
        if (!confirm('确定要删除这张卡片吗？')) {
            return;
        }

        const index = this.cards.findIndex(c => c.id === cardId);
        if (index === -1) {
            alert('未找到指定卡片');
            return;
        }

        this.cards.splice(index, 1);
        this.saveCards();
        this.renderCards();
    }

    // 填充表单
    fillForm(card) {
        document.getElementById('cardId').value = card.id || '';
        document.getElementById('cardName').value = card.name || '';
        document.getElementById('cardType').value = card.type || '';
        document.getElementById('cardAttack').value = card.attack || '';
        document.getElementById('cardDurability').value = card.durability || '';
        document.getElementById('cardSpecialEffect').value = card.specialEffect || '';
        document.getElementById('cardSpecialEffectDesc').value = card.specialEffectDesc || '';
        document.getElementById('cardSpecialEffectType').value = card.specialEffectType || '';
        document.getElementById('cardCostValue').value = card.costValue || '';
        document.getElementById('cardCostType').value = card.costType || '';
        document.getElementById('cardTarget').value = card.target || '';
        document.getElementById('cardTargetType').value = card.targetType || '';
        document.getElementById('cardDuration').value = card.duration || '';
        document.getElementById('cardActionCount').value = card.actionCount || '';
        document.getElementById('cardEffectValue').value = card.effectValue || '';
        document.getElementById('cardStatus').value = card.status || '普通';

        // 处理五行属性复选框
        const elementCheckboxes = document.querySelectorAll('#elementCheckboxes input[type="checkbox"]');
        elementCheckboxes.forEach(checkbox => {
            checkbox.checked = card.elements && card.elements.includes(checkbox.value);
        });

        // 处理触发方式复选框
        const triggerCheckboxes = document.querySelectorAll('#triggerMethodCheckboxes input[type="checkbox"]');
        triggerCheckboxes.forEach(checkbox => {
            checkbox.checked = card.triggerMethods && card.triggerMethods.includes(checkbox.value);
        });
    }

    // 清空表单
    clearForm() {
        document.getElementById('cardForm').reset();
        const elementCheckboxes = document.querySelectorAll('#elementCheckboxes input[type="checkbox"]');
        elementCheckboxes.forEach(checkbox => checkbox.checked = false);
        const triggerCheckboxes = document.querySelectorAll('#triggerMethodCheckboxes input[type="checkbox"]');
        triggerCheckboxes.forEach(checkbox => checkbox.checked = false);
    }

    // 从表单获取数据
    getFormData() {
        const triggerMethods = [];
        const triggerCheckboxes = document.querySelectorAll('#triggerMethodCheckboxes input[type="checkbox"]:checked');
        triggerCheckboxes.forEach(checkbox => triggerMethods.push(checkbox.value));

        const elements = [];
        const elementCheckboxes = document.querySelectorAll('#elementCheckboxes input[type="checkbox"]:checked');
        elementCheckboxes.forEach(checkbox => elements.push(checkbox.value));

        return {
            id: document.getElementById('cardId').value.trim(),
            name: document.getElementById('cardName').value.trim(),
            type: document.getElementById('cardType').value,
            attack: parseInt(document.getElementById('cardAttack').value) || undefined,
            durability: parseInt(document.getElementById('cardDurability').value) || undefined,
            specialEffect: document.getElementById('cardSpecialEffect').value.trim(),
            specialEffectDesc: document.getElementById('cardSpecialEffectDesc').value.trim(),
            specialEffectType: document.getElementById('cardSpecialEffectType').value,
            elements: elements,
            costValue: parseInt(document.getElementById('cardCostValue').value) || undefined,
            costType: document.getElementById('cardCostType').value,
            target: document.getElementById('cardTarget').value,
            targetType: document.getElementById('cardTargetType').value,
            triggerMethods: triggerMethods,
            duration: parseInt(document.getElementById('cardDuration').value) || undefined,
            actionCount: parseInt(document.getElementById('cardActionCount').value) || undefined,
            effectValue: parseInt(document.getElementById('cardEffectValue').value) || undefined,
            status: document.getElementById('cardStatus').value
        };
    }

    // 按类型筛选
    filterByType(type) {
        const filtered = this.cards.filter(card => card.type === type);
        this.renderCards(filtered);
    }

    // 显示所有卡片
    showAllCards() {
        this.renderCards();
    }

    // 搜索卡片
    searchCards() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filtered = this.cards.filter(card => 
            card.name.toLowerCase().includes(searchTerm) ||
            card.id.toLowerCase().includes(searchTerm) ||
            (card.specialEffect && card.specialEffect.toLowerCase().includes(searchTerm))
        );
        this.renderCards(filtered);
    }

    // 按ID排序
    sortById() {
        this.cards.sort((a, b) => a.id.localeCompare(b.id));
        this.renderCards();
        this.saveCards();
    }

    // 导出数据
    exportCards() {
        const dataStr = JSON.stringify(this.cards, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cards.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    // 导入数据
    importCards() {
        document.getElementById('fileInput').click();
    }
}

// 全局变量
let cardManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    cardManager = new CardManager();
});

// 全局函数
function openAddModal() {
    cardManager.currentEditingCard = null;
    cardManager.clearForm();
    document.getElementById('modalTitle').textContent = '新增卡片';
    document.getElementById('cardModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('cardModal').style.display = 'none';
    cardManager.currentEditingCard = null;
}

function saveCard() {
    const formData = cardManager.getFormData();
    
    // 验证必填字段
    if (!formData.id || !formData.name || !formData.type) {
        alert('请填写必填字段：ID、名称、类型');
        return;
    }

    let success = false;
    if (cardManager.currentEditingCard) {
        // 编辑模式
        success = cardManager.updateCard(cardManager.currentEditingCard.id, formData);
    } else {
        // 新增模式
        success = cardManager.addCard(formData);
    }

    if (success) {
        closeModal();
    }
}

function filterByType(type) {
    cardManager.filterByType(type);
}

function showAllCards() {
    cardManager.showAllCards();
}

function searchCards() {
    cardManager.searchCards();
}

function sortById() {
    cardManager.sortById();
}

function exportCards() {
    cardManager.exportCards();
}

function importCards() {
    cardManager.importCards();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedCards = JSON.parse(e.target.result);
            if (Array.isArray(importedCards)) {
                if (confirm('确定要导入这些卡片数据吗？这将覆盖现有数据。')) {
                    cardManager.cards = importedCards;
                    cardManager.saveCards();
                    cardManager.renderCards();
                    alert('导入成功！');
                }
            } else {
                alert('文件格式错误，请选择正确的JSON文件');
            }
        } catch (error) {
            alert('文件解析失败，请检查文件格式');
        }
    };
    reader.readAsText(file);
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('cardModal');
    if (event.target === modal) {
        closeModal();
    }
}