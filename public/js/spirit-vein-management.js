// 灵脉模板管理系统的JavaScript代码

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const veinTableBody = document.getElementById('vein-table-body');
    const loadingIndicator = document.getElementById('loading');
    const veinTable = document.getElementById('vein-table');
    const emptyState = document.getElementById('empty-state');
    const messageContainer = document.getElementById('message-container');
    const btnAddVein = document.getElementById('btn-add-vein');
    const btnGenerateVein = document.getElementById('btn-generate-vein');
    const veinModal = document.getElementById('vein-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelForm = document.getElementById('cancel-form');
    const modalTitle = document.getElementById('modal-title');
    const veinForm = document.getElementById('vein-form');
    
    // 初始化页面
    loadSpiritVeins();
    
    // 绑定事件监听器
    btnAddVein.addEventListener('click', showAddVeinModal);
    btnGenerateVein.addEventListener('click', generateRandomVein);
    closeModal.addEventListener('click', hideVeinModal);
    cancelForm.addEventListener('click', hideVeinModal);
    veinForm.addEventListener('submit', handleFormSubmit);
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', function(event) {
        if (event.target === veinModal) {
            hideVeinModal();
        }
    });
    
    /**
     * 加载灵脉模板列表
     */
    function loadSpiritVeins() {
        loadingIndicator.style.display = 'block';
        veinTable.style.display = 'none';
        emptyState.style.display = 'none';
        
        fetch('/api/spirit-veins')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取灵脉模板数据失败');
                }
                return response.json();
            })
            .then(spiritVeins => {
                loadingIndicator.style.display = 'none';
                
                if (spiritVeins.length > 0) {
                    veinTable.style.display = 'table';
                    renderVeinTable(spiritVeins);
                } else {
                    emptyState.style.display = 'block';
                }
            })
            .catch(error => {
                loadingIndicator.style.display = 'none';
                showMessage('获取灵脉模板数据失败: ' + error.message, 'error');
            });
    }
    
    /**
     * 渲染灵脉模板表格
     */
    function renderVeinTable(spiritVeins) {
        veinTableBody.innerHTML = '';
        
        spiritVeins.forEach(vein => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vein.id}</td>
                <td>${vein.name}</td>
                <td>${vein.level}</td>
                <td>${vein.spiritEnergyEffect}</td>
                <td>${vein.spiritMineEffect}</td>
                <td>${vein.spiritFieldEffect}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn btn-warning" onclick="editVein(${vein.id})">编辑</button>
                        <button class="action-btn btn-danger" onclick="deleteVein(${vein.id})">删除</button>
                    </div>
                </td>
            `;
            veinTableBody.appendChild(row);
        });
    }
    
    /**
     * 显示添加灵脉模板模态框
     */
    function showAddVeinModal() {
        modalTitle.textContent = '新增灵脉模板';
        veinForm.reset();
        document.getElementById('id').value = '';
        showModal();
    }
    
    /**
     * 编辑灵脉模板
     */
    window.editVein = function(id) {
        fetch(`/api/spirit-veins/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取灵脉模板数据失败');
                }
                return response.json();
            })
            .then(vein => {
                modalTitle.textContent = '编辑灵脉模板';
                document.getElementById('id').value = vein.id;
                document.getElementById('name').value = vein.name;
                document.getElementById('level').value = vein.level.toString();
                document.getElementById('spiritEnergyEffect').value = vein.spiritEnergyEffect;
                document.getElementById('spiritMineEffect').value = vein.spiritMineEffect;
                document.getElementById('spiritFieldEffect').value = vein.spiritFieldEffect;
                
                showModal();
            })
            .catch(error => {
                showMessage('获取灵脉模板数据失败: ' + error.message, 'error');
            });
    };
    
    /**
     * 删除灵脉模板
     */
    window.deleteVein = function(id) {
        if (confirm('确定要删除这个灵脉模板吗？')) {
            fetch(`/api/spirit-veins/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('删除灵脉模板失败');
                }
                return response.json();
            })
            .then(data => {
                showMessage('灵脉模板删除成功', 'success');
                loadSpiritVeins();
            })
            .catch(error => {
                showMessage('删除灵脉模板失败: ' + error.message, 'error');
            });
        }
    };
    
    /**
     * 生成随机灵脉模板
     */
    function generateRandomVein() {
        fetch('/api/spirit-veins/generate')
            .then(response => {
                if (!response.ok) {
                    throw new Error('生成随机灵脉模板失败');
                }
                return response.json();
            })
            .then(randomVein => {
                modalTitle.textContent = '随机生成灵脉模板';
                document.getElementById('id').value = '';
                document.getElementById('name').value = randomVein.name;
                document.getElementById('level').value = randomVein.level.toString();
                document.getElementById('spiritEnergyEffect').value = randomVein.spiritEnergyEffect;
                document.getElementById('spiritMineEffect').value = randomVein.spiritMineEffect;
                document.getElementById('spiritFieldEffect').value = randomVein.spiritFieldEffect;
                
                showModal();
            })
            .catch(error => {
                showMessage('生成随机灵脉模板失败: ' + error.message, 'error');
            });
    }
    
    /**
     * 处理表单提交
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // 获取表单数据
        const veinId = document.getElementById('id').value;
        const veinData = {
            name: document.getElementById('name').value,
            level: parseInt(document.getElementById('level').value),
            spiritEnergyEffect: parseInt(document.getElementById('spiritEnergyEffect').value),
            spiritMineEffect: parseInt(document.getElementById('spiritMineEffect').value),
            spiritFieldEffect: parseInt(document.getElementById('spiritFieldEffect').value)
        };
        
        // 提交数据
        const url = veinId ? `/api/spirit-veins/${veinId}` : '/api/spirit-veins';
        const method = veinId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(veinData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(veinId ? '更新灵脉模板失败' : '添加灵脉模板失败');
            }
            return response.json();
        })
        .then(data => {
            hideVeinModal();
            showMessage(veinId ? '灵脉模板更新成功' : '灵脉模板添加成功', 'success');
            loadSpiritVeins();
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
    }
    
    /**
     * 显示模态框
     */
    function showModal() {
        veinModal.style.display = 'flex';
        // 确保模态框内容在可见区域
        setTimeout(() => {
            veinModal.querySelector('.modal-content').scrollTop = 0;
        }, 10);
    }
    
    /**
     * 隐藏模态框
     */
    function hideVeinModal() {
        veinModal.style.display = 'none';
    }
    
    /**
     * 显示消息
     */
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