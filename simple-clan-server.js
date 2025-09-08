/**
 * 简化版服务器脚本，仅用于测试门派管理模块
 */

const express = require('express');
const app = express();
const port = 3001; // 使用不同的端口避免冲突

// 配置JSON解析器
app.use(express.json());

// 导入门派管理模块
const clanManagement = require('./clan-management-server');
app.use(clanManagement);

// 启动服务器
app.listen(port, () => {
    console.log(`简化版服务器运行在 http://localhost:${port}`);
    console.log('测试API端点:');
    console.log('- 获取所有门派: http://localhost:3001/api/clans');
    console.log('- 生成随机门派: http://localhost:3001/api/clans/generate');
});