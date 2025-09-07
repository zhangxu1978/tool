/**
 * 图片编辑器功能
 * 实现图片局部复制组合功能
 */

class ImageEditor {
    constructor() {
        // 初始化画布和上下文
        this.canvas = document.getElementById('editorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 输出画布和上下文
        this.outputCanvas = document.getElementById('outputCanvas');
        this.outputCtx = this.outputCanvas.getContext('2d');
        
        // 选择框元素
        this.selectionBox = document.getElementById('selectionBox');
        
        // 配置参数
        this.tileWidth = 64;
        this.tileHeight = 64;
        this.outputSize = 10;
        
        // 缩放相关配置
        this.maxCanvasWidth = 800;
        this.maxCanvasHeight = 600;
        this.scale = 1;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.scaleSelectionBox = false; // 选择框是否跟随缩放变化，默认不跟随
        this.snapToGrid = false; // 选择框是否对齐到网格，默认对齐（与HTML保持一致）
        
        // 状态变量
        this.currentImage = null;
        this.currentIndex = 0;
        this.tiles = [];
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听选择框大小变化
        document.getElementById('tileWidth').addEventListener('input', (e) => {
            this.tileWidth = parseInt(e.target.value);
            this.updateSelectionBoxStyle();
        });
        
        document.getElementById('tileHeight').addEventListener('input', (e) => {
            this.tileHeight = parseInt(e.target.value);
            this.updateSelectionBoxStyle();
        });
        
        // 监听缩放变化
        document.getElementById('zoomLevel').addEventListener('input', (e) => {
            if (this.currentImage) {
                this.scale = parseFloat(e.target.value) / 100;
                this.drawScaledImage();
                this.updateSelectionBoxStyle();
            }
        });
        
        // 监听选择框缩放选项变化
        document.getElementById('scaleSelectionBox').addEventListener('change', (e) => {
            this.scaleSelectionBox = e.target.checked;
            if (this.currentImage) {
                this.updateSelectionBoxStyle();
            }
        });
        
        // 监听网格对齐选项变化
        document.getElementById('snapToGrid').addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
        });
        
        // 监听用于复制的图片加载
        document.getElementById('editorImageFileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadImageFromFile(e.target.files[0]);
            }
        });
        
        // 监听用于继续编辑的导出图片加载
        document.getElementById('loadOutputImage').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                // 保存对this的引用以避免递归问题
                const editor = this;
                editor.loadExportedImage(e.target.files[0]);
            }
        });
        
        // 监听画布鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 监听导出按钮
        document.getElementById('exportButton').addEventListener('click', () => this.exportImage());
        
        // 监听重置按钮
        document.getElementById('resetButton').addEventListener('click', () => this.resetEditor());
        
        // 监听起始索引变化
        document.getElementById('startIndex').addEventListener('input', (e) => {
            this.currentIndex = parseInt(e.target.value);
            this.updateStartIndexDisplay();
        });
        
        // 监听使用现有图片按钮
        document.getElementById('useExistingButton').addEventListener('click', () => {
            const imageUrl = document.getElementById('existingImageUrl').value;
            if (imageUrl) {
                this.loadImageFromUrl(imageUrl);
            }
        });
        
        // 监听按当前宽高切图按钮
       // document.getElementById('sliceImageButton').addEventListener('click', () => this.sliceImageByCurrentSize());
    }
    
    /**
     * 按照当前宽高切割结果图并将瓦片信息存入this.tiles
     */
    // sliceImageByCurrentSize() {
    //     // 清空当前瓦片列表
    //     this.tiles = [];
        
    //     // 获取输出画布的像素数据
    //     const imageData = this.outputCtx.getImageData(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        
    //     // 计算横向和纵向可以切割的瓦片数量
    //     const numCols = Math.floor(this.outputCanvas.width / this.tileWidth);
    //     const numRows = Math.floor(this.outputCanvas.height / this.tileHeight);
        
    //     // 遍历所有瓦片位置
    //     for (let row = 0; row < numRows; row++) {
    //         for (let col = 0; col < numCols; col++) {
    //             // 计算瓦片索引
    //             const index = row * this.currentIndex + col;
                
    //             // 如果索引超过最大限制，跳过
    //             if (index >= this.currentIndex ) {
    //                 break;
    //             }
                
    //             // 计算瓦片在输出画布中的位置
    //             const targetX = col * this.tileWidth;
    //             const targetY = row * this.tileHeight;
                
    //             //切分图片
    //             this.outputCtx.drawImage(
    //                 this.outputCanvas, // 源画布
    //                 targetX, targetY, this.tileWidth, this.tileHeight, // 源矩形
    //                 0, 0, this.tileWidth, this.tileHeight // 目标矩形
    //             );
    //             this.tiles.push({
    //                 x: targetX,  // 虚拟的源X坐标
    //                 y: targetY,  // 虚拟的源Y坐标
    //                 index: index
    //             });
    //         }
    //     }
        
    //     // 显示切割完成的信息
    //     alert(`已按照当前宽高(${this.tileWidth}×${this.tileHeight}px)切割结果图，共生成${this.tiles.length}个瓦片。`);
    // }
    
    /**
     * 从文件加载图片（用于复制）
     */
    loadImageFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImageFromUrl(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 加载导出的图片（用于继续编辑）
     */
    loadExportedImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 保存当前已加载的用于复制的图片及其尺寸信息
                const tempCurrentImage = this.currentImage;
                const tempOriginalWidth = this.originalWidth;
                const tempOriginalHeight = this.originalHeight;
                const tempScale = this.scale;
                
                // 手动重置必要的状态，但保留输出画布和当前图片
                this.currentIndex = 0;
                this.tiles = [];
                
                // 清空编辑器画布，但保留输出画布
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 设置输出画布的尺寸和内容
                this.outputCanvas.width = img.width;
                this.outputCanvas.height = img.height;
                this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
                this.outputCtx.drawImage(img, 0, 0);
                
                // 显示画布和选择框
                this.canvas.style.display = 'block';
                this.selectionBox.style.display = 'block';
                
                // 计算当前的瓦片数量和尺寸（假设输出图片是按照10x10网格生成的）
                const currentTileWidth = Math.floor(img.width / this.outputSize);
                const currentTileHeight = Math.floor(img.height / this.outputSize);
                
                // 更新瓦片尺寸信息
                this.tileWidth = currentTileWidth;
                this.tileHeight = currentTileHeight;
                
                // 更新选择框样式
                this.updateSelectionBoxStyle();
                
                // 恢复已加载的用于复制的图片及其尺寸信息
                this.currentImage = tempCurrentImage;
                this.originalWidth = tempOriginalWidth;
                this.originalHeight = tempOriginalHeight;
                this.scale = tempScale;
                
                // 如果有已加载的图片，重新绘制它
                if (this.currentImage) {
                    this.drawScaledImage();
                }
                
                // 更新信息显示
                document.getElementById('tileInfo').textContent = 
                    `选择框尺寸: ${this.tileWidth}×${this.tileHeight}px`;
                document.getElementById('outputInfo').textContent = 
                    `输出尺寸: ${img.width}×${img.height}px (${this.outputSize}×${this.outputSize}网格)`;
                
                // 更新startIndex输入框的最大值
                document.getElementById('startIndex').max = this.outputSize * this.outputSize - 1;
                
                // 默认将当前索引设置为0，用户可以根据需要手动调整
                this.currentIndex = 0;
                this.updateStartIndexDisplay();
                
                // 显示已加载导出图片的信息
                document.getElementById('imageInfo').textContent = 
                    `已加载导出图片: ${img.width}×${img.height}`;
                
                // 如果没有加载用于复制的图片，提示用户
                if (!this.currentImage) {
                    alert('已加载导出图片。请上传一张用于复制的图片以继续添加内容。');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 从URL加载图片
     */
    loadImageFromUrl(url) {
        const img = new Image();
        img.onload = () => {
            this.currentImage = img;
            this.originalWidth = img.width;
            this.originalHeight = img.height;
            
            // 计算初始缩放比例
            this.calculateInitialScale();
            
            // 调整画布大小以适应缩放后的图片
            this.canvas.width = this.originalWidth * this.scale;
            this.canvas.height = this.originalHeight * this.scale;
            
            // 绘制缩放后的图片
            this.drawScaledImage();
            
            // 显示画布和选择框
            this.canvas.style.display = 'block';
            this.selectionBox.style.display = 'block';
            
            // 更新选择框样式
            this.updateSelectionBoxStyle();
            
            // 更新状态信息
            document.getElementById('imageInfo').textContent = 
                `原始尺寸: ${this.originalWidth}×${this.originalHeight} | 当前缩放: ${Math.round(this.scale * 100)}%`;
            
            // 更新缩放滑块值
            document.getElementById('zoomLevel').value = Math.round(this.scale * 100);
            document.getElementById('zoomValue').textContent = `${Math.round(this.scale * 100)}%`;
        };
        img.src = url;
    }
    
    /**
     * 计算初始缩放比例
     */
    calculateInitialScale() {
        const widthRatio = this.maxCanvasWidth / this.originalWidth;
        const heightRatio = this.maxCanvasHeight / this.originalHeight;
        this.scale = Math.min(widthRatio, heightRatio, 1); // 最大不超过100%
    }
    
    /**
     * 绘制缩放后的图片
     */
    drawScaledImage() {
        if (!this.currentImage) return;
        
        // 调整画布大小
        this.canvas.width = this.originalWidth * this.scale;
        this.canvas.height = this.originalHeight * this.scale;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制缩放后的图片
        this.ctx.drawImage(
            this.currentImage, 
            0, 0, this.originalWidth, this.originalHeight, 
            0, 0, this.canvas.width, this.canvas.height
        );
        
        // 更新状态信息
        document.getElementById('imageInfo').textContent = 
            `原始尺寸: ${this.originalWidth}×${this.originalHeight} | 当前缩放: ${Math.round(this.scale * 100)}%`;
            document.getElementById('zoomValue').textContent = `${Math.round(this.scale * 100)}%`;
    }
    
    /**
     * 更新选择框样式
     */
    updateSelectionBoxStyle() {
        // 根据scaleSelectionBox标志决定是否对选择框应用缩放
        const boxWidth = this.scaleSelectionBox ? this.tileWidth * this.scale : this.tileWidth;
        const boxHeight = this.scaleSelectionBox ? this.tileHeight * this.scale : this.tileHeight;
        
        // 设置选择框大小
        this.selectionBox.style.width = `${boxWidth}px`;
        this.selectionBox.style.height = `${boxHeight}px`;
        
        
        // 更新信息显示
        document.getElementById('tileInfo').textContent = 
            `选择框尺寸: ${this.tileWidth}×${this.tileHeight}px`;

    }
    
    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(e) {
        if (!this.currentImage) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 根据scaleSelectionBox标志决定是否对选择框大小应用缩放
        const boxWidth = this.scaleSelectionBox ? this.tileWidth * this.scale : this.tileWidth;
        const boxHeight = this.scaleSelectionBox ? this.tileHeight * this.scale : this.tileHeight;
        
        let boxX, boxY;
        
        // 根据snapToGrid标志决定是平滑移动还是对齐到网格
        if (this.snapToGrid) {
            // 对齐到网格
            boxX = Math.floor(x / boxWidth) * boxWidth;
            boxY = Math.floor(y / boxHeight) * boxHeight;
        } else {
            // 平滑移动，让选择框中心跟随鼠标位置
            boxX = x - boxWidth / 2;
            boxY = y - boxHeight / 2;
        }
        
        // 确保选择框不超出画布边界
        const maxX = this.canvas.width - boxWidth;
        const maxY = this.canvas.height - boxHeight;
        const finalX = Math.min(Math.max(0, boxX), maxX);
        const finalY = Math.min(Math.max(0, boxY), maxY);
        
        // 更新选择框位置
        this.selectionBox.style.left = `${finalX}px`;
        this.selectionBox.style.top = `${finalY}px`;
    }
    
    /**
     * 处理画布点击事件
     */
    handleCanvasClick(e) {
        if (!this.currentImage) return;
        
        // 获取选择框位置
        const boxRect = this.selectionBox.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // 计算选择框在画布中的相对位置
        const x = boxRect.left - canvasRect.left;
        const y = boxRect.top - canvasRect.top;
        
        // 检查当前索引是否超出范围
        if (this.currentIndex >= this.outputSize * this.outputSize) {
            alert('已达到最大瓦片数量！');
            return;
        }
        
        // 保存瓦片信息
        this.tiles.push({
            x: x,
            y: y,
            index: this.currentIndex
        });
        
        // 绘制瓦片到输出画布（直接使用缩放后的坐标，不再转换回原始坐标）
        this.drawTileToOutput(x, y, this.currentIndex);
        
        // 更新当前索引
        this.currentIndex++;
        this.updateStartIndexDisplay();
    }
    
    /**
     * 绘制瓦片到输出画布
     */
    drawTileToOutput(sourceX, sourceY, index) {
        // 计算目标位置
        const row = Math.floor(index / this.outputSize);
        const col = index % this.outputSize;
        const targetX = col * this.tileWidth;
        const targetY = row * this.tileHeight;
        
        // 直接从缩放后的画布上获取像素数据
        const imageData = this.ctx.getImageData(sourceX, sourceY, this.tileWidth, this.tileHeight);
        
        // 将像素数据绘制到输出画布
        this.outputCtx.putImageData(imageData, targetX, targetY);
    }
    
    /**
     * 重新绘制所有瓦片
     */
    redrawTiles() {
        // 清空输出画布
        this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        
        // 重新绘制所有瓦片
        this.tiles.forEach(tile => {
            // 直接使用保存的坐标（已经是缩放后的坐标）
            this.drawTileToOutput(tile.x, tile.y, tile.index);
        });
    }
    
    /**
     * 导出图片
     */
    exportImage() {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'combined-image.png';
        link.href = this.outputCanvas.toDataURL('image/png');
        link.click();
    }
    
    /**
     * 重置编辑器
     */
    resetEditor() {
        // 清空状态
        this.currentImage = null;
        this.currentIndex = 0;
        this.tiles = [];
        
        // 重置画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        
        // 隐藏画布和选择框
        this.canvas.style.display = 'none';
        this.selectionBox.style.display = 'none';
        
        // 重置输入
        document.getElementById('editorImageFileInput').value = '';
        document.getElementById('existingImageUrl').value = '';
        document.getElementById('zoomLevel').value = 100;
        document.getElementById('zoomValue').textContent = '100%';
        
        // 重置缩放相关变量
        this.scale = 1;
        this.originalWidth = 0;
        this.originalHeight = 0;
        
        // 更新信息显示
        document.getElementById('imageInfo').textContent = '';
        this.updateStartIndexDisplay();
    }
    
    /**
     * 更新起始索引显示
     */
    updateStartIndexDisplay() {
        document.getElementById('startIndex').value = this.currentIndex;
        document.getElementById('currentIndexInfo').textContent = 
            `当前索引: ${this.currentIndex} (最大: ${this.outputSize * this.outputSize - 1})`;
    }
}

// 当DOM加载完成后初始化图片编辑器
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否在图片编辑页面
    if (document.getElementById('imageEditorTab')) {
        // 图片编辑器会在切换到对应标签时初始化
    }
});