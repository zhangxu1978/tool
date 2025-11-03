import { loadAllJsonFiles, readJsonFile, findJsonFile,writeJsonFile } from './jsonDataHandler.js';

let currentSection = 'characters';
let data = {};
let fanyiData = {
    "PlayerList": {},
    "FeedbackList": {},
    "PropList": {},
    "EventList": {},
    "CareerList": {},
    "FanyiList": {"Name":"字段","ChName":"中文名","Id":"主键","Type":"分类"},
    "SkillList": {},
    "MapList": {},
    "MapRelationshipList": {},
     "RecipeList": {}
};
let showData = [];
let maxId = 0;
let sortInt = 0;
const selectElement = document.getElementById('shaixuan');
selectElement.addEventListener('change', handleSelectChange);

function handleSelectChange() {
    updateDisplay();
}

function uploadData() {
    document.getElementById('fileInput').click();
}

function sortById() {
    if (sortInt == 0) sortInt = 1;
    else sortInt = 0;
    updateDisplay();
}

function handleFileUpload(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (function(file) {
            return function(e) {
                console.log(file.name);
                let key = file.name.replace(/\.[^/.]+$/, ""); // 去掉文件名的后缀
                data[key] = JSON.parse(e.target.result); // 将文件名作为属性，文件内容作为数组对象放入data
                if (key == "PlayerList") {
                    document.getElementById('showPlayer').style.display = 'block'; // 显示角色
                } 
                else if (key == "FeedbackList") {
                    document.getElementById('showFeedbacks').style.display = 'block'; // 显示反馈
                }
                else if (key == "PropList") {
                    document.getElementById('showItems').style.display = 'block'; // 显示道具
                }
                 else if (key == "RecipeList") {
                    document.getElementById('showRecipes').style.display = 'block'; // 显示配方
                }
                 else if (key == "SkillList") {
                    document.getElementById('showSkills').style.display = 'block'; // 显示技能
                } else if (key == "EventList") {
                    document.getElementById('showEvents').style.display = 'block'; // 显示事件
                } else if (key == "CareerList") {
                    document.getElementById('showCareers').style.display = 'block'; // 显示职业
                } else if (key == "MapList") {
                    document.getElementById('showMaps').style.display = 'block'; // 显示地图
                } else if (key == "MapRelationshipList") {
                    document.getElementById('showMapRelationships').style.display = 'block'; // 显示地图关系
                } else if (key == "FanyiList") {
                    document.getElementById('showFanyis').style.display = 'block'; // 翻译
                    // 组织翻译数据
                    data["FanyiList"].forEach(it => {
                        if (it["Type"] == "角色") {
                            fanyiData.PlayerList[it["Name"]] = it["ChName"];
                        } 
                        else if (it["Type"] == "反馈") {
                            fanyiData.FeedbackList[it["Name"]] = it["ChName"];
                        }
                        else if (it["Type"] == "道具") {
                            fanyiData.PropList[it["Name"]] = it["ChName"];
                        }else if (it["Type"] == "配方") {
                            fanyiData.RecipeList[it["Name"]] = it["ChName"];
                        }
                         else if (it["Type"] == "事件") {
                            fanyiData.EventList[it["Name"]] = it["ChName"];
                        } else if (it["Type"] == "技能") {
                            fanyiData.SkillList[it["Name"]] = it["ChName"];
                        } else if (it["Type"] == "职业") {
                            fanyiData.CareerList[it["Name"]] = it["ChName"];
                        }else if (it["Type"] == "地图") {
                            fanyiData.MapList[it["Name"]] = it["ChName"];
                        }else if (it["Type"] == "地图关系") {
                            fanyiData.MapRelationshipList[it["Name"]] = it["ChName"];
                        }
                    });
                } else if (key === "Feedback") {
                    const button = document.createElement('button');
                    button.textContent = "编辑反馈";
                    button.style.margin = "5px";
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = JSON.stringify([]); // 初始化为空数组
                    
                    button.onclick = () => {
                        showFeedbackEditor((selectedFeedbacks) => {
                            input.value = JSON.stringify(selectedFeedbacks);
                            button.textContent = `已选择 ${selectedFeedbacks.length} 个反馈`;
                        }, JSON.parse(input.value), firstRecord);
                    };
                    
                    rowDiv.appendChild(button);
                    rowDiv.appendChild(input);
                }
            };
        })(file);
        reader.readAsText(file);
    }
}

function showSection(section) {
    currentSection = section;
    clearOptionsExceptFirst();
    let key = "";
    if (currentSection == "PlayerList"||currentSection == "RecipeList"||currentSection == "FanyiList" || currentSection == "CareerList" || currentSection == "PropList" || currentSection == "SkillList" || currentSection == "EventList"|| currentSection == "MapRelationshipList"|| currentSection == "MapList") key = "Type";
    if (currentSection == "FeedbackList") key = "Name";
    if (key != "")
        data[currentSection].forEach(
            item => {
                insertOptionToSelect(key, item[key])
            }
        )
    updateDisplay();
}
window.showSection = showSection;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.confirmAdd = confirmAdd;
window.confirmEdit = confirmEdit;
window.sortById = sortById;
window.uploadData = uploadData;
window.handleFileUpload = handleFileUpload;
window.confirmPropSelection  = confirmPropSelection ;
window.closePropModal = closePropModal;
window.confirmSkillSelection  = confirmSkillSelection ;
window.closeSkillModal = closeSkillModal;
window.confirmPlayerSelection  = confirmPlayerSelection ;
window.closePlayerModal = closePlayerModal;
window.confirmEventSelection  = confirmEventSelection ;
window.closeEventModal = closeEventModal;
window.openImageSelector = openImageSelector;
window.closeImageSelectorModal = closeImageSelectorModal;
window.loadExample = loadExample;

window.downloadData = downloadData;
window.downloadDataCsv = downloadDataCsv;
window.toggleAllSkills = toggleAllSkills;
window.toggleAllProps = toggleAllProps;
window.toggleAllPlayers = toggleAllPlayers;
window.toggleAllEvents = toggleAllEvents;



function updateDisplay() {
    const display = document.getElementById('data-display');
    display.innerHTML = ''; // 清空当前显示
    const shaixuan = document.getElementById('shaixuan');
    const selectedValue = shaixuan.value;
    const selectedOption = shaixuan.options[shaixuan.selectedIndex];
    const selectedText = selectedOption.text;
    showData = data[currentSection];

    maxId = 0;
    if (Array.isArray(showData) && showData.length > 0) {
        showData.sort((a, b) => {
            return sortInt === 0 ? a.Id - b.Id : b.Id - a.Id;
        });
        showData.forEach(item => {
            // 检查筛选条件
            if (selectedValue != "-1" && item[selectedValue] != selectedText) {
                return;
            }

            const card = document.createElement('div');
            card.className = 'card'; // 添加卡片样式

            // 添加删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: #ff4444;
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
            `;
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                if (confirm('确定要删除这条数据吗？')) {
                    // 使用 filter 创建新数组，移除指定 Id 的项
                    data[currentSection] = data[currentSection].filter(d => d.Id !== item.Id);
                    showData = data[currentSection];
                    writeJsonFile(currentSection, showData);
                    updateDisplay();
                }
            };
            card.appendChild(deleteBtn);

            if (Number(maxId) < Number(item["Id"])) maxId = Number(item["Id"]);
            
            const keys = Object.keys(item).slice(0, 5);
            keys.forEach(key => {
                let fy = fanyiData[currentSection][key] ? fanyiData[currentSection][key] : key;
                const propertyDiv = document.createElement('div');
                propertyDiv.innerText = `${fy}: ${item[key]}`;
                card.appendChild(propertyDiv);
            });

            card.onclick = () => {
                openEditModal(item);
            };

            display.appendChild(card);
        });
    } else {
        display.innerText = '没有数据可显示';
    }
}

// 条件设计弹出框相关变量
let conditionCallback = null;
let currentConditionValue = '';

// 创建条件设计弹出框
function createConditionModal() {
    // 检查是否已存在条件设计弹出框
    if (document.getElementById('conditionModal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'conditionModal';
    modal.className = 'condition-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        display: none;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'condition-modal-content';
    modalContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'condition-modal-header';
    modalHeader.innerHTML = '<h3>条件设计</h3>';
    
    const modalBody = document.createElement('div');
    modalBody.className = 'condition-modal-body';
    modalBody.style.marginBottom = '20px';
    
    // 类别选择和属性选择 - 同一行
    modalBody.innerHTML = `
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div class="form-group" style="flex: 1;">
                <label for="conditionType">类别:</label>
                <select id="conditionType" style="width: 100%; padding: 5px;"></select>
            </div>
            
            <div class="form-group" style="flex: 1;">
                <label for="conditionProperty">属性:</label>
                <select id="conditionProperty" style="width: 100%; padding: 5px;">
                </select>
            </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
            <label>运算符:</label>
            <div id="operators" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="operator-btn" data-operator="+" style="padding: 5px 10px;">+</button>
                <button class="operator-btn" data-operator="-" style="padding: 5px 10px;">-</button>
                <button class="operator-btn" data-operator="*" style="padding: 5px 10px;">*</button>
                <button class="operator-btn" data-operator="/" style="padding: 5px 10px;">/</button>
                <button class="operator-btn" data-operator="(" style="padding: 5px 10px;">(</button>
                <button class="operator-btn" data-operator=")" style="padding: 5px 10px;">)</button> 
                <button class="operator-btn" data-operator="&&" style="padding: 5px 10px;">与(&&)</button>
                <button class="operator-btn" data-operator="||" style="padding: 5px 10px;">或(||)</button>
                <button class="operator-btn" data-operator="?" style="padding: 5px 10px;">?</button>
                <button class="operator-btn" data-operator=":" style="padding: 5px 10px;">:</button>
                <button class="operator-btn" data-operator="result" style="padding: 5px 10px;">结果</button>
                <button class="operator-btn" data-operator="[" style="padding: 5px 10px;">[</button>
                <button class="operator-btn" data-operator="]" style="padding: 5px 10px;">]</button> 
            </div>
        </div>
        
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div class="form-group" style="flex: 1;">
                <label for="conditionComparator">比较符:</label>
                <select id="conditionComparator" style="width: 100%; padding: 5px;">
                    <option value=">">大于</option>
                    <option value="<">小于</option>
                    <option value="==">等于</option>
                    <option value=">=">大于等于</option>
                    <option value="<=">小于等于</option>
                    <option value="includes">包括</option>
                    <option value="startsWith">以此开始</option>
                    <option value="endsWith">以此结束</option>
                    <option value="exists">存在</option>
                    <option value="notExists">不存在</option>
                </select>
            </div>
            
            <div class="form-group" style="flex: 1;">
                <label for="conditionValue">比较值:</label>
                <input type="text" id="conditionValue" style="width: 100%; padding: 5px;">
            </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 15px;">
            <label for="conditionExpression">条件表达式 (可手工编辑):</label>
            <input type="text" id="conditionExpression" style="width: 100%; padding: 5px;">
        </div>
    `;
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'condition-modal-footer';
    modalFooter.style.textAlign = 'right';
    modalFooter.innerHTML = `
        <button id="testCondition" style="padding: 8px 16px; margin-right: 10px;">测试</button>
        <button id="cancelCondition" style="padding: 8px 16px; margin-right: 10px;">取消</button>
        <button id="confirmCondition" style="padding: 8px 16px;">确认</button>
    `;
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    // 绑定事件
    document.getElementById('conditionType').addEventListener('change', updatePropertySelect);
    document.querySelectorAll('.operator-btn').forEach(btn => {
        // 为运算符按钮添加样式
        btn.style.cssText = "padding: 6px 12px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; transition: all 0.2s;";
        btn.onmouseover = function() {
            this.style.backgroundColor = '#e0e0e0';
            this.style.borderColor = '#bbb';
        };
        btn.onmouseout = function() {
            this.style.backgroundColor = '#f0f0f0';
            this.style.borderColor = '#ddd';
        };
        
        btn.addEventListener('click', function() {
            const operator = this.getAttribute('data-operator');
            const expressionInput = document.getElementById('conditionExpression');
            expressionInput.value += operator;
            expressionInput.focus();
        });
    });
    
    document.getElementById('conditionProperty').addEventListener('change', function() {
        const propertySelect = document.getElementById('conditionProperty');
        const selectedOption = propertySelect.options[propertySelect.selectedIndex];
        const selectedType = document.getElementById('conditionType').value;
        if (selectedOption) {
            const value = selectedOption.getAttribute('data-value') || selectedOption.value;
            const expressionInput = document.getElementById('conditionExpression');
            expressionInput.value += selectedType+"."+ value;
            expressionInput.focus();
        }
    });
    
    document.getElementById('conditionValue').addEventListener('change', function() {
        const value = this.value;
        if (value) {
            const expressionInput = document.getElementById('conditionExpression');
            expressionInput.value += '"' + value + '"';
            expressionInput.focus();
        }
    });
    
    // 为比较符添加选择事件
    document.getElementById('conditionComparator').addEventListener('change', function() {
        const comparator = this.value;
        const expressionInput = document.getElementById('conditionExpression');
        expressionInput.value += comparator;
        expressionInput.focus();
    });
    
    // 为确认、取消和测试按钮添加样式
    const confirmConditionBtn = document.getElementById('confirmCondition');
    confirmConditionBtn.style.cssText = "padding: 8px 16px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s; margin-right: 8px;";
    confirmConditionBtn.onmouseover = function() { this.style.backgroundColor = '#45a049'; };
    confirmConditionBtn.onmouseout = function() { this.style.backgroundColor = '#4CAF50'; };
    
    const cancelConditionBtn = document.getElementById('cancelCondition');
    cancelConditionBtn.style.cssText = "padding: 8px 16px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s; margin-right: 8px;";
    cancelConditionBtn.onmouseover = function() { this.style.backgroundColor = '#d32f2f'; };
    cancelConditionBtn.onmouseout = function() { this.style.backgroundColor = '#f44336'; };
    
    const testConditionBtn = document.getElementById('testCondition');
    testConditionBtn.style.cssText = "padding: 8px 16px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s; margin-right: 8px;";
    testConditionBtn.onmouseover = function() { this.style.backgroundColor = '#1976D2'; };
    testConditionBtn.onmouseout = function() { this.style.backgroundColor = '#2196F3'; };
    
    confirmConditionBtn.addEventListener('click', confirmCondition);
    cancelConditionBtn.addEventListener('click', closeConditionModal);
    testConditionBtn.addEventListener('click', testCondition);
    
    // 移除点击模态框外部关闭的功能，只有点击取消按钮才能关闭
}

// 初始化类别和属性选择
function initConditionSelects() {
    const typeSelect = document.getElementById('conditionType');
    typeSelect.innerHTML = '';
    
    // 从FanyiList中获取所有类型
    const types = ["",...new Set(data.FanyiList.map(item => item.Type))];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
    
    // 初始更新属性选择
    updatePropertySelect();
}

// 根据选择的类别更新属性选择
function updatePropertySelect() {
    const typeSelect = document.getElementById('conditionType');
    const propertySelect = document.getElementById('conditionProperty');
    const selectedType = typeSelect.value;
    
    propertySelect.innerHTML = '';

        // 始终添加Id选项作为第一个选项
    const NullOption = document.createElement('option');
    NullOption.value = '';
    NullOption.setAttribute('data-value', '');
    NullOption.textContent = '';
    propertySelect.appendChild(NullOption);
    
    // 始终添加Id选项作为第一个选项
    const idOption = document.createElement('option');
    idOption.value = 'Id';
    idOption.setAttribute('data-value', 'Id');
    idOption.textContent = 'Id';
    propertySelect.appendChild(idOption);
    
    // 根据选择的类型筛选属性
    const properties = data.FanyiList.filter(item => item.Type === selectedType);
    properties.forEach(prop => {
        // 跳过已经添加的Id选项
        if (prop.Name === 'Id') return;
        
        const option = document.createElement('option');
        option.value = prop.ChName;
        option.setAttribute('data-value', prop.Name);
        option.textContent = prop.ChName;
        propertySelect.appendChild(option);
    });
    
    // 默认选择ID属性
    NullOption.selected = true;
}

// 显示条件设计弹出框
function showConditionEditor(callback, initialCondition = '') {
    // 确保条件设计弹出框已创建
    createConditionModal();
    
    conditionCallback = callback;
    currentConditionValue = initialCondition;
    
    // 设置初始条件表达式
    document.getElementById('conditionExpression').value = initialCondition;
    
    // 初始化选择框
    if (data.FanyiList) {
        initConditionSelects();
    }
    
    // 显示弹出框
    document.getElementById('conditionModal').style.display = 'flex';
}

// 确认条件
function confirmCondition() {
    const expression = document.getElementById('conditionExpression').value;
    if (conditionCallback) {
        conditionCallback(expression);
    }
    closeConditionModal();
}

// 关闭条件设计弹出框
function closeConditionModal() {
    const modal = document.getElementById('conditionModal');
    if (modal) {
        modal.style.display = 'none';
    }
    conditionCallback = null;
}

// 测试条件
async function testCondition() {
    const expression = document.getElementById('conditionExpression').value;
    try {
        // 加载所需的数据文件
        let characterData = [];
        let eventData = [];
        let mapData = [];
        let propData = [];
        let skillData = [];
        let careerData = [];
        
        // 尝试从已加载的数据中获取，如果没有则尝试加载
        if (data.PlayerList) {
            characterData = data.PlayerList;
        } else {
            const playerResponse = await fetch('../data/playerList.json');
            if (playerResponse.ok) {
                characterData = await playerResponse.json();
            }
        }
        
        if (data.EventList) {
            eventData = data.EventList;
        } else {
            const eventResponse = await fetch('../data/eventlist.json');
            if (eventResponse.ok) {
                eventData = await eventResponse.json();
            }
        }
        
        if (data.MapList) {
            mapData = data.MapList;
        } else {
            const mapResponse = await fetch('../data/malist.json');
            if (mapResponse.ok) {
                mapData = await mapResponse.json();
            }
        }
        
        if (data.PropList) {
            propData = data.PropList;
        } else {
            const propResponse = await fetch('../data/propList.json');
            if (propResponse.ok) {
                propData = await propResponse.json();
            }
        }
        
        if (data.SkillList) {
            skillData = data.SkillList;
        } else {
            const skillResponse = await fetch('../data/skillList.json');
            if (skillResponse.ok) {
                skillData = await skillResponse.json();
            }
        }
        
        if (data.CareerList) {
            careerData = data.CareerList;
        } else {
            const careerResponse = await fetch('../data/careerList.json');
            if (careerResponse.ok) {
                careerData = await careerResponse.json();
            }
        }
        
        // 定义用于表达式解析的函数
        function result(query) {
            console.log('解析result查询:', query);
            // 解析查询字符串，例如 "角色.Id==\"1\""
            // 改进正则表达式，支持中文字符
            const match = query.match(/^([\w\u4e00-\u9fa5]+)\.([^=<>!]+)\s*([=<>]=?|!=|!==)\s*(.+)$/);
            if (!match) {
                // 尝试更简单的匹配模式，同样支持中文
                const simpleMatch = query.match(/^([\w\u4e00-\u9fa5]+)\.([^=]+)=(.+)$/);
                if (!simpleMatch) {
                    console.error('无法解析查询格式:', query);
                    return [];
                }
                
                // 对于简单的=，视为==
                const [, dataType, field, value] = simpleMatch;
                console.log('简单匹配成功:', dataType, field, value);
                return processCondition(dataType, field, '==', value);
            }
            
            const [, dataType, field, operator, value] = match;
            console.log('复杂匹配成功:', dataType, field, operator, value);
            return processCondition(dataType, field, operator, value);
        }
        
        function processCondition(dataType, field, operator, value) {
            console.log('处理条件:', dataType, field, operator, value);
            let targetData = [];
            
            // 确定要查询的数据类型
            if (dataType === '角色' || dataType === 'Player' || dataType === 'player') {
                targetData = characterData || [];
                console.log('使用角色数据，共', targetData.length, '条记录');
            } else if (dataType === '事件' || dataType === 'Event' || dataType === 'event') {
                targetData = eventData || [];
                console.log('使用事件数据，共', targetData.length, '条记录');
            } else if (dataType === '地图' || dataType === 'Map' || dataType === 'map') {
                targetData = mapData || [];
                console.log('使用地图数据，共', targetData.length, '条记录');
            } 
            else if (dataType === '道具' || dataType === 'Prop' || dataType === 'prop') {
                targetData = propData || [];
                console.log('使用道具数据，共', targetData.length, '条记录');
            } 
            else if (dataType === '技能' || dataType === 'Skill' || dataType === 'skill') {
                targetData = skillData || [];
                console.log('使用技能数据，共', targetData.length, '条记录');
            } 
            else if (dataType === '职业' || dataType === 'Career' || dataType === 'career') {
                targetData = careerData || [];
                console.log('使用职业数据，共', targetData.length, '条记录');
            } 
            else {
                console.error('未知的数据类型:', dataType);
                return [];
            }
            
            // 清理值（去除引号）
            let cleanValue = value.trim();
            if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) || 
                (cleanValue.startsWith('\'') && cleanValue.endsWith('\''))) {
                cleanValue = cleanValue.slice(1, -1);
            }
            
            console.log('清理后的值:', cleanValue);
            
            // 添加详细日志，查看每条记录的过滤过程
            const filteredResults = [];
            targetData.forEach((item, index) => {
                const itemValue = item[field];
                let match = false;
                
                if (itemValue === undefined) {
                    console.log(`记录[${index}]: 字段${field}不存在`);
                } else {
                    switch (operator) {
                        case '==':
                        case '===':
                            match = String(itemValue) === String(cleanValue);
                            break;
                        case '!=':
                        case '!==':
                            match = String(itemValue) !== String(cleanValue);
                            break;
                        case '>':
                            match = Number(itemValue) > Number(cleanValue);
                            break;
                        case '<':
                            match = Number(itemValue) < Number(cleanValue);
                            break;
                        case '>=':
                            match = Number(itemValue) >= Number(cleanValue);
                            break;
                        case '<=':
                            match = Number(itemValue) <= Number(cleanValue);
                            break;
                        default:
                            console.error('未知的操作符:', operator);
                    }
                    console.log(`记录[${index}].${field}=${itemValue}, 与${cleanValue} ${operator} 匹配结果:`, match);
                }
                
                if (match) {
                    filteredResults.push(item);
                }
            });
            
            console.log('过滤结果数量:', filteredResults.length);
            return filteredResults;
        }
        
        function exists(arr) {
            return Array.isArray(arr) && arr.length > 0;
        }
        function notExists(arr) {
            return !exists(arr);
        }
        
        // 预处理表达式，将中文逻辑运算符替换为英文
        console.log('原始表达式:', expression);
        let processedExpression = expression
            .replace(/\|\|/g, '||')
            .replace(/&&/g, '&&')
            .replace(/\|/g, '||')
            .replace(/&/g, '&&')
            .replace(/！/g, '!')
            // 更安全地处理等号，避免在result函数参数内的=被错误替换
            .replace(/(?<!\(result\([^)]*)=(?!=|>|<)/g, '==');
        console.log('处理后的表达式:', processedExpression);
        
        // 构建安全的评估环境
        const context = {
            result,
            exists,
            notExists
        };
        
        // 安全检查：确保表达式只包含允许的函数调用
        const allowedFunctions = ['result', 'exists', 'notExists'];
        const functionCallRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let match;
        let isValid = true;
        
        while ((match = functionCallRegex.exec(processedExpression)) !== null) {
            if (!allowedFunctions.includes(match[1])) {
                isValid = false;
                break;
            }
        }
        
        if (!isValid) {
            throw new Error('表达式包含不允许的函数调用');
        }
        
        // 安全地评估表达式
        // 使用Function构造函数创建一个函数，避免使用eval
        try {
            // 进一步验证表达式的安全性 - 放宽规则允许中文字符
            // 允许中文、字母、数字、下划线、空格、括号、引号、逻辑运算符等
            if (/[^\w\s\u4e00-\u9fa5().|!&=<>\"\'\[\]]/.test(processedExpression)) {
                console.log('包含不允许的字符:', processedExpression.match(/[^\w\s\u4e00-\u9fa5().|!&=<>\"\'\[\]]/g));
                // 不再抛出错误，而是记录警告并继续
                console.warn('表达式包含不常见字符，但将继续处理');
            }
            
            // 简化格式验证，只确保基本结构正确
            if (!processedExpression.match(/^[\w\s\u4e00-\u9fa5().|!&=<>\"\'\[\]]*$/)) {
                console.warn('表达式格式可能有问题，但将尝试处理');
            }
            
            console.log('验证通过，准备评估表达式');
            
            // 使用更安全的方式创建和执行函数
            console.log('创建函数，上下文变量:', Object.keys(context));
            console.log('执行的代码:', `return ${processedExpression};`);
            
            // 更安全的方式：直接模拟result和exists函数的执行
            // 手动解析表达式结构
            function parseAndEvaluate(expr) {
                console.log('解析表达式:', expr);
                
                // 处理嵌套的exists函数
                if (expr.trim().startsWith('exists(') && expr.trim().endsWith(')')) {
                    const innerExpr = expr.trim().slice(7, -1);
                    const resultArr = parseAndEvaluate(innerExpr);
                    const existsResult = Array.isArray(resultArr) && resultArr.length > 0;
                    console.log('exists结果:', existsResult);
                    return existsResult;
                }
                
                // 处理result函数
                if (expr.trim().startsWith('result(') && expr.trim().endsWith(')')) {
                    const query = expr.trim().slice(7, -1).trim();
                    console.log('执行result查询:', query);
                    return result(query);
                }
                
                // 处理notExists函数
                if (expr.trim().startsWith('notExists(') && expr.trim().endsWith(')')) {
                    const innerExpr = expr.trim().slice(10, -1);
                    const resultArr = parseAndEvaluate(innerExpr);
                    const notExistsResult = !Array.isArray(resultArr) || resultArr.length === 0;
                    console.log('notExists结果:', notExistsResult);
                    return notExistsResult;
                }
                
                // 处理逻辑运算符 ||
                if (expr.includes('||')) {
                    const parts = expr.split('||');
                    for (const part of parts) {
                        const partResult = parseAndEvaluate(part.trim());
                        if (partResult === true) {
                            return true;
                        }
                    }
                    return false;
                }
                
                // 处理逻辑运算符 &&
                if (expr.includes('&&')) {
                    const parts = expr.split('&&');
                    for (const part of parts) {
                        const partResult = parseAndEvaluate(part.trim());
                        if (partResult === false) {
                            return false;
                        }
                    }
                    return true;
                }
                
                // 处理取反 !
                if (expr.trim().startsWith('!')) {
                    const innerExpr = expr.trim().slice(1).trim();
                    return !parseAndEvaluate(innerExpr);
                }
                
                // 处理括号
                if (expr.trim().startsWith('(') && expr.trim().endsWith(')')) {
                    return parseAndEvaluate(expr.trim().slice(1, -1));
                }
                
                console.error('无法解析的表达式:', expr);
                return false;
            }
            
            // 尝试使用手动解析方式
            const evalResult = parseAndEvaluate(processedExpression);
            
            console.log('表达式评估结果:', evalResult);
            alert(`测试条件: ${expression}\n\n结果: ${evalResult ? '满足条件 ✓' : '不满足条件 ✗'}`);
            return evalResult;
        } catch (funcError) {
            console.error('创建或执行表达式函数时出错:', funcError);
            console.log('处理后的表达式:', processedExpression);
            throw new Error(`表达式语法错误: ${funcError.message}`);
        }
        
        // 这个return不会被执行，因为上面的try块已经返回了
        
    } catch (error) {
        console.error('测试条件时出错:', error);
        alert(`测试条件时出错: ${error.message}\n\n表达式: ${expression}`);
        return false;
    }
}

// 注册全局函数
window.showConditionEditor = showConditionEditor;
window.confirmCondition = confirmCondition;
window.closeConditionModal = closeConditionModal;
window.testCondition = testCondition;

function openAddModal() {
    const firstRecord = showData[0];
    if (firstRecord) {
        closeModal();
        // 控制选择图片按钮的显示
        const imageSelectBtn = document.getElementById('imageSelectBtn');
        if (currentSection === 'PropList' || currentSection === 'SkillList') {
            imageSelectBtn.style.display = 'inline-block';
        } else {
            imageSelectBtn.style.display = 'none';
        }
        let rowDiv = document.createElement('div');
        Object.keys(firstRecord).forEach((key, index) => {
            let fy = fanyiData[currentSection][key] ? fanyiData[currentSection][key] : key;
            
            // 处理触发条件字段
            if (key === "Condition" && currentSection === "EventList") {
                const button = document.createElement('button');
                button.textContent = "设计条件";
                button.style.cssText = "padding: 8px 16px; margin: 5px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;";
                button.onmouseover = function() { this.style.backgroundColor = '#45a049'; };
                button.onmouseout = function() { this.style.backgroundColor = '#4CAF50'; };
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = '';
                
                button.onclick = () => {
                    showConditionEditor((condition) => {
                        input.value = condition;
                        button.textContent = condition ? `条件已设置` : "设计条件";
                    }, input.value);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Story") {
                const button = document.createElement('button');
                button.textContent = "编辑故事";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = '';
                
                button.onclick = () => {
                    const storyDialog = document.createElement('div');
                    storyDialog.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        z-index: 2000;
                        width: 80%;
                        max-width: 800px;
                    `;
                    
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.marginBottom = '10px';
                    
                    const confirmBtn = document.createElement('button');
                    confirmBtn.textContent = '确认';
                    confirmBtn.onclick = () => {
                        input.value = textarea.value;
                        document.body.removeChild(storyDialog);
                    };
                    
                    const cancelBtn = document.createElement('button');
                    cancelBtn.textContent = '取消';
                    cancelBtn.onclick = () => {
                        document.body.removeChild(storyDialog);
                    };
                    
                    // 添加复制按钮
                    const copyBtn = document.createElement('button');
                    copyBtn.textContent = '复制';
                    copyBtn.onclick = () => {
                        const textToCopy = textarea.value.replace(/\n/g, '\\n');
                        navigator.clipboard.writeText(textToCopy).then(() => {
                            alert('内容已复制到剪贴板');
                        }).catch(err => {
                            console.error('复制失败:', err);
                        });
                    };
                    
                    // 添加选择对话按钮
                    const selectDialogBtn = document.createElement('button');
                    selectDialogBtn.textContent = '选择对话';
                    selectDialogBtn.onclick = async () => {
                        try {
                            // 从DialogueList.json加载对话数据
                            const response = await fetch('../../data/DialogueList.json');
                            if (!response.ok) {
                                throw new Error('加载对话数据失败');
                            }
                            const dialogues = await response.json();
                            
                            // 创建对话选择弹窗
                            const dialogSelector = document.createElement('div');
                            dialogSelector.style.cssText = `
                                position: fixed;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                background: white;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 20px rgba(0,0,0,0.2);
                                z-index: 3000;
                                width: 70%;
                                max-width: 600px;
                                max-height: 60vh;
                                overflow-y: auto;
                            `;
                            
                            const selectorTitle = document.createElement('h3');
                            selectorTitle.textContent = '选择对话';
                            dialogSelector.appendChild(selectorTitle);
                            
                            const dialogueList = document.createElement('div');
                            dialogueList.style.marginTop = '15px';
                            
                            dialogues.forEach(dialogue => {
                                const dialogueItem = document.createElement('div');
                                dialogueItem.style.cssText = `
                                    padding: 10px;
                                    border: 1px solid #ddd;
                                    border-radius: 4px;
                                    margin-bottom: 10px;
                                    cursor: pointer;
                                    transition: background-color 0.2s;
                                `;
                                dialogueItem.onmouseover = () => {
                                    dialogueItem.style.backgroundColor = '#f5f5f5';
                                };
                                dialogueItem.onmouseout = () => {
                                    dialogueItem.style.backgroundColor = 'white';
                                };
                                
                                const dialogueName = document.createElement('div');
                                dialogueName.style.fontWeight = 'bold';
                                dialogueName.textContent = dialogue.name || `对话 ${dialogue.id}`;
                                
                                const dialogueId = document.createElement('div');
                                dialogueId.style.fontSize = '12px';
                                dialogueId.style.color = '#666';
                                dialogueId.textContent = `ID: ${dialogue.id}`;
                                
                                dialogueItem.appendChild(dialogueName);
                                dialogueItem.appendChild(dialogueId);
                                
                                dialogueItem.onclick = () => {
                                    // 将选中的对话text内容复制到文本框
                                    textarea.value = dialogue.text || '';
                                    document.body.removeChild(dialogSelector);
                                };
                                
                                dialogueList.appendChild(dialogueItem);
                            });
                            
                            const closeSelectorBtn = document.createElement('button');
                            closeSelectorBtn.textContent = '关闭';
                            closeSelectorBtn.style.marginTop = '15px';
                            closeSelectorBtn.onclick = () => {
                                document.body.removeChild(dialogSelector);
                            };
                            
                            dialogSelector.appendChild(dialogueList);
                            dialogSelector.appendChild(closeSelectorBtn);
                            document.body.appendChild(dialogSelector);
                            
                        } catch (error) {
                            console.error('选择对话时出错:', error);
                            alert('加载对话数据失败，请稍后重试');
                        }
                    };
                    
                    const textarea = document.createElement('textarea');
                    textarea.style.cssText = `
                        width: 100%;
                        height: 400px;
                        margin-top: 10px;
                        padding: 10px;
                        box-sizing: border-box;
                        resize: vertical;
                    `;
                    textarea.value = input.value;
                    
                    buttonContainer.appendChild(confirmBtn);
                    buttonContainer.appendChild(cancelBtn);
                    buttonContainer.appendChild(copyBtn); // 添加复制按钮到按钮容器
                    buttonContainer.appendChild(selectDialogBtn); // 添加选择对话按钮到按钮容器
                    storyDialog.appendChild(buttonContainer);
                    storyDialog.appendChild(textarea);
                    document.body.appendChild(storyDialog);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Props"||key === "Ingredients") {
                const button = document.createElement('button');
                button.textContent = "选择道具";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify([]); // 初始化为空数组
                
                button.onclick = () => {
                    // 传入当前已选择的道具作为预选值
                    const currentProps = JSON.parse(input.value);
                    showPropSelector((selectedProps) => {
                        input.value = JSON.stringify(selectedProps);
                        button.textContent = `已选择 ${selectedProps.length} 个道具`;
                    }, currentProps); // 传入当前选中的道具数组
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Skills") {
                const button = document.createElement('button');
                button.textContent = "选择技能";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify([]); // 初始化为空数组
                
                button.onclick = () => {
                    const currentSkills = JSON.parse(input.value);
                    showSkillSelector((selectedSkills) => {
                        input.value = JSON.stringify(selectedSkills);
                        button.textContent = `已选择 ${selectedSkills.length} 个技能`;
                    }, currentSkills);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            }else if (key === "Npcs") {
                const button = document.createElement('button');
                button.textContent = "选择角色";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify([]); // 初始化为空数组
                
                button.onclick = () => {
                    const currentPlayers = JSON.parse(input.value);
                    showPlayerSelector((selectedPlayers) => {
                        input.value = JSON.stringify(selectedPlayers);
                        button.textContent = `已选择 ${selectedPlayers.length} 个角色`;
                    }, currentPlayers);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Events") {
                const button = document.createElement('button');
                button.textContent = "选择事件";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify([]); // 初始化为空数组
                
                button.onclick = () => {
                    const currentEvents = JSON.parse(input.value);
                    showEventSelector((selectedEvents) => {
                        input.value = JSON.stringify(selectedEvents);
                        button.textContent = `已选择 ${selectedEvents.length} 个事件`;
                    }, currentEvents);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Feedback") {
                const button = document.createElement('button');
                button.textContent = "编辑反馈";
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify([]); // 初始化为空数组
                
                button.onclick = () => {
                    showFeedbackEditor((selectedFeedbacks) => {
                        input.value = JSON.stringify(selectedFeedbacks);
                        button.textContent = `已选择 ${selectedFeedbacks.length} 个反馈`;
                    }, JSON.parse(input.value), firstRecord);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            }else {
                // 其他字段保持不变
                const input = document.createElement('input');
                input.type = 'text';
                input.value = '';
                input.title = fy;
                input.name = key;
                input.placeholder = fy;
                if (key == 'Id') {
                    input.value = Number(maxId) + 1;
                    input.readOnly = true;
                } else if (key == document.getElementById('shaixuan').value) {
                    const shaixuan = document.getElementById('shaixuan');
                    const selectedOption = shaixuan.options[shaixuan.selectedIndex];
                    input.value = selectedOption.text;
                    input.readOnly = true;
                }
                rowDiv.appendChild(input);
            }

            if ((index + 1) % 3 === 0) {
                document.getElementById('modal').appendChild(rowDiv);
                rowDiv = document.createElement('div');
            } else if (index === Object.keys(firstRecord).length - 1) {
                document.getElementById('modal').appendChild(rowDiv);
            }
        });
        
        if (rowDiv.children.length > 0) {
            document.getElementById('modal').appendChild(rowDiv);
        }
        document.getElementById('modal').style.display = 'block';
    }
}

function confirmAdd() {
    let item = {};
    let isAdd = true;
    if (showData[0]) {        
        const modal = document.getElementById('modal');
        const inputFields = modal.getElementsByTagName('input');
        
        // 先处理普通字段
        for (let field of inputFields) {
            const fieldName = field.name;
            if (fieldName === "Id") {
                item[fieldName] = field.value;
                if (Number(maxId) + 1 == Number(field.value)) {
                    isAdd = true;
                } else {
                    isAdd = false;
                }
            } else if (fieldName !== "Props" && fieldName !== "Skills" && 
                      fieldName !== "Npcs" && fieldName !== "Events" && 
                      fieldName !== "Feedback"&&fieldName !== "Ingredients") {
                item[fieldName] = field.value;
            }
        }

        // 特殊处理数组类型的字段
        for (let field of inputFields) {
            const fieldName = field.name;
            if (fieldName === "Props" || fieldName === "Skills" || 
                fieldName === "Npcs" || fieldName === "Events" || 
                fieldName === "Feedback"||fieldName === "Ingredients") {
                try {
                    item[fieldName] = JSON.parse(field.value || '[]');
                } catch (e) {
                    console.error('解析JSON失败:', e);
                    item[fieldName] = [];
                }
            }
        }
    }

    if (isAdd) {
        showData.push(item);
    } else {
        const id = item.Id;
        const index = showData.findIndex(existingItem => existingItem.Id === id);
        if (index !== -1) {
            // 合并现有数据和新数据
            showData[index] = {...showData[index], ...item};
        }
    }
    
    writeJsonFile(currentSection, showData);
    closeModal();
    updateDisplay();
}

function openEditModal(item) {
    if (item) {
        closeModal();
        // 控制选择图片按钮的显示
        const imageSelectBtn = document.getElementById('imageSelectBtn');
        if (currentSection === 'PropList' || currentSection === 'SkillList') {
            imageSelectBtn.style.display = 'inline-block';
        } else {
            imageSelectBtn.style.display = 'none';
        }
        let rowDiv = document.createElement('div');
        Object.keys(item).forEach((key, index) => {
            let fy = fanyiData[currentSection][key] ? fanyiData[currentSection][key] : key;
            
            if (key === "Story") {
const button = document.createElement('button');
button.textContent = "编辑故事";
button.style.margin = "5px";
const input = document.createElement('input');
input.type = 'hidden';
input.name = key;
input.value = item[key] || '';
                
button.onclick = () => {
    const storyDialog = document.createElement('div');
    storyDialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        z-index: 2000;
        width: 80%;
        max-width: 800px;
    `;
                    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginBottom = '10px';
                    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认';
    confirmBtn.onclick = () => {
        input.value = textarea.value;
        document.body.removeChild(storyDialog);
    };
                    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => {
        document.body.removeChild(storyDialog);
    };
                    
    // 添加复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制';
    copyBtn.onclick = () => {
        const textToCopy = textarea.value.replace(/\n/g, '\\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('内容已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
        });
    };
    
    // 添加选择对话按钮
    const selectDialogBtn = document.createElement('button');
    selectDialogBtn.textContent = '选择对话';
    selectDialogBtn.onclick = async () => {
        try {
            // 从DialogueList.json加载对话数据
            const response = await fetch('../../data/DialogueList.json');
            if (!response.ok) {
                throw new Error('加载对话数据失败');
            }
            const dialogues = await response.json();
            
            // 创建对话选择弹窗
            const dialogSelector = document.createElement('div');
            dialogSelector.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0,0,0,0.2);
                z-index: 3000;
                width: 70%;
                max-width: 600px;
                max-height: 60vh;
                overflow-y: auto;
            `;
            
            const selectorTitle = document.createElement('h3');
            selectorTitle.textContent = '选择对话';
            dialogSelector.appendChild(selectorTitle);
            
            const dialogueList = document.createElement('div');
            dialogueList.style.marginTop = '15px';
            
            dialogues.forEach(dialogue => {
                const dialogueItem = document.createElement('div');
                dialogueItem.style.cssText = `
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;
                dialogueItem.onmouseover = () => {
                    dialogueItem.style.backgroundColor = '#f5f5f5';
                };
                dialogueItem.onmouseout = () => {
                    dialogueItem.style.backgroundColor = 'white';
                };
                
                const dialogueName = document.createElement('div');
                dialogueName.style.fontWeight = 'bold';
                dialogueName.textContent = dialogue.name || `对话 ${dialogue.id}`;
                
                const dialogueId = document.createElement('div');
                dialogueId.style.fontSize = '12px';
                dialogueId.style.color = '#666';
                dialogueId.textContent = `ID: ${dialogue.id}`;
                
                dialogueItem.appendChild(dialogueName);
                dialogueItem.appendChild(dialogueId);
                
                dialogueItem.onclick = () => {
                    // 将选中的对话text内容复制到文本框
                    textarea.value = dialogue.text || '';
                    document.body.removeChild(dialogSelector);
                };
                
                dialogueList.appendChild(dialogueItem);
            });
            
            const closeSelectorBtn = document.createElement('button');
            closeSelectorBtn.textContent = '关闭';
            closeSelectorBtn.style.marginTop = '15px';
            closeSelectorBtn.onclick = () => {
                document.body.removeChild(dialogSelector);
            };
            
            dialogSelector.appendChild(dialogueList);
            dialogSelector.appendChild(closeSelectorBtn);
            document.body.appendChild(dialogSelector);
            
        } catch (error) {
            console.error('选择对话时出错:', error);
            alert('加载对话数据失败，请稍后重试');
        }
    };
                    
    const textarea = document.createElement('textarea');
    textarea.style.cssText = `
        width: 100%;
        height: 400px;
        margin-top: 10px;
        padding: 10px;
        box-sizing: border-box;
        resize: vertical;
    `;
    textarea.value = input.value;
                    
    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(copyBtn); // 添加复制按钮到按钮容器
    buttonContainer.appendChild(selectDialogBtn); // 添加选择对话按钮到按钮容器
    storyDialog.appendChild(buttonContainer);
    storyDialog.appendChild(textarea);
    document.body.appendChild(storyDialog);
};

rowDiv.appendChild(button);
rowDiv.appendChild(input);
            } else if (key === "Condition" && currentSection === "EventList") {
                const button = document.createElement('button');
                button.textContent = item[key] ? `条件已设置` : "设计条件";
                button.style.cssText = "padding: 8px 16px; margin: 5px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;";
                button.onmouseover = function() { this.style.backgroundColor = '#45a049'; };
                button.onmouseout = function() { this.style.backgroundColor = '#4CAF50'; };
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = item[key] || '';
                
                button.onclick = () => {
                    showConditionEditor((condition) => {
                        input.value = condition;
                        button.textContent = condition ? `条件已设置` : "设计条件";
                    }, input.value);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Props"||key === "Ingredients") {
                const button = document.createElement('button');
                const existingProps = Array.isArray(item[key]) ? item[key] : [];
                button.textContent = `已选择 ${existingProps.length} 个道具`;
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify(existingProps);
                
                button.onclick = () => {
                    // 预选中已有的道具
                    showPropSelector((selectedProps) => {
                        input.value = JSON.stringify(selectedProps);
                        button.textContent = `已选择 ${selectedProps.length} 个道具`;
                    }, existingProps);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Skills") {
                const button = document.createElement('button');
                const existingSkills = Array.isArray(item[key]) ? item[key] : [];
                button.textContent = `已选择 ${existingSkills.length} 个技能`;
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify(existingSkills);
                
                button.onclick = () => {
                    const currentSkills = JSON.parse(input.value);
                    showSkillSelector((selectedSkills) => {
                        input.value = JSON.stringify(selectedSkills);
                        button.textContent = `已选择 ${selectedSkills.length} 个技能`;
                    }, currentSkills);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Npcs") {
                const button = document.createElement('button');
                const existingPlayers = Array.isArray(item[key]) ? item[key] : [];
                button.textContent = `已选择 ${existingPlayers.length} 个角色`;
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify(existingPlayers);
                
                button.onclick = () => {
                    const currentPlayers = JSON.parse(input.value);
                    showPlayerSelector((selectedPlayers) => {
                        input.value = JSON.stringify(selectedPlayers);
                        button.textContent = `已选择 ${selectedPlayers.length} 个角色`;
                    }, currentPlayers);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Events") {
                const button = document.createElement('button');
                const existingEvents = Array.isArray(item[key]) ? item[key] : [];
                button.textContent = `已选择 ${existingEvents.length} 个事件`;
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify(existingEvents);
                
                button.onclick = () => {
                    const currentEvents = JSON.parse(input.value);
                    showEventSelector((selectedEvents) => {
                        input.value = JSON.stringify(selectedEvents);
                        button.textContent = `已选择 ${selectedEvents.length} 个事件`;
                    }, currentEvents);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            } else if (key === "Feedback") {
                const button = document.createElement('button');
                const existingFeedbacks = Array.isArray(item[key]) ? item[key] : [];
                button.textContent = `已选择 ${existingFeedbacks.length} 个反馈`;
                button.style.margin = "5px";
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = JSON.stringify(existingFeedbacks);
                
                button.onclick = () => {
                    showFeedbackEditor((selectedFeedbacks) => {
                        input.value = JSON.stringify(selectedFeedbacks);
                        button.textContent = `已选择 ${selectedFeedbacks.length} 个反馈`;
                        // 直接更新item中的反馈数据
                        item[key] = selectedFeedbacks;
                    }, item[key] || [], item);
                };
                
                rowDiv.appendChild(button);
                rowDiv.appendChild(input);
            }else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = item[key];
                input.title = fy;
                input.name = key;
                input.placeholder = fy;
                if (key == 'Id')
                    input.readOnly = true;
                rowDiv.appendChild(input);
            }

            if ((index + 1) % 3 === 0) {
                document.getElementById('modal').appendChild(rowDiv);
                rowDiv = document.createElement('div');
            } else if (index === Object.keys(item).length - 1) {
                document.getElementById('modal').appendChild(rowDiv);
            }
        });
        
        if (rowDiv.children.length > 0) {
            document.getElementById('modal').appendChild(rowDiv);
        }
        document.getElementById('modal').style.display = 'block';
    }
}

function confirmEdit() {
    debugger;
    const inputData = document.getElementById('inputData').value;
    const index = data.indexOf(currentItem); // currentItem 是当前编辑的项
    if (index > -1) {
        data[index] = inputData;
    }
    closeModal();
    updateDisplay();
}



function downloadData() {
    const blob = new Blob([JSON.stringify(showData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSection+'.json';
    a.click();
    URL.revokeObjectURL(url);
}
function downloadDataCsv() {
    // 假设 showData 是一个包含对象的数组，对象具有相同的属性
    const header = Object.keys(showData[0]).join(',');
    let csvContent = header + '\n';
    showData.forEach(item => {
        const values = Object.values(item).map(value => {
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            } else {
                return value;
            }
        });
        csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSection + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    // 移除modal下的所有input text元素
    const modal = document.getElementById('modal');
    const inputs = modal.getElementsByTagName('div');
    while (inputs.length > 0) {
        modal.removeChild(inputs[0]);
    }
}

function openImageSelector() {
    const modal = document.getElementById('imageSelectorModal');
    modal.style.display = 'block';
    loadIconSet();
}

function closeImageSelectorModal() {
    const modal = document.getElementById('imageSelectorModal');
    modal.style.display = 'none';
}

function loadIconSet() {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = ''; // 清空现有内容
    
    // 创建一个新的Image对象来加载图片
    const img = new Image();
    img.src = './IconSet.png';
    
    img.onload = function() {
        const numColumns = Math.floor(img.width / 32);
        const numRows = Math.floor(img.height / 32);
        
        // 创建一个临时canvas来切割图片
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 32;
        tempCanvas.height = 32;
        
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numColumns; col++) {
                const index = row * numColumns + col;
                
                // 创建一个新的canvas元素来显示每个图块
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                canvas.className = 'image-tile';
                canvas.dataset.index = index;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, col * 32, row * 32, 32, 32, 0, 0, 32, 32);
                
                canvas.onclick = function() {
                    // 移除其他图块的选中状态
                    document.querySelectorAll('.image-tile').forEach(tile => {
                        tile.classList.remove('selected');
                    });
                    
                    // 添加选中状态到当前图块
                    canvas.classList.add('selected');
                    
                    // 更新Image字段的值
                    const imageInput = document.querySelector('input[name="Image"]');
                    if (imageInput) {
                        imageInput.value = index;
                    }
                    
                    // 关闭模态框
                    closeImageSelectorModal();
                };
                
                imageGrid.appendChild(canvas);
            }
        }
    };
}
function loadExample(){
    const firstRecord = showData[0];
    if (firstRecord) {
    const modal = document.getElementById('modal');
    const inputFields = modal.getElementsByTagName('input');
    for (let field of inputFields) {
        const fieldName = field.name;
      if (fieldName!="Id"&&firstRecord.hasOwnProperty(fieldName)) {
            field.value = firstRecord[fieldName];
        }
    }
    //modal.style.display = 'block'; // 显示modal
    }
}
function insertOptionToSelect(value, text) {
    const selectElement = document.getElementById('shaixuan');
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].text === text) {
            return; // 如果值重复，不插入并直接返回
        }
    }
    const option = document.createElement('option');
    option.value = value;
    option.text = text;
    selectElement.appendChild(option);
}
function clearOptionsExceptFirst() {
    const selectElement = document.getElementById('shaixuan');
    const firstOption = selectElement.options[0];
    while (selectElement.options.length > 1) {
        selectElement.removeChild(selectElement.options[1]);
    }
}

let propSelectionCallback = null;

function showPropSelector(callback, preSelectedProps = []) {
    propSelectionCallback = callback;
    const modal = document.getElementById('propSelectModal');
    const tbody = document.getElementById('propTableBody');
    tbody.innerHTML = '';

    // 获取预选中道具的ID列表
    const preSelectedIds = preSelectedProps.map(p => p.Id.toString()); // 确保ID是字符串类型

    // 填充道具数据
    data.PropList.forEach(prop => {
        const tr = document.createElement('tr');
        const isChecked = preSelectedIds.includes(prop.Id.toString()) ? 'checked' : '';
        const quantity = preSelectedProps.find(p => p.Id == prop.Id)?.Quantity || 0;
        tr.innerHTML = `
            <td><input type="checkbox" value="${prop.Id}" ${isChecked}></td>
            <td>${prop.Id}</td>
            <td>${prop.Name}</td>
            <td>${prop.Desc || ''}</td>
            <td><input type="number" value="${quantity}" min="0"></td> <!-- 新增数量列 -->
            <td>${prop.Type || ''}</td> <!-- 新增类型列 -->
        `;
        tbody.appendChild(tr);
    });

    modal.style.display = 'block';
}

function closePropModal() {
    document.getElementById('propSelectModal').style.display = 'none';
    propSelectionCallback = null;
}

function toggleAllProps(checkbox) {
    const checkboxes = document.querySelectorAll('#propTableBody input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = checkbox.checked);
}

function confirmPropSelection() {
    const selectedProps = [];
    const checkboxes = document.querySelectorAll('#propTableBody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const propId = checkbox.value;
        const quantityInput = checkbox.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.querySelector('input[type="number"]');
        const quantity = parseInt(quantityInput.value, 10) || 0;
        const prop = data.PropList.find(p => p.Id == propId);
        if (prop) {
            selectedProps.push({ ...prop, Quantity: quantity }); // 包含数量数据
        }
    });

    if (propSelectionCallback) {
        propSelectionCallback(selectedProps);
    }
    
    closePropModal();
}

let skillSelectionCallback = null;

function showSkillSelector(callback, preSelectedSkills = []) {
    skillSelectionCallback = callback;
    const modal = document.getElementById('skillSelectModal');
    const tbody = document.getElementById('skillTableBody');
    tbody.innerHTML = '';

    // 获取预选中技能的ID列表
    const preSelectedIds = preSelectedSkills.map(p => p.Id.toString());

    // 填充技能数据，过滤掉系统技能
    data.SkillList
        .filter(skill => skill.Type !== "系统能力")
        .forEach(skill => {
            const tr = document.createElement('tr');
            const isChecked = preSelectedIds.includes(skill.Id.toString()) ? 'checked' : '';
            tr.innerHTML = `
                <td><input type="checkbox" value="${skill.Id}" ${isChecked}></td>
                <td>${skill.Id}</td>
                <td>${skill.Name}</td>
                <td>${skill.Description || ''}</td>
            `;
            tbody.appendChild(tr);
        });

    modal.style.display = 'block';
}
let playerSelectionCallback = null;
function showPlayerSelector(callback, preSelectedPlayers = []) {
    playerSelectionCallback = callback;
    const modal = document.getElementById('playerSelectModal');
    const tbody = document.getElementById('playerTableBody');
    tbody.innerHTML = '';

    // 获取预选中技能的ID列表
    const preSelectedIds = preSelectedPlayers.map(p => p.Id.toString());

    // 填充技能数据，过滤掉系统技能
    data.PlayerList
        .filter(player => player.Type !== "系统能力")
        .forEach(player => {
            const tr = document.createElement('tr');
            const isChecked = preSelectedIds.includes(player.Id.toString()) ? 'checked' : '';
            tr.innerHTML = `
                <td><input type="checkbox" value="${player.Id}" ${isChecked}></td>
                <td>${player.Id}</td>
                <td>${player.Name}</td>
                <td>${player.Description || ''}</td>
            `;
            tbody.appendChild(tr);
        });

    modal.style.display = 'block';
}
function closePlayerModal() {
    document.getElementById('playerSelectModal').style.display = 'none';
    playerSelectionCallback = null;
}

function toggleAllPlayers(checkbox) {
    const checkboxes = document.querySelectorAll('#playerTableBody input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = checkbox.checked);
}

function confirmPlayerSelection() {
    const selectedPlayers = [];
    const checkboxes = document.querySelectorAll('#playerTableBody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const playerId = checkbox.value;
        const player = data.PlayerList.find(s => s.Id == playerId);
        if (player) {
            selectedPlayers.push(player);
        }
    });

    if (playerSelectionCallback) {
        playerSelectionCallback(selectedPlayers);
    }
    
    closePlayerModal();
}
function closeSkillModal() {
    document.getElementById('skillSelectModal').style.display = 'none';
    skillSelectionCallback = null;
}
function closeEventModal() {
    document.getElementById('eventSelectModal').style.display = 'none';
    eventSelectionCallback = null;
}
function toggleAllSkills(checkbox) {
    const checkboxes = document.querySelectorAll('#skillTableBody input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = checkbox.checked);
}
function toggleAllEvents(checkbox) {
    const checkboxes = document.querySelectorAll('#eventTableBody input[type="checkbox"]');
    checkboxes.forEach(box => box.checked = checkbox.checked);
}
function confirmSkillSelection() {
    const selectedSkills = [];
    const checkboxes = document.querySelectorAll('#skillTableBody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const skillId = checkbox.value;
        const skill = data.SkillList.find(s => s.Id == skillId);
        if (skill) {
            selectedSkills.push(skill);
        }
    });

    if (skillSelectionCallback) {
        skillSelectionCallback(selectedSkills);
    }
    
    closeSkillModal();
}
//补全event方法
let eventSelectionCallback = null;
function confirmEventSelection() {
    const selectedEvents = [];
    const checkboxes = document.querySelectorAll('#eventTableBody input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        const eventId = checkbox.value;
        const event = data.EventList.find(s => s.Id == eventId);
        if (event) {
            selectedEvents.push(event);
        }
    });

    if (eventSelectionCallback) {
        eventSelectionCallback(selectedEvents);
    }
    
    closeEventModal();
}
// 在文件加载时自动读取 jsonData 目录下的所有 JSON 文件
async function loadJsonData() {
    const allData = await loadAllJsonFiles(); // 加载所有 JSON 文件
    allData.forEach((da, index) => {
        if (da) {
            let key = findJsonFile()[index].replace('.json', ''); // 获取文件名作为键
            data[key] = da; // 将文件内容放入 data
            // 处理显示逻辑
            if (key === "PlayerList") {
                document.getElementById('showPlayer').style.display = 'block'; // 显示角色
            }
            else if (key === "FeedbackList") {
                document.getElementById('showFeedback').style.display = 'block'; // 显示反馈
            }
             else if (key === "PropList") {
                document.getElementById('showItems').style.display = 'block'; // 显示道具
            } else if (key === "RecipeList") {
                document.getElementById('showRecipes').style.display = 'block'; // 显示配方
            } else if (key === "SkillList") {
                document.getElementById('showSkills').style.display = 'block'; // 显示技能
            } else if (key === "EventList") {
                document.getElementById('showEvents').style.display = 'block'; // 显示事件
            } else if (key === "CareerList") {
                document.getElementById('showCareers').style.display = 'block'; // 显示职业
            }  else if (key == "MapList") {
                document.getElementById('showMaps').style.display = 'block'; // 显示地图
            } else if (key == "MapRelationshipList") {
                document.getElementById('showMapRelationships').style.display = 'block'; // 显示地图关系
            }else if (key === "FanyiList") {
                document.getElementById('showFanyis').style.display = 'block'; // 翻译
                // 组织翻译数据
                data["FanyiList"].forEach(it => {
                    if (it["Type"] == "角色") {
                        fanyiData.PlayerList[it["Name"]] = it["ChName"];
                    }
                    else if(it["Type"] == "反馈") {
                        fanyiData.FeedbackList[it["Name"]] = it["ChName"];
                        }
                     else if (it["Type"] == "道具") {
                        fanyiData.PropList[it["Name"]] = it["ChName"];
                    } 
                    else if (it["Type"] == "配方") {
                        fanyiData.RecipeList[it["Name"]] = it["ChName"];
                    } 
                    else if (it["Type"] == "事件") {
                        fanyiData.EventList[it["Name"]] = it["ChName"];
                    } else if (it["Type"] == "技能") {
                        fanyiData.SkillList[it["Name"]] = it["ChName"];
                    } else if (it["Type"] == "职业") {
                        fanyiData.CareerList[it["Name"]] = it["ChName"];
                    }else if (it["Type"] == "地图") {
                        fanyiData.MapList[it["Name"]] = it["ChName"];
                    }else if (it["Type"] == "地图关系") {
                        fanyiData.MapRelationshipList[it["Name"]] = it["ChName"];
                    }
                });
            }
        }
    });
}

// 在脚本加载时调用 loadJsonData 函数
loadJsonData();

function showEventSelector(callback, preSelectedEvents = []) {
    // 选择事件的实现
    eventSelectionCallback = callback;
    const modal = document.getElementById('eventSelectModal');
    const tbody = document.getElementById('eventTableBody');
    tbody.innerHTML = '';

    // 获取预选中事件的ID列表
    const preSelectedIds = preSelectedEvents.map(e => e.Id.toString());

    // 填充事件数据
    data.EventList.forEach(event => {
        const tr = document.createElement('tr');
        const isChecked = preSelectedIds.includes(event.Id.toString()) ? 'checked' : '';
        tr.innerHTML = `
            <td><input type="checkbox" value="${event.Id}" ${isChecked}></td>
            <td>${event.Id}</td>
            <td>${event.Name}</td>
            <td>${event.Description || ''}</td>
        `;
        tbody.appendChild(tr);
    });

    modal.style.display = 'block';
}

let feedbackSelectionCallback = null;

function getFamiliarityText(value) {
    if (value >= 90) return '很熟悉';
    if (value >= 60) return '熟悉';
    if (value >= 30) return '认识';
    return '初见';
}

function showFeedbackEditor(callback, preSelectedFeedbacks = [], currentItem) {
    feedbackSelectionCallback = callback;
    const modal = document.getElementById('feedbackSelectModal');
    const content = document.getElementById('feedbackContent');
    content.innerHTML = '';

    // 确保 preSelectedFeedbacks 是数组
    const feedbacks = Array.isArray(preSelectedFeedbacks) ? preSelectedFeedbacks : [];

    // 从当前项获取信息
    const name = currentItem?.Name || '未知';
    const age = currentItem?.Age || '未知';
    const gender = currentItem?.Gender || '未知';
    const familiarity = currentItem?.Familiarity || 0;
    const familiarityText = getFamiliarityText(familiarity);

    // 创建按钮和信息区域的容器
    const headerArea = document.createElement('div');
    headerArea.className = 'feedback-header-area';
    headerArea.innerHTML = `
        <div class="feedback-buttons">
            <button onclick="confirmFeedbackSelection()">确认</button>
            <button onclick="closeFeedbackModal()">取消</button>
        </div>
        <div class="feedback-info">
            <span>姓名：${name}</span>
            <span>年龄：${age}</span>
            <span>性别：${gender}</span>
            <span class="familiarity">熟悉度：<span class="familiarity-value">${familiarity}</span> (${familiarityText})</span>
        </div>
    `;
    content.appendChild(headerArea);

    // 创建熟悉度进度条
    const familiarityBar = document.createElement('div');
    familiarityBar.className = 'familiarity-bar';
    familiarityBar.innerHTML = `
        <div class="familiarity-progress" style="width: ${familiarity}%"></div>
    `;
    content.appendChild(familiarityBar);

    // 创建已选反馈列表
    const feedbackList = document.createElement('div');
    feedbackList.className = 'feedback-list';
    
    feedbacks.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `
            <span>${feedback}</span>
            <button onclick="removeFeedback(this)" class="remove-btn">×</button>
        `;
        feedbackList.appendChild(feedbackItem);
    });

    // 创建输入区域
    const inputArea = document.createElement('div');
    inputArea.className = 'feedback-input-area';
    inputArea.innerHTML = `
        <input type="text" id="newFeedback" placeholder="输入新反馈">
        <button onclick="addNewFeedback()">添加</button>
    `;

    content.appendChild(feedbackList);
    content.appendChild(inputArea);
    modal.style.display = 'block';
}

function addNewFeedback() {
    const input = document.getElementById('newFeedback');
    const feedbackText = input.value.trim();
    if (feedbackText) {
        const feedbackList = document.querySelector('.feedback-list');
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `
            <span>${feedbackText}</span>
            <button onclick="removeFeedback(this)" class="remove-btn">×</button>
        `;
        feedbackList.appendChild(feedbackItem);
        input.value = '';
    }
}

function removeFeedback(button) {
    button.parentElement.remove();
}

function confirmFeedbackSelection() {
    const selectedFeedbacks = [];
    document.querySelectorAll('.feedback-item span').forEach(span => {
        selectedFeedbacks.push(span.textContent);
    });

    if (feedbackSelectionCallback) {
        feedbackSelectionCallback(selectedFeedbacks);
    }
    
    closeFeedbackModal();
}

function closeFeedbackModal() {
    document.getElementById('feedbackSelectModal').style.display = 'none';
    feedbackSelectionCallback = null;
}

// 确保这些函数可以从HTML中访问
window.addNewFeedback = addNewFeedback;
window.removeFeedback = removeFeedback;
window.confirmFeedbackSelection = confirmFeedbackSelection;
window.closeFeedbackModal = closeFeedbackModal;

// AI Dialog functions
function openAiDialog() {
    const dialog = document.getElementById('aiDialog');
    dialog.style.display = 'block';
    // 重新加载iframe以确保每次打开都是新的会话
    const aiFrame = document.getElementById('aiFrame');
    aiFrame.src = aiFrame.src;
}

function closeAiDialog() {
    document.getElementById('aiDialog').style.display = 'none';
}

window.openAiDialog = openAiDialog;
window.closeAiDialog = closeAiDialog;
