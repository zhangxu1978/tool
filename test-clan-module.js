// 测试clan-management-server.js模块
const express = require('express');
const clanManagement = require('./clan-management-server');

// 创建一个测试应用
const app = express();

// 打印路由器的所有路由
console.log('=== 测试clan-management-server.js模块 ===');

// 尝试获取路由器的路由信息
if (clanManagement && typeof clanManagement === 'function') {
    console.log('模块已成功导入并是一个函数');
} else if (clanManagement && typeof clanManagement === 'object') {
    console.log('模块已成功导入并是一个对象');
    console.log('模块的主要属性:', Object.keys(clanManagement));
} else {
    console.log('模块导入失败或返回了无效值');
}

console.log('=== 测试结束 ===');