/**
 * 服务器主文件
 * 提供音频和图片文件管理功能
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// 配置静态文件服务
app.use(express.static('public'));
app.use('/audio', express.static('audio'));
app.use('/images', express.static('images'));
app.use('/jsonData', express.static('jsonData'));
app.use(express.json());

// 导入门派管理模块
const clanManagement = require('./clan-management-server');
app.use(clanManagement);

// 配置文件上传
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'audio/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadAudio = multer({ 
  storage: audioStorage,
  fileFilter: function (req, file, cb) {
    // 只接受音频文件
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传音频文件！'));
    }
  }
});

const uploadImage = multer({ 
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    // 只接受图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  }
});

/**
 * 获取所有音频文件列表
 */
app.get('/api/audio', (req, res) => {
  fs.readdir('audio', (err, files) => {
    if (err) {
      return res.status(500).json({ error: '无法读取音频文件' });
    }
    
    const audioFiles = files.map(file => {
      const stats = fs.statSync(path.join('audio', file));
      return {
        name: file,
        path: `/audio/${file}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    res.json(audioFiles);
  });
});

/**
 * 获取所有图片文件列表
 */
app.get('/api/images', (req, res) => {
  fs.readdir('images', (err, files) => {
    if (err) {
      return res.status(500).json({ error: '无法读取图片文件' });
    }
    
    const imageFiles = files.map(file => {
      const stats = fs.statSync(path.join('images', file));
      return {
        name: file,
        path: `/images/${file}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    res.json(imageFiles);
  });
});

/**
 * 上传音频文件
 */
app.post('/api/audio/upload', uploadAudio.single('audioFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/audio/${req.file.filename}`,
      size: req.file.size
    }
  });
});

/**
 * 上传图片文件
 */
app.post('/api/images/upload', uploadImage.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/images/${req.file.filename}`,
      size: req.file.size
    }
  });
});

/**
 * 删除音频文件
 */
app.delete('/api/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('audio', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除文件失败' });
    }
    
    res.json({ success: true, message: '文件已删除' });
  });
});

/**
 * 删除图片文件
 */
app.delete('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('images', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除文件失败' });
    }
    
    res.json({ success: true, message: '文件已删除' });
  });
});

/**
 * 获取音频文件关联的JSON数据
 */
app.get('/api/audio/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('jsonData', 'audio.json');
  
  try {
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, JSON.stringify({ files: [] }));
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const fileData = jsonData.files.find(file => file.filename === filename);
    
    if (fileData) {
      res.json({ success: true, data: fileData });
    } else {
      res.json({ success: false, message: '未找到关联数据' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取JSON数据失败' });
  }
});

/**
 * 保存音频文件关联的JSON数据
 */
app.post('/api/audio/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('jsonData', 'audio.json');
  const { name, type } = req.body;
  
  try {
    let jsonData = { files: [] };
    
    if (fs.existsSync(jsonFilePath)) {
      jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
    
    // 查找是否已存在该文件的数据
    const existingIndex = jsonData.files.findIndex(file => file.filename === filename);
    
    if (existingIndex !== -1) {
      // 更新现有数据
      jsonData.files[existingIndex] = { filename, name, type };
    } else {
      // 添加新数据
      jsonData.files.push({ filename, name, type });
    }
    
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    res.status(500).json({ error: '保存JSON数据失败' });
  }
});

/**
 * 获取图片文件关联的JSON数据
 */
app.get('/api/images/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('jsonData', 'images.json');
  
  try {
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, JSON.stringify({ files: [] }));
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const fileData = jsonData.files.find(file => file.filename === filename);
    
    if (fileData) {
      res.json({ success: true, data: fileData });
    } else {
      res.json({ success: false, message: '未找到关联数据' });
    }
  } catch (error) {
    res.status(500).json({ error: '读取JSON数据失败' });
  }
});

/**
 * 保存图片文件关联的JSON数据
 */
app.post('/api/images/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('jsonData', 'images.json');
  const { name, type } = req.body;
  
  try {
    let jsonData = { files: [] };
    
    if (fs.existsSync(jsonFilePath)) {
      jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
    
    // 查找是否已存在该文件的数据
    const existingIndex = jsonData.files.findIndex(file => file.filename === filename);
    
    if (existingIndex !== -1) {
      // 更新现有数据
      jsonData.files[existingIndex] = { filename, name, type };
    } else {
      // 添加新数据
      jsonData.files.push({ filename, name, type });
    }
    
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    res.json({ success: true, message: '数据保存成功' });
  } catch (error) {
    res.status(500).json({ error: '保存JSON数据失败' });
  }
});

/**
 * 保存对话数据
 */
app.post('/api/dialogue/save', (req, res) => {
  const jsonFilePath = path.join('jsonData', 'DialogueList.json');
  const dialogueData = req.body;
  
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(dialogueData, null, 2));
    res.json({ success: true, message: '对话数据保存成功' });
  } catch (error) {
    console.error('保存对话数据失败:', error);
    res.status(500).json({ success: false, error: '保存对话数据失败' });
  }
});

/**
 * 按名称和类型检索音频文件
 */
app.get('/api/audio/search', (req, res) => {
  const { name, type } = req.query;
  const jsonFilePath = path.join('jsonData', 'audio.json');
  
  try {
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, JSON.stringify({ files: [] }));
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    let filteredFiles = jsonData.files;
    
    // 按名称过滤
    if (name) {
      filteredFiles = filteredFiles.filter(file => 
        file.name && file.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // 按类型过滤
    if (type) {
      filteredFiles = filteredFiles.filter(file => 
        file.type && file.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    // 获取文件的完整信息
    const result = filteredFiles.map(file => {
      try {
        const stats = fs.statSync(path.join('audio', file.filename));
        return {
          ...file,
          path: `/audio/${file.filename}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      } catch (err) {
        // 文件可能已被删除，返回基本信息
        return {
          ...file,
          path: `/audio/${file.filename}`,
          size: 0,
          createdAt: new Date()
        };
      }
    });
    
    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('搜索音频文件失败:', error);
    res.status(500).json({ success: false, error: '搜索音频文件失败' });
  }
});

/**
 * 按名称和类型检索图片文件
 */
app.get('/api/images/search', (req, res) => {
  const { name, type } = req.query;
  const jsonFilePath = path.join('jsonData', 'images.json');
  
  try {
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, JSON.stringify({ files: [] }));
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    let filteredFiles = jsonData.files;
    
    // 按名称过滤
    if (name) {
      filteredFiles = filteredFiles.filter(file => 
        file.name && file.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // 按类型过滤
    if (type) {
      filteredFiles = filteredFiles.filter(file => 
        file.type && file.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    // 获取文件的完整信息
    const result = filteredFiles.map(file => {
      try {
        const stats = fs.statSync(path.join('images', file.filename));
        return {
          ...file,
          path: `/images/${file.filename}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      } catch (err) {
        // 文件可能已被删除，返回基本信息
        return {
          ...file,
          path: `/images/${file.filename}`,
          size: 0,
          createdAt: new Date()
        };
      }
    });
    
    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('搜索图片文件失败:', error);
    res.status(500).json({ success: false, error: '搜索图片文件失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});