// 数字竞技场 JavaScript 逻辑

class DigitalArena {
    constructor() {
        this.fighters = JSON.parse(localStorage.getItem('arenaFighters')) || [];
        this.rules = JSON.parse(localStorage.getItem('arenaRules')) || this.getDefaultRules();
        this.battleHistory = JSON.parse(localStorage.getItem('arenaBattleHistory')) || [];
        this.isBattling = false;
        this.battleInterval = null;
        
        this.initEventListeners();
        this.loadFighters();
        this.loadRules();
        this.updateFighterSelects();
    }

    getDefaultRules() {
        return {
            attack: "力量 * 1.2 + 等级 * 0.5",
            defense: "体质 * 1.0 + 等级 * 0.3", 
            health: "体质 * 10 + 等级 * 5",
            dodge: "敏捷 * 0.5 + 幸运 * 0.3",
            critical: "智力 * 0.4 + 幸运 * 0.6",
            luckBonus: "幸运 * 0.1"
        };
    }

    initEventListeners() {
        document.getElementById('fighter1Select').addEventListener('change', (e) => {
            this.showFighterStats('fighter1Stats', e.target.value);
        });
        
        document.getElementById('fighter2Select').addEventListener('change', (e) => {
            this.showFighterStats('fighter2Stats', e.target.value);
        });

        ['attackRule', 'defenseRule', 'healthRule', 'dodgeRule', 'criticalRule', 'luckBonusRule'].forEach(ruleId => {
            document.getElementById(ruleId).addEventListener('change', () => {
                this.saveRules();
            });
        });
    }

    // 添加竞技者
    addFighter() {
        const name = document.getElementById('fighterName').value.trim();
        const level = parseInt(document.getElementById('fighterLevel').value);
        const strength = parseInt(document.getElementById('strength').value);
        const intelligence = parseInt(document.getElementById('intelligence').value);
        const agility = parseInt(document.getElementById('agility').value);
        const constitution = parseInt(document.getElementById('constitution').value);
        const luck = parseInt(document.getElementById('luck').value);

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
            attributes: { strength, intelligence, agility, constitution, luck }
        };

        this.fighters.push(fighter);
        this.saveFighters();
        this.loadFighters();
        this.updateFighterSelects();
        
        // 清空输入框
        document.getElementById('fighterName').value = '';
        ['fighterLevel', 'strength', 'intelligence', 'agility', 'constitution', 'luck'].forEach(id => {
            document.getElementById(id).value = id === 'fighterLevel' ? '1' : '10';
        });
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

        // 直接删除而不弹出确认对话框
        this.fighters = this.fighters.filter(f => f.id !== id);
        this.saveFighters();
        this.loadFighters();
        this.updateFighterSelects();
        
        document.getElementById('fighters-tab').click();
    }

    // 计算战斗属性
    calculateBattleStats(fighter) {
        const attrs = fighter.attributes;
        const level = fighter.level;
        
        const replaceVars = (formula) => {
            return formula
                .replace(/力量/g, attrs.strength)
                .replace(/智力/g, attrs.intelligence)
                .replace(/敏捷/g, attrs.agility)
                .replace(/体质/g, attrs.constitution)
                .replace(/幸运/g, attrs.luck)
                .replace(/等级/g, level);
        };

        try {
            const attack = eval(replaceVars(this.rules.attack));
            const defense = eval(replaceVars(this.rules.defense));
            const health = eval(replaceVars(this.rules.health));
            const dodge = Math.min(eval(replaceVars(this.rules.dodge)), 95);
            const critical = Math.min(eval(replaceVars(this.rules.critical)), 95);
            const luckBonus = eval(replaceVars(this.rules.luckBonus));

            return { attack, defense, health, dodge, critical, luckBonus };
        } catch (error) {
            console.error('公式计算错误:', error);
            return {
                attack: attrs.strength * 1.2 + level * 0.5,
                defense: attrs.constitution * 1.0 + level * 0.3,
                health: attrs.constitution * 10 + level * 5,
                dodge: Math.min(attrs.agility * 0.5 + attrs.luck * 0.3, 95),
                critical: Math.min(attrs.intelligence * 0.4 + attrs.luck * 0.6, 95),
                luckBonus: attrs.luck * 0.1
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
                    
                    <div class="mb-3">
                        <small>幸运</small>
                        <div class="attribute-bar">
                            <div class="attribute-progress luck" style="width: ${Math.min(fighter.attributes.luck / 100 * 100, 100)}%">
                                ${fighter.attributes.luck}
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-top pt-3">
                        <small class="text-muted">战斗属性预览</small>
                        <div class="row text-center">
                            <div class="col-4"><small>攻击<br><strong>${Math.round(stats.attack)}</strong></small></div>
                            <div class="col-4"><small>防御<br><strong>${Math.round(stats.defense)}</strong></small></div>
                            <div class="col-4"><small>生命<br><strong>${Math.round(stats.health)}</strong></small></div>
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
    showFighterStats(containerId, fighterId) {
        const container = document.getElementById(containerId);
        
        if (!fighterId) {
            container.style.display = 'none';
            return;
        }

        const fighter = this.fighters.find(f => f.id == fighterId);
        if (!fighter) return;

        const stats = this.calculateBattleStats(fighter);
        
        container.innerHTML = `
            <div class="border-top pt-3">
                <h6>${fighter.name} (Lv.${fighter.level})</h6>
                <div class="row">
                    <div class="col-6">
                        <small>力量: ${fighter.attributes.strength}</small><br>
                        <small>智力: ${fighter.attributes.intelligence}</small><br>
                        <small>敏捷: ${fighter.attributes.agility}</small>
                    </div>
                    <div class="col-6">
                        <small>体质: ${fighter.attributes.constitution}</small><br>
                        <small>幸运: ${fighter.attributes.luck}</small>
                    </div>
                </div>
                <div class="mt-2">
                    <strong>战斗属性：</strong><br>
                    <small>攻击: ${Math.round(stats.attack)} | 防御: ${Math.round(stats.defense)} | 生命: ${Math.round(stats.health)}</small><br>
                    <small>闪避: ${Math.round(stats.dodge * 10) / 10}% | 暴击: ${Math.round(stats.critical * 10) / 10}%</small>
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

        const fighter1 = this.fighters.find(f => f.id == fighter1Id);
        const fighter2 = this.fighters.find(f => f.id == fighter2Id);

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
        const stats1 = this.calculateBattleStats(fighter1);
        const stats2 = this.calculateBattleStats(fighter2);

        const finalStats1 = this.applyLuckBonus(stats1);
        const finalStats2 = this.applyLuckBonus(stats2);

        let hp1 = finalStats1.health;
        let hp2 = finalStats2.health;
        const maxHp1 = hp1;
        const maxHp2 = hp2;

        const log = [];
        let round = 0;

        while (hp1 > 0 && hp2 > 0 && round < 1000) {
            round++;
            
            const fighters = [
                { fighter: fighter1, stats: finalStats1, hp: hp1, index: 1 },
                { fighter: fighter2, stats: finalStats2, hp: hp2, index: 2 }
            ];
            
            fighters.sort((a, b) => (b.stats.dodge + b.fighter.attributes.agility) - (a.stats.dodge + a.fighter.attributes.agility));

            for (const attacker of fighters) {
                if (attacker.hp <= 0) continue;
                
                const defender = fighters.find(f => f !== attacker);
                if (defender.hp <= 0) continue;

                const attackResult = this.calculateAttack(attacker, defender);
                
                if (attacker.index === 1) {
                    hp2 = Math.max(0, hp2 - attackResult.damage);
                    defender.hp = hp2;
                } else {
                    hp1 = Math.max(0, hp1 - attackResult.damage);
                    defender.hp = hp1;
                }

                log.push({
                    round,
                    attacker: attacker.fighter.name,
                    defender: defender.fighter.name,
                    ...attackResult,
                    defenderHp: defender.hp
                });

                if (defender.hp <= 0) break;
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
    applyLuckBonus(stats) {
        const bonus = stats.luckBonus;
        return {
            attack: stats.attack + Math.random() * bonus,
            defense: stats.defense + Math.random() * bonus,
            health: stats.health + Math.random() * bonus * 5,
            dodge: stats.dodge,
            critical: stats.critical,
            luckBonus: stats.luckBonus
        };
    }

    // 计算攻击结果
    calculateAttack(attacker, defender) {
        if (Math.random() * 100 < defender.stats.dodge) {
            return {
                type: 'dodge',
                damage: 0,
                description: `${defender.fighter.name}闪避了攻击！`
            };
        }

        let damage = Math.max(1, attacker.stats.attack - defender.stats.defense);
        
        const isCritical = Math.random() * 100 < attacker.stats.critical;
        if (isCritical) {
            damage *= 2;
            return {
                type: 'critical',
                damage: Math.round(damage),
                description: `${attacker.fighter.name}造成了暴击！`
            };
        }

        return {
            type: 'normal',
            damage: Math.round(damage),
            description: `${attacker.fighter.name}对${defender.fighter.name}造成了${Math.round(damage)}点伤害`
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
            luckBonus: document.getElementById('luckBonusRule').value
        };
        
        localStorage.setItem('arenaRules', JSON.stringify(this.rules));
        this.loadFighters();
        
        const fighter1Id = document.getElementById('fighter1Select').value;
        const fighter2Id = document.getElementById('fighter2Select').value;
        if (fighter1Id) this.showFighterStats('fighter1Stats', fighter1Id);
        if (fighter2Id) this.showFighterStats('fighter2Stats', fighter2Id);
        
        alert('规则保存成功！');
    }

    saveBattleHistory() {
        localStorage.setItem('arenaBattleHistory', JSON.stringify(this.battleHistory));
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