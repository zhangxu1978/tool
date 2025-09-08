// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const playerTableBody = document.getElementById('player-table-body');
    const loadingIndicator = document.getElementById('loading');
    const playerTableContainer = document.getElementById('player-table-container');
    const emptyState = document.getElementById('empty-state');
    const messageContainer = document.getElementById('message-container');
    const btnAddPlayer = document.getElementById('btn-add-player');
    const playerModal = document.getElementById('player-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelForm = document.getElementById('cancel-form');
    const modalTitle = document.getElementById('modal-title');
    const playerForm = document.getElementById('player-form');
    const searchInput = document.getElementById('search-input');
    const typeFilter = document.getElementById('type-filter');
    const teamFilter = document.getElementById('team-filter');
    const genderFilter = document.getElementById('gender-filter');
    const playerDetails = document.getElementById('player-details');
    const closeDetails = document.getElementById('close-details');
    
    // 获取表单输入元素
    const playerId = document.getElementById('player-id');
    const playerName = document.getElementById('player-name');
    const playerType = document.getElementById('player-type');
    const playerTeam = document.getElementById('player-team');
    const playerGender = document.getElementById('player-gender');
    const playerAge = document.getElementById('player-age');
    const playerDescription = document.getElementById('player-description');
    const playerImage = document.getElementById('player-image');
    const playerMoney = document.getElementById('player-money');
    const playerLevel = document.getElementById('player-level');
    const playerExperience = document.getElementById('player-experience');
    const playerStrength = document.getElementById('player-strength');
    const playerAgility = document.getElementById('player-agility');
    const playerIntelligence = document.getElementById('player-intelligence');
    const playerConstitution = document.getElementById('player-constitution');
    const playerSpirit = document.getElementById('player-spirit');
    const playerLuck = document.getElementById('player-luck');
    const playerReputation = document.getElementById('player-reputation');
    const playerCareer = document.getElementById('player-career');
    const playerPoetry = document.getElementById('player-poetry');
    
    // 获取详情页面元素
    const detailName = document.getElementById('detail-name');
    const detailId = document.getElementById('detail-id');
    const detailType = document.getElementById('detail-type');
    const detailTeam = document.getElementById('detail-team');
    const detailGender = document.getElementById('detail-gender');
    const detailAge = document.getElementById('detail-age');
    const detailLevel = document.getElementById('detail-level');
    const detailDescription = document.getElementById('detail-description');
    const detailStrength = document.getElementById('detail-strength');
    const detailAgility = document.getElementById('detail-agility');
    const detailIntelligence = document.getElementById('detail-intelligence');
    const detailConstitution = document.getElementById('detail-constitution');
    const detailSpirit = document.getElementById('detail-spirit');
    const detailLuck = document.getElementById('detail-luck');
    const detailProps = document.getElementById('detail-props');
    const detailSkills = document.getElementById('detail-skills');
    const strengthBar = document.getElementById('strength-bar');
    const agilityBar = document.getElementById('agility-bar');
    const intelligenceBar = document.getElementById('intelligence-bar');
    const constitutionBar = document.getElementById('constitution-bar');
    const spiritBar = document.getElementById('spirit-bar');
    const luckBar = document.getElementById('luck-bar');
    
    // 当前正在编辑的角色
    let currentPlayer = null;
    
    // 角色数据
    let playersData = [];
    
    // 初始化页面
    loadPlayers();
    
    // 绑定事件监听器
    btnAddPlayer.addEventListener('click', showAddPlayerModal);
    closeModal.addEventListener('click', hidePlayerModal);
    cancelForm.addEventListener('click', hidePlayerModal);
    playerForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', filterPlayers);
    typeFilter.addEventListener('change', filterPlayers);
    teamFilter.addEventListener('change', filterPlayers);
    genderFilter.addEventListener('change', filterPlayers);
    closeDetails.addEventListener('click', hidePlayerDetails);
    
    // 加载角色数据
    function loadPlayers() {
        showLoading();
        
        fetch('/api/players')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应错误');
                }
                return response.json();
            })
            .then(data => {
                playersData = data || [];
                renderPlayers(playersData);
            })
            .catch(error => {
                console.error('加载角色数据失败:', error);
                showMessage('加载角色数据失败，请刷新页面重试', 'error');
                showEmptyState();
            });
    }
    
    // 渲染角色列表
    function renderPlayers(players) {
        hideLoading();
        
        // 清空表格
        playerTableBody.innerHTML = '';
        
        if (players.length === 0) {
            showEmptyState();
            return;
        }
        
        // 显示表格
        playerTableContainer.style.display = 'block';
        emptyState.style.display = 'none';
        
        // 渲染每个角色行
        players.forEach(player => {
            const row = document.createElement('tr');
            const genderText = player.Gender === '1' ? '男' : player.Gender === '0' ? '女' : '未知';
            
            row.innerHTML = `
                <td>${player.Id}</td>
                <td>${player.Name}</td>
                <td><span class="badge badge-type">${player.Type || '-'}</span></td>
                <td><span class="badge badge-team">${player.Team || '-'}</span></td>
                <td><span class="badge badge-gender">${genderText}</span></td>
                <td>${player.Age || '-'}</td>
                <td>${player.Level || '-'}</td>
                <td>${player.Description ? (player.Description.length > 20 ? player.Description.substring(0, 20) + '...' : player.Description) : '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="viewPlayer('${player.Id}')">查看</button>
                    <button class="btn btn-primary btn-small" onclick="editPlayer('${player.Id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deletePlayer('${player.Id}')">删除</button>
                </td>
            `;
            
            playerTableBody.appendChild(row);
        });
    }
    
    // 过滤角色
    function filterPlayers() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeFilter.value;
        const selectedTeam = teamFilter.value;
        const selectedGender = genderFilter.value;
        
        const filteredPlayers = playersData.filter(player => {
            const matchesSearch = player.Name.toLowerCase().includes(searchTerm) || 
                                 (player.Description && player.Description.toLowerCase().includes(searchTerm));
            const matchesType = !selectedType || player.Type === selectedType;
            const matchesTeam = !selectedTeam || player.Team === selectedTeam;
            const matchesGender = !selectedGender || player.Gender === selectedGender;
            
            return matchesSearch && matchesType && matchesTeam && matchesGender;
        });
        
        renderPlayers(filteredPlayers);
    }
    
    // 显示添加角色模态框
    function showAddPlayerModal() {
        currentPlayer = null;
        modalTitle.textContent = '添加角色';
        resetForm();
        showModal();
    }
    
    // 显示编辑角色模态框
    function editPlayer(id) {
        const player = playersData.find(p => p.Id === id);
        if (!player) return;
        
        currentPlayer = player;
        modalTitle.textContent = '编辑角色';
        
        // 填充表单数据
        playerId.value = player.Id;
        playerName.value = player.Name;
        playerType.value = player.Type || '人类';
        playerTeam.value = player.Team || '无门无派';
        playerGender.value = player.Gender || '';
        playerAge.value = player.Age || '';
        playerDescription.value = player.Description || '';
        playerImage.value = player.Image || '';
        playerMoney.value = player.Money || '0';
        playerLevel.value = player.Level || '0';
        playerExperience.value = player.Experience || '0';
        playerStrength.value = player.Strength || '100';
        playerAgility.value = player.Agility || '100';
        playerIntelligence.value = player.Intelligence || '100';
        playerConstitution.value = player.Constitution || '100';
        playerSpirit.value = player.Spirit || '100';
        playerLuck.value = player.Luck || '100';
        playerReputation.value = player.Reputation || '0';
        playerCareer.value = player.Career || '';
        playerPoetry.value = player.Shi || '';
        
        showModal();
    }
    
    // 查看角色详情
    function viewPlayer(id) {
        const player = playersData.find(p => p.Id === id);
        if (!player) return;
        
        // 填充详情数据
        detailName.textContent = `${player.Name} - 详情`;
        detailId.textContent = player.Id;
        detailType.textContent = player.Type || '-';
        detailTeam.textContent = player.Team || '-';
        detailGender.textContent = player.Gender === '1' ? '男' : player.Gender === '0' ? '女' : '未知';
        detailAge.textContent = player.Age || '-';
        detailLevel.textContent = player.Level || '-';
        detailDescription.textContent = player.Description || '无';
        
        // 填充属性
        const attributes = ['strength', 'agility', 'intelligence', 'constitution', 'spirit', 'luck'];
        attributes.forEach(attr => {
            const value = player[attr.charAt(0).toUpperCase() + attr.slice(1)] || '100';
            const detailElem = document.getElementById(`detail-${attr}`);
            const barElem = document.getElementById(`${attr}-bar`);
            
            if (detailElem && barElem) {
                detailElem.textContent = value;
                barElem.style.width = `${Math.min(parseInt(value), 200)}%`;
            }
        });
        
        // 填充道具
        detailProps.innerHTML = '';
        if (player.Props && player.Props.length > 0) {
            const propsList = document.createElement('ul');
            propsList.className = 'list-group';
            
            player.Props.forEach(prop => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${prop.Name} (${prop.Type})`;
                propsList.appendChild(li);
            });
            
            detailProps.appendChild(propsList);
        } else {
            detailProps.textContent = '无';
        }
        
        // 填充技能
        detailSkills.innerHTML = '';
        if (player.Skills && player.Skills.length > 0) {
            const skillsList = document.createElement('ul');
            skillsList.className = 'list-group';
            
            player.Skills.forEach(skill => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${skill.Name} (${skill.Type})`;
                skillsList.appendChild(li);
            });
            
            detailSkills.appendChild(skillsList);
        } else {
            detailSkills.textContent = '无';
        }
        
        // 显示详情面板
        playerDetails.style.display = 'block';
        
        // 滚动到详情面板
        playerDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // 删除角色
    function deletePlayer(id) {
        if (confirm('确定要删除这个角色吗？')) {
            fetch(`/api/players/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('删除失败');
                    }
                    return response.json();
                })
                .then(() => {
                    showMessage('角色删除成功', 'success');
                    loadPlayers(); // 重新加载数据
                })
                .catch(error => {
                    console.error('删除角色失败:', error);
                    showMessage('删除角色失败，请重试', 'error');
                });
        }
    }
    
    // 处理表单提交
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = {
            Name: playerName.value.trim(),
            Type: playerType.value,
            Team: playerTeam.value.trim() || '无门无派',
            Gender: playerGender.value,
            Age: playerAge.value.trim(),
            Description: playerDescription.value.trim(),
            Image: playerImage.value.trim(),
            Money: playerMoney.value.trim(),
            Level: playerLevel.value.trim(),
            Experience: playerExperience.value.trim(),
            Strength: playerStrength.value,
            Agility: playerAgility.value,
            Intelligence: playerIntelligence.value,
            Constitution: playerConstitution.value,
            Spirit: playerSpirit.value,
            Luck: playerLuck.value,
            Reputation: playerReputation.value.trim(),
            Career: playerCareer.value.trim(),
            Shi: playerPoetry.value.trim(),
            Props: currentPlayer && currentPlayer.Props ? currentPlayer.Props : [],
            Skills: currentPlayer && currentPlayer.Skills ? currentPlayer.Skills : []
        };
        
        // 验证表单数据
        if (!formData.Name) {
            showMessage('角色名称不能为空', 'error');
            return;
        }
        
        // 保存角色数据
        const isEdit = !!currentPlayer;
        const url = isEdit ? `/api/players/${currentPlayer.Id}` : '/api/players';
        const method = isEdit ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(isEdit ? '更新失败' : '创建失败');
                }
                return response.json();
            })
            .then(() => {
                showMessage(isEdit ? '角色更新成功' : '角色创建成功', 'success');
                hidePlayerModal();
                loadPlayers(); // 重新加载数据
            })
            .catch(error => {
                console.error(isEdit ? '更新角色失败:' : '创建角色失败:', error);
                showMessage(isEdit ? '更新角色失败，请重试' : '创建角色失败，请重试', 'error');
            });
    }
    
    // 重置表单
    function resetForm() {
        playerForm.reset();
        playerId.value = '';
        playerTeam.value = '无门无派';
        playerType.value = '人类';
        playerLevel.value = '0';
        playerExperience.value = '0';
        playerStrength.value = '100';
        playerAgility.value = '100';
        playerIntelligence.value = '100';
        playerConstitution.value = '100';
        playerSpirit.value = '100';
        playerLuck.value = '100';
        playerReputation.value = '0';
    }
    
    // 显示模态框
    function showModal() {
        playerModal.style.display = 'flex';
    }
    
    // 隐藏模态框
    function hidePlayerModal() {
        playerModal.style.display = 'none';
        resetForm();
    }
    
    // 隐藏角色详情
    function hidePlayerDetails() {
        playerDetails.style.display = 'none';
    }
    
    // 显示加载状态
    function showLoading() {
        loadingIndicator.style.display = 'block';
        playerTableContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }
    
    // 隐藏加载状态
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }
    
    // 显示空状态
    function showEmptyState() {
        playerTableContainer.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    // 显示消息提示
    function showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
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
    
    // 全局函数，供HTML调用
    window.editPlayer = editPlayer;
    window.deletePlayer = deletePlayer;
    window.viewPlayer = viewPlayer;
});