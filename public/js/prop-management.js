// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const propTableBody = document.getElementById('prop-table-body');
    const loadingIndicator = document.getElementById('loading');
    const propTableContainer = document.getElementById('prop-table-container');
    const emptyState = document.getElementById('empty-state');
    const messageContainer = document.getElementById('message-container');
    const btnAddProp = document.getElementById('btn-add-prop');
    const propModal = document.getElementById('prop-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelForm = document.getElementById('cancel-form');
    const modalTitle = document.getElementById('modal-title');
    const propForm = document.getElementById('prop-form');
    const searchInput = document.getElementById('search-input');
    const typeFilter = document.getElementById('type-filter');
    const levelFilter = document.getElementById('level-filter');
    
    // 获取表单输入元素
    const propId = document.getElementById('prop-id');
    const propName = document.getElementById('prop-name');
    const propType = document.getElementById('prop-type');
    const propDescription = document.getElementById('prop-description');
    const propImage = document.getElementById('prop-image');
    const propPrice = document.getElementById('prop-price');
    const propLevel = document.getElementById('prop-level');
    const propEffect = document.getElementById('prop-effect');
    const propEffectDescription = document.getElementById('prop-effect-description');
    const propUseCondition = document.getElementById('prop-use-condition');
    
    // 当前正在编辑的道具
    let currentProp = null;
    
    // 道具数据
    let propsData = [];
    
    // 初始化页面
    loadProps();
    
    // 绑定事件监听器
    btnAddProp.addEventListener('click', showAddPropModal);
    closeModal.addEventListener('click', hidePropModal);
    cancelForm.addEventListener('click', hidePropModal);
    propForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', filterProps);
    typeFilter.addEventListener('change', filterProps);
    levelFilter.addEventListener('change', filterProps);
    
    // 加载道具数据
    function loadProps() {
        showLoading();
        
        fetch('/api/props')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                return response.json();
            })
            .then(data => {
                propsData = data || [];
                renderProps(propsData);
            })
            .catch(error => {
                console.error('加载道具数据失败:', error);
                showMessage('加载道具数据失败，请刷新页面重试', 'error');
                showEmptyState();
            });
    }
    
    // 渲染道具列表
    function renderProps(props) {
        hideLoading();
        
        // 清空表格
        propTableBody.innerHTML = '';
        
        if (props.length === 0) {
            showEmptyState();
            return;
        }
        
        // 显示表格
        propTableContainer.style.display = 'block';
        emptyState.style.display = 'none';
        
        // 渲染每个道具行
        props.forEach(prop => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prop.Id}</td>
                <td>${prop.Name}</td>
                <td><span class="badge badge-type">${prop.Type || '-'}</span></td>
                <td>${prop.Description || '-'}</td>
                <td>${prop.Level ? `<span class="badge badge-level">${prop.Level}级</span>` : '-'}</td>
                <td>${prop.Price ? `<span class="badge badge-price">${prop.Price}</span>` : '-'}</td>
                <td>${prop.Effect || '-'}</td>
                <td>${prop.UseCondition || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="editProp('${prop.Id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProp('${prop.Id}', '${prop.Name}')">删除</button>
                </td>
            `;
            propTableBody.appendChild(row);
        });
        
        // 将编辑和删除函数绑定到window对象，以便在模板字符串中调用
        window.editProp = editProp;
        window.deleteProp = deleteProp;
    }
    
    // 搜索和筛选道具
    function filterProps() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeFilter.value;
        const selectedLevel = levelFilter.value;
        
        const filteredProps = propsData.filter(prop => {
            const matchesSearch = 
                (prop.Name && prop.Name.toLowerCase().includes(searchTerm)) ||
                (prop.Description && prop.Description.toLowerCase().includes(searchTerm)) ||
                (prop.Effect && prop.Effect.toLowerCase().includes(searchTerm));
            
            const matchesType = !selectedType || prop.Type === selectedType;
            const matchesLevel = !selectedLevel || prop.Level === selectedLevel;
            
            return matchesSearch && matchesType && matchesLevel;
        });
        
        renderProps(filteredProps);
    }
    
    // 显示添加道具模态框
    function showAddPropModal() {
        currentProp = null;
        modalTitle.textContent = '添加道具';
        resetForm();
        propModal.style.display = 'flex';
    }
    
    // 编辑道具
    function editProp(id) {
        currentProp = propsData.find(prop => prop.Id === id);
        if (!currentProp) {
            showMessage('找不到该道具', 'error');
            return;
        }
        
        modalTitle.textContent = '编辑道具';
        populateForm(currentProp);
        propModal.style.display = 'flex';
    }
    
    // 删除道具
    function deleteProp(id, name) {
        if (confirm(`确定要删除道具「${name}」吗？`)) {
            fetch(`/api/props/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('删除失败');
                    }
                    return response.json();
                })
                .then(() => {
                    // 从本地数据中移除
                    propsData = propsData.filter(prop => prop.Id !== id);
                    filterProps();
                    showMessage('删除成功', 'success');
                })
                .catch(error => {
                    console.error('删除道具失败:', error);
                    showMessage('删除失败，请重试', 'error');
                });
        }
    }
    
    // 处理表单提交
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // 收集表单数据
        const formData = {
            Name: propName.value.trim(),
            Type: propType.value,
            Description: propDescription.value.trim(),
            Image: propImage.value.trim(),
            Price: propPrice.value.trim() || "",
            Level: propLevel.value,
            Effect: propEffect.value.trim(),
            EffectDescription: propEffectDescription.value.trim(),
            UseCondition: propUseCondition.value.trim()
        };
        
        // 验证表单数据
        if (!formData.Name) {
            showMessage('请输入道具名称', 'error');
            return;
        }
        
        if (!formData.Type) {
            showMessage('请选择道具类型', 'error');
            return;
        }
        
        const method = currentProp ? 'PUT' : 'POST';
        const url = currentProp ? `/api/props/${currentProp.Id}` : '/api/props';
        
        // 如果是编辑，保留原有的ID
        if (currentProp) {
            formData.Id = currentProp.Id;
        }
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('保存失败');
                }
                return response.json();
            })
            .then(data => {
                if (currentProp) {
                    // 更新现有道具
                    const index = propsData.findIndex(prop => prop.Id === currentProp.Id);
                    if (index !== -1) {
                        propsData[index] = data;
                    }
                } else {
                    // 添加新道具
                    propsData.push(data);
                }
                
                filterProps();
                hidePropModal();
                showMessage(currentProp ? '更新成功' : '添加成功', 'success');
            })
            .catch(error => {
                console.error('保存道具失败:', error);
                showMessage('保存失败，请重试', 'error');
            });
    }
    
    // 重置表单
    function resetForm() {
        propId.value = '';
        propName.value = '';
        propType.value = '';
        propDescription.value = '';
        propImage.value = '';
        propPrice.value = '0';
        propLevel.value = '';
        propEffect.value = '';
        propEffectDescription.value = '';
        propUseCondition.value = '';
    }
    
    // 填充表单
    function populateForm(prop) {
        propId.value = prop.Id || '';
        propName.value = prop.Name || '';
        propType.value = prop.Type || '';
        propDescription.value = prop.Description || '';
        propImage.value = prop.Image || '';
        propPrice.value = prop.Price || '0';
        propLevel.value = prop.Level || '';
        propEffect.value = prop.Effect || '';
        propEffectDescription.value = prop.EffectDescription || '';
        propUseCondition.value = prop.UseCondition || '';
    }
    
    // 隐藏模态框
    function hidePropModal() {
        propModal.style.display = 'none';
        resetForm();
    }
    
    // 显示加载状态
    function showLoading() {
        loadingIndicator.style.display = 'block';
        propTableContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }
    
    // 隐藏加载状态
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }
    
    // 显示空状态
    function showEmptyState() {
        emptyState.style.display = 'block';
        propTableContainer.style.display = 'none';
    }
    
    // 显示消息提示
    function showMessage(message, type = 'success') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        messageContainer.appendChild(messageElement);
        
        // 3秒后自动移除消息
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(100%)';
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            setTimeout(() => {
                messageContainer.removeChild(messageElement);
            }, 300);
        }, 3000);
    }
    
    // 点击模态框外部关闭模态框
    propModal.addEventListener('click', function(event) {
        if (event.target === propModal) {
            hidePropModal();
        }
    });
    
    // 阻止模态框内容点击事件冒泡
    document.querySelector('.modal-content').addEventListener('click', function(event) {
        event.stopPropagation();
    });
});