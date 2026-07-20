const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// 1. Resolve paths dynamically
const homedir = os.homedir();
const resourcesPath = path.join(homedir, 'AppData/Local/Programs/antigravity/resources');
const asarPath = path.join(resourcesPath, 'app.asar');
const backupPath = path.join(resourcesPath, 'app.asar.bak');
const tempExtractDir = path.join(__dirname, 'temp_extracted');
const newAsarPath = path.join(__dirname, 'new_app.asar');

console.log('--- Antigravity Chinese Localization Installer ---');
console.log('Resolving resources directory:', resourcesPath);

if (!fs.existsSync(asarPath)) {
  console.error('Error: Could not find Antigravity installation at:', asarPath);
  process.exit(1);
}

// 2. Create Backup
if (!fs.existsSync(backupPath)) {
  console.log('Creating clean app.asar backup...');
  fs.copyFileSync(asarPath, backupPath);
  console.log('Backup created successfully at:', backupPath);
} else {
  console.log('Using existing backup from:', backupPath);
}

// 3. Extract ASAR Function
function unpackAsar(srcAsar, destDir) {
  console.log('Unpacking core assets...');
  const fd = fs.openSync(srcAsar, 'r');
  const sizeBuf = Buffer.alloc(16);
  fs.readSync(fd, sizeBuf, 0, 16, 0);
  const totalHeaderSize = sizeBuf.readUInt32LE(4);
  const headerJsonSize = sizeBuf.readUInt32LE(12);
  const headerBuf = Buffer.alloc(headerJsonSize);
  fs.readSync(fd, headerBuf, 0, headerJsonSize, 16);
  const header = JSON.parse(headerBuf.toString('utf8'));
  const baseOffset = totalHeaderSize + 8;

  function extractDir(files, currentPath) {
    for (const [name, info] of Object.entries(files)) {
      const itemPath = path.join(currentPath, name);
      if (info.files) {
        fs.mkdirSync(itemPath, { recursive: true });
        extractDir(info.files, itemPath);
      } else {
        fs.mkdirSync(path.dirname(itemPath), { recursive: true });
        const offset = parseInt(info.offset);
        const size = info.size;
        
        if (info.unpacked) {
          const unpackedPath = srcAsar + '.unpacked/' + itemPath.substring(destDir.length + 1).replace(/\\/g, '/');
          if (fs.existsSync(unpackedPath)) {
            fs.copyFileSync(unpackedPath, itemPath);
            continue;
          }
        }
        
        const fileBuf = Buffer.alloc(size);
        fs.readSync(fd, fileBuf, 0, size, baseOffset + offset);
        fs.writeFileSync(itemPath, fileBuf);
      }
    }
  }

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  extractDir(header.files, destDir);
  fs.closeSync(fd);
  console.log('Unpacked successfully!');
}

unpackAsar(backupPath, tempExtractDir);

// 4. Inject translation engine into preload.js
console.log('Injecting translation engine...');
const preloadPath = path.join(tempExtractDir, 'dist/preload.js');
if (!fs.existsSync(preloadPath)) {
  console.error('Error: preload.js not found in extracted files.');
  process.exit(1);
}

let preloadContent = fs.readFileSync(preloadPath, 'utf8');

const translationEngine = `
// --- Antigravity UI Chinese Translation Patch & Toggle Switch ---
(function() {
  const { ipcRenderer } = require('electron');

  let currentLang = 'zh';
  try {
    currentLang = window.localStorage.getItem('uiLanguage') || 'zh';
  } catch (e) {
    console.error('Failed to read localStorage:', e);
  }

  // Load from persistent app storage in the background
  ipcRenderer.invoke('storage:get-items').then(items => {
    const lang = items.uiLanguage;
    if (lang && lang !== currentLang) {
      try {
        window.localStorage.setItem('uiLanguage', lang);
        window.location.reload();
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
    }
  }).catch(err => {
    console.error('Failed to fetch from storage:', err);
  });

  const isZh = (currentLang === 'zh');

  const dict = {
    "New Conversation": "新建对话",
    "Conversation History": "历史会话",
    "Scheduled Tasks": "定时任务",
    "Projects": "项目列表",
    "Conversations": "会话列表",
    "Settings": "设置",
    
    "General": "常规",
    "Account": "账户",
    "Agent": "智能体",
    "Models": "模型",
    "Customizations": "自定义",
    "Browser": "浏览器",
    "App": "应用",
    "Shortcuts": "快捷键",
    "Provide Feedback": "提供反馈",
    "Appearance": "外观",
    
    "Manage project folders, agent settings, and permissions.": "管理项目文件夹、智能体设置与权限。",
    "Configure agent execution, queued message delivery, and permissions.": "配置智能体执行、排队消息投递及权限。",
    "Agent settings and permissions for conversations outside of projects.": "配置非项目环境下会话的智能体设置和权限。",
    "Execution": "执行设置",
    "Queued Messages": "排队消息",
    "Configure when follow-up messages are sent.": "配置后续跟进消息的发放时机。",
    "Queue After Turn": "在回合后排队",
    "Folders": "项目文件夹",
    "Add Folder": "添加文件夹",
    "Agent Settings": "智能体设置",
    "Security Preset": "安全预设",
    "Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.": "选择预设的安全级别。这控制了终端自动执行策略和文件访问策略。",
    
    "Default": "默认",
    "Requires manual review for all terminal commands and file accesses outside of the working folders.": "对所有终端命令以及工作文件夹外的文件访问都需要手动确认。",
    "Full machine": "全机访问",
    "All terminal commands require review. The agent can read or write to any file in the machine.": "所有终端命令都需要确认。智能体可以读写电脑上的任何文件。",
    "Turbo Mode": "极速模式",
    "Turbo mode": "极速模式",
    "Disables all safety barriers for maximal iteration velocity.": "禁用所有安全屏障，以获取最大的迭代速度。",
    "Custom": "自定义",
    "Manually customize individual settings.": "手动自定义各项设置。",
    
    "Agent Behavior": "智能体行为",
    "Artifact Review Policy": "构件审查策略",
    "Specifies Agent's behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience.": "指定智能体在请求审查构件时的行为。构件是智能体创建的文档，用于提供更丰富的交互体验。",
    "Use Global": "使用全局设置",
    "Local Permissions": "本地权限",
    "Also includes global settings when working in this project. Learn more.": "在此项目中工作时也包含全局设置。了解更多。",
    "Also includes global settings when working in this project.": "在此项目中工作时也包含全局设置。",
    "Learn more.": "了解更多。",
    
    "File Access Rules": "文件访问规则",
    "Configure allowed and denied paths for file reads and writes.": "配置允许或拒绝的文件读取与写入路径。",
    "Network Access Rules": "网络访问规则",
    "Configure allowed and denied URLs for reading.": "配置允许或拒绝的 URL 读取规则。",
    "Terminal Commands": "终端命令",
    "Configure allowed and denied commands for execution.": "配置允许或拒绝执行的命令规则。",
    "Configure allowed terminal commands.": "配置允许执行的终端命令。",
    "Commands Outside Sandbox": "沙盒外终端命令",
    "Configure allowed commands outside the sandbox.": "配置允许在沙盒外执行的命令。",
    "MCP Tools": "MCP 工具",
    "Configure external tools via Model Context Protocol.": "通过模型上下文协议配置外部工具。",
    
    "File Permissions": "文件权限",
    "Network Permissions": "网络权限",
    "Terminal & Tooling Permissions": "终端与工具权限",
    "Open": "打开",
    
    "Browser Settings": "浏览器设置",
    "Configure the browser subagent. It requires ": "配置浏览器子智能体。其运行需要安装 ",
    " to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.": "。您可以在对话框中输入 /browser 调用浏览器子智能体。",
    "Browser Javascript Execution Policy": "浏览器 JavaScript 执行策略",
    "Controls whether the agent can run custom JavaScript to automate complex browser actions.": "控制智能体是否可以运行自定义 JavaScript 来实现复杂的浏览器自动化操作。",
    "Request Review": "请求确认",
    "always-proceed": "总是执行",
    "request-review": "请求确认",
    "strict": "严格限制",
    "proceed-in-sandbox": "在沙盒中执行",
    "Actuation Permissions": "动作执行权限",
    "Browser Actuation Rules": "浏览器动作执行规则",
    "Configure allowed and denied URLs for browser actuation.": "配置允许与拒绝进行浏览器动作执行的 URL 规则。",
    
    "App Settings": "应用首选项",
    "Manage application settings.": "管理应用配置。",
    "Notifications": "系统通知",
    "Enable system notifications on task completion": "任务完成时启用系统通知",
    "Keep computer awake while running tasks": "运行任务时保持电脑处于唤醒状态",
    "Run in background": "在后台运行",
    "Auto-check for updates": "自动检查更新",
    "Check for Updates": "检查更新",
    "Version": "版本",
    "Theme": "外观主题",
    "Dark": "深色",
    "Light": "浅色",
    "System": "系统默认",
    "Conversation Width": "对话宽度",
    "Standard": "标准",
    "Wide": "宽屏",
    "Full width": "全宽",
    "Prevent Sleep": "防止电脑休眠",
    "Prevent the computer from sleeping while the app is running.": "当应用运行时防止电脑进入休眠状态。",
    "Keep In Menu Bar": "保留在菜单栏",
    "The app will be accessible from the menu bar and will keep running in the background when all windows are closed.": "应用将常驻在系统菜单栏/托盘中，当所有窗口关闭时继续在后台运行。",
    "Notification Settings": "通知设置",
    "To modify notification settings, open your operating system's system preferences.": "要修改通知设置，请打开您操作系统的系统首选项。",
    "Open System Preferences": "打开系统设置",
    "Advanced Settings": "高级设置",
    
    "Configure default behaviors, skills, and MCP servers. Learn more.": "配置默认行为、技能（Skills）以及 MCP 服务。了解更多。",
    "The breakdown below shows token usage from customizations like skills, rules, and MCP. If the budget is exceeded, large customizations will be truncated automatically.": "下方的细目显示了由于技能、规则和 MCP 等自定义内容占用的 Token 用量。如果超出预算，大型自定义内容将被自动截断。",
    "Installed MCP Servers": "已安装的 MCP 服务端",
    "Add MCP +": "添加 MCP +",
    "Refresh": "刷新",
    "Open MCP Config": "打开 MCP 配置",
    "No MCP Servers": "未安装 MCP 服务端",
    "You currently don't have any MCP Servers installed. Add an MCP server above or add a custom one via the MCP Config.": "您当前未安装任何 MCP 服务端。请在上方添加 MCP 服务端，或通过 MCP 配置添加自定义服务端。",
    "Build With Google Plugins": "使用 Google 插件进行构建",
    "Customize": "自定义",
    "Global": "全局",
    
    "Configure the agent's visual theme and display preferences.": "配置智能体的视觉主题及显示偏好。",
    "Chat Settings": "聊天设置",
    "Verbose Agent Chat": "详细对话日志",
    "Display and preserve intermediate thinking steps.": "显示并保留中间思考步骤。",
    "Select light, dark, or inherit system settings.": "选择浅色、深色或继承系统设置。",
    "Light Theme": "浅色主题",
    "Dark Theme": "深色主题",
    "Preset": "预设主题",
    "Background": "背景颜色",
    "Foreground": "前景颜色",
    "Accent": "强调颜色",
    "Default Light": "默认浅色",
    "Default Dark": "默认深色",
    
    "Manage your plan, credentials, and general preferences.": "管理您的订阅计划、凭据以及常规偏好。",
    "Enable Telemetry": "启用遥测与分析",
    "When toggled on, Antigravity collects usage data to help Google enhance performance and features.": "开启后，Antigravity 将收集使用数据，以帮助 Google 优化性能与功能。",
    "Marketing Emails": "营销邮件",
    "Receive product updates, tips, and promotions from Google Antigravity via email.": "通过电子邮件接收来自 Google Antigravity 的产品更新、提示和促销信息。",
    "Your Plan: Google AI Pro": "您的订阅计划：Google AI Pro",
    "You can upgrade to a Google AI Ultra plan to receive higher rate limits.": "您可以升级至 Google AI Ultra 计划以获得更高的速率限制。",
    "Upgrade": "升级计划",
    "Email": "电子邮箱",
    "Sign Out": "注销登录",
    "Terms of Service": "服务条款",
    "By using this app, you agree to its Terms of Service": "使用此应用即表示您同意其服务条款",
    
    "Active Model": "当前激活模型",
    "Choose which model to use.": "选择要使用的 AI 模型。",
    "Model Selection": "模型选择",
    "Plan": "订阅计划",
    "Model Credits": "模型额度",
    "Enable AI Credit Overages": "启用超额 AI 额度",
    "When toggled on, Antigravity will use your AI credits to fulfill model requests once you're out of model quota. Antigravity will always use your model quota first before using AI credits.": "开启后，当您的模型配额用尽时，Antigravity 将使用您的 AI 额度来处理模型请求。Antigravity 将始终优先使用您的模型配额，然后再使用 AI 额度。",
    "Model Quota": "模型配额",
    "Within each group, models share a weekly limit and a 5-hour limit. Quota is consumed proportionally to the cost of the tokens. Thus, limits will last longer with shorter tasks or using more cost-effective models. The 5-hour limit smooths out aggregate demand to fairly distribute global capacity across all users, while your weekly limit is tied directly to your individual tier.": "在每个分组中，模型共享周限制和 5 小时限制。配额按消耗 Token 的比例进行应答扣除。因此，执行较短的任务或使用更具性价比的模型会使限制持续更久。5 小时限制可以平滑总体需求，以公平地在所有用户之间分配全球算力，而您的周限制则直接与您的个人订阅层级挂钩。",
    "Gemini Models": "Gemini模型",
    "Weekly Limit": "周限制",
    "Five Hour Limit": "五小时限制",
    
    "Danger Zone": "危险区域",
    "Delete Project": "删除项目",
    
    "Skills": "技能 (Skills)",
    "Rules": "规则 (Rules)",
    "Plugins": "插件 (Plugins)",
    "MCP Servers": "MCP 服务端",
    
    "Logged in as": "登录身份为",
    "Sign Out": "注销登录",
    "Sign In": "登录账号",
    
    "Task": "任务列表",
    "Walkthrough": "运行报告",
    "Cancel": "取消",
    "Save": "保存",
    "Close": "关闭",
    "Edit": "编辑",
    "Delete": "删除",
    "Search": "搜索",
    "Confirm": "确认",
    "Ok": "确定",
    "Apply": "应用",
    
    "Ask anything, @ to mention, / for actions": "问任何问题，输入 @ 提及，/ 触发快捷指令",
    "Ask anything, @ to mention...": "问任何问题，输入 @ 提及...",
    
    "seconds ago": "秒前",
    "minutes ago": "分钟前",
    "hours ago": "小时前",
    "days ago": "天前",
    
    "Working.": "正在运行...",
    "Working": "正在运行...",
    "Finished": "已完成",
    "Edited": "已修改",
    "Created": "已创建",
    "Deleted": "已删除",
    "Ran": "已运行",
    "Viewed": "已查看",
    "Searching": "正在搜索",
    "Found": "已找到",
    
    "File": "文件",
    "View": "视图",
    "Window": "窗口",
    "Help": "帮助",
    "Quit": "退出"
  };

  function translateDuration(timeStr) {
    return timeStr.replace(/days?/g, '天')
                   .replace(/hours?/g, '小时')
                   .replace(/minutes?/g, '分钟')
                   .replace(/seconds?/g, '秒');
  }

  function translateText(text) {
    if (!text) return null;
    let trimmed = text.trim();
    if (dict[trimmed]) {
      return text.replace(trimmed, dict[trimmed]);
    }
    
    if (/^Learn more about (.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Learn more about (.+)$/i);
      const key = match[1].trim();
      const translatedKey = dict[key] || key;
      return text.replace(/Learn more about (.+)/i, '了解更多关于 ' + translatedKey + ' 的信息');
    }

    if (/You have used some of your weekly limit, it will fully refresh in (.+)/i.test(trimmed)) {
      const match = trimmed.match(/You have used some of your weekly limit, it will fully refresh in (.+)/i);
      const duration = translateDuration(match[1]);
      return '您已使用了周限制的一部分，它将在 ' + duration + '内完全重置。';
    }

    if (/You have used some of your 5-hour limit, it will fully refresh in (.+)/i.test(trimmed)) {
      const match = trimmed.match(/You have used some of your 5-hour limit, it will fully refresh in (.+)/i);
      const duration = translateDuration(match[1]);
      return '您已使用了 5 小时限制的一部分，它将在 ' + duration + '内完全重置。';
    }

    if (/Permanently delete (.+) including (\\d+) active conversation(s)? and (\\d+) archived conversation(s)?/i.test(trimmed)) {
      const match = trimmed.match(/Permanently delete (.+) including (\\d+) active conversation(s)? and (\\d+) archived conversation(s)?/i);
      return '永久删除 ' + match[1] + '，包括 ' + match[2] + ' 个活跃会话和 ' + match[4] + ' 个归档会话。';
    }

    if (/([0-9.]+)% of the customization budget is available/i.test(trimmed)) {
      const match = trimmed.match(/([0-9.]+)% of the customization budget is available/i);
      return match[1] + '% 的自定义预算可用。';
    }

    if (/Show (\\d+) breakdowns?/i.test(trimmed)) {
      const match = trimmed.match(/Show (\\d+) breakdowns?/i);
      return '显示 ' + match[1] + ' 项明细';
    }

    if (/^Plugin:\\\\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^Plugin:\\\\s*(.+)$/i);
      return '插件: ' + match[1];
    }
    
    if (/worked for (\\d+m\\s*)?(\\d+s)/i.test(trimmed)) {
      return text.replace(/worked for /i, '运行耗时 ');
    }
    
    if (/^(\\d+)\\s+files\\s+changed$/i.test(trimmed)) {
      return text.replace(/files\\s+changed/i, '个文件已修改');
    }

    if (/^Thought for (.+)$/i.test(trimmed)) {
      return text.replace(/Thought for /i, '思考 ');
    }

    if (/^Edited\\s/i.test(trimmed)) {
      return text.replace(/^Edited/i, '已修改');
    }
    if (/^Created\\s/i.test(trimmed)) {
      return text.replace(/^Created/i, '已创建');
    }
    if (/^Deleted\\s/i.test(trimmed)) {
      return text.replace(/^Deleted/i, '已删除');
    }
    if (/^Ran\\s/i.test(trimmed)) {
      return text.replace(/^Ran/i, '已运行');
    }
    if (/^Viewed\\s/i.test(trimmed)) {
      return text.replace(/^Viewed/i, '已查看');
    }
    
    return null;
  }

  function walk(node) {
    if (node.nodeType === 3) {
      const translated = translateText(node.nodeValue);
      if (translated !== null) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === 1) {
      if (node.placeholder) {
        const translated = translateText(node.placeholder);
        if (translated !== null) {
          node.placeholder = translated;
        }
      }
      if (node.title) {
        const translated = translateText(node.title);
        if (translated !== null) {
          node.title = translated;
        }
      }
      for (let child = node.firstChild; child; child = child.nextSibling) {
        walk(child);
      }
    }
  }

  if (isZh) {
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const translated = translateText(mutation.target.nodeValue);
          if (translated !== null) {
            mutation.target.nodeValue = translated;
          }
        } else {
          for (const node of mutation.addedNodes) {
            walk(node);
          }
        }
      }
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    });

    if (document.documentElement) {
      walk(document.documentElement);
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        walk(document.documentElement);
        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      });
    }
  }

  function addToggleWidget() {
    if (document.getElementById('lang-toggle-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'lang-toggle-widget';
    
    widget.style.position = 'fixed';
    widget.style.bottom = '16px';
    widget.style.right = '24px';
    widget.style.zIndex = '999999';
    widget.style.padding = '6px 12px';
    widget.style.borderRadius = '20px';
    widget.style.backgroundColor = isZh ? 'rgba(66, 133, 244, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    widget.style.backdropFilter = 'blur(8px)';
    widget.style.border = '1px solid ' + (isZh ? 'rgba(66, 133, 244, 0.4)' : 'rgba(255, 255, 255, 0.15)');
    widget.style.color = isZh ? '#8ab4f8' : '#e0e0e0';
    widget.style.fontSize = '12px';
    widget.style.fontWeight = 'bold';
    widget.style.cursor = 'pointer';
    widget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    widget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    widget.style.userSelect = 'none';
    widget.style.display = 'flex';
    widget.style.alignItems = 'center';
    widget.style.gap = '6px';

    const iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 8h10M4 14h16M6 20h12M2 5h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"/>' +
      '<path d="m9 11 3 3 6-6"/>' +
      '</svg>';
    
    widget.innerHTML = iconSvg + '<span>' + (isZh ? '中 / EN' : 'EN / 中') + '</span>';
    widget.title = isZh ? '切换至英文 (Switch to English)' : '切换至中文 (Switch to Chinese)';

    widget.onmouseover = () => {
      widget.style.backgroundColor = isZh ? 'rgba(66, 133, 244, 0.4)' : 'rgba(255, 255, 255, 0.2)';
      widget.style.transform = 'scale(1.05) translateY(-2px)';
      widget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
    };
    widget.onmouseout = () => {
      widget.style.backgroundColor = isZh ? 'rgba(66, 133, 244, 0.25)' : 'rgba(255, 255, 255, 0.08)';
      widget.style.transform = 'scale(1) translateY(0)';
      widget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    };

    widget.onclick = async (e) => {
      e.stopPropagation();
      const nextLang = isZh ? 'en' : 'zh';
      try {
        window.localStorage.setItem('uiLanguage', nextLang);
        await ipcRenderer.invoke('storage:update-items', { uiLanguage: nextLang });
        window.location.reload();
      } catch (err) {
        alert('Failed to switch language: ' + err.message);
      }
    };

    document.body.appendChild(widget);
  }

  const checkBody = setInterval(() => {
    if (document.body) {
      clearInterval(checkBody);
      addToggleWidget();
    }
  }, 100);
})();
`;

preloadContent += '\n' + translationEngine;
fs.writeFileSync(preloadPath, preloadContent, 'utf8');

// 5. Repack ASAR
console.log('Repacking modified assets...');
function getIntegrity(contentBuf) {
  const hash = crypto.createHash('sha256').update(contentBuf).digest('hex');
  const blockSize = 4194304;
  const blocks = [];
  for (let i = 0; i < contentBuf.length; i += blockSize) {
    const chunk = contentBuf.slice(i, i + blockSize);
    const blockHash = crypto.createHash('sha256').update(chunk).digest('hex');
    blocks.push(blockHash);
  }
  return {
    algorithm: 'SHA256',
    hash: hash,
    blockSize: blockSize,
    blocks: blocks
  };
}

function packAsar(originalAsar, extractedDir, outputAsar) {
  const fd = fs.openSync(originalAsar, 'r');
  const sizeBuf = Buffer.alloc(16);
  fs.readSync(fd, sizeBuf, 0, 16, 0);
  const totalHeaderSize = sizeBuf.readUInt32LE(4);
  const headerJsonSize = sizeBuf.readUInt32LE(12);
  const headerBuf = Buffer.alloc(headerJsonSize);
  fs.readSync(fd, headerBuf, 0, headerJsonSize, 16);
  const header = JSON.parse(headerBuf.toString('utf8'));
  fs.closeSync(fd);

  const files = [];
  function traverse(node, currentPath) {
    if (node.files) {
      for (const [name, child] of Object.entries(node.files)) {
        traverse(child, currentPath ? `${currentPath}/${name}` : name);
      }
    } else {
      if (!node.unpacked) {
        files.push({
          path: currentPath,
          offset: parseInt(node.offset),
          size: node.size,
          node: node
        });
      }
    }
  }
  traverse(header, '');
  files.sort((a, b) => a.offset - b.offset);

  let currentOffset = 0;
  const payloadBuffers = [];
  
  for (const file of files) {
    const filePath = path.join(extractedDir, file.path);
    const fileContent = fs.readFileSync(filePath);
    
    if (file.path === 'dist/preload.js') {
      file.node.size = fileContent.length;
      file.node.integrity = getIntegrity(fileContent);
    }
    
    file.node.offset = String(currentOffset);
    payloadBuffers.push(fileContent);
    currentOffset += fileContent.length;
  }
  
  const payload = Buffer.concat(payloadBuffers);
  const headerJson = JSON.stringify(header);
  const newHeaderJsonSize = Buffer.byteLength(headerJson, 'utf8');
  const newTotalHeaderSize = (8 + newHeaderJsonSize + 3) & ~3;
  const paddingSize = newTotalHeaderSize - 8 - newHeaderJsonSize;

  const outFd = fs.openSync(outputAsar, 'w');
  const finalSizeBuf = Buffer.alloc(16);
  finalSizeBuf.writeUInt32LE(4, 0);
  finalSizeBuf.writeUInt32LE(newTotalHeaderSize, 4);
  finalSizeBuf.writeUInt32LE(newTotalHeaderSize - 4, 8);
  finalSizeBuf.writeUInt32LE(newHeaderJsonSize, 12);
  fs.writeSync(outFd, finalSizeBuf, 0, 16);
  
  const finalHeaderBuf = Buffer.from(headerJson, 'utf8');
  fs.writeSync(outFd, finalHeaderBuf, 0, finalHeaderBuf.length);
  
  if (paddingSize > 0) {
    const paddingBuf = Buffer.alloc(paddingSize, 0);
    fs.writeSync(outFd, paddingBuf, 0, paddingBuf.length);
  }
  
  fs.writeSync(outFd, payload, 0, payload.length);
  fs.closeSync(outFd);
}

packAsar(backupPath, tempExtractDir, newAsarPath);

// 6. Overwrite app.asar
console.log('Replacing app.asar...');
fs.copyFileSync(newAsarPath, asarPath);

// 7. Cleanup
console.log('Cleaning up temporary files...');
fs.rmSync(tempExtractDir, { recursive: true, force: true });
fs.rmSync(newAsarPath, { force: true });

console.log('\n==============================================');
console.log('Installation Complete!');
console.log('Please restart your Antigravity client to apply!');
console.log('==============================================');
