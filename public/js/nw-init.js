/**
 * NW.js初始化文件
 * 处理桌面应用特定功能
 */

// 检查是否在NW.js环境中
const isNwjs = typeof nw !== 'undefined';

if (isNwjs) {
    console.log('在NW.js环境中运行');
    
    // 获取NW.js的API
    const fs = require('fs');
    const path = require('path');
    
    // 应用目录
    const appDir = nw.App.dataPath;
    console.log('应用数据目录:', appDir);
    
    // 确保必要的目录存在
    function ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    
    // 为了更好的桌面体验，修改链接行为
    function modifyLinkBehavior() {
        // 修改所有target="_blank"的链接，在NW.js中打开新窗口
        document.querySelectorAll('a[target="_blank"], button[onclick*="window.open"]').forEach(el => {
            if (el.tagName === 'A') {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = el.getAttribute('href');
                    if (url) {
                        nw.Shell.openExternal(url);
                    }
                });
            }
        });
    }
    
    // 修改window.open行为，使其在NW.js中正确工作
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
        if (target === '_blank') {
            // 如果是相对路径，在NW.js中打开新窗口
            if (url && !url.startsWith('http')) {
                // 在当前目录中打开相对路径
                const win = nw.Window.open(url, { 
                    new_instance: false,
                    width: 1024,
                    height: 768
                });
                return win.window;
            } else {
                // 外部URL使用默认浏览器打开
                nw.Shell.openExternal(url);
                return null;
            }
        }
        return originalWindowOpen.apply(window, arguments);
    };
    
    // 设置API端点处理 - 在NW.js环境中使用相对路径，避免端口冲突
    function modifyApiEndpoints() {
        // 在NW.js环境中使用相对路径，与浏览器环境保持一致
        window.apiBaseUrl = '';
        
        // 提供一个函数来获取正确的API URL
        window.getApiUrl = function(endpoint) {
            return endpoint;
        };
    }
    
    // 初始化应用
    function initNwjsApp() {
        // 确保必要的目录存在
        ensureDirectory(path.join(appDir, 'sound'));
        ensureDirectory(path.join(appDir, 'img'));
        ensureDirectory(path.join(appDir, 'data'));
        
        // 修改链接行为
        modifyLinkBehavior();
        
        // 修改API端点
        modifyApiEndpoints();
        
        console.log('NW.js应用初始化完成');
    }
    
    // 当DOM加载完成后立即初始化，不延迟
    document.addEventListener('DOMContentLoaded', initNwjsApp);
} else {
    console.log('在浏览器环境中运行');
    // 浏览器环境中使用相对路径
    window.apiBaseUrl = '';
    window.getApiUrl = function(endpoint) {
        return endpoint;
    };
}