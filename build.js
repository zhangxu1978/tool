/**
 * NW.js应用构建脚本
 * 使用nw-builder来打包应用程序
 */

const NwBuilder = require('nw-builder');
const path = require('path');

// 构建配置
const nw = new NwBuilder({
    // NW.js版本
    version: '0.78.0',
    // 应用名称
    name: '数字竞技场工具',
    // 应用源码
    files: [
        './package.json',
        './server.js',
        './public/**/*',
        './sound/**/*',
        './img/**/*',
        './data/**/*',
        './clan-management-server.js',
        './spiritVeinServer.js',
        './prop-server.js',
        './player-server.js'
    ],
    // 输出目录
    output: './build',
    // 平台配置
    platforms: [
        'win32',  // Windows 32位
        'win64'   // Windows 64位
        // 如需其他平台，可添加 'osx64', 'linux32', 'linux64'
    ],
    // 构建模式
    mode: 'build', // 可选值: 'build', 'run', 'versioned'
    // 是否包含ffmpeg
    flavor: 'normal', // 可选值: 'normal', 'sdk'
    // 应用图标
    // 如需设置图标，请取消注释并提供图标路径
    // appIcon: './public/img/icon.ico',
    // 是否压缩
    zip: true,
    // 执行前的回调函数
    beforeBuild: function() {
        console.log('开始构建NW.js应用...');
    }
});

// 构建NW.js应用
nw.build()
    .then(function () {
        console.log('构建完成！应用已输出到', path.resolve('./build'));
    })
    .catch(function (error) {
        console.error('构建失败:', error);
    });