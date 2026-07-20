---
name: chinese-guide
description: >-
  提供关于 Antigravity 平台核心组件（如 CLI 命令行工具 `agy`、IDE 界面集成、Electron 桌面客户端 Antigravity 2.0 以及 Python SDK）的中文使用说明与快速参考指南。当用户询问如何配置或定制 Antigravity 时，可以使用此技能。
---

# Antigravity 中文指南与快速参考

本指南旨在帮助中文用户快速上手并高效使用 Antigravity 开发平台。

## 1. 核心交互界面

### A. 命令行工具 (`agy`)
- **启动 CLI**：在终端运行 `agy`。
- **首次认证**：初次启动时，请按照屏幕提示完成登录与身份验证。
- **退出 CLI**：连续按两次 `Ctrl+D`，或者在 TUI 界面中输入 `/exit` 或 `/quit`。
- **斜杠命令**：在 TUI 界面内输入 `/help` 查看所有可用的斜杠命令。
- **参数帮助**：运行 `agy --help` 可以查看所有命令行标志和子命令。

### B. IDE 界面集成
- **代码补全 (Tab 键)**：Antigravity 能够预测您的输入，按下 `Tab` 键接受代码补全建议，或使用 `Ctrl+→` 逐词接受。
- **内联编辑 (Ctrl+I / Cmd+I)**：在编辑器中选中一段代码，按此快捷键可以针对该片段进行重构、解释或修改。
- **诊断自动修复**：直接从代码中编译器错误或 Lint 警告的 Problems 面板触发 Agent，自动为您生成修复方案。

### C. 桌面客户端 (Antigravity 2.0)
- **侧边栏**：可以启动新会话、切换项目、查看定时任务/计划任务（Cron）、管理 Skill/Rule/Plugin 以及调整全局配置。
- **画板与提及 (@)**：在聊天时输入 `@` 可以引用文件、过去的对话、终端会话、特定规则和 MCP 服务等。

---

## 2. 定制与配置系统

Antigravity 支持以下 5 种自定义方式，用于适应不同的项目流程：

| 定制类型 | 配置文件/文件夹位置 | 作用域 | 最佳适用场景 |
| :--- | :--- | :--- | :--- |
| **Rules (规则)** | `GEMINI.md` 或 `AGENTS.md` | 目录级/继承 | 强制代码规范、API 限制及本地指南。 |
| **Skills (技能)** | `skills/<name>/SKILL.md` | 按需激活 | 针对特定任务的工作流、操作手册（Runbooks）。 |
| **Plugins (插件)**| `plugins/<name>/plugin.json` | 捆绑包 | 打包相关的 Skill、Rule、MCP 配置到单一分发包中。 |
| **Hooks (钩子)** | `hooks.json` | 生命周期 | 在 Agent 生命周期的特定节点执行脚本/命令（如工具执行前）。 |
| **MCP 协议** | `mcp_config.json` | 工具集成 | 将 Agent 与外部本地工具、微服务或 SSE 服务连接。 |

---

## 3. 常见管理命令

- **`/goal`**：当有耗时较长、需要反复尝试或离线运行的任务时，向 Agent 推荐此命令。
- **`/schedule`**：配置定时任务或单次延迟提醒。
- **`/grill-me`**：通过交互式问答帮助您对齐设计决策和实施计划。
