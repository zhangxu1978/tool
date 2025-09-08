// 门派管理系统的JavaScript代码

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
    
    // 初始化页面
    loadClans();
    
    // 绑定事件监听器
    btnAddClan.addEventListener('click', showAddClanModal);
    btnGenerateClan.addEventListener('click', generateRandomClan);
    closeModal.addEventListener('click', hideClanModal);
    cancelForm.addEventListener('click', hideClanModal);
    clanForm.addEventListener('submit', handleFormSubmit);
    addSpecialtyBtn.addEventListener('click', addSpecialtySelect);
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target === clanModal) {
            hideClanModal();
        }
    });
    
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
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${clan.ID}</td>
                <td>${clan.clanName}</td>
                <td>${clan.cultivationLevel}</td>
                <td>${clan.spiritVein}</td>
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
            specialties: []
        };
        
        // 获取所有选择的宗门擅长
        const specialtySelects = document.querySelectorAll('.specialty-select');
        specialtySelects.forEach(select => {
            if (select.value) {
                clanData.specialties.push(select.value);
            }
        });
        
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
        specialtyItem.innerHTML = `
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <select class="specialty-select form-control">
                    <option value="">请选择</option>
                    <option value="符箓">符箓</option>
                    <option value="剑法">剑法</option>
                    <option value="炼丹">炼丹</option>
                    <option value="炼器">炼器</option>
                    <option value="御兽">御兽</option>
                    <option value="阵法">阵法</option>
                    <option value="幻术">幻术</option>
                    <option value="毒术">毒术</option>
                    <option value="体修">体修</option>
                    <option value="雷法">雷法</option>
                    <option value="冰法">冰法</option>
                    <option value="火法">火法</option>
                </select>
                <button type="button" class="btn btn-sm btn-danger remove-specialty" style="margin-top: auto; margin-bottom: auto;">
                    删除
                </button>
            </div>
        `;
        
        if (value) {
            specialtyItem.querySelector('.specialty-select').value = value;
        }
        
        specialtiesContainer.appendChild(specialtyItem);
        
        // 绑定删除按钮事件
        specialtyItem.querySelector('.remove-specialty').addEventListener('click', function() {
            specialtiesContainer.removeChild(specialtyItem);
        });
    }
    
    // 重置宗门擅长选择框
    function resetSpecialties() {
        specialtiesContainer.innerHTML = `
            <div class="specialty-item">
                <select class="specialty-select form-control">
                    <option value="">请选择</option>
                    <option value="符箓">符箓</option>
                    <option value="剑法">剑法</option>
                    <option value="炼丹">炼丹</option>
                    <option value="炼器">炼器</option>
                    <option value="御兽">御兽</option>
                    <option value="阵法">阵法</option>
                    <option value="幻术">幻术</option>
                    <option value="毒术">毒术</option>
                    <option value="体修">体修</option>
                    <option value="雷法">雷法</option>
                    <option value="冰法">冰法</option>
                    <option value="火法">火法</option>
                </select>
            </div>
        `;
    }
    
    // 显示模态框
    function showModal() {
        clanModal.style.display = 'flex';
        // 确保模态框内容在可见区域
        setTimeout(() => {
            clanModal.querySelector('.modal-content').scrollTop = 0;
        }, 10);
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