/**
 * 前端主JavaScript文件
 * 实现音频和图片文件的管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化加载文件列�?
    loadAudioFiles();
    
    // 音频搜索按钮事件
    document.getElementById('audioSearchBtn').addEventListener('click', function() {
        const name = document.getElementById('audioSearchName').value.trim();
        const type = document.getElementById('audioSearchType').value;
        searchAudioFiles(name, type);
    });
    
    // 音频重置按钮事件
    document.getElementById('audioResetBtn').addEventListener('click', function() {
        document.getElementById('audioSearchName').value = '';
        document.getElementById('audioSearchType').value = '';
        loadAudioFiles();
    });
    
    // 图片搜索按钮事件
    document.getElementById('imageSearchBtn').addEventListener('click', function() {
        const name = document.getElementById('imageSearchName').value.trim();
        const type = document.getElementById('imageSearchType').value;
        searchImageFiles(name, type);
    });
    
    // 图片重置按钮事件
    document.getElementById('imageResetBtn').addEventListener('click', function() {
        document.getElementById('imageSearchName').value = '';
        document.getElementById('imageSearchType').value = '';
        loadImageFiles();
    });
    
    // 标签切换事件
    document.getElementById('images-tab').addEventListener('click', function() {
        loadImageFiles();
    });
    
    document.getElementById('dialogue-tab').addEventListener('click', function() {
        loadDialogues();
        loadImagesForCharacterSelect();
    });
    
    // 对话选择框change事件（为了保持向后兼容）
    document.getElementById('dialogueSelect').addEventListener('change', function() {
        const selectedId = this.value;
        updateDialogueBySelection(selectedId);
    });
    
    // 对话搜索输入框变化事�?
    document.getElementById('dialogueSearchInput').addEventListener('input', function() {
        const inputValue = this.value;
        const hiddenInput = document.getElementById('dialogueSelectHidden');
        const selectElement = document.getElementById('dialogueSelect');
        
        if (!inputValue) {
            // 输入为空时，重置隐藏字段
            hiddenInput.value = '';
            selectElement.value = '';
            document.getElementById('dialogueText').value = '';
            return;
        }
        
        // 查找匹配的选项
        fetch('/data/DialogueList.json')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // 检查是否有完全匹配的选项
                    const matchedOption = data.find(d => 
                        (d.Name ? `${d.Name} - 对话 ${d.Id}` : `对话 ${d.Id}`) === inputValue
                    );
                    
                    if (matchedOption) {
                        hiddenInput.value = matchedOption.Id;
                        selectElement.value = matchedOption.Id;
                        document.getElementById('dialogueText').value = matchedOption.Text;
                    }
                }
            })
            .catch(error => {
                console.error('搜索对话失败:', error);
            });
    });
    
    // 辅助函数：根据选择的ID更新对话文本
    function updateDialogueBySelection(selectedId) {
        const hiddenInput = document.getElementById('dialogueSelectHidden');
        const searchInput = document.getElementById('dialogueSearchInput');
        
        if (selectedId) {
            hiddenInput.value = selectedId;
            
            fetch('/data/DialogueList.json')
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        const selectedDialogue = data.find(d => d.Id === selectedId);   
                        if (selectedDialogue) {
                            document.getElementById('dialogueText').value = selectedDialogue.Text;
                            // 更新搜索输入框显示的文本
                            searchInput.value = selectedDialogue.Name ? 
                                `${selectedDialogue.Name} - 对话 ${selectedDialogue.Id}` : 
                                `对话 ${selectedDialogue.Id}`;
                        }
                    }
                })
                .catch(error => {
                    console.error('加载对话内容失败:', error);
                });
        } else {
            // 选择新增时清空文本框和隐藏字�?
            hiddenInput.value = '';
            searchInput.value = '';
            document.getElementById('dialogueText').value = '';
        }
    }
    
    // 快捷输入按钮事件
    document.getElementById('insertStart').addEventListener('click', function() {
        insertTextIntoDialogue('[开始]\n');
    });
    
    document.getElementById('insertEnd').addEventListener('click', function() {
        insertTextIntoDialogue('\n[结束]');
    });
    
    document.getElementById('insertShowRole').addEventListener('click', function() {
        const showRoleModal = new bootstrap.Modal(document.getElementById('showRoleModal'));
        showRoleModal.show();
    });
    
    document.getElementById('insertHideRole').addEventListener('click', function() {
        const dialogueText = document.getElementById('dialogueText');
        const textarea = dialogueText;
        
        // 显示一个简单的提示让用户输入位�?
        const position = prompt('请输入角色位�?left/center/right):');
        if (position && ['left', 'center', 'right'].includes(position.toLowerCase())) {
            insertTextIntoDialogue(`\n[隐藏角色]${position.toLowerCase()}`);
        } else if (position) {
            alert('位置输入错误，请输入left、center或right');
        }
    });
    
    document.getElementById('insertBlackScreen').addEventListener('click', function() {
        const blackScreenModal = new bootstrap.Modal(document.getElementById('blackScreenModal'));
        blackScreenModal.show();
    });
    
    // 播放声音按钮事件
    document.getElementById('insertPlaySound').addEventListener('click', function() {
        const playSoundModal = new bootstrap.Modal(document.getElementById('playSoundModal'));
        loadAudioFilesForSoundSelect();
        playSoundModal.show();
    });
    
    // 停止播放按钮事件
    document.getElementById('insertStopSound').addEventListener('click', function() {
        insertTextIntoDialogue('\n[停止播放]');
    });
    
    // 显示背景按钮事件
    document.getElementById('insertShowBackground').addEventListener('click', function() {
        const showBackgroundModal = new bootstrap.Modal(document.getElementById('showBackgroundModal'));
        loadImagesForBackgroundSelect();
        showBackgroundModal.show();
    });
    
    // 隐藏背景按钮事件
    document.getElementById('insertHideBackground').addEventListener('click', function() {
        insertTextIntoDialogue('\n[隐藏背景]');
    });
    
    // 播放音乐按钮事件
    document.getElementById('insertPlayMusic').addEventListener('click', function() {
        const playMusicModal = new bootstrap.Modal(document.getElementById('playMusicModal'));
        loadAudioFilesForMusicSelect();
        playMusicModal.show();
    });
    
    // 显示角色确认按钮
    document.getElementById('confirmShowRole').addEventListener('click', function() {
        const position = document.getElementById('rolePosition').value;
        const imageSelect = document.getElementById('roleImage');
        const selectedImage = imageSelect.options[imageSelect.selectedIndex].text;
        const imagePath = imageSelect.value;
        
        insertTextIntoDialogue(`\n[显示角色]${position},${imagePath}`);
        
        const showRoleModal = bootstrap.Modal.getInstance(document.getElementById('showRoleModal'));
        showRoleModal.hide();
    });
    
    // 黑屏确认按钮
    document.getElementById('confirmBlackScreen').addEventListener('click', function() {
        const blackScreenText = document.getElementById('blackScreenText').value;
        if (blackScreenText) {
            insertTextIntoDialogue(`\n[黑屏]${blackScreenText}`);
        }
        
        const blackScreenModal = bootstrap.Modal.getInstance(document.getElementById('blackScreenModal'));
        blackScreenModal.hide();
        document.getElementById('blackScreenText').value = '';
    });
    
    // 播放声音确认按钮
    document.getElementById('confirmPlaySound').addEventListener('click', function() {
        const soundFile = document.getElementById('soundFile');
        const selectedOption = soundFile.options[soundFile.selectedIndex];
        const soundPath = selectedOption.value;
        const soundName = selectedOption.text;
        
        if (soundPath) {
            insertTextIntoDialogue(`\n[播放声音]${soundPath}`);
        }
        
        const playSoundModal = bootstrap.Modal.getInstance(document.getElementById('playSoundModal'));
        playSoundModal.hide();
    });
    
    // 显示背景确认按钮
    document.getElementById('confirmShowBackground').addEventListener('click', function() {
        const backgroundImage = document.getElementById('backgroundImage');
        const selectedOption = backgroundImage.options[backgroundImage.selectedIndex];
        const imagePath = selectedOption.value;
        
        if (imagePath) {
            insertTextIntoDialogue(`\n[显示背景]${imagePath}`);
        }
        
        const showBackgroundModal = bootstrap.Modal.getInstance(document.getElementById('showBackgroundModal'));
        showBackgroundModal.hide();
    });
    
    // 播放音乐确认按钮
    document.getElementById('confirmPlayMusic').addEventListener('click', function() {
        const selectedMusic = [];
        document.querySelectorAll('#musicList input[type="checkbox"]:checked').forEach(checkbox => {
            selectedMusic.push(checkbox.value);
        });
        
        const playMode = document.getElementById('playMode').value;
        
        if (selectedMusic.length > 0) {
            // 将音乐路径用逗号分隔
            const musicPaths = selectedMusic.join(',');
            insertTextIntoDialogue(`\n[播放音乐]${musicPaths},${playMode}`);
        }
        
        const playMusicModal = bootstrap.Modal.getInstance(document.getElementById('playMusicModal'));
        playMusicModal.hide();
    });
    
    // 分支选择按钮事件
    document.getElementById('insertBranchSelect').addEventListener('click', function() {
        const branchSelectModal = new bootstrap.Modal(document.getElementById('branchSelectModal'));
        branchSelectModal.show();
    });
    
    // 确认分支选择按钮事件
    document.getElementById('confirmBranchSelect').addEventListener('click', function() {
        const branchOptionsText = document.getElementById('branchOptions').value;
        if (!branchOptionsText.trim()) {
            alert('请输入至少一个选择选项');
            return;
        }
        
        const options = branchOptionsText.trim().split('\n').filter(option => option.trim());
        let branchSelectCommand = '[分支选择]' + options.join(',');
        let branchTargetCommand = '[选择目标]';
        let hasEmptyTarget = false;
        
        // 遍历所有选项，获取对应的目标对话
        options.forEach((option, index) => {
            const targetSelect = document.getElementById(`targetDialogue_${index}`);
            const targetId = targetSelect ? targetSelect.value : '';
            
            if (!targetId) {
                hasEmptyTarget = true;
            }
            
            branchTargetCommand += `${option}:${targetId}`;
            if (index < options.length - 1) {
                branchTargetCommand += ',';
            }
        });
        
        if (hasEmptyTarget) {
            alert('请为所有选项选择目标对话');
            return;
        }
        
        // 插入分支选择指令到对话文本中
        insertTextIntoDialogue(`\n${branchTargetCommand}\n${branchSelectCommand}`);
        
        const branchSelectModal = bootstrap.Modal.getInstance(document.getElementById('branchSelectModal'));
        branchSelectModal.hide();
        document.getElementById('branchOptions').value = '';
        document.getElementById('branchTargets').innerHTML = '';
    });
    
    // 监听分支选项文本框变化，动态生成目标对话选择�?
    document.getElementById('branchOptions').addEventListener('input', function() {
        const options = this.value.trim().split('\n').filter(option => option.trim());
        const branchTargetsDiv = document.getElementById('branchTargets');
        branchTargetsDiv.innerHTML = '';
        
        // 先加载所有对话供选择
        fetch('/data/DialogueList.json')
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    branchTargetsDiv.innerHTML = '<p class="text-muted">没有可用的对�?/p>';
                    return;
                }
                
                options.forEach((option, index) => {
                    const div = document.createElement('div');
                    div.className = 'mb-3';
                    
                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = `"${option}" 的目标对话`;
                    
                    const select = document.createElement('select');
                    select.Id = `targetDialogue_${index}`;
                    select.className = 'form-select';
                    
                    // 添加空选项
                    const emptyOption = document.createElement('option');
                    emptyOption.value = '';
                    emptyOption.textContent = '-- 请选择目标对话 --';
                    select.appendChild(emptyOption);
                    
                    // 添加所有对话作为选项
                    data.forEach(dialogue => {
                        const optionElement = document.createElement('option');
                        optionElement.value = dialogue.Id;
                        optionElement.textContent = dialogue.Name ? `${dialogue.Name} - 对话 ${dialogue.Id}` : `对话 ${dialogue.Id}`;
                        select.appendChild(optionElement);
                    });
                    
                    div.appendChild(label);
                    div.appendChild(select);
                    branchTargetsDiv.appendChild(div);
                });
            })
            .catch(error => {
                console.error('加载对话失败:', error);
                branchTargetsDiv.innerHTML = '<p class="text-danger">加载对话失败</p>';
            });
    });
    
    // 保存对话按钮
    document.getElementById('saveDialogue').addEventListener('click', saveDialogue);
    
    // 预览对话按钮
    document.getElementById('previewDialogue').addEventListener('click', previewDialogue);
    
    // 删除对话按钮
    document.getElementById('deleteDialogue').addEventListener('click', deleteDialogue);
    
    // BGM上传区域点击事件
    document.getElementById('bgmUploadArea').addEventListener('click', function() {
        document.getElementById('bgmFileInput').click();
    });
    
    // SFX上传区域点击事件
    document.getElementById('sfxUploadArea').addEventListener('click', function() {
        document.getElementById('sfxFileInput').click();
    });
    
    // 图片上传区域点击事件
    document.getElementById('imageUploadArea').addEventListener('click', function() {
        document.getElementById('imageFileInput').click();
    });
    
    // BGM文件选择事件
    document.getElementById('bgmFileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadBgmFile(e.target.files[0]);
        }
    });
    
    // SFX文件选择事件
    document.getElementById('sfxFileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadSfxFile(e.target.files[0]);
        }
    });
    
    // 图片文件选择事件
    document.getElementById('imageFileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadImageFile(e.target.files[0]);
        }
    });
    
    // 拖放上传功能 - BGM
    const bgmDropArea = document.getElementById('bgmUploadArea');
    bgmDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#007bff';
    });
    
    bgmDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
    });
    
    bgmDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('audio/')) {
                uploadBgmFile(file);
            } else {
                alert('请上传音频文件！');
            }
        }
    });
    
    // 拖放上传功能 - SFX
    const sfxDropArea = document.getElementById('sfxUploadArea');
    sfxDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#007bff';
    });
    
    sfxDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
    });
    
    sfxDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('audio/')) {
                uploadSfxFile(file);
            } else {
                alert('请上传音频文件！');
            }
        }
    });
    
    // 拖放上传功能 - 图片
    const imageDropArea = document.getElementById('imageUploadArea');
    imageDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#007bff';
    });
    
    imageDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
    });
    
    imageDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                uploadImageFile(file);
            } else {
                alert('请上传图片文件！');
            }
        }
    });
    
    // 确认删除按钮事件
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        const fileToDelete = deleteModal._element.dataset.fileToDelete;
        const fileType = deleteModal._element.dataset.fileType;
        
        if (fileType === 'audio') {
            deleteAudioFile(fileToDelete);
        } else if (fileType === 'image') {
            deleteImageFile(fileToDelete);
        }
        
        deleteModal.hide();
    });
}

);

/**
 * 加载音频文件列表
 */
function loadAudioFiles() {
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    audioList.innerHTML = '';
    loading.style.display = 'block';
    
    fetch('/api/sound')
        .then(response => response.json())
        .then(files => {
            loading.style.display = 'none';
            
            if (files.length === 0) {
                audioList.innerHTML = '<div class="text-center p-4">没有音频文件</div>';
                return;
            }
            
            files.forEach(file => {
                const fileItem = createAudioFileItem(file);
                audioList.appendChild(fileItem);
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            audioList.innerHTML = `<div class="text-center p-4 text-danger">加载失败: ${error.message}</div>`;
            console.error('加载音频文件失败:', error);
        });
}

/**
 * 按名称和类型搜索音频文件
 * @param {string} name - 搜索的名称关键词
 * @param {string} type - 搜索的类�?
 */
function searchAudioFiles(name, type) {
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    audioList.innerHTML = '';
    loading.style.display = 'block';
    
    // 构建搜索URL
    let url = /api/sound/search?;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    if (type) url += `type=${encodeURIComponent(type)}`;
    
    // 移除末尾�?& �??
    if (url.endsWith('&') || url.endsWith('?')) {
        url = url.slice(0, -1);
    }
    
    fetch('url')
        .then(response => response.json())
        .then(result => {
            loading.style.display = 'none';
            
            if (!result.success || result.count === 0) {
                audioList.innerHTML = '<div class="text-center p-4">没有找到匹配的音频文�?/div>';
                return;
            }
            
            result.data.forEach(file => {
                const fileItem = createAudioFileItem(file);
                audioList.appendChild(fileItem);
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            audioList.innerHTML = `<div class="text-center p-4 text-danger">搜索失败: ${error.message}</div>`;
            console.error('搜索音频文件失败:', error);
        });
}

/**
 * 加载图片文件列表
 */
function loadImageFiles() {
    const imageList = document.getElementById('imageList');
    const loading = document.getElementById('imageLoading');
    
    imageList.innerHTML = '';
    loading.style.display = 'block';
    
    fetch('/api/img')
        .then(response => response.json())
        .then(files => {
            loading.style.display = 'none';
            
            if (files.length === 0) {
                imageList.innerHTML = '<div class="text-center p-4">没有图片文件</div>';
                return;
            }
            
            files.forEach(file => {
                const fileItem = createImageFileItem(file);
                imageList.appendChild(fileItem);
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            imageList.innerHTML = `<div class="text-center p-4 text-danger">加载失败: ${error.message}</div>`;
            console.error('加载图片文件失败:', error);
        });
}

/**
 * 按名称和类型搜索图片文件
 * @param {string} name - 搜索的名称关键词
 * @param {string} type - 搜索的类�?
 */
function searchImageFiles(name, type) {
    const imageList = document.getElementById('imageList');
    const loading = document.getElementById('imageLoading');
    
    imageList.innerHTML = '';
    loading.style.display = 'block';
    
    // 构建搜索URL
    let url = /api/img/search?;
    if (name) url += `name=${encodeURIComponent(name)}&`;
    if (type) url += `type=${encodeURIComponent(type)}`;
    
    // 移除末尾�?& �??
    if (url.endsWith('&') || url.endsWith('?')) {
        url = url.slice(0, -1);
    }
    
    fetch('url')
        .then(response => response.json())
        .then(result => {
            loading.style.display = 'none';
            
            if (!result.success || result.count === 0) {
                imageList.innerHTML = '<div class="text-center p-4">没有找到匹配的图片文�?/div>';
                return;
            }
            
            result.data.forEach(file => {
                const fileItem = createImageFileItem(file);
                imageList.appendChild(fileItem);
            });
        })
        .catch(error => {
            loading.style.display = 'none';
            imageList.innerHTML = `<div class="text-center p-4 text-danger">搜索失败: ${error.message}</div>`;
            console.error('搜索图片文件失败:', error);
        });
}

/**
 * 创建音频文件列表�?
 * @param {Object} file - 音频文件信息
 * @returns {HTMLElement} - 列表项元�?
 */
function createAudioFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const audioPreview = document.createElement('div');
    audioPreview.className = 'audio-preview';
    audioPreview.innerHTML = '<i class="bi bi-file-earmark-music"></i>';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileName = document.createElement('h5');
    
    // 检查是否有关联的JSON数据
    fetch(`window.getApiUrl(`/api/sound/json/${file.name}``))
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                // 如果有关联数据，显示自定义名�?
                fileName.textContent = data.data.name || file.name;
                
                // 添加类型信息到详情中
                const fileDetails = document.createElement('p');
                fileDetails.className = 'text-muted mb-0';
                fileDetails.textContent = `类型: ${data.data.type} | 大小: ${formatFileSize(file.size)} | 创建时间: ${new Date(file.createdAt).toLocaleString()}`;
                
                // 清空并重新添加子元素
                while (fileInfo.firstChild) {
                    fileInfo.removeChild(fileInfo.firstChild);
                }
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileDetails);
            }
        })
        .catch(error => {
            console.error('获取音频JSON数据失败:', error);
        });
    
    // 默认显示（如果没有关联数据或者在数据加载前）
    fileName.textContent = file.name;
    
    const fileDetails = document.createElement('p');
    fileDetails.className = 'text-muted mb-0';
    fileDetails.textContent = `大小: ${formatFileSize(file.size)} | 创建时间: ${new Date(file.createdAt).toLocaleString()}`;
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileDetails);
    
    const fileActions = document.createElement('div');
    fileActions.className = 'file-actions';
    
    const playButton = document.createElement('button');
    playButton.className = 'btn btn-sm btn-primary';
    playButton.textContent = '播放';
    playButton.addEventListener('click', function() {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = file.path;
        
        const audioModal = new bootstrap.Modal(document.getElementById('audioPreviewModal'));
        audioModal.show();
    });
    
    // 添加关联JSON数据按钮
    const jsonButton = document.createElement('button');
    jsonButton.className = 'btn btn-sm btn-info';
    jsonButton.textContent = '关联数据';
    jsonButton.addEventListener('click', function() {
        // 检查是否已有关联数�?
        fetch(`window.getApiUrl(`/api/sound/json/${file.name}``))
            .then(response => response.json())
            .then(data => {
                const audioJsonModal = document.getElementById('audioJsonModal');
                audioJsonModal.dataset.filename = file.name;
                
                // 如果有数据，填充表单
                if (data.success && data.data) {
                    document.getElementById('audioName').value = data.data.name || '';
                    document.getElementById('audioType').value = data.data.type || '';
                    document.getElementById('audioJsonModalLabel').textContent = '查看/编辑音频数据';
                } else {
                    // 清空表单
                    document.getElementById('audioName').value = '';
                    document.getElementById('audioType').value = '';
                    document.getElementById('audioJsonModalLabel').textContent = '关联音频数据';
                }
                
                const modal = new bootstrap.Modal(audioJsonModal);
                modal.show();
            })
            .catch(error => {
                console.error('获取音频JSON数据失败:', error);
                alert('获取音频JSON数据失败');
            });
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-danger';
    deleteButton.textContent = '删除';
    deleteButton.addEventListener('click', function() {
        const deleteModal = document.getElementById('deleteConfirmModal');
        deleteModal.dataset.fileToDelete = file.name;
        deleteModal.dataset.fileType = 'audio';
        
        const modal = new bootstrap.Modal(deleteModal);
        modal.show();
    });
    
    fileActions.appendChild(playButton);
    fileActions.appendChild(jsonButton);
    fileActions.appendChild(deleteButton);
    
    fileItem.appendChild(audioPreview);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileActions);
    
    return fileItem;
}

/**
 * 创建图片文件列表�?
 * @param {Object} file - 图片文件信息
 * @returns {HTMLElement} - 列表项元�?
 */
function createImageFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const imagePreview = document.createElement('img');
    imagePreview.className = 'file-preview';
    imagePreview.src = file.path;
    imagePreview.alt = file.name;
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileName = document.createElement('h5');
    
    // 检查是否有关联的JSON数据
    fetch(`window.getApiUrl(`/api/img/json/${file.name}``))
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                // 如果有关联数据，显示自定义名�?
                fileName.textContent = data.data.name || file.name;
                
                // 添加类型信息到详情中
                const fileDetails = document.createElement('p');
                fileDetails.className = 'text-muted mb-0';
                fileDetails.textContent = `类型: ${data.data.type} | 大小: ${formatFileSize(file.size)} | 创建时间: ${new Date(file.createdAt).toLocaleString()}`;
                
                // 清空并重新添加子元素
                while (fileInfo.firstChild) {
                    fileInfo.removeChild(fileInfo.firstChild);
                }
                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileDetails);
            }
        })
        .catch(error => {
            console.error('获取图片JSON数据失败:', error);
        });
    
    // 默认显示（如果没有关联数据或者在数据加载前）
    fileName.textContent = file.name;
    
    const fileDetails = document.createElement('p');
    fileDetails.className = 'text-muted mb-0';
    fileDetails.textContent = `大小: ${formatFileSize(file.size)} | 创建时间: ${new Date(file.createdAt).toLocaleString()}`;
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileDetails);
    
    const fileActions = document.createElement('div');
    fileActions.className = 'file-actions';
    
    const viewButton = document.createElement('button');
    viewButton.className = 'btn btn-sm btn-primary';
    viewButton.textContent = '查看';
    viewButton.addEventListener('click', function() {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = file.path;
        
        const imageModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        imageModal.show();
    });
    
    // 添加关联JSON数据按钮
    const jsonButton = document.createElement('button');
    jsonButton.className = 'btn btn-sm btn-info';
    jsonButton.textContent = '关联数据';
    jsonButton.addEventListener('click', function() {
        // 检查是否已有关联数�?
        fetch(`window.getApiUrl(`/api/img/json/${file.name}``))
            .then(response => response.json())
            .then(data => {
                const imageJsonModal = document.getElementById('imageJsonModal');
                imageJsonModal.dataset.filename = file.name;
                
                // 如果有数据，填充表单
                if (data.success && data.data) {
                    document.getElementById('imageName').value = data.data.name || '';
                    document.getElementById('imageType').value = data.data.type || '';
                    document.getElementById('imageJsonModalLabel').textContent = '查看/编辑图片数据';
                } else {
                    // 清空表单
                    document.getElementById('imageName').value = '';
                    document.getElementById('imageType').value = '';
                    document.getElementById('imageJsonModalLabel').textContent = '关联图片数据';
                }
                
                const modal = new bootstrap.Modal(imageJsonModal);
                modal.show();
            })
            .catch(error => {
                console.error('获取图片JSON数据失败:', error);
                alert('获取图片JSON数据失败');
            });
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-sm btn-danger';
    deleteButton.textContent = '删除';
    deleteButton.addEventListener('click', function() {
        const deleteModal = document.getElementById('deleteConfirmModal');
        deleteModal.dataset.fileToDelete = file.name;
        deleteModal.dataset.fileType = 'image';
        
        const modal = new bootstrap.Modal(deleteModal);
        modal.show();
    });
    
    fileActions.appendChild(viewButton);
    fileActions.appendChild(jsonButton);
    fileActions.appendChild(deleteButton);
    
    fileItem.appendChild(imagePreview);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileActions);
    
    return fileItem;
}

/**
 * 上传BGM文件
 * @param {File} file - 要上传的BGM文件
 */
function uploadBgmFile(file) {
    const formData = new FormData();
    formData.append('bgmFile', file);
    
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    loading.style.display = 'block';
    
    fetch('/api/sound/bgm/upload, {
        method: 'POST',
        body: formData
    }')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 保存文件关联信息到JSON
            saveAudioFileInfo(data.file.name, file.name, '音乐').then(() => {
                loadAudioFiles(); // 重新加载音频列表
            });
        } else {
            alert(`上传失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`上传失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('上传BGM文件失败:', error);
    });
}

/**
 * 上传SFX文件
 * @param {File} file - 要上传的SFX文件
 */
function uploadSfxFile(file) {
    const formData = new FormData();
    formData.append('sfxFile', file);
    
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    loading.style.display = 'block';
    
    fetch('/api/sound/sfx/upload, {
        method: 'POST',
        body: formData
    }')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 保存文件关联信息到JSON
            saveAudioFileInfo(data.file.name, file.name, '音效').then(() => {
                loadAudioFiles(); // 重新加载音频列表
            });
        } else {
            alert(`上传失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`上传失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('上传SFX文件失败:', error);
    });
}

/**
 * 保存音频文件关联信息
 * @param {string} filename - 服务器上的文件名
 * @param {string} originalName - 原始文件�?
 * @param {string} type - 文件类型（音�?音效�?
 * @returns {Promise}
 */
function saveAudioFileInfo(filename, originalName, type) {
    return fetch(`window.getApiUrl(`/api/sound/json/${filename}``), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: originalName.replace(/\.[^/.]+$/, ""), // 移除文件扩展�?
            type: type 
          })
        }).then(response => response.json());
    }
/**
 * 上传音频文件
 * @param {File} file - 要上传的音频文件
 */
function uploadAudioFile(file) {
    const formData = new FormData();
    formData.append('soundFile', file);
    
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    loading.style.display = 'block';
    
    fetch('/api/sound/upload, {
        method: 'POST',
        body: formData
    }')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAudioFiles(); // 重新加载音频列表
        } else {
            alert(`上传失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`上传失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('上传音频文件失败:', error);
    });
}

/**
 * 压缩PNG图片
 * @param {File} file - 原始PNG文件
 * @returns {Promise<Blob>} - 压缩后的PNG Blob
 */
function compressPNG(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                // 创建Canvas元素
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 设置Canvas尺寸为原始图片尺�?
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 清除Canvas并设置透明背景
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // 绘制图片到Canvas（保留透明通道�?
                ctx.drawImage(img, 0, 0);
                
                // 将Canvas内容转换为压缩的PNG Blob
                // quality参数在PNG中影响不大，但保留它以兼容API
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('PNG压缩失败'));
                        }
                    },
                    'image/png',
                    0.8 // 压缩质量，对于PNG主要影响压缩算法的选择
                );
            };
            img.onerror = function() {
                reject(new Error('图片加载失败'));
            };
        };
        reader.onerror = function() {
            reject(new Error('文件读取失败'));
        };
    });
}

/**
 * 上传图片文件
 * @param {File} file - 要上传的图片文件
 */
async function uploadImageFile(file) {
    const imageList = document.getElementById('imageList');
    const loading = document.getElementById('imageLoading');
    
    loading.style.display = 'block';
    
    try {
        let fileToUpload = file;
        
        // 检查是否为PNG图片，如果是则进行压�?
        if (file.type === 'image/png') {
            // 显示压缩中提�?
            alert('正在压缩PNG图片，请稍�?..');
            // 压缩图片
            const compressedBlob = await compressPNG(file);
            // 创建新的File对象，保留原始文件名和类�?
            fileToUpload = new File([compressedBlob], file.name, { type: 'image/png' });
            
            // 显示压缩结果
            const originalSize = (file.size / 1024).toFixed(2);
            const compressedSize = (fileToUpload.size / 1024).toFixed(2);
            const reduction = ((1 - fileToUpload.size / file.size) * 100).toFixed(1);
            console.log(`PNG图片压缩完成: ${originalSize}KB -> ${compressedSize}KB (减少${reduction}%)`);
        }
        
        // 创建表单数据并上�?
        const formData = new FormData();
        formData.append('imageFile', fileToUpload);
        
        const response = await fetch('/api/img/upload, {
            method: 'POST',
            body: formData
        }');
        
        const data = await response.json();
        
        if (data.success) {
            loadImageFiles(); // 重新加载图片列表
        } else {
            alert(`上传失败: ${data.error}`);
        }
    } catch (error) {
        alert(`处理失败: ${error.message}`);
        console.error('图片处理或上传失�?', error);
    } finally {
        loading.style.display = 'none';
    }
}

/**
 * 删除音频文件
 * @param {string} filename - 要删除的文件�?
 */
function deleteAudioFile(filename) {
    const loading = document.getElementById('audioLoading');
    loading.style.display = 'block';
    
    fetch(`window.getApiUrl(`/api/sound/${filename}``), {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAudioFiles(); // 重新加载音频列表
        } else {
            alert(`删除失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`删除失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('删除音频文件失败:', error);
    });
}

/**
 * 删除图片文件
 * @param {string} filename - 要删除的文件�?
 */
function deleteImageFile(filename) {
    const loading = document.getElementById('imageLoading');
    loading.style.display = 'block';
    
    fetch(`window.getApiUrl(`/api/img/${filename}``), {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadImageFiles(); // 重新加载图片列表
        } else {
            alert(`删除失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`删除失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('删除图片文件失败:', error);
    });
}

/**
 * 格式化文件大�?
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} - 格式化后的文件大�?
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 加载对话列表（同时更新select和datalist�?
 */
function loadDialogues() {
    const dialogueSelect = document.getElementById('dialogueSelect');
    const dialogueOptions = document.getElementById('dialogueOptions');
    const searchInput = document.getElementById('dialogueSearchInput');
    const hiddenInput = document.getElementById('dialogueSelectHidden');
    const currentHiddenValue = hiddenInput.value;
    
    // 清空除了第一个选项以外的所有选项（select元素�?
    while (dialogueSelect.options.length > 1) {
        dialogueSelect.remove(1);
    }
    
    // 清空datalist
    dialogueOptions.innerHTML = '';
    
    fetch('/data/DialogueList.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                return;
            }
            
            // 保存当前选中的对话名�?
            let selectedDialogueName = '';
            if (currentHiddenValue) {
                const selectedDialogue = data.find(d => d.Id === currentHiddenValue);
                if (selectedDialogue) {
                    selectedDialogueName = selectedDialogue.Name ? 
                        `${selectedDialogue.Name} - 对话 ${selectedDialogue.Id}` : 
                        `对话 ${selectedDialogue.Id}`;
                }
            }
            
            data.forEach(dialogue => {
                // 更新select元素（为了保持向后兼容）
                const selectOption = document.createElement('option');
                selectOption.value = dialogue.Id;
                selectOption.textContent = dialogue.Name ? `${dialogue.Name} - 对话 ${dialogue.Id}` : `对话 ${dialogue.Id}`;
                dialogueSelect.appendChild(selectOption);
                
                // 更新datalist元素（用于搜索）
                const datalistOption = document.createElement('option');
                datalistOption.value = dialogue.Name ? `${dialogue.Name} - 对话 ${dialogue.Id}` : `对话 ${dialogue.Id}`;
                datalistOption.setAttribute('data-id', dialogue.Id);
                dialogueOptions.appendChild(datalistOption);
            });
            
            // 恢复之前的选择（如果有�?
            if (currentHiddenValue) {
                dialogueSelect.value = currentHiddenValue;
                hiddenInput.value = currentHiddenValue;
                searchInput.value = selectedDialogueName;
            }
        })
        .catch(error => {
            console.error('加载对话失败:', error);
        });
}

/**
 * 加载角色选择的图片列�?
 */
function loadImagesForCharacterSelect() {
    const roleImageSelect = document.getElementById('roleImage');
    
    // 从images.json获取图片数据
    fetch('/data/img.json')
        .then(response => response.json())
        .then(data => {
            roleImageSelect.innerHTML = '';
            
            if (!data.files || data.files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的图�?;
                roleImageSelect.appendChild(option);
                return;
            }
            
            // 过滤出类型为"人物"的图�?
            const characterImages = data.files.filter(file => 
                file.type && file.type.includes('人物')
            );
            
            if (characterImages.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的人物图�?;
                roleImageSelect.appendChild(option);
                return;
            }
            
            // 添加人物图片选项
            characterImages.forEach(image => {
                const option = document.createElement('option');
                // 构建完整的图片路�?
                option.value = `/img/${image.filename}`;
                option.textContent = image.name || image.filename;
                roleImageSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('加载人物图片失败:', error);
            // 在出错时显示提示
            roleImageSelect.innerHTML = '';
            const option = document.createElement('option');
            option.textContent = '加载人物图片失败';
            roleImageSelect.appendChild(option);
        });
}

/**
 * 加载声音选择的音频文件列�?
 */
function loadAudioFilesForSoundSelect() {
    const soundFileSelect = document.getElementById('soundFile');
    
    // 获取所有音频文�?
    fetch('/data/sound.json')
        .then(response => response.json())
        .then(data => {
            soundFileSelect.innerHTML = '';
            
            if (!data.files || data.files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的音频文�?;
                soundFileSelect.appendChild(option);
                return;
            }
                        // 过滤出类型为"音效"的音频文�?
            const soundFiles = data.files.filter(file => 
                file.type && file.type.includes('音效')
            );
            if (soundFiles.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的音效文�?;
                soundFileSelect.appendChild(option);
                return;
            }
            soundFiles.forEach(file => {
                const option = document.createElement('option');
                option.value =`/sound/sfx/${file.filename}`;
                option.textContent =file.name || file.filename;
                soundFileSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('加载音频文件失败:', error);
            soundFileSelect.innerHTML = '';
            const option = document.createElement('option');
            option.textContent = '加载音频文件失败';
            soundFileSelect.appendChild(option);
        });
}

/**
 * 加载背景选择的图片列�?
 */
function loadImagesForBackgroundSelect() {
    const backgroundImageSelect = document.getElementById('backgroundImage');
    
    // 从images.json获取图片数据
    fetch('/data/img.json')
        .then(response => response.json())
        .then(data => {
            backgroundImageSelect.innerHTML = '';
                        // 过滤出类型为"人物"的图�?

            
            if (!data.files || data.files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的图�?;
                backgroundImageSelect.appendChild(option);
                return;
            }
            // 过滤出类型为"背景"的图�?
            const backgroundImages = data.files.filter(file => 
                file.type && file.type.includes('背景')
            );
                        if (backgroundImages.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的背景图�?;
                backgroundImageSelect.appendChild(option);
                return;
            }
            // 添加所有图片作为背景选项
            backgroundImages.forEach(image => {
                const option = document.createElement('option');
                // 构建完整的图片路�?
                option.value = `/img/${image.filename}`;
                option.textContent = image.name || image.filename;
                backgroundImageSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('加载背景图片失败:', error);
            backgroundImageSelect.innerHTML = '';
            const option = document.createElement('option');
            option.textContent = '加载背景图片失败';
            backgroundImageSelect.appendChild(option);
        });
}

/**
 * 加载音乐选择的音频文件列表（用于多选）
 */
function loadAudioFilesForMusicSelect() {
    const musicListDiv = document.getElementById('musicList');
    
    // 获取所有音频文�?
    fetch('/data/sound.json')
        .then(response => response.json())
        .then(data => {
            musicListDiv.innerHTML = '';
            
            if (!data.files || data.files.length === 0) {
                musicListDiv.innerHTML = '<p class="text-muted">没有可用的音频文�?/p>';
                return;
            }
                                    // 过滤出类型为"音乐"的音频文�?
            const musicFiles = data.files.filter(file => 
                file.type && file.type.includes('音乐')
            );
            
            musicFiles.forEach(file => {
                const div = document.createElement('div');
                div.className = 'form-check';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input';
                checkbox.id = `music-${file.filename}`;
                checkbox.value =`/sound/bgm/${file.filename}`;
                
                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.htmlFor = `music-${file.name}`;
                label.textContent = file.name;
                
                div.appendChild(checkbox);
                div.appendChild(label);
                musicListDiv.appendChild(div);
            });
        })
        .catch(error => {
            console.error('加载音频文件失败:', error);
            musicListDiv.innerHTML = '<p class="text-danger">加载音频文件失败</p>';
        });
}

/**
 * 向对话文本框插入文本
 * @param {string} text - 要插入的文本
 */
function insertTextIntoDialogue(text) {
    const textarea = document.getElementById('dialogueText');
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    
    textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
    textarea.scrollTop = scrollTop;
}

/**
 * 保存对话
 */
function saveDialogue() {
    const dialogueText = document.getElementById('dialogueText').value;
    const dialogueSelectHidden = document.getElementById('dialogueSelectHidden');
    const selectedId = dialogueSelectHidden.value;
    
    if (!dialogueText.trim()) {
        alert('请输入对话内�?);
        return;
    }
    
    fetch('/data/DialogueList.json')
        .then(response => response.json())
        .then(data => {
            if (!data) {
                data = [];
            }
            
            if (selectedId) {
                // 更新现有对话
                const dialogueIndex = data.findIndex(d => d.Id === selectedId);
                if (dialogueIndex !== -1) {
                    // 弹出一个输入框让用户录入对话的名称
                    const dialogueName = prompt('请输入对话名�?, data[dialogueIndex].Name || '');
                    if (dialogueName === null) {
                        return Promise.reject(new Error('取消保存'));
                    }
                    if (!dialogueName) {
                        alert('请输入对话名�?);
                        return Promise.reject(new Error('请输入对话名�?));
                    }
                    
                    data[dialogueIndex].Text = dialogueText;
                    data[dialogueIndex].Name = dialogueName;
                }
            } else {
                // 添加新对�?
                // 弹出一个输入框让用户录入对话的名称
                const dialogueName = prompt('请输入对话名�?);
                if (dialogueName === null) {
                    return Promise.reject(new Error('取消保存'));
                }
                if (!dialogueName) {
                    alert('请输入对话名�?);
                    return Promise.reject(new Error('请输入对话名�?));
                }
                
                // 生成新的ID
                const newId = data.length > 0 ? 
                    (Math.max(...data.map(d => parseInt(d.Id))) + 1).toString() : '1';
                
                // 添加新对�?
                data.push({
                    Id: newId,
                    Name: dialogueName,
                    Text: dialogueText
                });
            }
            
            // 保存回文�?
            return fetch('/api/dialogue/save, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data')
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('对话保存成功');
                loadDialogues();
                // 如果是新增，重置选择�?
                if (!selectedId) {
                    document.getElementById('dialogueSelect').value = '';
                    document.getElementById('dialogueSelectHidden').value = '';
                    document.getElementById('dialogueSearchInput').value = '';
                    document.getElementById('dialogueText').value = '';
                }
            } else {
                alert('保存失败: ' + (result.error || '未知错误'));
            }
        })
        .catch(error => {
            if (error.message !== '取消保存' && error.message !== '请输入对话名�?) {
                console.error('保存对话失败:', error);
                alert('保存对话失败');
            }
        });
}

/**
 * 删除对话
 */
function deleteDialogue() {
    const dialogueSelectHidden = document.getElementById('dialogueSelectHidden');
    const selectedId = dialogueSelectHidden.value;
    
    if (!selectedId) {
        alert('请先选择要删除的对话');
        return;
    }
    
    // 弹出确认�?
    if (confirm('确定要删除这个对话吗？此操作不可撤销�?)) {
        fetch('/data/DialogueList.json')
            .then(response => response.json())
            .then(data => {
                if (!data) {
                    data = [];
                }
                
                // 过滤掉要删除的对�?
                data = data.filter(dialogue => dialogue.Id !== selectedId);
                
                // 保存回文�?
                return fetch('/api/dialogue/save, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data')
                });
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('对话删除成功');
                    loadDialogues();
                    // 重置选择框和文本�?
                    document.getElementById('dialogueSelect').value = '';
                    document.getElementById('dialogueSelectHidden').value = '';
                    document.getElementById('dialogueSearchInput').value = '';
                    document.getElementById('dialogueText').value = '';
                } else {
                    alert('删除失败: ' + (result.error || '未知错误'));
                }
            })
            .catch(error => {
                console.error('删除对话失败:', error);
                alert('删除对话失败');
            });
    }
}

/**
 * 预览对话
 */
function previewDialogue() {
    const dialogueText = document.getElementById('dialogueText').value;
    
    if (!dialogueText.trim()) {
        alert('请先输入对话内容');
        return;
    }
    
    // 打开预览模态框
    const previewModal = new bootstrap.Modal(document.getElementById('dialoguePreviewModal'));
    previewModal.show();
    
    // 解析对话内容并开始播�?
    parseAndPlayDialogue(dialogueText);
}

/**
 * 解析并播放对�?
 * @param {string} dialogueText - 对话文本内容
 */
function parseAndPlayDialogue(dialogueText) {
    const lines = dialogueText.split('\n');
    const scene = document.getElementById('scene');
    const dialogueDisplay = document.getElementById('dialogue-display');
    
    // 清空舞台
    document.getElementById('left-character').innerHTML = '';
    document.getElementById('center-character').innerHTML = '';
    document.getElementById('right-character').innerHTML = '';
    dialogueDisplay.innerHTML = '';
    
    // 清除现有的背�?
    const existingBackground = scene.querySelector('.scene-background');
    if (existingBackground) {
        scene.removeChild(existingBackground);
    }
    
    // 停止任何正在播放的音�?
    if (window.currentSound) {
        window.currentSound.pause();
        window.currentSound = null;
    }
    if (window.currentMusic) {
        window.currentMusic.pause();
        window.currentMusic = null;
    }
    
    let currentLine = 0;
    let branchTargets = {}; // 存储分支选择的目标对话ID
    
    // 开始播�?
    function playNextLine() {
        if (currentLine >= lines.length) {
            return;
        }
        
        const line = lines[currentLine].trim();
        currentLine++;
        
        if (!line) {
            // 跳过空行
            playNextLine();
            return;
        }
        
        // 检查是否是指令
        if (line.startsWith('[')) {
            // 处理分支选择指令
            if (line.startsWith('[分支选择]')) {
                const optionsStr = line.substring('[分支选择]'.length).trim();
                const options = optionsStr.split(',');
                
                // 清空对话显示区域
                dialogueDisplay.innerHTML = '<p class="text-lg mb-4">请选择�?/p>';
                
                // 创建选择按钮
                options.forEach(option => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-primary m-2';
                    btn.textContent = option;
                    btn.onclick = function() {
                            // 获取该选择对应的目标对话ID（使用trim确保与存储时的键一致）
                            const targetDialogueId = branchTargets[option.trim()];
                            if (targetDialogueId) {
                                // 查找并加载目标对�?
                                fetch('/data/DialogueList.json')
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data) {
                                            const targetDialogue = data.find(d => d.Id === targetDialogueId);
                                            if (targetDialogue) {
                                                // 解析并播放目标对�?
                                                parseAndPlayDialogue(targetDialogue.Text);
                                            } else {
                                                console.error('未找到目标对�?', targetDialogueId);
                                            }
                                        } else {
                                            console.error('对话数据格式错误');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('加载目标对话失败:', error);
                                    });
                            } else {
                                console.error('未找到该选项对应的目标对�?);
                            }
                        };
                    dialogueDisplay.appendChild(btn);
                });
                
                // 不需要继续播放下一行，等待用户选择
                return;
            }
            // 处理选择目标指令
            else if (line.startsWith('[选择目标]')) {
                const targetsStr = line.substring('[选择目标]'.length).trim();
                const targets = targetsStr.split(',');
                
                // 解析选择目标
                targets.forEach(target => {
                    const [option, dialogueId] = target.split(':');
                    if (option && dialogueId) {
                        branchTargets[option.trim()] = dialogueId.trim();
                    }
                });
                
                setTimeout(playNextLine, 1);
                return;
            }
            // 其他原有指令保持不变
            else if (line.startsWith('[开始]') || line.startsWith('[结束]')) {
                // 开始继续下一�?
                if (line.startsWith('[开始]')) {
                    setTimeout(playNextLine, 100);
                }else if (line.startsWith('[结束]')) {
                    return;
                }
            } else if (line.startsWith('[显示角色]')) {
                // 显示角色指令
                const params = line.substring('[显示角色]'.length).trim();
                const [position, imagePath] = params.split(',');
                
                if (position && imagePath) {
                    const characterDiv = document.getElementById(`${position}-character`);
                    if (characterDiv) {
                        // 清除该位置的现有角色
                        characterDiv.innerHTML = '';
                        
                        // 创建新的角色图片
                        const characterImage = document.createElement('img');
                        
                        // 检查图片路径是否是res://格式或实际路�?
                        if (imagePath.startsWith('res://')) {
                            // 模拟res://路径，实际项目中可能需要转�?
                            characterImage.src = '/img/default-character.png';
                            characterImage.alt = '角色图片';
                        } else {
                            // 使用实际路径
                            characterImage.src = imagePath;
                            characterImage.alt = '角色图片';
                        }
                        
                        characterImage.className = 'img-fluid max-h-[400px]';
                        characterDiv.appendChild(characterImage);
                    }
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[隐藏角色]')) {
                // 隐藏角色指令
                const position = line.substring('[隐藏角色]'.length).trim();
                
                if (position) {
                    const characterDiv = document.getElementById(`${position}-character`);
                    if (characterDiv) {
                        characterDiv.innerHTML = '';
                    }
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[黑屏]')) {
                // 黑屏指令
                const blackScreenText = line.substring('[黑屏]'.length).trim();
                
                // 清除所有角�?
                document.getElementById('left-character').innerHTML = '';
                document.getElementById('center-character').innerHTML = '';
                document.getElementById('right-character').innerHTML = '';
                
                // 清除背景
                const existingBackground = scene.querySelector('.scene-background');
                if (existingBackground) {
                    scene.removeChild(existingBackground);
                }
                
                // 设置场景为黑色背�?
                scene.style.backgroundColor = 'black';
                
                // 显示黑屏文字
                dialogueDisplay.innerHTML = `<p class="text-white text-center text-xl">${blackScreenText}</p>`;
                dialogueDisplay.classList.remove('bg-white');
                dialogueDisplay.classList.add('bg-black');
                setTimeout(() => {
                    // 恢复场景背景�?
                    scene.style.backgroundColor = '#f8f9fa';
                    dialogueDisplay.classList.remove('bg-black');
                    dialogueDisplay.classList.add('bg-white');
                    playNextLine();
                }, 2000);
            } else if (line.startsWith('[播放声音]')) {
                // 播放声音指令
                const soundPath = line.substring('[播放声音]'.length).trim();
                
                if (soundPath) {
                    // 停止并清除当前正在播放的声音
                    if (window.currentSound) {
                        window.currentSound.pause();
                        window.currentSound = null;
                    }
                    
                    // 创建新的音频元素并播�?
                    window.currentSound = new Audio(soundPath);
                    
                    // 添加加载完成事件监听
                    window.currentSound.oncanplaythrough = function() {
                        // 确保只有在没有其他暂停操作干扰的情况下才播放
                        if (window.currentSound === this) {
                            this.play().catch(error => {
                                console.error('播放声音失败:', error);
                            });
                        }
                    };
                    
                    // 如果音频已经加载完成，直接播�?
                    if (window.currentSound.readyState >= 4) {
                        window.currentSound.oncanplaythrough();
                    }
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[停止播放]')) {
                // 停止播放指令
                // 停止当前正在播放的声音和音乐
                if (window.currentSound) {
                    window.currentSound.pause();
                    window.currentSound = null;
                }
                if (window.currentMusic) {
                    window.currentMusic.pause();
                    window.currentMusic = null;
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[显示背景]')) {
                // 显示背景指令
                const backgroundPath = line.substring('[显示背景]'.length).trim();
                
                if (backgroundPath) {
                    // 清除现有的背�?
                    const existingBackground = scene.querySelector('.scene-background');
                    if (existingBackground) {
                        scene.removeChild(existingBackground);
                    }
                    
                    // 创建新的背景图片
                    const backgroundImage = document.createElement('img');
                    backgroundImage.src = backgroundPath;
                    backgroundImage.alt = '背景图片';
                    backgroundImage.className = 'scene-background position-absolute top-0 left-0 w-full h-full object-cover z-0';
                    backgroundImage.style.opacity = '0.8'; // 设置透明�?
                    //设置背景图片最大宽度和高度
                    backgroundImage.style.maxWidth = '800px';
                    backgroundImage.style.maxHeight = '600px';
                    //确保背景图片在其他元素之�?
                    scene.style.position = 'relative';
                    if (scene.firstChild) {
                        scene.insertBefore(backgroundImage, scene.firstChild);
                    } else {
                        scene.appendChild(backgroundImage);
                    }
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[隐藏背景]')) {
                // 隐藏背景指令
                const existingBackground = scene.querySelector('.scene-background');
                if (existingBackground) {
                    scene.removeChild(existingBackground);
                }
                
                setTimeout(playNextLine, 1);
            } else if (line.startsWith('[播放音乐]')) {
                // 播放音乐指令
                const params = line.substring('[播放音乐]'.length).trim();
                const parts = params.split(',');
                const playMode = parts.pop(); // 最后一个参数是播放模式
                const musicPaths = parts; // 前面的都是音乐路�?
                
                if (musicPaths.length > 0) {
                    // 停止当前正在播放的音�?
                    if (window.currentMusic) {
                        window.currentMusic.pause();
                        window.currentMusic = null;
                    }
                    
                    // 创建音频播放管理�?
                    createMusicPlayer(musicPaths, playMode);
                }
                
                setTimeout(playNextLine, 1);
            }
        } else {
            // 普通对话文�?
            dialogueDisplay.innerHTML = `<p class="text-lg">${line}</p>`;
            
            // 等待用户点击继续
            dialogueDisplay.style.cursor = 'pointer';
            dialogueDisplay.onclick = function() {
                dialogueDisplay.onclick = null;
                dialogueDisplay.style.cursor = 'default';
                playNextLine();
            };
        }
    }
    
    // 开始播放第一�?
    playNextLine();
}

/**
 * 创建音乐播放�?
 * @param {Array} musicPaths - 音乐文件路径数组
 * @param {string} playMode - 播放模式：single（单曲循环）、random（随机播放）、sequential（顺序播放一次）
 */
function createMusicPlayer(musicPaths, playMode) {
    let currentIndex = 0;
    
    function playNextMusic() {
        if (musicPaths.length === 0) {
            return;
        }
        
        // 根据播放模式确定下一首要播放的音乐索�?
        if (playMode === 'random') {
            // 随机播放
            currentIndex = Math.floor(Math.random() * musicPaths.length);
        } else if (playMode === 'sequential') {
            // 顺序播放一�?
            if (currentIndex >= musicPaths.length - 1) {
                // 已经播放到最后一首，停止播放
                return;
            }
            currentIndex++;
        }
        // 单曲循环则保持currentIndex不变
        
        // 停止并清除当前正在播放的音乐
        if (window.currentMusic) {
            window.currentMusic.pause();
            window.currentMusic = null;
        }
        
        // 创建新的音频元素
        window.currentMusic = new Audio(musicPaths[currentIndex]);
        
        // 设置音频结束事件
        window.currentMusic.onended = function() {
            if (playMode === 'sequential' && currentIndex >= musicPaths.length - 1) {
                // 顺序播放一次模式下，播放完最后一首后停止
                window.currentMusic = null;
                return;
            }
            // 其他模式继续播放
            playNextMusic();
        };
        
        // 添加加载完成事件监听
        window.currentMusic.oncanplaythrough = function() {
            // 确保只有在没有其他暂停操作干扰的情况下才播放
            if (window.currentMusic === this) {
                this.play().catch(error => {
                    console.error('播放音乐失败:', error);
                });
            }
        };
        
        // 如果音频已经加载完成，直接播�?
        if (window.currentMusic.readyState >= 4) {
            window.currentMusic.oncanplaythrough();
        }
    }
    
    // 开始播放第一首音�?
    playNextMusic();
}

/**
 * 保存音频JSON数据
 */
document.getElementById('saveAudioJsonBtn').addEventListener('click', function() {
    const audioJsonModal = document.getElementById('audioJsonModal');
    const filename = audioJsonModal.dataset.filename;
    const name = document.getElementById('audioName').value;
    const type = document.getElementById('audioType').value;
    
    if (!name || !type) {
        alert('请填写完整信�?);
        return;
    }
    
    fetch(`window.getApiUrl(`/api/sound/json/${filename}``), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('数据保存成功');
            const modal = bootstrap.Modal.getInstance(audioJsonModal);
            modal.hide();
        } else {
            alert(`保存失败: ${data.error || data.message}`);
        }
    })
    .catch(error => {
        console.error('保存音频JSON数据失败:', error);
        alert('保存音频JSON数据失败');
    });
});

/**
 * 保存图片JSON数据
 */
document.getElementById('saveImageJsonBtn').addEventListener('click', function() {
    const imageJsonModal = document.getElementById('imageJsonModal');
    const filename = imageJsonModal.dataset.filename;
    const name = document.getElementById('imageName').value;
    const type = document.getElementById('imageType').value;
    
    if (!name || !type) {
        alert('请填写完整信�?);
        return;
    }
    
    fetch(`window.getApiUrl(`/api/img/json/${filename}``), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('数据保存成功');
            const modal = bootstrap.Modal.getInstance(imageJsonModal);
            modal.hide();
        } else {
            alert(`保存失败: ${data.error || data.message}`);
        }
    })
    .catch(error => {
        console.error('保存图片JSON数据失败:', error);
        alert('保存图片JSON数据失败');
    });
});
