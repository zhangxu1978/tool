/**
 * 前端主JavaScript文件
 * 实现音频和图片文件的管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化加载文件列表
    loadAudioFiles();
    
    // 标签切换事件
    document.getElementById('images-tab').addEventListener('click', function() {
        loadImageFiles();
    });
    
    document.getElementById('dialogue-tab').addEventListener('click', function() {
        loadDialogues();
        loadImagesForCharacterSelect();
    });
    
    // 对话选择框change事件
    document.getElementById('dialogueSelect').addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            fetch('/jsonData/DialogueList.json')
                .then(response => response.json())
                .then(data => {
                    if (data.dialogues) {
                        const selectedDialogue = data.dialogues.find(d => d.id === selectedId);
                        if (selectedDialogue) {
                            document.getElementById('dialogueText').value = selectedDialogue.text;
                        }
                    }
                })
                .catch(error => {
                    console.error('加载对话内容失败:', error);
                });
        } else {
            // 选择新增时清空文本框
            document.getElementById('dialogueText').value = '';
        }
    });
    
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
        
        // 显示一个简单的提示让用户输入位置
        const position = prompt('请输入角色位置(left/center/right):');
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
    
    // 保存对话按钮
    document.getElementById('saveDialogue').addEventListener('click', saveDialogue);
    
    // 预览对话按钮
    document.getElementById('previewDialogue').addEventListener('click', previewDialogue);
    
    // 删除对话按钮
    document.getElementById('deleteDialogue').addEventListener('click', deleteDialogue);
    
    // 音频上传区域点击事件
    document.getElementById('audioUploadArea').addEventListener('click', function() {
        document.getElementById('audioFileInput').click();
    });
    
    // 图片上传区域点击事件
    document.getElementById('imageUploadArea').addEventListener('click', function() {
        document.getElementById('imageFileInput').click();
    });
    
    // 音频文件选择事件
    document.getElementById('audioFileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadAudioFile(e.target.files[0]);
        }
    });
    
    // 图片文件选择事件
    document.getElementById('imageFileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadImageFile(e.target.files[0]);
        }
    });
    
    // 拖放上传功能 - 音频
    const audioDropArea = document.getElementById('audioUploadArea');
    audioDropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#007bff';
    });
    
    audioDropArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
    });
    
    audioDropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.borderColor = '#ddd';
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('audio/')) {
                uploadAudioFile(file);
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
});

/**
 * 加载音频文件列表
 */
function loadAudioFiles() {
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    audioList.innerHTML = '';
    loading.style.display = 'block';
    
    fetch('/api/audio')
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
 * 加载图片文件列表
 */
function loadImageFiles() {
    const imageList = document.getElementById('imageList');
    const loading = document.getElementById('imageLoading');
    
    imageList.innerHTML = '';
    loading.style.display = 'block';
    
    fetch('/api/images')
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
 * 创建音频文件列表项
 * @param {Object} file - 音频文件信息
 * @returns {HTMLElement} - 列表项元素
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
    fetch(`/api/audio/json/${file.name}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                // 如果有关联数据，显示自定义名称
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
        // 检查是否已有关联数据
        fetch(`/api/audio/json/${file.name}`)
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
 * 创建图片文件列表项
 * @param {Object} file - 图片文件信息
 * @returns {HTMLElement} - 列表项元素
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
    fetch(`/api/images/json/${file.name}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                // 如果有关联数据，显示自定义名称
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
        // 检查是否已有关联数据
        fetch(`/api/images/json/${file.name}`)
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
 * 上传音频文件
 * @param {File} file - 要上传的音频文件
 */
function uploadAudioFile(file) {
    const formData = new FormData();
    formData.append('audioFile', file);
    
    const audioList = document.getElementById('audioList');
    const loading = document.getElementById('audioLoading');
    
    loading.style.display = 'block';
    
    fetch('/api/audio/upload', {
        method: 'POST',
        body: formData
    })
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
 * 上传图片文件
 * @param {File} file - 要上传的图片文件
 */
function uploadImageFile(file) {
    const formData = new FormData();
    formData.append('imageFile', file);
    
    const imageList = document.getElementById('imageList');
    const loading = document.getElementById('imageLoading');
    
    loading.style.display = 'block';
    
    fetch('/api/images/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadImageFiles(); // 重新加载图片列表
        } else {
            alert(`上传失败: ${data.error}`);
            loading.style.display = 'none';
        }
    })
    .catch(error => {
        alert(`上传失败: ${error.message}`);
        loading.style.display = 'none';
        console.error('上传图片文件失败:', error);
    });
}

/**
 * 删除音频文件
 * @param {string} filename - 要删除的文件名
 */
function deleteAudioFile(filename) {
    const loading = document.getElementById('audioLoading');
    loading.style.display = 'block';
    
    fetch(`/api/audio/${filename}`, {
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
 * @param {string} filename - 要删除的文件名
 */
function deleteImageFile(filename) {
    const loading = document.getElementById('imageLoading');
    loading.style.display = 'block';
    
    fetch(`/api/images/${filename}`, {
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
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} - 格式化后的文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 加载对话列表
 */
function loadDialogues() {
    const dialogueSelect = document.getElementById('dialogueSelect');
    
    // 清空除了第一个选项以外的所有选项
    while (dialogueSelect.options.length > 1) {
        dialogueSelect.remove(1);
    }
    
    fetch('/jsonData/DialogueList.json')
        .then(response => response.json())
        .then(data => {
            if (!data.dialogues || data.dialogues.length === 0) {
                return;
            }
            
            data.dialogues.forEach(dialogue => {
                const option = document.createElement('option');
                option.value = dialogue.id;
                option.textContent = dialogue.name ? `${dialogue.name} - 对话 ${dialogue.id}` : `对话 ${dialogue.id}`;
                dialogueSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('加载对话失败:', error);
        });
}

/**
 * 加载角色选择的图片列表
 */
function loadImagesForCharacterSelect() {
    const roleImageSelect = document.getElementById('roleImage');
    
    // 从images.json获取图片数据
    fetch('/jsonData/images.json')
        .then(response => response.json())
        .then(data => {
            roleImageSelect.innerHTML = '';
            
            if (!data.files || data.files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的图片';
                roleImageSelect.appendChild(option);
                return;
            }
            
            // 过滤出类型为"人物"的图片
            const characterImages = data.files.filter(file => 
                file.type && file.type.includes('人物')
            );
            
            if (characterImages.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的人物图片';
                roleImageSelect.appendChild(option);
                return;
            }
            
            // 添加人物图片选项
            characterImages.forEach(image => {
                const option = document.createElement('option');
                // 构建完整的图片路径
                option.value = `/images/${image.filename}`;
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
 * 加载声音选择的音频文件列表
 */
function loadAudioFilesForSoundSelect() {
    const soundFileSelect = document.getElementById('soundFile');
    
    // 获取所有音频文件
    fetch('/api/audio')
        .then(response => response.json())
        .then(files => {
            soundFileSelect.innerHTML = '';
            
            if (files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的音频文件';
                soundFileSelect.appendChild(option);
                return;
            }
            
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file.path;
                option.textContent = file.name;
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
 * 加载背景选择的图片列表
 */
function loadImagesForBackgroundSelect() {
    const backgroundImageSelect = document.getElementById('backgroundImage');
    
    // 从images.json获取图片数据
    fetch('/jsonData/images.json')
        .then(response => response.json())
        .then(data => {
            backgroundImageSelect.innerHTML = '';
            
            if (!data.files || data.files.length === 0) {
                const option = document.createElement('option');
                option.textContent = '没有可用的图片';
                backgroundImageSelect.appendChild(option);
                return;
            }
            
            // 添加所有图片作为背景选项
            data.files.forEach(image => {
                const option = document.createElement('option');
                // 构建完整的图片路径
                option.value = `/images/${image.filename}`;
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
    
    // 获取所有音频文件
    fetch('/api/audio')
        .then(response => response.json())
        .then(files => {
            musicListDiv.innerHTML = '';
            
            if (files.length === 0) {
                musicListDiv.innerHTML = '<p class="text-muted">没有可用的音频文件</p>';
                return;
            }
            
            files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'form-check';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input';
                checkbox.id = `music-${file.name}`;
                checkbox.value = file.path;
                
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
    const dialogueSelect = document.getElementById('dialogueSelect');
    const selectedId = dialogueSelect.value;
    
    if (!dialogueText.trim()) {
        alert('请输入对话内容');
        return;
    }
    
    fetch('/jsonData/DialogueList.json')
        .then(response => response.json())
        .then(data => {
            if (!data.dialogues) {
                data.dialogues = [];
            }
            
            if (selectedId) {
                // 更新现有对话
                const dialogueIndex = data.dialogues.findIndex(d => d.id === selectedId);
                if (dialogueIndex !== -1) {
                    // 弹出一个输入框让用户录入对话的名称
                    const dialogueName = prompt('请输入对话名称', data.dialogues[dialogueIndex].name || '');
                    if (dialogueName === null) {
                        return Promise.reject(new Error('取消保存'));
                    }
                    if (!dialogueName) {
                        alert('请输入对话名称');
                        return Promise.reject(new Error('请输入对话名称'));
                    }
                    
                    data.dialogues[dialogueIndex].text = dialogueText;
                    data.dialogues[dialogueIndex].name = dialogueName;
                }
            } else {
                // 添加新对话
                // 弹出一个输入框让用户录入对话的名称
                const dialogueName = prompt('请输入对话名称');
                if (dialogueName === null) {
                    return Promise.reject(new Error('取消保存'));
                }
                if (!dialogueName) {
                    alert('请输入对话名称');
                    return Promise.reject(new Error('请输入对话名称'));
                }
                
                // 生成新的ID
                const newId = data.dialogues.length > 0 ? 
                    (Math.max(...data.dialogues.map(d => parseInt(d.id))) + 1).toString() : '1';
                
                // 添加新对话
                data.dialogues.push({
                    id: newId,
                    name: dialogueName,
                    text: dialogueText
                });
            }
            
            // 保存回文件
            return fetch('/api/dialogue/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('对话保存成功');
                loadDialogues();
                // 如果是新增，重置选择框
                if (!selectedId) {
                    dialogueSelect.value = '';
                    document.getElementById('dialogueText').value = '';
                }
            } else {
                alert('保存失败: ' + (result.error || '未知错误'));
            }
        })
        .catch(error => {
            if (error.message !== '取消保存' && error.message !== '请输入对话名称') {
                console.error('保存对话失败:', error);
                alert('保存对话失败');
            }
        });
}

/**
 * 删除对话
 */
function deleteDialogue() {
    const dialogueSelect = document.getElementById('dialogueSelect');
    const selectedId = dialogueSelect.value;
    
    if (!selectedId) {
        alert('请先选择要删除的对话');
        return;
    }
    
    // 弹出确认框
    if (confirm('确定要删除这个对话吗？此操作不可撤销。')) {
        fetch('/jsonData/DialogueList.json')
            .then(response => response.json())
            .then(data => {
                if (!data.dialogues) {
                    data.dialogues = [];
                }
                
                // 过滤掉要删除的对话
                data.dialogues = data.dialogues.filter(dialogue => dialogue.id !== selectedId);
                
                // 保存回文件
                return fetch('/api/dialogue/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('对话删除成功');
                    loadDialogues();
                    // 重置选择框和文本框
                    dialogueSelect.value = '';
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
    
    // 解析对话内容并开始播放
    parseAndPlayDialogue(dialogueText);
}

/**
 * 解析并播放对话
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
    
    // 清除现有的背景
    const existingBackground = scene.querySelector('.scene-background');
    if (existingBackground) {
        scene.removeChild(existingBackground);
    }
    
    // 停止任何正在播放的音频
    if (window.currentSound) {
        window.currentSound.pause();
        window.currentSound = null;
    }
    if (window.currentMusic) {
        window.currentMusic.pause();
        window.currentMusic = null;
    }
    
    let currentLine = 0;
    
    // 开始播放
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
           // const command = line.substring(1, line.length - 1);
            
            if (line.startsWith('[开始]') || line.startsWith('[结束]')) {
                // 开始或结束指令，继续下一行
                setTimeout(playNextLine, 100);
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
                        
                        // 检查图片路径是否是res://格式或实际路径
                        if (imagePath.startsWith('res://')) {
                            // 模拟res://路径，实际项目中可能需要转换
                            characterImage.src = '/images/default-character.png';
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
                
                // 清除所有角色
                document.getElementById('left-character').innerHTML = '';
                document.getElementById('center-character').innerHTML = '';
                document.getElementById('right-character').innerHTML = '';
                
                // 清除背景
                const existingBackground = scene.querySelector('.scene-background');
                if (existingBackground) {
                    scene.removeChild(existingBackground);
                }
                
                // 设置场景为黑色背景
                scene.style.backgroundColor = 'black';
                
                // 显示黑屏文字
                dialogueDisplay.innerHTML = `<p class="text-white text-center text-xl">${blackScreenText}</p>`;
                dialogueDisplay.classList.remove('bg-white');
                dialogueDisplay.classList.add('bg-black');
                setTimeout(() => {
                    // 恢复场景背景色
                    scene.style.backgroundColor = '#f8f9fa';
                    dialogueDisplay.classList.remove('bg-black');
                    dialogueDisplay.classList.add('bg-white');
                    playNextLine();
                }, 2000);
            } else if (line.startsWith('[播放声音]')) {
                // 播放声音指令
                const soundPath = line.substring('[播放声音]'.length).trim();
                
                if (soundPath) {
                    // 停止当前正在播放的声音
                    if (window.currentSound) {
                        window.currentSound.pause();
                    }
                    
                    // 创建新的音频元素并播放
                    window.currentSound = new Audio(soundPath);
                    window.currentSound.play().catch(error => {
                        console.error('播放声音失败:', error);
                    });
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
                    // 清除现有的背景
                    const existingBackground = scene.querySelector('.scene-background');
                    if (existingBackground) {
                        scene.removeChild(existingBackground);
                    }
                    
                    // 创建新的背景图片
                    const backgroundImage = document.createElement('img');
                    backgroundImage.src = backgroundPath;
                    backgroundImage.alt = '背景图片';
                    backgroundImage.className = 'scene-background position-absolute top-0 left-0 w-full h-full object-cover z-0';
                    backgroundImage.style.opacity = '0.5'; // 设置透明度
                    
                    // 将背景图片添加到场景中
                    scene.style.position = 'relative';
                    scene.insertBefore(backgroundImage, scene.firstChild);
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
                const musicPaths = parts; // 前面的都是音乐路径
                
                if (musicPaths.length > 0) {
                    // 停止当前正在播放的音乐
                    if (window.currentMusic) {
                        window.currentMusic.pause();
                        window.currentMusic = null;
                    }
                    
                    // 创建音频播放管理器
                    createMusicPlayer(musicPaths, playMode);
                }
                
                setTimeout(playNextLine, 1);
            }
        } else {
            // 普通对话文本
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
    
    // 开始播放第一行
    playNextLine();
}

/**
 * 创建音乐播放器
 * @param {Array} musicPaths - 音乐文件路径数组
 * @param {string} playMode - 播放模式：single（单曲循环）、random（随机播放）、sequential（顺序播放一次）
 */
function createMusicPlayer(musicPaths, playMode) {
    let currentIndex = 0;
    
    function playNextMusic() {
        if (musicPaths.length === 0) {
            return;
        }
        
        // 根据播放模式确定下一首要播放的音乐索引
        if (playMode === 'random') {
            // 随机播放
            currentIndex = Math.floor(Math.random() * musicPaths.length);
        } else if (playMode === 'sequential') {
            // 顺序播放一次
            if (currentIndex >= musicPaths.length - 1) {
                // 已经播放到最后一首，停止播放
                return;
            }
            currentIndex++;
        }
        // 单曲循环则保持currentIndex不变
        
        // 创建新的音频元素并播放
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
        
        // 开始播放
        window.currentMusic.play().catch(error => {
            console.error('播放音乐失败:', error);
        });
    }
    
    // 开始播放第一首音乐
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
        alert('请填写完整信息');
        return;
    }
    
    fetch(`/api/audio/json/${filename}`, {
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
        alert('请填写完整信息');
        return;
    }
    
    fetch(`/api/images/json/${filename}`, {
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