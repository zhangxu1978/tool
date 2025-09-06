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
        
        // 监听图片加载
        document.getElementById('editorImageFileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadImageFromFile(e.target.files[0]);
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
    }
    
    /**
     * 从文件加载图片
     */
    loadImageFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadImageFromUrl(e.target.result);
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
            
            // 调整画布大小以适应图片
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            
            // 绘制图片到画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            
            // 显示画布和选择框
            this.canvas.style.display = 'block';
            this.selectionBox.style.display = 'block';
            
            // 更新选择框样式
            this.updateSelectionBoxStyle();
            
            // 更新状态信息
            document.getElementById('imageInfo').textContent = 
                `图片尺寸: ${img.width}×${img.height}`;
        };
        img.src = url;
    }
    
    /**
     * 更新选择框样式
     */
    updateSelectionBoxStyle() {
        this.selectionBox.style.width = `${this.tileWidth}px`;
        this.selectionBox.style.height = `${this.tileHeight}px`;
        
        // 更新输出画布大小
        const outputWidth = this.tileWidth * this.outputSize;
        const outputHeight = this.tileHeight * this.outputSize;
        this.outputCanvas.width = outputWidth;
        this.outputCanvas.height = outputHeight;
        
        // 更新信息显示
        document.getElementById('tileInfo').textContent = 
            `选择框尺寸: ${this.tileWidth}×${this.tileHeight}px`;
        document.getElementById('outputInfo').textContent = 
            `输出尺寸: ${outputWidth}×${outputHeight}px (10×10网格)`;
        
        // 重置输出画布
        this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        
        // 重新绘制所有已保存的瓦片
        this.redrawTiles();
    }
    
    /**
     * 处理鼠标移动事件
     */
    handleMouseMove(e) {
        if (!this.currentImage) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 计算选择框位置（对齐到网格）
        const boxX = Math.floor(x / this.tileWidth) * this.tileWidth;
        const boxY = Math.floor(y / this.tileHeight) * this.tileHeight;
        
        // 确保选择框不超出画布边界
        const maxX = this.canvas.width - this.tileWidth;
        const maxY = this.canvas.height - this.tileHeight;
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
        
        // 绘制瓦片到输出画布
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
        
        // 绘制瓦片
        this.outputCtx.drawImage(
            this.currentImage,
            sourceX, sourceY, this.tileWidth, this.tileHeight,
            targetX, targetY, this.tileWidth, this.tileHeight
        );
    }
    
    /**
     * 重新绘制所有瓦片
     */
    redrawTiles() {
        // 清空输出画布
        this.outputCtx.clearRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
        
        // 重新绘制所有瓦片
        this.tiles.forEach(tile => {
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