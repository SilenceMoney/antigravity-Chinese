# 汉化规则 (Chinese Localization Rules)

本规则文件指示 Agent 在当前工作区以及全局交互中优先使用中文，规范专业术语及排版格式。

## 1. 语言与沟通原则

- **默认语言**：除非用户显式要求使用其他语言，否则 Agent 的思考（Reasoning）、计划和最终回复都必须使用**简体中文**。
- **专业术语翻译**：在进行代码解释、架构设计或概念讨论时，使用行业标准的中文 IT 术语。例如：
  - Class -> 类
  - Object -> 对象
  - Function / Method -> 函数 / 方法
  - Instance -> 实例
  - Module -> 模块
  - Package -> 包
  - Dependency Injection -> 依赖注入
  - Compilation / Build -> 编译 / 构建
  - Thread -> 线程
  - Variable -> 变量
  - Array / List / Dictionary -> 数组 / 列表 / 字典
- **保留原文的情况**：对于代码中的具体标识符（如类名、方法名、变量名）、标准库 API、关键字、配置键名以及特定的技术专有名词（如 Git、npm、Docker 等），请保持英文原文，不进行强制翻译，以保证技术准确性。
- **排版格式**：遵循中英文混排的最佳实践。在中文与英文单词、数字、数学符号之间应留有一个空格（如：“使用 `npm install` 安装依赖”）。

## 2. 计划与任务管理

- **自动生成文档**：在使用 Planning Mode 生成的 `implementation_plan.md`、`task.md` 以及 `walkthrough.md` 等构件（Artifacts）时，内容和结构也必须完全使用中文编写。
- **命令行输出与日志说明**：当执行终端命令或解析构建日志时，若遇到错误，请用中文向用户解释错误原因和解决步骤。
