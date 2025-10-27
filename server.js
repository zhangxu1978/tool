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
app.use('/sound', express.static('sound'));
app.use('/img', express.static('img'));
app.use('/data', express.static('data'));
app.use(express.json());

// 导入门派管理模块
const clanManagement = require('./clan-management-server');
app.use(clanManagement);

// 导入灵脉模板管理模块
const spiritVeinServer = require('./spiritVeinServer');
app.use(spiritVeinServer);

// 导入道具管理模块
const propServer = require('./prop-server');
app.use(propServer);

// 导入角色管理模块
const playerServer = require('./player-server');
app.use(playerServer);

// 配置文件上传
const soundStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'sound/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// BGM文件存储配置
const bgmStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保bgm目录存在
    const bgmDir = 'sound/bgm/';
    if (!fs.existsSync(bgmDir)) {
      fs.mkdirSync(bgmDir, { recursive: true });
    }
    cb(null, bgmDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// SFX文件存储配置
const sfxStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保sfx目录存在
    const sfxDir = 'sound/sfx/';
    if (!fs.existsSync(sfxDir)) {
      fs.mkdirSync(sfxDir, { recursive: true });
    }
    cb(null, sfxDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'img/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadSound = multer({ 
  storage: soundStorage,
  fileFilter: function (req, file, cb) {
    // 只接受音频文件
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传音频文件！'));
    }
  }
});

const uploadBgm = multer({ 
  storage: bgmStorage,
  fileFilter: function (req, file, cb) {
    // 只接受音频文件
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传音频文件！'));
    }
  }
});

const uploadSfx = multer({ 
  storage: sfxStorage,
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
 * 从bgm和sfx目录中获取所有音频文件
 */
app.get('/api/sound', (req, res) => {
  const bgmDir = 'sound/bgm/';
  const sfxDir = 'sound/sfx/';
  let allAudioFiles = [];
  
  try {
    // 读取bgm目录中的文件
    if (fs.existsSync(bgmDir)) {
      const bgmFiles = fs.readdirSync(bgmDir);
      bgmFiles.forEach(file => {
        try {
          const stats = fs.statSync(path.join(bgmDir, file));
          allAudioFiles.push({
            name: file,
            path: `/sound/bgm/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            type: '音乐'
          });
        } catch (err) {
          console.error(`读取BGM文件信息失败: ${file}`, err);
        }
      });
    }
    
    // 读取sfx目录中的文件
    if (fs.existsSync(sfxDir)) {
      const sfxFiles = fs.readdirSync(sfxDir);
      sfxFiles.forEach(file => {
        try {
          const stats = fs.statSync(path.join(sfxDir, file));
          allAudioFiles.push({
            name: file,
            path: `/sound/sfx/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            type: '音效'
          });
        } catch (err) {
          console.error(`读取SFX文件信息失败: ${file}`, err);
        }
      });
    }
    
    res.json(allAudioFiles);
  } catch (err) {
    console.error('读取音频文件失败:', err);
    res.status(500).json({ error: '无法读取音频文件' });
  }
});

/**
 * 获取所有图片文件列表
 */
app.get('/api/img', (req, res) => {
  fs.readdir('img', (err, files) => {
    if (err) {
      return res.status(500).json({ error: '无法读取图片文件' });
    }
    
    const imageFiles = files.map(file => {
      const stats = fs.statSync(path.join('img', file));
      return {
        name: file,
        path: `/img/${file}`,
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
app.post('/api/sound/upload', uploadSound.single('soundFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/sound/${req.file.filename}`,
      size: req.file.size
    }
  });
});

/**
 * 上传BGM文件
 */
app.post('/api/sound/bgm/upload', uploadBgm.single('bgmFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/sound/bgm/${req.file.filename}`,
      size: req.file.size,
      type: '音乐'
    }
  });
});

/**
 * 上传SFX文件
 */
app.post('/api/sound/sfx/upload', uploadSfx.single('sfxFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/sound/sfx/${req.file.filename}`,
      size: req.file.size,
      type: '音效'
    }
  });
});

/**
 * 上传图片文件
 */
app.post('/api/img/upload', uploadImage.single('imageFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件或文件类型不正确' });
  }
  
  res.json({ 
    success: true, 
    file: {
      name: req.file.filename,
      path: `/img/${req.file.filename}`,
      size: req.file.size
    }
  });
});

/**
 * 删除音频文件
 */
app.delete('/api/sound/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('sound', filename);
  
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
app.delete('/api/img/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join('img', filename);
  
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
app.get('/api/sound/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('data', 'sound.json');
  
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
app.post('/api/sound/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('data', 'sound.json');
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
app.get('/api/img/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('data', 'img.json');
  
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
app.post('/api/img/json/:filename', (req, res) => {
  const filename = req.params.filename;
  const jsonFilePath = path.join('data', 'img.json');
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
  const jsonFilePath = path.join('data', 'DialogueList.json');
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
 * 选音乐从bgm目录搜索，选音效从sfx目录搜索
 */
app.get('/api/sound/search', (req, res) => {
  const { name, type } = req.query;
  const jsonFilePath = path.join('data', 'sound.json');
  
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
    
    // 获取文件的完整信息，根据类型确定文件路径
    const result = filteredFiles.map(file => {
      try {
        let filePath;
        let fileUrl;
        
        // 根据文件类型确定目录
        if (file.type && file.type.toLowerCase() === '音乐') {
          filePath = path.join('sound/bgm', file.filename);
          fileUrl = `/sound/bgm/${file.filename}`;
        } else if (file.type && file.type.toLowerCase() === '音效') {
          filePath = path.join('sound/sfx', file.filename);
          fileUrl = `/sound/sfx/${file.filename}`;
        } else {
          // 默认尝试两个目录
          const bgmPath = path.join('sound/bgm', file.filename);
          const sfxPath = path.join('sound/sfx', file.filename);
          
          if (fs.existsSync(bgmPath)) {
            filePath = bgmPath;
            fileUrl = `/sound/bgm/${file.filename}`;
          } else if (fs.existsSync(sfxPath)) {
            filePath = sfxPath;
            fileUrl = `/sound/sfx/${file.filename}`;
          } else {
            throw new Error('文件不存在');
          }
        }
        
        const stats = fs.statSync(filePath);
        return {
          ...file,
          path: fileUrl,
          size: stats.size,
          createdAt: stats.birthtime
        };
      } catch (err) {
        // 文件可能已被删除，返回基本信息
        return {
          ...file,
          path: file.type && file.type.toLowerCase() === '音乐' 
            ? `/sound/bgm/${file.filename}` 
            : `/sound/sfx/${file.filename}`,
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
app.get('/api/img/search', (req, res) => {
  const { name, type } = req.query;
  const jsonFilePath = path.join('data', 'img.json');
  
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
        const stats = fs.statSync(path.join('img', file.filename));
        return {
          ...file,
          path: `/img/${file.filename}`,
          size: stats.size,
          createdAt: stats.birthtime
        };
      } catch (err) {
        // 文件可能已被删除，返回基本信息
        return {
          ...file,
          path: `/img/${file.filename}`,
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