// 门派管理系统的JavaScript代码

// 存储全局配置数据
let globalConfig = {
    specialties: []
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const clanTableBody = document.getElementById('clan-table-body');
    const loadingIndicator = document.getElementById('loading');
    const clanTable = document.getElementById('clan-table');
    const emptyState = document.getElementById('empty-state');
    const messageContainer = document.getElementById('message-container');
    const btnAddClan = document.getElementById('btn-add-clan');
    const btnGenerateClan = document.getElementById('btn-generate-clan');
    const clanModal = document.getElementById('clan-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelForm = document.getElementById('cancel-form');
    const modalTitle = document.getElementById('modal-title');
    const clanForm = document.getElementById('clan-form');
    const addSpecialtyBtn = document.getElementById('add-specialty');
    const specialtiesContainer = document.getElementById('specialtiesContainer');
    const manageSpiritVeinsBtn = document.getElementById('manage-spirit-veins');
    const spiritVeinModal = document.getElementById('spirit-vein-modal');
    const closeSpiritVeinModal = document.getElementById('close-spirit-vein-modal');
    const cancelSpiritVein = document.getElementById('cancel-spirit-vein');
    const saveSpiritVeins = document.getElementById('save-spirit-veins');
    const currentClanId = document.getElementById('current-clan-id');
    const availableVeinsList = document.getElementById('available-veins-list');
    const addedVeinsList = document.getElementById('added-veins-list');
    const spiritVeinInput = document.getElementById('spiritVein');
    
    // 当前正在编辑的门派
    let currentClan = null;
    // 正在编辑的灵脉列表
    let editingSpiritVeinList = [];
    
    // 首先加载配置数据，然后再加载门派数据
    loadConfig().then(() => {
        // 初始化页面
        loadClans();
        
        // 绑定事件监听器
        btnAddClan.addEventListener('click', showAddClanModal);
        btnGenerateClan.addEventListener('click', generateRandomClan);
        closeModal.addEventListener('click', hideClanModal);
        cancelForm.addEventListener('click', hideClanModal);
        clanForm.addEventListener('submit', handleFormSubmit);
        addSpecialtyBtn.addEventListener('click', addSpecialtySelect);
        manageSpiritVeinsBtn.addEventListener('click', showSpiritVeinModal);
        closeSpiritVeinModal.addEventListener('click', hideSpiritVeinModal);
        cancelSpiritVein.addEventListener('click', hideSpiritVeinModal);
        saveSpiritVeins.addEventListener('click', handleSaveSpiritVeins);
        
        // 当灵脉数量变化时，更新UI状态
        spiritVeinInput.addEventListener('change', function() {
            if (currentClan && currentClan.spiritVeinList) {
                const spiritVeinCount = parseInt(this.value);
                // 确保灵脉数量不超过设置的灵脉总数
                currentClan.spiritVeinList = currentClan.spiritVeinList.slice(0, spiritVeinCount);
            }
        });
        
        // 点击灵脉模态框外部关闭模态框
        window.addEventListener('click', function(event) {
            if (event.target === spiritVeinModal) {
                hideSpiritVeinModal();
            }
        });
        
        // 点击模态框外部关闭模态框
        window.addEventListener('click', function(event) {
            if (event.target === clanModal) {
                hideClanModal();
            }
        });
    }).catch(error => {
        showMessage('加载配置失败: ' + error.message, 'error');
        // 即使配置加载失败，也尝试加载门派数据
        loadClans();
    });
    
    /**
     * 加载配置数据
     */
    function loadConfig() {
        return fetch('/api/clan-config')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取配置数据失败');
                }
                return response.json();
            })
            .then(config => {
                globalConfig = config;
                // 确保specialties数组存在
                if (!globalConfig.specialties || !Array.isArray(globalConfig.specialties)) {
                    globalConfig.specialties = ['符箓', '剑法', '炼丹', '炼器', '御兽', '阵法', '幻术', '毒术', '体修', '雷法', '冰法', '火法'];
                }
            });
    }
    
    // 加载门派列表
    function loadClans() {
        loadingIndicator.style.display = 'block';
        clanTable.style.display = 'none';
        emptyState.style.display = 'none';
        
        fetch('/api/clans')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取门派数据失败');
                }
                return response.json();
            })
            .then(clans => {
                loadingIndicator.style.display = 'none';
                
                if (clans.length > 0) {
                    clanTable.style.display = 'table';
                    renderClanTable(clans);
                } else {
                    emptyState.style.display = 'block';
                }
            })
            .catch(error => {
                loadingIndicator.style.display = 'none';
                showMessage('获取门派数据失败: ' + error.message, 'error');
            });
    }
    
    // 渲染门派表格
    function renderClanTable(clans) {
        clanTableBody.innerHTML = '';
        
        clans.forEach(clan => {
            // 获取灵脉总数，如果没有设置，则使用spiritVein字段的值
            const spiritVeinCount = clan.spiritVeinList && clan.spiritVeinList.length > 0 ? clan.spiritVeinList.length : clan.spiritVein;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${clan.ID}</td>
                <td>${clan.clanName}</td>
                <td>${clan.cultivationLevel}</td>
                <td>${spiritVeinCount}</td>
                <td>${clan.spiritEnergy}</td>
                <td>${clan.spiritStone}</td>
                <td>
                    <div class="specialties">
                        ${clan.specialties.map(specialty => 
                            `<span class="specialty-badge">${specialty}</span>`
                        ).join('')}
                    </div>
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn btn-warning" onclick="editClan(${clan.ID})">编辑</button>
                        <button class="action-btn btn-danger" onclick="deleteClan(${clan.ID})">删除</button>
                    </div>
                </td>
            `;
            clanTableBody.appendChild(row);
        });
    }
    
    // 显示添加门派模态框
        function showAddClanModal() {
            modalTitle.textContent = '新增门派';
            clanForm.reset();
            document.getElementById('ID').value = '';
            resetSpecialties();
            currentClan = null;
            showModal();
        }
    
    // 编辑门派
        window.editClan = function(id) {
            fetch(`/api/clans/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('获取门派数据失败');
                    }
                    return response.json();
                })
                .then(clan => {
                    modalTitle.textContent = '编辑门派';
                    document.getElementById('ID').value = clan.ID;
                    document.getElementById('clanName').value = clan.clanName;
                    document.getElementById('cultivationLevel').value = clan.cultivationLevel;
                    document.getElementById('spiritVein').value = clan.spiritVein;
                    document.getElementById('spiritEnergy').value = clan.spiritEnergy;
                    document.getElementById('spiritStone').value = clan.spiritStone;
                    document.getElementById('spiritMine').value = clan.spiritMine;
                    document.getElementById('spiritField').value = clan.spiritField;
                    document.getElementById('spiritPlant').value = clan.spiritPlant;
                    document.getElementById('defense').value = clan.defense;
                    document.getElementById('population').value = clan.population;
                    document.getElementById('cultivatorCount').value = clan.cultivatorCount;
                    document.getElementById('masterCount').value = clan.masterCount;
                    document.getElementById('ruleDegree').value = clan.ruleDegree;
                    
                    // 设置宗门擅长
                    resetSpecialties();
                    clan.specialties.forEach((specialty, index) => {
                        if (index === 0) {
                            document.querySelector('.specialty-select').value = specialty;
                        } else {
                            addSpecialtySelect(specialty);
                        }
                    });
                    
                    // 保存当前编辑的门派
                    currentClan = clan;
                    
                    showModal();
                })
            .catch(error => {
                showMessage('获取门派数据失败: ' + error.message, 'error');
            });
    };
    
    // 删除门派
    window.deleteClan = function(id) {
        if (confirm('确定要删除这个门派吗？')) {
            fetch(`/api/clans/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('删除门派失败');
                }
                return response.json();
            })
            .then(data => {
                showMessage('门派删除成功', 'success');
                loadClans();
            })
            .catch(error => {
                showMessage('删除门派失败: ' + error.message, 'error');
            });
        }
    };
    
    // 生成随机门派
    function generateRandomClan() {
        fetch('/api/clans/generate')
            .then(response => {
                if (!response.ok) {
                    throw new Error('生成随机门派失败');
                }
                return response.json();
            })
            .then(randomClan => {
                modalTitle.textContent = '随机生成门派';
                document.getElementById('ID').value = '';
                document.getElementById('clanName').value = randomClan.clanName;
                document.getElementById('cultivationLevel').value = randomClan.cultivationLevel;
                document.getElementById('spiritVein').value = randomClan.spiritVein;
                document.getElementById('spiritEnergy').value = randomClan.spiritEnergy;
                document.getElementById('spiritStone').value = randomClan.spiritStone;
                document.getElementById('spiritMine').value = randomClan.spiritMine;
                document.getElementById('spiritField').value = randomClan.spiritField;
                document.getElementById('spiritPlant').value = randomClan.spiritPlant;
                document.getElementById('defense').value = randomClan.defense;
                document.getElementById('population').value = randomClan.population;
                document.getElementById('cultivatorCount').value = randomClan.cultivatorCount;
                document.getElementById('masterCount').value = randomClan.masterCount;
                document.getElementById('ruleDegree').value = randomClan.ruleDegree;
                
                // 设置宗门擅长
                resetSpecialties();
                randomClan.specialties.forEach((specialty, index) => {
                    if (index === 0) {
                        document.querySelector('.specialty-select').value = specialty;
                    } else {
                        addSpecialtySelect(specialty);
                    }
                });
                
                // 初始化当前编辑的门派
                currentClan = {
                    ...randomClan,
                    spiritVeinList: []
                };
                
                showModal();
            })
            .catch(error => {
                showMessage('生成随机门派失败: ' + error.message, 'error');
            });
    }
    
    // 处理表单提交
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // 获取表单数据
        const clanId = document.getElementById('ID').value;
        const clanData = {
            clanName: document.getElementById('clanName').value,
            cultivationLevel: document.getElementById('cultivationLevel').value,
            spiritVein: parseInt(document.getElementById('spiritVein').value),
            spiritEnergy: parseInt(document.getElementById('spiritEnergy').value),
            spiritStone: parseInt(document.getElementById('spiritStone').value),
            spiritMine: parseInt(document.getElementById('spiritMine').value),
            spiritField: parseInt(document.getElementById('spiritField').value),
            spiritPlant: parseInt(document.getElementById('spiritPlant').value),
            defense: parseInt(document.getElementById('defense').value),
            population: parseInt(document.getElementById('population').value),
            cultivatorCount: parseInt(document.getElementById('cultivatorCount').value),
            masterCount: parseInt(document.getElementById('masterCount').value),
            ruleDegree: parseInt(document.getElementById('ruleDegree').value),
            specialties: [],
            spiritVeinList: []
        };
        
        // 获取所有选择的宗门擅长
        const specialtySelects = document.querySelectorAll('.specialty-select');
        specialtySelects.forEach(select => {
            if (select.value) {
                clanData.specialties.push(select.value);
            }
        });
        
        // 如果有灵脉列表，添加到门派数据中
        if (currentClan && currentClan.spiritVeinList) {
            // 确保灵脉数量不超过设置的灵脉总数
            const spiritVeinCount = parseInt(document.getElementById('spiritVein').value);
            clanData.spiritVeinList = currentClan.spiritVeinList.slice(0, spiritVeinCount);
        }
        
        // 确保至少有一个宗门擅长
        if (clanData.specialties.length === 0) {
            showMessage('请至少选择一个宗门擅长', 'error');
            return;
        }
        
        // 提交数据
        const url = clanId ? `/api/clans/${clanId}` : '/api/clans';
        const method = clanId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clanData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(clanId ? '更新门派失败' : '添加门派失败');
            }
            return response.json();
        })
        .then(data => {
            hideClanModal();
            showMessage(clanId ? '门派更新成功' : '门派添加成功', 'success');
            loadClans();
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
    }
    
    // 添加宗门擅长选择框
    function addSpecialtySelect(value = '') {
        const specialtyItem = document.createElement('div');
        specialtyItem.className = 'specialty-item';
        
        // 创建选择框HTML
        let selectHtml = `
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <select class="specialty-select form-control">
                    <option value="">请选择</option>`;
        
        // 动态添加选项
        globalConfig.specialties.forEach(specialty => {
            const selected = value === specialty ? 'selected' : '';
            selectHtml += `
                    <option value="${specialty}" ${selected}>${specialty}</option>`;
        });
        
        selectHtml += `
                </select>
                <button type="button" class="btn btn-sm btn-danger remove-specialty" style="margin-top: auto; margin-bottom: auto;">
                    删除
                </button>
            </div>`;
        
        specialtyItem.innerHTML = selectHtml;
        specialtiesContainer.appendChild(specialtyItem);
        
        // 绑定删除按钮事件
        specialtyItem.querySelector('.remove-specialty').addEventListener('click', function() {
            specialtiesContainer.removeChild(specialtyItem);
        });
    }
    
    // 重置宗门擅长选择框
    function resetSpecialties() {
        // 创建选择框HTML
        let selectHtml = `
            <div class="specialty-item">
                <select class="specialty-select form-control">
                    <option value="">请选择</option>`;
        
        // 动态添加选项
        globalConfig.specialties.forEach(specialty => {
            selectHtml += `
                    <option value="${specialty}">${specialty}</option>`;
        });
        
        selectHtml += `
                </select>
            </div>`;
        
        specialtiesContainer.innerHTML = selectHtml;
    }
    
    // 显示门派模态框
    function showModal() {
        clanModal.style.display = 'flex';
        // 确保模态框内容在可见区域
        setTimeout(() => {
            clanModal.querySelector('.modal-content').scrollTop = 0;
        }, 10);
    }
    
    // 显示灵脉管理模态框
    function showSpiritVeinModal() {
        // 获取当前编辑的门派ID
        const clanId = document.getElementById('ID').value;
        if (!clanId && !currentClan) {
            showMessage('请先保存门派信息', 'error');
            return;
        }
        
        currentClanId.value = clanId;
        
        // 初始化编辑的灵脉列表
        if (currentClan && currentClan.spiritVeinList) {
            editingSpiritVeinList = JSON.parse(JSON.stringify(currentClan.spiritVeinList));
        } else {
            editingSpiritVeinList = [];
        }
        
        // 加载可用的灵脉模板
        loadSpiritVeinTemplates();
        
        // 显示灵脉管理模态框
        spiritVeinModal.style.display = 'flex';
        // 确保模态框内容在可见区域
        setTimeout(() => {
            spiritVeinModal.querySelector('.modal-content').scrollTop = 0;
        }, 10);
    }
    
    // 隐藏灵脉管理模态框
    function hideSpiritVeinModal() {
        spiritVeinModal.style.display = 'none';
    }
    
    // 加载灵脉模板
    function loadSpiritVeinTemplates() {
        availableVeinsList.innerHTML = '<div class="loading"><p>加载中...</p></div>';
        
        fetch('/api/spirit-veins')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取灵脉模板失败');
                }
                return response.json();
            })
            .then(spiritVeins => {
                availableVeinsList.innerHTML = '';
                
                spiritVeins.forEach(vein => {
                    const veinItem = document.createElement('div');
                    veinItem.className = 'card';
                    veinItem.style.marginBottom = '10px';
                    
                    let addButtonText = '添加';
                    let addButtonDisabled = false;
                    
                    // 检查是否已经添加了足够的灵脉
                    const spiritVeinCount = parseInt(spiritVeinInput.value);
                    if (editingSpiritVeinList.length >= spiritVeinCount) {
                        addButtonText = '已达上限';
                        addButtonDisabled = true;
                    }
                    
                    // 根据是否禁用条件性地添加disabled属性
                    const disabledAttr = addButtonDisabled ? 'disabled' : '';
                    
                    veinItem.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h5>${vein.name}</h5>
                                <p>等级: ${vein.level}</p>
                                <p>灵气效果: ${vein.spiritEnergyEffect} | 灵矿效果: ${vein.spiritMineEffect} | 灵田效果: ${vein.spiritFieldEffect}</p>
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-vein-btn" data-vein-id="${vein.id}" ${disabledAttr}>
                                ${addButtonText}
                            </button>
                        </div>
                    `;
                    
                    availableVeinsList.appendChild(veinItem);
                });
                
                // 绑定添加灵脉按钮事件
                document.querySelectorAll('.add-vein-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const veinId = parseInt(this.getAttribute('data-vein-id'));
                        addSpiritVein(veinId);
                    });
                });
                
                // 更新已添加灵脉列表
                updateAddedVeinsList();
            })
            .catch(error => {
                availableVeinsList.innerHTML = '';
                showMessage('加载灵脉模板失败: ' + error.message, 'error');
            });
    }
    
    // 添加灵脉
    function addSpiritVein(veinId) {
        // 获取灵脉模板详情
        fetch(`/api/spirit-veins/${veinId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取灵脉模板详情失败');
                }
                return response.json();
            })
            .then(vein => {
                // 检查是否已经添加了足够的灵脉
                const spiritVeinCount = parseInt(spiritVeinInput.value);
                if (editingSpiritVeinList.length >= spiritVeinCount) {
                    showMessage('已达到灵脉数量上限', 'error');
                    return;
                }
                
                // 对灵脉效果进行10%的随机变动
                const modifiedVein = {
                    ...vein,
                    spiritEnergyEffect: getRandomValue(vein.spiritEnergyEffect),
                    spiritMineEffect: getRandomValue(vein.spiritMineEffect),
                    spiritFieldEffect: getRandomValue(vein.spiritFieldEffect),
                    id: editingSpiritVeinList.length + 1 // 为添加到门派的灵脉生成唯一ID
                };
                
                // 添加到编辑的灵脉列表
                editingSpiritVeinList.push(modifiedVein);
                
                // 更新UI
                loadSpiritVeinTemplates();
            })
            .catch(error => {
                showMessage('添加灵脉失败: ' + error.message, 'error');
            });
    }
    
    // 移除灵脉
    function removeSpiritVein(veinId) {
        editingSpiritVeinList = editingSpiritVeinList.filter(vein => vein.id !== veinId);
        
        // 重新为剩余灵脉分配ID
        editingSpiritVeinList.forEach((vein, index) => {
            vein.id = index + 1;
        });
        
        // 更新UI
        loadSpiritVeinTemplates();
    }
    
    // 更新已添加灵脉列表
    function updateAddedVeinsList() {
        addedVeinsList.innerHTML = '';
        
        if (editingSpiritVeinList.length === 0) {
            addedVeinsList.innerHTML = '<p style="text-align: center; color: #666;">暂无添加的灵脉</p>';
            return;
        }
        
        editingSpiritVeinList.forEach(vein => {
            const veinItem = document.createElement('div');
            veinItem.className = 'card';
            veinItem.style.marginBottom = '10px';
            
            veinItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h5>${vein.name}</h5>
                        <p>等级: ${vein.level}</p>
                        <p>灵气效果: ${vein.spiritEnergyEffect} | 灵矿效果: ${vein.spiritMineEffect} | 灵田效果: ${vein.spiritFieldEffect}</p>
                    </div>
                    <button type="button" class="btn btn-sm btn-danger remove-vein-btn" data-vein-id="${vein.id}">
                        移除
                    </button>
                </div>
            `;
            
            addedVeinsList.appendChild(veinItem);
        });
        
        // 绑定移除灵脉按钮事件
        document.querySelectorAll('.remove-vein-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const veinId = parseInt(this.getAttribute('data-vein-id'));
                removeSpiritVein(veinId);
            });
        });
    }
    
    // 生成随机值（在原值的90%-110%之间）
    function getRandomValue(baseValue) {
        const min = Math.floor(baseValue * 0.9);
        const max = Math.ceil(baseValue * 1.1);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 处理保存灵脉列表
    function handleSaveSpiritVeins() {
        // 更新当前编辑的门派的灵脉列表
        if (currentClan) {
            currentClan.spiritVeinList = editingSpiritVeinList;
        }
        
        hideSpiritVeinModal();
        showMessage('灵脉设置成功', 'success');
    }
    
    // 隐藏模态框
    function hideClanModal() {
        clanModal.style.display = 'none';
    }
    
    // 显示消息
    function showMessage(message, type = 'success') {
        messageContainer.innerHTML = '';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // 3秒后自动隐藏消息
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                messageContainer.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
});