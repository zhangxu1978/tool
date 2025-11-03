const jsonDataDir = './data'; // Set the directory path for JSON files

function writeJsonFile(fileName, data) {
    const filePath = `${jsonDataDir}/${fileName}.json`;
    
    // 深拷贝数据以避免修改原始数据
    const dataToWrite = JSON.parse(JSON.stringify(data));
    
    // 处理道具数量，确保它们是字符串类型
    if (Array.isArray(dataToWrite)) {
        dataToWrite.forEach(item => {
            if (item.Props && Array.isArray(item.Props)) {
                item.Props.forEach(prop => {
                    // 将Quantity转换为字符串
                    if (prop.Quantity !== undefined) {
                        prop.Quantity = prop.Quantity.toString();
                    }
                });
            }
        });
    }
    // 处理材料，只保留id和数量和价格
    if (Array.isArray(dataToWrite)) {
        dataToWrite.forEach(item => {
            if (item.Ingredients && Array.isArray(item.Ingredients)) {
                item.Ingredients = item.Ingredients.map(ingredient => ({
                    Id: ingredient.Id,
                    Quantity: ingredient.Quantity,
                    Price: ingredient.Price
                }));
            }
        });
    }
    
    console.log(`写入文件: ${filePath}`);
    console.log(dataToWrite);
    
    // 在浏览器环境中，我们可以使用 fetch 或其他方法来写入文件
    // 这里仅作示例，实际应用中需要根据具体需求实现
    return fetch(filePath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToWrite)
    }).then(response => response.json());
}

async function readJsonFile(filename) {
    const filePath = `${jsonDataDir}/${filename}`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error reading file ${filename}: ${response.statusText}`);
        }
        return await response.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

// 查找目录下所有json文件
function findJsonFile() {
    // 这里需要手动列出文件名，因为浏览器无法直接读取目录
    return ['PlayerList.json','PlayerData.json','RecipeList.json','FeedbackList.json', 'MapList.json', 'MapRelationshipList.json', 'PropList.json', 'SkillList.json', 'EventList.json', 'CareerList.json', 'FanyiList.json'];
}

async function loadAllJsonFiles() {
    const jsonFiles = findJsonFile(); // 获取 jsonData 目录下的所有 JSON 文件
    const dataPromises = jsonFiles.map(file => readJsonFile(file));
    return Promise.all(dataPromises);
}

// 导出函数
export { readJsonFile, loadAllJsonFiles, findJsonFile, writeJsonFile };
