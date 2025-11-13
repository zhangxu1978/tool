// 数字竞技场 JavaScript 逻辑

class DigitalArena {
    constructor() {
        this.fighters = JSON.parse(localStorage.getItem('arenaFighters')) || [];
        this.rules = JSON.parse(localStorage.getItem('arenaRules')) || this.getDefaultRules();
        this.battleHistory = JSON.parse(localStorage.getItem('arenaBattleHistory')) || [];
        this.equipment = JSON.parse(localStorage.getItem('arenaEquipment')) || [];
        this.isBattling = false;
        this.battleInterval = null;
        
        this.initEventListeners();
        this.loadFighters();
        this.loadEquipment();
        this.updateEquipmentSelects();
        this.loadRules();
        this.updateFighterSelects();
        
        // 初始化Bootstrap Select插件
        if (typeof $('.selectpicker').selectpicker === 'function') {
            $('.selectpicker').selectpicker();
        }
    }

    getDefaultRules() {
        return {
            attack: "力量 * 1.2 + 等级 * 0.5",
            defense: "体质 * 1.0 + 等级 * 0.3", 
            health: "体质 * 10 + 等级 * 5",
            dodge: "敏捷 * 0.5 + 幸运 * 0.3",
            critical: "智力 * 0.4 + 幸运 * 0.6",
            luckBonus: "幸运 * 0.1",
            spiritPower: "灵力 * 10 + 等级 * 5",
            spiritAttack: {
                金: "元素加成.金 * 0.8 + 精神 * 0.5",
                木: "元素加成.木 * 0.8 + 精神 * 0.5",
                水: "元素加成.水 * 0.8 + 精神 * 0.5",
                火: "元素加成.火 * 0.8 + 精神 * 0.5",
                土: "元素加成.土 * 0.8 + 精神 * 0.5"
            },
            spiritDefense: {
                金: "元素抗性.金 * 0.8 + 精神 * 0.3",
                木: "元素抗性.木 * 0.8 + 精神 * 0.3",
                水: "元素抗性.水 * 0.8 + 精神 * 0.3",
                火: "元素抗性.火 * 0.8 + 精神 * 0.3",
                土: "元素抗性.土 * 0.8 + 精神 * 0.3"
            }
        };
    }

    initEventListeners() {
        document.getElementById('fighter1Select').addEventListener('change', (e) => {
            this.showFighterStats('fighter1Stats', e.target.value);
        });
        
        document.getElementById('fighter2Select').addEventListener('change', (e) => {
            this.showFighterStats('fighter2Stats', e.target.value);
        });

        // 装备选择事件 (使用 Bootstrap Select 插件的 changed.bs.select 事件)
        $('#fighter1Equipment').on('changed.bs.select', () => {
            const fighter1Select = document.getElementById('fighter1Select');
            if (fighter1Select.value) {
                this.showFighterStats('fighter1Stats', fighter1Select.value, true); // true表示需要考虑装备
            }
        });
        
        $('#fighter2Equipment').on('changed.bs.select', () => {
            const fighter2Select = document.getElementById('fighter2Select');
            if (fighter2Select.value) {
                this.showFighterStats('fighter2Stats', fighter2Select.value, true); // true表示需要考虑装备
            }
        });

        ['attackRule', 'defenseRule', 'healthRule', 'dodgeRule', 'criticalRule', 'luckBonusRule', 'spiritPowerRule', 'spiritAttackRule_gold', 'spiritAttackRule_wood', 'spiritAttackRule_water', 'spiritAttackRule_fire', 'spiritAttackRule_earth', 'spiritDefenseRule_gold', 'spiritDefenseRule_wood', 'spiritDefenseRule_water', 'spiritDefenseRule_fire', 'spiritDefenseRule_earth'].forEach(ruleId => {
            document.getElementById(ruleId).addEventListener('change', () => {
                this.saveRules();
            });
        });
        
        // 移除重复的事件监听器，只保留HTML中的onclick属性调用
    }

    // 添加装备
    addEquipment() {
        const name = document.getElementById('equipmentName').value.trim();
        const description = document.getElementById('equipmentDescription').value.trim();
        const equipmentLevel = document.getElementById('equipmentLevel').value.trim();
        const position = document.getElementById('equipmentPosition').value.trim();
        const attack = parseInt(document.getElementById('equipmentAttack').value) || 0;
        const defense = parseInt(document.getElementById('equipmentDefense').value) || 0;
        const dodge = parseInt(document.getElementById('equipmentDodge').value) || 0;
        const critical = parseInt(document.getElementById('equipmentCritical').value) || 0;
        const luckBonus = parseInt(document.getElementById('equipmentLuckBonus').value) || 0;
        const health = parseInt(document.getElementById('equipmentHealth').value) || 0;
        const spiritPower = parseInt(document.getElementById('equipmentSpiritPower').value) || 0;
        
        // 获取灵力攻击
        const spiritAttack = {
            金: parseInt(document.getElementById('spiritAttack_gold').value) || 0,
            木: parseInt(document.getElementById('spiritAttack_wood').value) || 0,
            水: parseInt(document.getElementById('spiritAttack_water').value) || 0,
            火: parseInt(document.getElementById('spiritAttack_fire').value) || 0,
            土: parseInt(document.getElementById('spiritAttack_earth').value) || 0
        };
        
        // 获取灵力防御
        const spiritDefense = {
            金: parseInt(document.getElementById('spiritDefense_gold').value) || 0,
            木: parseInt(document.getElementById('spiritDefense_wood').value) || 0,
            水: parseInt(document.getElementById('spiritDefense_water').value) || 0,
            火: parseInt(document.getElementById('spiritDefense_fire').value) || 0,
            土: parseInt(document.getElementById('spiritDefense_earth').value) || 0
        };

        if (!name) {
            alert('请输入装备名称！');
            return;
        }

        if (this.equipment.find(e => e.name === name)) {
            alert('装备名称已存在！');
            return;
        }

        const equipment = {
            id: Date.now(),
            name,
            description,
            equipmentLevel,
            position,
            stats: {
                attack,
                defense,
                dodge,
                critical,
                luckBonus,
                health,
                spiritPower
            },
            spiritAttack,
            spiritDefense
        };

        this.equipment.push(equipment);
        this.saveEquipment();
        this.loadEquipment();
        this.updateEquipmentSelects();
        
        // 清空输入框
        document.getElementById('equipmentName').value = '';
        document.getElementById('equipmentDescription').value = '';
        document.getElementById('equipmentLevel').value = '';
        document.getElementById('equipmentPosition').value = '';
        ['equipmentAttack', 'equipmentDefense', 'equipmentDodge', 'equipmentCritical', 'equipmentLuckBonus', 'equipmentHealth', 'equipmentSpiritPower'].forEach(id => {
            document.getElementById(id).value = 0;
        });
        
        // 清空灵力攻击输入框
        ['spiritAttack_gold', 'spiritAttack_wood', 'spiritAttack_water', 'spiritAttack_fire', 'spiritAttack_earth'].forEach(id => {
            document.getElementById(id).value = 0;
        });
        
        // 清空灵力防御输入框
        ['spiritDefense_gold', 'spiritDefense_wood', 'spiritDefense_water', 'spiritDefense_fire', 'spiritDefense_earth'].forEach(id => {
            document.getElementById(id).value = 0;
        });
    }
    
    // 保存装备
    saveEquipment() {
        localStorage.setItem('arenaEquipment', JSON.stringify(this.equipment));
    }
    
    // 加载装备
    loadEquipment() {
        const container = document.getElementById('equipmentList');
        container.innerHTML = '';

        if (this.equipment.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><p>暂无装备，请先添加装备！</p></div>';
            return;
        }

        this.equipment.forEach(equipment => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="fighter-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${equipment.name}</h5>
                        <span class="badge bg-primary">装备</span>
                    </div>
                    <p class="text-muted small mb-2">${equipment.description || '无描述'}</p>
                    <p class="text-muted small mb-2">装备等级：${equipment.equipmentLevel || '无等级'}</p>
                    <p class="text-muted small mb-2">装备部位：${equipment.position || '无部位'}</p>
                    
                    <div class="mb-2">
                        <small>攻击力</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress strength" style="width: ${Math.min(equipment.stats.attack / 100 * 100, 100)}%">
                                ${equipment.stats.attack}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>防御力</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress intelligence" style="width: ${Math.min(equipment.stats.defense / 100 * 100, 100)}%">
                                ${equipment.stats.defense}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>闪避率(%)</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress agility" style="width: ${Math.min(equipment.stats.dodge / 100 * 100, 100)}%">
                                ${equipment.stats.dodge}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>暴击率(%)</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress constitution" style="width: ${Math.min(equipment.stats.critical / 100 * 100, 100)}%">
                                ${equipment.stats.critical}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>幸运加成</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress luck" style="width: ${Math.min(equipment.stats.luckBonus / 100 * 100, 100)}%">
                                ${equipment.stats.luckBonus}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>生命值</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress" style="width: ${Math.min(equipment.stats.health / 100 * 100, 100)}%; background: linear-gradient(90deg, #4ecdc4, #44a08d);">
                                ${equipment.stats.health}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>灵力值</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress" style="width: ${Math.min(equipment.stats.spiritPower / 100 * 100, 100)}%; background: linear-gradient(90deg, #9c27b0, #673ab7);">
                                ${equipment.stats.spiritPower}
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-top pt-3">
                        <small class="text-muted">灵力攻击</small>
                        <div class="row text-center mb-2">
                            <div class="col-2"><small>金</small></div>
                            <div class="col-2"><small>木</small></div>
                            <div class="col-2"><small>水</small></div>
                            <div class="col-2"><small>火</small></div>
                            <div class="col-2"><small>土</small></div>
                        </div>
                        <div class="row text-center mb-2">
                            <div class="col-2">${equipment.spiritAttack.金}</div>
                            <div class="col-2">${equipment.spiritAttack.木}</div>
                            <div class="col-2">${equipment.spiritAttack.水}</div>
                            <div class="col-2">${equipment.spiritAttack.火}</div>
                            <div class="col-2">${equipment.spiritAttack.土}</div>
                        </div>
                        
                        <small class="text-muted">灵力防御</small>
                        <div class="row text-center">
                            <div class="col-2"><small>金</small></div>
                            <div class="col-2"><small>木</small></div>
                            <div class="col-2"><small>水</small></div>
                            <div class="col-2"><small>火</small></div>
                            <div class="col-2"><small>土</small></div>
                        </div>
                        <div class="row text-center">
                            <div class="col-2">${equipment.spiritDefense.金}</div>
                            <div class="col-2">${equipment.spiritDefense.木}</div>
                            <div class="col-2">${equipment.spiritDefense.水}</div>
                            <div class="col-2">${equipment.spiritDefense.火}</div>
                            <div class="col-2">${equipment.spiritDefense.土}</div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between mt-3">
                        <button class="btn btn-sm btn-primary" onclick="arena.editEquipment(${equipment.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="arena.deleteEquipment(${equipment.id})">删除</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
    
    // 删除装备
    deleteEquipment(id) {
        if (confirm('确定要删除这个装备吗？')) {
            this.equipment = this.equipment.filter(e => e.id !== id);
            this.saveEquipment();
            this.loadEquipment();
            this.updateEquipmentSelects();
        }
    }
    
    // 编辑装备
    editEquipment(id) {
        const equipment = this.equipment.find(e => e.id === id);
        if (!equipment) return;

        document.getElementById('equipmentName').value = equipment.name;
        document.getElementById('equipmentDescription').value = equipment.description;
        document.getElementById('equipmentAttack').value = equipment.stats.attack;
        document.getElementById('equipmentDefense').value = equipment.stats.defense;
        document.getElementById('equipmentDodge').value = equipment.stats.dodge;
        document.getElementById('equipmentCritical').value = equipment.stats.critical;
        document.getElementById('equipmentLuckBonus').value = equipment.stats.luckBonus;
        document.getElementById('equipmentHealth').value = equipment.stats.health;
        document.getElementById('equipmentSpiritPower').value = equipment.stats.spiritPower;
        
        // 加载灵力攻击
        document.getElementById('spiritAttack_gold').value = equipment.spiritAttack.金;
        document.getElementById('spiritAttack_wood').value = equipment.spiritAttack.木;
        document.getElementById('spiritAttack_water').value = equipment.spiritAttack.水;
        document.getElementById('spiritAttack_fire').value = equipment.spiritAttack.火;
        document.getElementById('spiritAttack_earth').value = equipment.spiritAttack.土;
        
        // 加载灵力防御
        document.getElementById('spiritDefense_gold').value = equipment.spiritDefense.金;
        document.getElementById('spiritDefense_wood').value = equipment.spiritDefense.木;
        document.getElementById('spiritDefense_water').value = equipment.spiritDefense.水;
        document.getElementById('spiritDefense_fire').value = equipment.spiritDefense.火;
        document.getElementById('spiritDefense_earth').value = equipment.spiritDefense.土;

        // 直接删除而不弹出确认对话框
        this.equipment = this.equipment.filter(e => e.id !== id);
        this.saveEquipment();
        this.loadEquipment();
        this.updateEquipmentSelects();
        
        document.getElementById('equipment-tab').click();
    }
    
    // 更新装备选择框
    updateEquipmentSelects() {
        const fighter1EquipmentSelect = document.getElementById('fighter1Equipment');
        const fighter2EquipmentSelect = document.getElementById('fighter2Equipment');

        // 清空选择框
        fighter1EquipmentSelect.innerHTML = '';
        fighter2EquipmentSelect.innerHTML = '';

        if (this.equipment.length === 0) {
            // 如果没有装备，添加提示选项
            const noEquipmentOption = document.createElement('option');
            noEquipmentOption.value = '';
            noEquipmentOption.textContent = '暂无装备';
            noEquipmentOption.disabled = true;
            fighter1EquipmentSelect.appendChild(noEquipmentOption);
            fighter2EquipmentSelect.appendChild(noEquipmentOption.cloneNode(true));
        } else {
            // 添加装备选项
            this.equipment.forEach(equipment => {
                const option = document.createElement('option');
                option.value = equipment.id;
                option.textContent = `${equipment.name} (攻击+${equipment.stats.attack}, 防御+${equipment.stats.defense})`;
                fighter1EquipmentSelect.appendChild(option);
                fighter2EquipmentSelect.appendChild(option.cloneNode(true));
            });
        }

        // 刷新 Bootstrap Select 插件
        if (typeof $('.selectpicker').selectpicker === 'function') {
            $('.selectpicker').selectpicker('refresh');
        }
    }
    
    // 应用装备属性加成
    applyEquipmentBonuses(target, equipmentIds) {
        // 为每个选中的装备应用属性加成
        equipmentIds.forEach(equipmentId => {
            const equipment = this.equipment.find(e => e.id === equipmentId);
            if (equipment) {
                // 确定目标是stats对象还是fighter对象
                const isStats = target.attack !== undefined && target.defense !== undefined;
                
                if (isStats) {
                    // 应用到stats对象
                    target.attack += equipment.stats.attack;
                    target.defense += equipment.stats.defense;
                    target.dodge += equipment.stats.dodge;
                    target.critical += equipment.stats.critical;
                    target.luck += equipment.stats.luckBonus;
                    target.health += equipment.stats.health;
                    
                    // 应用灵力值加成，如果存在的话
                    if (target.spiritPower !== undefined) {
                        target.spiritPower += equipment.stats.spiritPower;
                    }
                    
                    // 应用灵力攻击加成
                    if (!target.spiritAttack) {
                        target.spiritAttack = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
                    }
                    target.spiritAttack.金 += equipment.spiritAttack.金;
                    target.spiritAttack.木 += equipment.spiritAttack.木;
                    target.spiritAttack.水 += equipment.spiritAttack.水;
                    target.spiritAttack.火 += equipment.spiritAttack.火;
                    target.spiritAttack.土 += equipment.spiritAttack.土;
                    
                    // 应用灵力防御加成
                    if (!target.spiritDefense) {
                        target.spiritDefense = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
                    }
                    target.spiritDefense.金 += equipment.spiritDefense.金;
                    target.spiritDefense.木 += equipment.spiritDefense.木;
                    target.spiritDefense.水 += equipment.spiritDefense.水;
                    target.spiritDefense.火 += equipment.spiritDefense.火;
                    target.spiritDefense.土 += equipment.spiritDefense.土;
                } else {
                    // 应用到fighter对象
                    // 确保fighter有attributes属性
                    if (!target.attributes) {
                        target.attributes = {};
                    }
                    // 应用基本属性加成
                    if (!target.attributes.strength) target.attributes.strength = 10;
                    if (!target.attributes.intelligence) target.attributes.intelligence = 10;
                    if (!target.attributes.agility) target.attributes.agility = 10;
                    if (!target.attributes.constitution) target.attributes.constitution = 10;
                    if (!target.attributes.luck) target.attributes.luck = 10;
                    if (!target.attributes.spirit) target.attributes.spirit = 10;
                    target.attributes.strength += equipment.stats.attack;
                    target.attributes.constitution += equipment.stats.defense;
                    target.attributes.agility += equipment.stats.dodge;
                    target.attributes.intelligence += equipment.stats.critical;
                    target.attributes.luck += equipment.stats.luckBonus;
                    
                    // 应用生命值和灵力值加成
                    if (!target.equipmentBonuses) {
                        target.equipmentBonuses = { health: 0, spiritPower: 0 };
                    }
                    target.equipmentBonuses.health += equipment.stats.health;
                    target.equipmentBonuses.spiritPower += equipment.stats.spiritPower;
                    
                    // 应用灵力攻击加成
                    if (!target.elementBonus) {
                        target.elementBonus = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
                    }
                    target.elementBonus.金 += equipment.spiritAttack.金;
                    target.elementBonus.木 += equipment.spiritAttack.木;
                    target.elementBonus.水 += equipment.spiritAttack.水;
                    target.elementBonus.火 += equipment.spiritAttack.火;
                    target.elementBonus.土 += equipment.spiritAttack.土;
                    
                    // 应用灵力防御加成
                    if (!target.elementResistance) {
                        target.elementResistance = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
                    }
                    target.elementResistance.金 += equipment.spiritDefense.金;
                    target.elementResistance.木 += equipment.spiritDefense.木;
                    target.elementResistance.水 += equipment.spiritDefense.水;
                    target.elementResistance.火 += equipment.spiritDefense.火;
                    target.elementResistance.土 += equipment.spiritDefense.土;
                }
            }
        });
    }
    
    // 添加竞技者
    addFighter() {
        const name = document.getElementById('fighterName').value.trim();
        const level = parseInt(document.getElementById('fighterLevel').value) || 1;
        const strength = parseInt(document.getElementById('strength').value) || 10;
        const intelligence = parseInt(document.getElementById('intelligence').value) || 10;
        const agility = parseInt(document.getElementById('agility').value) || 10;
        const constitution = parseInt(document.getElementById('constitution').value) || 10;
        const luck = parseInt(document.getElementById('luck').value) || 10;
        // 获取精神值，默认为10
        const spirit = parseInt(document.getElementById('spirit')?.value) || 10;
        // 获取灵根资质，默认为10
        const rootQualification = parseInt(document.getElementById('rootQualification')?.value) || 10;
        
        // 获取元素抗性，默认为0
        const elementResistance = {
            金: parseInt(document.getElementById('resistance_gold')?.value) || 0,
            木: parseInt(document.getElementById('resistance_wood')?.value) || 0,
            水: parseInt(document.getElementById('resistance_water')?.value) || 0,
            火: parseInt(document.getElementById('resistance_fire')?.value) || 0,
            土: parseInt(document.getElementById('resistance_earth')?.value) || 0
        };
        
        // 获取元素加成，默认为0
        const elementBonus = {
            金: parseInt(document.getElementById('bonus_gold')?.value) || 0,
            木: parseInt(document.getElementById('bonus_wood')?.value) || 0,
            水: parseInt(document.getElementById('bonus_water')?.value) || 0,
            火: parseInt(document.getElementById('bonus_fire')?.value) || 0,
            土: parseInt(document.getElementById('bonus_earth')?.value) || 0
        };

        if (!name) {
            alert('请输入竞技者姓名！');
            return;
        }

        if (this.fighters.find(f => f.name === name)) {
            alert('竞技者姓名已存在！');
            return;
        }

        const fighter = {
            id: Date.now(),
            name,
            level,
            attributes: { strength, intelligence, agility, constitution, luck, spirit, rootQualification },
            elementResistance,
            elementBonus
        };

        this.fighters.push(fighter);
        this.saveFighters();
        this.loadFighters();
        this.updateFighterSelects();
        
        // 清空输入框
        document.getElementById('fighterName').value = '';
        ['fighterLevel', 'strength', 'intelligence', 'agility', 'constitution', 'luck', 'spirit', 'rootQualification'].forEach(id => {
            document.getElementById(id).value = id === 'fighterLevel' ? '1' : '10';
        });
    }
    
    // 从JSON导入竞技者
    importFighterFromJson() {
        const name = document.getElementById('fighterJsonName').value.trim();
        const level = parseInt(document.getElementById('fighterJsonLevel').value) || 1;
        const jsonData = document.getElementById('fighterJsonData').value.trim();
        
        if (!name) {
            alert('请输入竞技者姓名！');
            return;
        }
        
        if (this.fighters.find(f => f.name === name)) {
            alert('竞技者姓名已存在！');
            return;
        }
        
        try {
            const data = JSON.parse(jsonData);
            
            // 验证必要的字段
            if (!data['基础属性'] || !data['元素抗性'] || !data['元素加成']) {
                alert('JSON数据格式错误，缺少必要的字段！');
                return;
            }
            
            const baseAttrs = data['基础属性'];
            // 获取属性值，默认值为10
            const strength = baseAttrs['力量'] || 10;
            const agility = baseAttrs['敏捷'] || 10;
            const constitution = baseAttrs['体质'] || 10;
            const intelligence = baseAttrs['智力'] || 10;
            const spirit = baseAttrs['精神'] || 10;
            // 获取灵根资质，默认值为10
            const rootQualification = baseAttrs['灵根资质'] || 10;
            // 幸运保留手工录入，默认为10
            const luck = 10;
            
            const elementResistance = {
                金: data['元素抗性']['金'] || 0,
                木: data['元素抗性']['木'] || 0,
                水: data['元素抗性']['水'] || 0,
                火: data['元素抗性']['火'] || 0,
                土: data['元素抗性']['土'] || 0
            };
            
            const elementBonus = {
                金: data['元素加成']['金'] || 0,
                木: data['元素加成']['木'] || 0,
                水: data['元素加成']['水'] || 0,
                火: data['元素加成']['火'] || 0,
                土: data['元素加成']['土'] || 0
            };
            
            const fighter = {
                id: Date.now(),
                name,
                level,
                attributes: { strength, intelligence, agility, constitution, luck, spirit, rootQualification },
                elementResistance,
                elementBonus
            };
            
            this.fighters.push(fighter);
            this.saveFighters();
            this.loadFighters();
            this.updateFighterSelects();
            
            // 清空输入框
            document.getElementById('fighterJsonName').value = '';
            document.getElementById('fighterJsonLevel').value = 1;
            document.getElementById('fighterJsonData').value = '';
            
            alert('竞技者导入成功！');
        } catch (error) {
            alert('JSON解析错误：' + error.message);
        }
    }

    deleteFighter(id) {
        if (confirm('确定要删除这个竞技者吗？')) {
            this.fighters = this.fighters.filter(f => f.id !== id);
            this.saveFighters();
            this.loadFighters();
            this.updateFighterSelects();
        }
    }

    editFighter(id) {
        const fighter = this.fighters.find(f => f.id === id);
        if (!fighter) return;

        document.getElementById('fighterName').value = fighter.name;
        document.getElementById('fighterLevel').value = fighter.level;
        document.getElementById('strength').value = fighter.attributes.strength;
        document.getElementById('intelligence').value = fighter.attributes.intelligence;
        document.getElementById('agility').value = fighter.attributes.agility;
        document.getElementById('constitution').value = fighter.attributes.constitution;
        document.getElementById('luck').value = fighter.attributes.luck;
        
        // 加载精神值
        if (document.getElementById('spirit')) {
            document.getElementById('spirit').value = fighter.attributes.spirit || 10;
        }
        
        // 加载灵根资质
        if (document.getElementById('rootQualification')) {
            document.getElementById('rootQualification').value = fighter.attributes.rootQualification || 10;
        }
        
        // 加载元素抗性
        if (document.getElementById('resistance_gold')) {
            document.getElementById('resistance_gold').value = fighter.elementResistance?.金 || 0;
            document.getElementById('resistance_wood').value = fighter.elementResistance?.木 || 0;
            document.getElementById('resistance_water').value = fighter.elementResistance?.水 || 0;
            document.getElementById('resistance_fire').value = fighter.elementResistance?.火 || 0;
            document.getElementById('resistance_earth').value = fighter.elementResistance?.土 || 0;
        }
        
        // 加载元素加成
        if (document.getElementById('bonus_gold')) {
            document.getElementById('bonus_gold').value = fighter.elementBonus?.金 || 0;
            document.getElementById('bonus_wood').value = fighter.elementBonus?.木 || 0;
            document.getElementById('bonus_water').value = fighter.elementBonus?.水 || 0;
            document.getElementById('bonus_fire').value = fighter.elementBonus?.火 || 0;
            document.getElementById('bonus_earth').value = fighter.elementBonus?.土 || 0;
        }

        // 直接删除而不弹出确认对话框
        this.fighters = this.fighters.filter(f => f.id !== id);
        this.saveFighters();
        this.loadFighters();
        this.updateFighterSelects();
        
        document.getElementById('fighters-tab').click();
    }

    // 计算战斗属性
    calculateBattleStats(fighter) {
        const attrs = fighter.attributes || {};
        const level = fighter.level;
        const elementResistance = fighter.elementResistance || { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
        const elementBonus = fighter.elementBonus || { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
        
        // 确保属性存在，提供默认值
        const strength = attrs.strength || 10;
        const intelligence = attrs.intelligence || 10;
        const agility = attrs.agility || 10;
        const constitution = attrs.constitution || 10;
        const luck = attrs.luck || 10;
        const spirit = attrs.spirit || 10;
        const rootQualification = attrs.rootQualification || 10;
        
        const replaceVars = (formula) => {
            // 先替换基础属性
            let replaced = formula
                .replace(/力量/g, strength)
                .replace(/智力/g, intelligence)
                .replace(/敏捷/g, agility)
                .replace(/体质/g, constitution)
                .replace(/幸运/g, luck)
                .replace(/精神/g, spirit)
                .replace(/灵根资质/g, rootQualification)
                .replace(/等级/g, level);
            
            // 替换元素抗性和元素加成
            for (const element of ['金', '木', '水', '火', '土']) {
                replaced = replaced.replace(new RegExp(`元素抗性\\.${element}`, 'g'), elementResistance[element]);
                replaced = replaced.replace(new RegExp(`元素加成\\.${element}`, 'g'), elementBonus[element]);
            }
            
            return replaced;
        };

        try {
            let attack = eval(replaceVars(this.rules.attack));
            let defense = eval(replaceVars(this.rules.defense));
            let health = eval(replaceVars(this.rules.health));
            let dodge = Math.min(eval(replaceVars(this.rules.dodge)), 95);
            let critical = Math.min(eval(replaceVars(this.rules.critical)), 95);
            let luckBonus = eval(replaceVars(this.rules.luckBonus));
            
            // 计算灵力攻击和灵力防御
            const spiritAttack = {};
            const spiritDefense = {};
            for (const element of ['金', '木', '水', '火', '土']) {
                spiritAttack[element] = eval(replaceVars(this.rules.spiritAttack[element]));
                spiritDefense[element] = eval(replaceVars(this.rules.spiritDefense[element]));
            }

            // 计算灵力值 = 灵力 * 10 + 等级 * 5
            let spiritPower = (attrs.spirit || 10) * 10 + (attrs.level || 1) * 5;
            
            // 应用装备加成的生命值和灵力值
            if (fighter.equipmentBonuses) {
                health += fighter.equipmentBonuses.health;
                spiritPower += fighter.equipmentBonuses.spiritPower;
            }
            
            return {
                attack, 
                defense, 
                health, 
                dodge, 
                critical, 
                luckBonus,
                spiritAttack,
                spiritDefense,
                spirit: attrs.spirit || 10,
                spiritPower,
                rootQualification
            };
        } catch (error) {
            console.error('公式计算错误:', error);
            // 计算灵力攻击和灵力防御
            const spiritAttack = {};
            const spiritDefense = {};
            for (const element of ['金', '木', '水', '火', '土']) {
                spiritAttack[element] = elementBonus[element] * 0.8 + spirit * 0.5;
                spiritDefense[element] = elementResistance[element] * 0.8 + spirit * 0.3;
            }
            
            // 计算灵力值 = 灵力 * 10 + 等级 * 5
            const spiritPower = spirit * 10 + level * 5;
            return {
                attack: strength * 1.2 + level * 0.5,
                defense: constitution * 1.0 + level * 0.3,
                health: constitution * 10 + level * 5,
                dodge: Math.min(agility * 0.5 + luck * 0.3, 95),
                critical: Math.min(intelligence * 0.4 + luck * 0.6, 95),
                luckBonus: luck * 0.1,
                spiritAttack,
                spiritDefense,
                spirit,
                spiritPower,
                rootQualification
            };
        }
    }

    // 加载竞技者列表
    loadFighters() {
        const container = document.getElementById('fightersList');
        container.innerHTML = '';

        if (this.fighters.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted"><p>暂无竞技者，请先添加竞技者！</p></div>';
            return;
        }

        this.fighters.forEach(fighter => {
            const stats = this.calculateBattleStats(fighter);
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="fighter-card">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${fighter.name}</h5>
                        <span class="badge bg-primary">Lv.${fighter.level}</span>
                    </div>
                    
                    <div class="mb-2">
                        <small>力量</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress strength" style="width: ${Math.min(fighter.attributes.strength / 100 * 100, 100)}%">
                                ${fighter.attributes.strength}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>智力</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress intelligence" style="width: ${Math.min(fighter.attributes.intelligence / 100 * 100, 100)}%">
                                ${fighter.attributes.intelligence}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>敏捷</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress agility" style="width: ${Math.min(fighter.attributes.agility / 100 * 100, 100)}%">
                                ${fighter.attributes.agility}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>体质</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress constitution" style="width: ${Math.min(fighter.attributes.constitution / 100 * 100, 100)}%">
                                ${fighter.attributes.constitution}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-2">
                        <small>幸运</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress luck" style="width: ${Math.min(fighter.attributes.luck / 100 * 100, 100)}%">
                                ${fighter.attributes.luck}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <small>灵根资质</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress" style="width: ${Math.min(fighter.attributes.rootQualification / 100 * 100, 100)}%; background: linear-gradient(90deg, #9c27b0, #673ab7);">
                                ${fighter.attributes.rootQualification || 10}
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-top pt-3">
                        <small class="text-muted">元素属性</small>
                        <div class="row text-center mb-2">
                            <div class="col-2"><small>金</small></div>
                            <div class="col-2"><small>木</small></div>
                            <div class="col-2"><small>水</small></div>
                            <div class="col-2"><small>火</small></div>
                            <div class="col-2"><small>土</small></div>
                            <div class="col-2"><small>精神</small></div>
                        </div>
                        <div class="row text-center mb-2">
                            <div class="col-2"><small>R:${fighter.elementResistance?.金 || 0}<br>B:${fighter.elementBonus?.金 || 0}</small></div>
                            <div class="col-2"><small>R:${fighter.elementResistance?.木 || 0}<br>B:${fighter.elementBonus?.木 || 0}</small></div>
                            <div class="col-2"><small>R:${fighter.elementResistance?.水 || 0}<br>B:${fighter.elementBonus?.水 || 0}</small></div>
                            <div class="col-2"><small>R:${fighter.elementResistance?.火 || 0}<br>B:${fighter.elementBonus?.火 || 0}</small></div>
                            <div class="col-2"><small>R:${fighter.elementResistance?.土 || 0}<br>B:${fighter.elementBonus?.土 || 0}</small></div>
                            <div class="col-2"><small><strong>${fighter.attributes.spirit || 10}</strong></small></div>
                        </div>
                        
                        <small class="text-muted">战斗属性预览</small>
                        <div class="row text-center">
                            <div class="col-3"><small>攻击<br><strong>${Math.round(stats.attack)}</strong></small></div>
                            <div class="col-3"><small>防御<br><strong>${Math.round(stats.defense)}</strong></small></div>
                            <div class="col-3"><small>生命<br><strong>${Math.round(stats.health)}</strong></small></div>
                            <div class="col-3"><small>灵力值<br><strong>${Math.round(stats.spiritPower)}</strong></small></div>
                        </div>
                        <div class="row text-center mt-2">
                            <div class="col-6"><small>闪避<br><strong>${Math.round(stats.dodge * 10) / 10}%</strong></small></div>
                            <div class="col-6"><small>暴击<br><strong>${Math.round(stats.critical * 10) / 10}%</strong></small></div>
                        </div>
                    </div>
                    
                    <div class="mt-3 text-center">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="arena.editFighter(${fighter.id})">编辑</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="arena.deleteFighter(${fighter.id})">删除</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 更新竞技者下拉选择
    updateFighterSelects() {
        const select1 = document.getElementById('fighter1Select');
        const select2 = document.getElementById('fighter2Select');
        
        [select1, select2].forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">请选择竞技者</option>';
            
            this.fighters.forEach(fighter => {
                const option = document.createElement('option');
                option.value = fighter.id;
                option.textContent = `${fighter.name} (Lv.${fighter.level})`;
                select.appendChild(option);
            });
            
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    // 显示竞技者详细属性
    showFighterStats(containerId, fighterId, considerEquipment = false) {
        const container = document.getElementById(containerId);
        
        if (!fighterId) {
            container.style.display = 'none';
            return;
        }

        const fighter = this.fighters.find(f => f.id == fighterId);
        if (!fighter) return;

        let displayFighter = fighter;
        let stats = this.calculateBattleStats(fighter);

        // 如果需要考虑装备，应用装备加成
        if (considerEquipment) {
            // 获取选中的装备
            const equipmentSelectId = containerId === 'fighter1Stats' ? 'fighter1Equipment' : 'fighter2Equipment';
            const equipmentIds = Array.from(document.getElementById(equipmentSelectId).selectedOptions)
                .map(opt => parseInt(opt.value));

            if (equipmentIds.length > 0 && !isNaN(equipmentIds[0])) {
                // 应用装备加成到战斗属性
                this.applyEquipmentBonuses(stats, equipmentIds);
            }
        }
        
        // 确保属性存在
        const attrs = fighter.attributes || { strength: 10, agility: 10, constitution: 10, intelligence: 10, luck: 10, spirit: 10 };
        const elementResistance = fighter.elementResistance || { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
        const elementBonus = fighter.elementBonus || { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
        
        container.innerHTML = `
            <div class="border-top pt-3">
                <h6>${fighter.name} (Lv.${fighter.level})</h6>
                <div class="row">
                    <div class="col-6">
                        <small>力量: ${attrs.strength}</small><br>
                        <small>智力: ${attrs.intelligence}</small><br>
                        <small>敏捷: ${attrs.agility}</small><br>
                        <small>体质: ${attrs.constitution}</small><br>
                        <small>幸运: ${attrs.luck}</small><br>
                        <small>精神: ${attrs.spirit}</small>
                    </div>
                    <div class="col-6">
                        <strong>元素抗性：</strong><br>
                        <small>金: ${elementResistance.金} | 木: ${elementResistance.木} | 水: ${elementResistance.水}</small><br>
                        <small>火: ${elementResistance.火} | 土: ${elementResistance.土}</small><br>
                        <strong>元素加成：</strong><br>
                        <small>金: ${elementBonus.金} | 木: ${elementBonus.木} | 水: ${elementBonus.水}</small><br>
                        <small>火: ${elementBonus.火} | 土: ${elementBonus.土}</small>
                    </div>
                </div>
                <div class="mt-2">
                    <strong>战斗属性：</strong><br>
                    <small>攻击: ${Math.round(stats.attack)} | 防御: ${Math.round(stats.defense)} | 生命: ${Math.round(stats.health)}</small><br>
                    <small>闪避: ${Math.round(stats.dodge * 10) / 10}% | 暴击: ${Math.round(stats.critical * 10) / 10}%</small><br>
                    <small>幸运加成: +${Math.round(stats.luckBonus)} | 精神值: ${Math.round(stats.spirit || attrs.spirit)}</small><br>
                    <strong>灵力攻击：</strong><br>
                    <small>金: ${Math.round(stats.spiritAttack?.金 || 0)} | 木: ${Math.round(stats.spiritAttack?.木 || 0)} | 水: ${Math.round(stats.spiritAttack?.水 || 0)}</small><br>
                    <small>火: ${Math.round(stats.spiritAttack?.火 || 0)} | 土: ${Math.round(stats.spiritAttack?.土 || 0)}</small><br>
                    <strong>灵力防御：</strong><br>
                    <small>金: ${Math.round(stats.spiritDefense?.金 || 0)} | 木: ${Math.round(stats.spiritDefense?.木 || 0)} | 水: ${Math.round(stats.spiritDefense?.水 || 0)}</small><br>
                    <small>火: ${Math.round(stats.spiritDefense?.火 || 0)} | 土: ${Math.round(stats.spiritDefense?.土 || 0)}</small>
                </div>
            </div>
        `;
        container.style.display = 'block';
    }

    // 加载转化规则
    loadRules() {
        document.getElementById('attackRule').value = this.rules.attack;
        document.getElementById('defenseRule').value = this.rules.defense;
        document.getElementById('healthRule').value = this.rules.health;
        document.getElementById('dodgeRule').value = this.rules.dodge;
        document.getElementById('criticalRule').value = this.rules.critical;
        document.getElementById('luckBonusRule').value = this.rules.luckBonus;
        document.getElementById('spiritPowerRule').value = this.rules.spiritPower || '灵力 * 10 + 等级 * 5';
        
        // 加载灵力规则
        document.getElementById('spiritAttackRule_gold').value = this.rules.spiritAttack?.金 || '元素加成.金 * 0.8 + 精神 * 0.5';
        document.getElementById('spiritAttackRule_wood').value = this.rules.spiritAttack?.木 || '元素加成.木 * 0.8 + 精神 * 0.5';
        document.getElementById('spiritAttackRule_water').value = this.rules.spiritAttack?.水 || '元素加成.水 * 0.8 + 精神 * 0.5';
        document.getElementById('spiritAttackRule_fire').value = this.rules.spiritAttack?.火 || '元素加成.火 * 0.8 + 精神 * 0.5';
        document.getElementById('spiritAttackRule_earth').value = this.rules.spiritAttack?.土 || '元素加成.土 * 0.8 + 精神 * 0.5';
        
        document.getElementById('spiritDefenseRule_gold').value = this.rules.spiritDefense?.金 || '元素抗性.金 * 0.8 + 精神 * 0.3';
        document.getElementById('spiritDefenseRule_wood').value = this.rules.spiritDefense?.木 || '元素抗性.木 * 0.8 + 精神 * 0.3';
        document.getElementById('spiritDefenseRule_water').value = this.rules.spiritDefense?.水 || '元素抗性.水 * 0.8 + 精神 * 0.3';
        document.getElementById('spiritDefenseRule_fire').value = this.rules.spiritDefense?.火 || '元素抗性.火 * 0.8 + 精神 * 0.3';
        document.getElementById('spiritDefenseRule_earth').value = this.rules.spiritDefense?.土 || '元素抗性.土 * 0.8 + 精神 * 0.3';
    }
    
    // 导出规则
    exportRules() {
        const rulesData = JSON.stringify(this.rules, null, 2);
        const blob = new Blob([rulesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arena-rules-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('规则导出成功！');
    }
    
    // 导入规则
    importRules(rulesJson) {
        try {
            const importedRules = JSON.parse(rulesJson);
            
            // 验证必要的字段
            const requiredFields = ['attack', 'defense', 'health', 'dodge', 'critical', 'luckBonus', 'spiritAttack', 'spiritDefense'];
            const missingFields = requiredFields.filter(field => !(field in importedRules));
            
            if (missingFields.length > 0) {
                alert(`导入失败：缺少必要字段 ${missingFields.join(', ')}`);
                return false;
            }
            
            // 验证spiritAttack和spiritDefense的结构
            const elements = ['金', '木', '水', '火', '土'];
            for (const element of elements) {
                if (!importedRules.spiritAttack[element] || !importedRules.spiritDefense[element]) {
                    alert(`导入失败：缺少元素 ${element} 的攻击或防御规则`);
                    return false;
                }
            }
            
            // 更新规则
            this.rules = importedRules;
            localStorage.setItem('arenaRules', JSON.stringify(this.rules));
            this.loadRules();
            
            // 更新相关界面
            this.loadFighters();
            const fighter1Id = document.getElementById('fighter1Select').value;
            const fighter2Id = document.getElementById('fighter2Select').value;
            if (fighter1Id) this.showFighterStats('fighter1Stats', fighter1Id);
            if (fighter2Id) this.showFighterStats('fighter2Stats', fighter2Id);
            
            alert('规则导入成功！');
            return true;
        } catch (error) {
            alert('规则导入失败：' + error.message);
            return false;
        }
    }

    // 开始战斗
    startBattle() {
        const fighter1Id = document.getElementById('fighter1Select').value;
        const fighter2Id = document.getElementById('fighter2Select').value;
        const rounds = parseInt(document.getElementById('battleRounds').value);
        const speed = parseInt(document.getElementById('battleSpeed').value);
        const showDetails = document.getElementById('showDetails').checked;

        if (!fighter1Id || !fighter2Id) {
            alert('请选择两名竞技者！');
            return;
        }

        if (fighter1Id === fighter2Id) {
            alert('不能选择同一名竞技者！');
            return;
        }

        // 获取选择的装备
        const fighter1EquipmentIds = Array.from(document.getElementById('fighter1Equipment').selectedOptions).map(opt => parseInt(opt.value));
        const fighter2EquipmentIds = Array.from(document.getElementById('fighter2Equipment').selectedOptions).map(opt => parseInt(opt.value));

        // 克隆基础竞技者数据
        const fighter1 = JSON.parse(JSON.stringify(this.fighters.find(f => f.id == fighter1Id)));
        const fighter2 = JSON.parse(JSON.stringify(this.fighters.find(f => f.id == fighter2Id)));

        // 应用装备属性加成
        this.applyEquipmentBonuses(fighter1, fighter1EquipmentIds);
        this.applyEquipmentBonuses(fighter2, fighter2EquipmentIds);

        this.isBattling = true;
        document.getElementById('startBattleBtn').style.display = 'none';
        document.getElementById('stopBattleBtn').style.display = 'inline-block';
        document.getElementById('battleProgress').style.display = 'block';
        
        if (showDetails) {
            document.getElementById('battleDetails').style.display = 'block';
            document.getElementById('battleLog').innerHTML = '';
        }

        const battleData = {
            fighter1,
            fighter2,
            rounds,
            currentRound: 0,
            fighter1Wins: 0,
            fighter2Wins: 0,
            startTime: Date.now(),
            details: []
        };

        this.runBattle(battleData, speed, showDetails);
    }

    // 执行战斗
    runBattle(battleData, speed, showDetails) {
        if (!this.isBattling || battleData.currentRound >= battleData.rounds) {
            this.finishBattle(battleData);
            return;
        }

        const result = this.simulateSingleBattle(battleData.fighter1, battleData.fighter2);
        
        battleData.currentRound++;
        if (result.winner === 1) {
            battleData.fighter1Wins++;
        } else {
            battleData.fighter2Wins++;
        }

        if (showDetails) {
            battleData.details.push(result);
            this.addBattleLogEntry(result, battleData.currentRound);
        }

        this.updateBattleProgress(battleData);

        this.battleInterval = setTimeout(() => {
            this.runBattle(battleData, speed, showDetails);
        }, speed);
    }

    // 模拟单次战斗
    simulateSingleBattle(fighter1, fighter2) {
        const finalStats1 = this.calculateBattleStats(fighter1);
        //打印stats1
        console.log(finalStats1);
        const finalStats2 = this.calculateBattleStats(fighter2);
        //打印finalStats2
        console.log(finalStats2);

        // const finalStats1 = this.applyLuckBonus(stats1);
        // //打印finalStats1
        // console.log(finalStats1);
        // const finalStats2 = this.applyLuckBonus(stats2);
        // //打印finalStats2
        // console.log(finalStats2);   

        let hp1 = finalStats1.health;
        let hp2 = finalStats2.health;
        const maxHp1 = hp1;
        const maxHp2 = hp2;
        
        // 初始化灵力值
        let spiritPower1 = finalStats1.spiritPower;
        let spiritPower2 = finalStats2.spiritPower;

        const log = [];
        let round = 0;
        
        // 初始化战斗AI数据结构
        const aiData = {
            1: {
                damageHistory: { normal: [], 金: [], 木: [], 水: [], 火: [], 土: [] },
                testRounds: 1, // 只在第一轮测试
                attackPreferences: null, // 攻击偏好，后期使用
                attackSequenceIndex: 0 // 记录当前应该使用的攻击类型索引
            },
            2: {
                damageHistory: { normal: [], 金: [], 木: [], 水: [], 火: [], 土: [] },
                testRounds: 1,
                attackPreferences: null,
                attackSequenceIndex: 0
            }
        };

        while (hp1 > 0 && hp2 > 0 && round < 1000) {
            round++;
            
            // 获取两个竞技者的敏捷值
            const agility1 = fighter1.attributes.agility || 1;
            const agility2 = fighter2.attributes.agility || 1;
            
            // 创建攻击序列，基于时间单位计算出手频率
            // 敏捷10为基准，相当于1单位时间出手一次
            // 其他敏捷值N相当于10/N单位时间出手一次
            const agilityBase = 10; // 基准敏捷值
            
            // 计算本回合可能的出手次数（考虑到回合限制）
            const maxPossibleAttacks = Math.max(3, Math.ceil(agilityBase / Math.min(agility1, agility2)));
            
            // 计算每个角色的出手时间点
            const attackTimings = [];
            
            // 为两个角色生成出手时间点
            for (let i = 1; i <= maxPossibleAttacks; i++) {
                // 角色1的出手时间
                const time1 = (i - 1) * (agilityBase / agility1);
                if (hp1 > 0) {
                    attackTimings.push({ 
                        time: time1, 
                        fighter: fighter1, 
                        stats: finalStats1, 
                        hp: hp1,
                        spiritPower: spiritPower1,
                        index: 1 
                    });
                }
                
                // 角色2的出手时间
                const time2 = (i - 1) * (agilityBase / agility2);
                if (hp2 > 0) {
                    attackTimings.push({ 
                        time: time2, 
                        fighter: fighter2, 
                        stats: finalStats2, 
                        hp: hp2,
                        spiritPower: spiritPower2,
                        index: 2 
                    });
                }
            }
            
            // 按时间排序，确保先到时间点的先出手
            attackTimings.sort((a, b) => a.time - b.time);
            
            // 取前N个出手动作（避免过多重复）
            let attackSequence = attackTimings.slice(0, Math.max(6, maxPossibleAttacks));

            for (const attacker of attackSequence) {
                if (attacker.hp <= 0) continue;
                
                const defender = attacker.index === 1 ? 
                    { fighter: fighter2, stats: finalStats2, hp: hp2, index: 2 } : 
                    { fighter: fighter1, stats: finalStats1, hp: hp1, index: 1 };
                
                if (defender.hp <= 0) continue;

                // 使用AI选择攻击类型
                const attackType = this.selectAttackType(attacker, defender, aiData[attacker.index], round);
                const attackResult = this.calculateAttack(attacker, defender, attackType);
                
                // 记录伤害数据用于AI学习
                if (attackResult.damage > 0) {
                    aiData[attacker.index].damageHistory[attackType].push(attackResult.damage);
                }
                
                if (attacker.index === 1) {
                    hp2 = Math.max(0, hp2 - attackResult.damage);
                    // 消耗灵力值
                    if (attackResult.spiritCost > 0) {
                        spiritPower1 = Math.max(0, spiritPower1 - attackResult.spiritCost);
                    }
                } else {
                    hp1 = Math.max(0, hp1 - attackResult.damage);
                    // 消耗灵力值
                    if (attackResult.spiritCost > 0) {
                        spiritPower2 = Math.max(0, spiritPower2 - attackResult.spiritCost);
                    }
                }

                log.push({
                    round,
                    attacker: attacker.fighter.name,
                    defender: defender.fighter.name,
                    attackType: attackResult.attackType,
                    ...attackResult,
                    defenderHp: attacker.index === 1 ? hp2 : hp1,
                    attackerSpiritPower: attacker.index === 1 ? spiritPower1 : spiritPower2
                });

                if (hp1 <= 0 || hp2 <= 0) break;
            }
        }

        return {
            winner: hp1 > 0 ? 1 : 2,
            winnerName: hp1 > 0 ? fighter1.name : fighter2.name,
            loserName: hp1 > 0 ? fighter2.name : fighter1.name,
            rounds: round,
            finalHp: { fighter1: Math.max(0, hp1), fighter2: Math.max(0, hp2) },
            maxHp: { fighter1: maxHp1, fighter2: maxHp2 },
            log
        };
    }

    // 应用幸运加成
    // applyLuckBonus(stats) {
    //     const bonus = stats.luckBonus;
    //     return {
    //         ...stats, // 保留所有原始属性
    //         attack: stats.attack + Math.random() * bonus, // 只增加攻击，不增加防御
    //         health: stats.health + Math.random() * bonus * 5,
    //         spiritPower: stats.spiritPower // 保留灵力值不变
    //     };
    // }

    // AI选择攻击类型
    selectAttackType(attacker, defender, aiData, round) {
        // 检查灵力值，如果不足则只能进行普通攻击
        const isSpiritAttack = (type) => ['金', '木', '水', '火', '土'].includes(type);
        const canUseSpiritAttack = attacker.spiritPower > 0;
        const elements = ['金', '木', '水', '火', '土'];
        
        // 如果灵力值不足，强制普通攻击
        if (!canUseSpiritAttack) {
            return 'normal';
        }
        
        // 确保 damageHistory 对象存在
        if (!aiData.damageHistory) {
            aiData.damageHistory = {
                normal: [],
                金: [],
                木: [],
                水: [],
                火: [],
                土: []
            };
        }
        
        // 确保 attackSequenceIndex 存在
        if (aiData.attackSequenceIndex === undefined) {
            aiData.attackSequenceIndex = 0;
        }
        
        // 检查是否所有测试都已完成
        const allTestsCompleted = 
            aiData.damageHistory.normal.length > 0 &&
            aiData.highBonusElement && aiData.damageHistory[aiData.highBonusElement].length > 0 &&
            aiData.lowResistanceElement && aiData.damageHistory[aiData.lowResistanceElement].length > 0;
        
        // 如果测试已完成，进入正常攻击模式
        if (allTestsCompleted) {
            // 标记测试完成，避免重复测试
            aiData.testCompleted = true;
            
            // 如果还没有计算攻击偏好，先计算
            if (!aiData.attackPreferences) {
                aiData.attackPreferences = this.calculateAttackPreferences(aiData.damageHistory);
            }
            
            // 根据偏好选择攻击类型
            const random = Math.random();
            let cumulativeProbability = 0;
            
            for (const [attackType, probability] of Object.entries(aiData.attackPreferences)) {
                // 如果选择灵力攻击但灵力不足，跳过
                if (isSpiritAttack(attackType) && !canUseSpiritAttack) {
                    continue;
                }
                
                cumulativeProbability += probability;
                if (random <= cumulativeProbability) {
                    return attackType;
                }
            }
            
            // 默认返回普通攻击
            return 'normal';
        } else {
            // 测试阶段：按顺序测试不同的攻击类型
            // 基于attackSequenceIndex而不是round，确保在同一轮的不同出手中测试
            
            // 第一次攻击：使用普通攻击
            if (aiData.damageHistory.normal.length === 0) {
                return 'normal';
            }
            
            // 第二次攻击：使用元素加成最高的攻击
            if (!aiData.highBonusElement) {
                // 找出元素加成最高的元素
                let maxBonus = -1;
                let bestElement = null;
                
                for (const element of elements) {
                    const bonus = attacker.fighter.elementBonus[element] || 0;
                    if (bonus > maxBonus) {
                        maxBonus = bonus;
                        bestElement = element;
                    }
                }
                
                if (bestElement) {
                    aiData.highBonusElement = bestElement;
                    return bestElement;
                }
            }
            
            // 如果元素加成攻击还没测试
            if (aiData.highBonusElement && aiData.damageHistory[aiData.highBonusElement].length === 0) {
                return aiData.highBonusElement;
            }
            
            // 第三次攻击：使用对方元素抗性最低的攻击
            if (!aiData.lowResistanceElement) {
                // 找出对方元素抗性最低的元素
                let minResistance = Infinity;
                let bestElement = null;
                
                for (const element of elements) {
                    const resistance = defender.fighter.elementResistance[element] || 0;
                    if (resistance < minResistance) {
                        minResistance = resistance;
                        bestElement = element;
                    }
                }
                
                // 如果找到了合适的元素，记录下来并使用（且不是已经测试过的加成最高的元素）
                if (bestElement && bestElement !== aiData.highBonusElement) {
                    aiData.lowResistanceElement = bestElement;
                    return bestElement;
                } else {
                    // 如果和加成最高的元素相同，找下一个抗性最低的
                    minResistance = Infinity;
                    bestElement = null;
                    for (const element of elements) {
                        const resistance = defender.fighter.elementResistance[element] || 0;
                        if (resistance < minResistance && element !== aiData.highBonusElement) {
                            minResistance = resistance;
                            bestElement = element;
                        }
                    }
                    
                    if (bestElement) {
                        aiData.lowResistanceElement = bestElement;
                        return bestElement;
                    }
                }
            }
            
            // 如果抗性最低元素攻击还没测试
            if (aiData.lowResistanceElement && aiData.damageHistory[aiData.lowResistanceElement].length === 0) {
                return aiData.lowResistanceElement;
            }
            
            // 如果以上条件都不满足，默认返回普通攻击
            return 'normal';
        }
    }
    
    // 计算攻击偏好概率
    calculateAttackPreferences(damageHistory) {
        const avgDamages = {};
        let totalAvgDamage = 0;
        
        // 计算每种攻击的平均伤害
        for (const [attackType, damages] of Object.entries(damageHistory)) {
            if (damages.length > 0) {
                avgDamages[attackType] = damages.reduce((sum, d) => sum + d, 0) / damages.length;
            } else {
                // 如果没有数据，给一个基础值
                avgDamages[attackType] = 5;
            }
            totalAvgDamage += avgDamages[attackType];
        }
        
        // 计算每种攻击的概率（基于平均伤害）
        const preferences = {};
        for (const [attackType, avgDamage] of Object.entries(avgDamages)) {
            preferences[attackType] = avgDamage / totalAvgDamage;
        }
        
        return preferences;
    }
    
    // 计算攻击结果
    calculateAttack(attacker, defender, attackType = 'normal') {
        if (Math.random() * 100 < defender.stats.dodge) {
            return {
                type: 'dodge',
                attackType: attackType,
                damage: 0,
                spiritCost: 0,
                description: `${defender.fighter.name}闪避了${attackType === 'normal' ? '普通攻击' : attackType + '属性攻击'}！`
            };
        }

        let damage;
        let attackName = '普通攻击';
        let spiritCost = 0;
        
        // 根据攻击类型计算伤害
        if (attackType === 'normal') {
            damage = Math.max(1, attacker.stats.attack - defender.stats.defense);
        } else {
            // 灵力攻击计算
            attackName = attackType + '属性攻击';
            const spiritAttack = attacker.stats.spiritAttack?.[attackType] || 10;
            const spiritDefense = defender.stats.spiritDefense?.[attackType] || 0;
            damage = Math.max(1, spiritAttack - spiritDefense);
            
            // 灵力攻击消耗等量灵力值
            spiritCost = damage;
        }
        
        const isCritical = Math.random() * 100 < attacker.stats.critical;
        if (isCritical) {
            damage *= 2;
            return {
                type: 'critical',
                attackType: attackType,
                damage: Math.round(damage),
                spiritCost: spiritCost,
                description: `${attacker.fighter.name}的${attackName}造成了暴击！`
            };
        }

        return {
            type: 'normal',
            attackType: attackType,
            damage: Math.round(damage),
            spiritCost: spiritCost,
            description: `${attacker.fighter.name}对${defender.fighter.name}造成了${Math.round(damage)}点${attackType === 'normal' ? '物理' : attackType + '属性'}伤害`
        };
    }

    // 更新战斗进度
    updateBattleProgress(battleData) {
        const progress = (battleData.currentRound / battleData.rounds) * 100;
        
        document.getElementById('currentRound').textContent = `第 ${battleData.currentRound} 轮`;
        document.getElementById('fighter1Wins').textContent = `${battleData.fighter1.name}: ${battleData.fighter1Wins}胜`;
        document.getElementById('fighter2Wins').textContent = `${battleData.fighter2.name}: ${battleData.fighter2Wins}胜`;
        
        const winRate = battleData.currentRound > 0 ? 
            `${battleData.fighter1.name} ${Math.round(battleData.fighter1Wins / battleData.currentRound * 100)}%` : '--';
        document.getElementById('currentWinRate').textContent = `胜率: ${winRate}`;
        
        document.getElementById('battleProgressBar').style.width = `${progress}%`;
        document.getElementById('battleProgressBar').textContent = `${Math.round(progress)}%`;
    }

    // 添加战斗日志条目
    addBattleLogEntry(result, round) {
        const logContainer = document.getElementById('battleLog');
        const logEntry = document.createElement('div');
        logEntry.className = 'battle-result mb-2';
        
        const winnerClass = result.winner === 1 ? 'text-success' : 'text-primary';
        
        let battleDetailsHtml = '';
        if (result.log && result.log.length > 0) {
            battleDetailsHtml = `
                <div class="mt-2">
                    <small class="text-muted">战斗详情：</small>
                    <div class="battle-details mt-1 p-2 bg-light rounded">
                        ${result.log.map((entry, index) => {
                            let entryClass = 'text-dark';
                            let actionText = '';
                            
                            if (entry.type === 'dodge') {
                                entryClass = 'text-info';
                                const attackTypeName = entry.attackType === 'normal' ? '普通攻击' : entry.attackType + '属性攻击';
                                const spiritInfo = entry.spiritCost > 0 ? `，消耗 ${entry.spiritCost} 灵力值，剩余灵力值: ${entry.attackerSpiritPower}` : '';
                                actionText = `${entry.attacker} 使用 ${attackTypeName} 攻击 ${entry.defender}，但 ${entry.defender} 闪避了攻击！${spiritInfo}`;
                            } else if (entry.type === 'critical') {
                                entryClass = 'text-danger';
                                const damageType = entry.attackType === 'normal' ? '物理' : entry.attackType + '属性';
                                const spiritInfo = entry.spiritCost > 0 ? `，消耗 ${entry.spiritCost} 灵力值，剩余灵力值: ${entry.attackerSpiritPower}` : '';
                                actionText = `${entry.attacker} 对 ${entry.defender} 造成了 ${entry.damage} 点${damageType}暴击伤害！剩余生命值: ${entry.defenderHp}${spiritInfo}`;
                            } else {
                                const damageType = entry.attackType === 'normal' ? '物理' : entry.attackType + '属性';
                                const spiritInfo = entry.spiritCost > 0 ? `，消耗 ${entry.spiritCost} 灵力值，剩余灵力值: ${entry.attackerSpiritPower}` : '';
                                actionText = `${entry.attacker} 对 ${entry.defender} 造成了 ${entry.damage} 点${damageType}伤害！剩余生命值: ${entry.defenderHp}${spiritInfo}`;
                            }
                            
                            return `<div class="${entryClass} mb-1"><small>回合${entry.round} [${index + 1}]: ${actionText}</small></div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        logEntry.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span><strong>第${round}轮</strong> - 获胜者: <span class="${winnerClass}">${result.winnerName}</span></span>
                <small class="text-muted">用时: ${result.rounds}回合</small>
            </div>
            <div class="row mt-2">
                <div class="col-6">
                    <small>${result.winner === 1 ? '?' : '?'} ${result.winner === 1 ? result.winnerName : result.loserName}: ${result.finalHp.fighter1}/${result.maxHp.fighter1} HP</small>
                </div>
                <div class="col-6">
                    <small>${result.winner === 2 ? '?' : '?'} ${result.winner === 2 ? result.winnerName : result.loserName}: ${result.finalHp.fighter2}/${result.maxHp.fighter2} HP</small>
                </div>
            </div>
            ${battleDetailsHtml}
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // 停止战斗
    stopBattle() {
        this.isBattling = false;
        if (this.battleInterval) {
            clearTimeout(this.battleInterval);
            this.battleInterval = null;
        }
        
        document.getElementById('startBattleBtn').style.display = 'inline-block';
        document.getElementById('stopBattleBtn').style.display = 'none';
    }

    // 完成战斗
    finishBattle(battleData) {
        this.isBattling = false;
        document.getElementById('startBattleBtn').style.display = 'inline-block';
        document.getElementById('stopBattleBtn').style.display = 'none';

        const battleResult = {
            id: Date.now(),
            fighter1: battleData.fighter1,
            fighter2: battleData.fighter2,
            rounds: battleData.rounds,
            fighter1Wins: battleData.fighter1Wins,
            fighter2Wins: battleData.fighter2Wins,
            winner: battleData.fighter1Wins > battleData.fighter2Wins ? battleData.fighter1 : battleData.fighter2,
            winRate: Math.round(battleData.fighter1Wins / battleData.rounds * 100),
            duration: Date.now() - battleData.startTime,
            timestamp: new Date().toLocaleString()
        };

        this.battleHistory.unshift(battleResult);
        this.saveBattleHistory();
        this.loadBattleResults();

        document.getElementById('results-tab').click();
        
        alert(`战斗结束！\n${battleResult.winner.name} 获胜！\n胜率: ${battleResult.winRate}%`);
    }

    // 加载战斗结果
    loadBattleResults() {
        const container = document.getElementById('battleResults');
        
        if (this.battleHistory.length === 0) {
            container.innerHTML = '<div class="text-center text-muted"><p>暂无战斗记录，请先进行战斗！</p></div>';
            return;
        }

        container.innerHTML = '';
        
        this.battleHistory.forEach((battle, index) => {
            const resultCard = document.createElement('div');
            resultCard.className = 'battle-result result-winner mb-3';
            
            const winRate1 = Math.round(battle.fighter1Wins / battle.rounds * 100);
            const winRate2 = 100 - winRate1;
            
            resultCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">战斗记录 #${this.battleHistory.length - index}</h5>
                    <div>
                        <span class="badge bg-success">? ${battle.winner.name}</span>
                        <small class="text-muted ms-2">${battle.timestamp}</small>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-5">
                        <div class="text-center">
                            <h6>${battle.fighter1.name} (Lv.${battle.fighter1.level})</h6>
                            <div class="mb-2">
                                <span class="badge ${battle.winner.id === battle.fighter1.id ? 'bg-success' : 'bg-secondary'}">
                                    ${battle.fighter1Wins} 胜 (${winRate1}%)
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-2 d-flex align-items-center justify-content-center">
                        <div class="text-center">
                            <div class="vs-divider" style="font-size: 1.5rem;">VS</div>
                            <small class="text-muted">${battle.rounds}轮</small>
                        </div>
                    </div>
                    
                    <div class="col-md-5">
                        <div class="text-center">
                            <h6>${battle.fighter2.name} (Lv.${battle.fighter2.level})</h6>
                            <div class="mb-2">
                                <span class="badge ${battle.winner.id === battle.fighter2.id ? 'bg-success' : 'bg-secondary'}">
                                    ${battle.fighter2Wins} 胜 (${winRate2}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${winRate1}%">
                            ${battle.fighter1.name} ${winRate1}%
                        </div>
                        <div class="progress-bar bg-warning" role="progressbar" style="width: ${winRate2}%">
                            ${battle.fighter2.name} ${winRate2}%
                        </div>
                    </div>
                </div>
                
                <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="arena.deleteBattleResult(${battle.id})">删除记录</button>
                </div>
            `;
            
            container.appendChild(resultCard);
        });
    }

    // 删除战斗记录
    deleteBattleResult(id) {
        if (confirm('确定要删除这条战斗记录吗？')) {
            this.battleHistory = this.battleHistory.filter(b => b.id !== id);
            this.saveBattleHistory();
            this.loadBattleResults();
        }
    }

    saveFighters() {
        localStorage.setItem('arenaFighters', JSON.stringify(this.fighters));
    }

    saveRules() {
        this.rules = {
            attack: document.getElementById('attackRule').value,
            defense: document.getElementById('defenseRule').value,
            health: document.getElementById('healthRule').value,
            dodge: document.getElementById('dodgeRule').value,
            critical: document.getElementById('criticalRule').value,
            luckBonus: document.getElementById('luckBonusRule').value,
            spiritPower: document.getElementById('spiritPowerRule').value || '灵力 * 10 + 等级 * 5',
            spiritAttack: {
                金: document.getElementById('spiritAttackRule_gold').value || '元素加成.金 * 0.8 + 精神 * 0.5',
                木: document.getElementById('spiritAttackRule_wood').value || '元素加成.木 * 0.8 + 精神 * 0.5',
                水: document.getElementById('spiritAttackRule_water').value || '元素加成.水 * 0.8 + 精神 * 0.5',
                火: document.getElementById('spiritAttackRule_fire').value || '元素加成.火 * 0.8 + 精神 * 0.5',
                土: document.getElementById('spiritAttackRule_earth').value || '元素加成.土 * 0.8 + 精神 * 0.5'
            },
            spiritDefense: {
                金: document.getElementById('spiritDefenseRule_gold').value || '元素抗性.金 * 0.8 + 精神 * 0.3',
                木: document.getElementById('spiritDefenseRule_wood').value || '元素抗性.木 * 0.8 + 精神 * 0.3',
                水: document.getElementById('spiritDefenseRule_water').value || '元素抗性.水 * 0.8 + 精神 * 0.3',
                火: document.getElementById('spiritDefenseRule_fire').value || '元素抗性.火 * 0.8 + 精神 * 0.3',
                土: document.getElementById('spiritDefenseRule_earth').value || '元素抗性.土 * 0.8 + 精神 * 0.3'
            }
        };
        
        localStorage.setItem('arenaRules', JSON.stringify(this.rules));
        this.loadFighters();
        
        const fighter1Id = document.getElementById('fighter1Select').value;
        const fighter2Id = document.getElementById('fighter2Select').value;
        if (fighter1Id) this.showFighterStats('fighter1Stats', fighter1Id);
        if (fighter2Id) this.showFighterStats('fighter2Stats', fighter2Id);
        
        alert('规则保存成功！');
    }

// 保存战斗历史
    saveBattleHistory() {
        localStorage.setItem('arenaBattleHistory', JSON.stringify(this.battleHistory));
    }
    
    // 重置规则
    resetRules() {
        this.rules = this.getDefaultRules();
        localStorage.setItem('arenaRules', JSON.stringify(this.rules));
        this.loadRules();
        alert('规则已重置为默认值！');
    }
    
    // 导出规则
    exportRules() {
        const rulesData = JSON.stringify(this.rules, null, 2);
        const blob = new Blob([rulesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arena-rules-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('规则导出成功！');
    }
    
    // 导入规则
    importRules(rulesJson) {
        try {
            const importedRules = JSON.parse(rulesJson);
            
            // 验证必要的字段
            const requiredFields = ['attack', 'defense', 'health', 'dodge', 'critical', 'luckBonus', 'spiritAttack', 'spiritDefense'];
            const missingFields = requiredFields.filter(field => !(field in importedRules));
            
            if (missingFields.length > 0) {
                alert(`导入失败：缺少必要字段 ${missingFields.join(', ')}`);
                return false;
            }
            
            // 验证spiritAttack和spiritDefense的结构
            const elements = ['金', '木', '水', '火', '土'];
            for (const element of elements) {
                if (!importedRules.spiritAttack[element] || !importedRules.spiritDefense[element]) {
                    alert(`导入失败：缺少元素 ${element} 的攻击或防御规则`);
                    return false;
                }
            }
            
            // 更新规则
            this.rules = importedRules;
            localStorage.setItem('arenaRules', JSON.stringify(this.rules));
            this.loadRules();
            
            // 更新相关界面
            this.loadFighters();
            const fighter1Id = document.getElementById('fighter1Select').value;
            const fighter2Id = document.getElementById('fighter2Select').value;
            if (fighter1Id) this.showFighterStats('fighter1Stats', fighter1Id);
            if (fighter2Id) this.showFighterStats('fighter2Stats', fighter2Id);
            
            alert('规则导入成功！');
            return true;
        } catch (error) {
            alert('规则导入失败：' + error.message);
            return false;
        }
    }
    
    // 处理规则导入
    handleImportRules() {
        const fileInput = document.getElementById('importRulesFile');
        
        // 监听文件选择事件
        const handleFileSelect = (e) => {
            if (!fileInput.files || fileInput.files.length === 0) {
                return;
            }
            
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileContent = e.target.result;
                this.importRules(fileContent);
                // 重置文件输入框，允许重新选择同一文件
                fileInput.value = '';
            };
            
            reader.onerror = () => {
                alert('读取文件失败');
            };
            
            reader.readAsText(file);
            
            // 移除事件监听器，避免重复绑定
            fileInput.removeEventListener('change', handleFileSelect);
        };
        
        // 添加一次性事件监听器
        fileInput.addEventListener('change', handleFileSelect);
        
        // 触发文件选择器
        fileInput.click();
    }
    
    // 确认导入竞技者
    confirmImportFighter() {
        try {
            const name = document.getElementById('fighterJsonName').value.trim();
            const level = parseInt(document.getElementById('fighterJsonLevel').value) || 1;
            const jsonData = document.getElementById('fighterJsonData').value.trim();
            
            if (!name) {
                alert('请输入竞技者名称！');
                return;
            }
            
            if (!jsonData) {
                alert('请输入JSON数据！');
                return;
            }
            
            // 解析JSON数据
            const data = JSON.parse(jsonData);
            
            // 构建竞技者属性
            const attributes = {
                strength: data.力量 || data.strength || 10,
                agility: data.敏捷 || data.agility || 10,
                constitution: data.体质 || data.constitution || 10,
                intelligence: data.智力 || data.intelligence || 10,
                luck: data.幸运 || data.luck || 10,
                spirit: data.精神 || data.spirit || 10
            };
            
            // 构建元素抗性
            const elementResistance = {
                金: data.元素抗性?.金 || data.elementResistance?.金 || data.elementResistance?.gold || 0,
                木: data.元素抗性?.木 || data.elementResistance?.木 || data.elementResistance?.wood || 0,
                水: data.元素抗性?.水 || data.elementResistance?.水 || data.elementResistance?.water || 0,
                火: data.元素抗性?.火 || data.elementResistance?.火 || data.elementResistance?.fire || 0,
                土: data.元素抗性?.土 || data.elementResistance?.土 || data.elementResistance?.earth || 0
            };
            
            // 构建元素加成
            const elementBonus = {
                金: data.元素加成?.金 || data.elementBonus?.金 || data.elementBonus?.gold || 0,
                木: data.元素加成?.木 || data.elementBonus?.木 || data.elementBonus?.wood || 0,
                水: data.元素加成?.水 || data.elementBonus?.水 || data.elementBonus?.water || 0,
                火: data.元素加成?.火 || data.elementBonus?.火 || data.elementBonus?.fire || 0,
                土: data.元素加成?.土 || data.elementBonus?.土 || data.elementBonus?.earth || 0
            };
            
            // 添加竞技者
            this.fighters.push({
                id: Date.now(),
                name: name,
                level: level,
                attributes: attributes,
                elementResistance: elementResistance,
                elementBonus: elementBonus
            });
            
            // 保存并刷新界面
            this.saveFighters();
            this.loadFighters();
            
            // 关闭模态框
            document.getElementById('importJsonModal').style.display = 'none';
            
            // 清空输入框
            document.getElementById('fighterJsonName').value = '';
            document.getElementById('fighterJsonLevel').value = 1;
            document.getElementById('fighterJsonData').value = '';
            
            alert('竞技者导入成功！');
        } catch (error) {
            alert('导入失败：' + error.message);
        }
    }
}

// 全局变量
let arena;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    arena = new DigitalArena();
});

// 全局函数
function addFighter() {
    arena.addFighter();
}

function exportRules() {
    arena.exportRules();
}

function importRules() {
    arena.handleImportRules();
}

function saveRules() {
    arena.saveRules();
}

function resetRules() {
    arena.resetRules();
}

function saveRules() {
    arena.saveRules();
}

function resetRules() {
    if (confirm('确定要重置为默认规则吗？')) {
        arena.rules = arena.getDefaultRules();
        arena.loadRules();
        arena.saveRules();
    }
}

function startBattle() {
    arena.startBattle();
}

function stopBattle() {
    arena.stopBattle();
}

function importFighterFromJson() {
    // 使用Bootstrap API显示导入模态框
    var myModal = new bootstrap.Modal(document.getElementById('importJsonModal'));
    myModal.show();
}

function confirmImportFighter() {
    arena.importFighterFromJson();
    // 关闭模态框
    var myModal = bootstrap.Modal.getInstance(document.getElementById('importJsonModal'));
    if (myModal) {
        myModal.hide();
    }
}

function closeImportModal() {
    // 使用Bootstrap API关闭导入模态框
    var myModal = bootstrap.Modal.getInstance(document.getElementById('importJsonModal'));
    if (myModal) {
        myModal.hide();
    }
}

function addEquipment() {
    arena.addEquipment();
}

// 设置所有抗性为指定值
function setAllResistances(value) {
    document.getElementById('resistance_gold').value = value;
    document.getElementById('resistance_wood').value = value;
    document.getElementById('resistance_water').value = value;
    document.getElementById('resistance_fire').value = value;
    document.getElementById('resistance_earth').value = value;
}

// 设置所有加成为指定值
function setAllBonuses(value) {
    document.getElementById('bonus_gold').value = value;
    document.getElementById('bonus_wood').value = value;
    document.getElementById('bonus_water').value = value;
    document.getElementById('bonus_fire').value = value;
    document.getElementById('bonus_earth').value = value;
}