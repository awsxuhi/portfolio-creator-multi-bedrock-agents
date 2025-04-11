# Portfolio Creator Multi-Bedrock Agents

A multi-agent system built with AWS Bedrock for creating investment portfolios and analyzing FOMC (Federal Open Market Committee) reports. The system consists of two main agents: Portfolio Creator Agent and Supervisor Agent, working together to provide investment portfolio creation and economic analysis services.

[中文版本](#portfolio-creator-multi-bedrock-agents-中文)

## Project Overview

This project uses AWS CDK (Cloud Development Kit) to deploy a complete multi-agent system as Infrastructure as Code (IaC). The system includes:

- **Supervisor Agent**: The main entry point of the system, responsible for receiving user requests and delegating tasks to the specialized Portfolio Creator Agent
- **Portfolio Creator Agent**: Specialized in creating investment portfolios and analyzing FOMC reports
- **Knowledge Base**: Stores and indexes FOMC reports, allowing the Portfolio Creator Agent to access and analyze this information
- **S3 Bucket**: Used to store FOMC report documents
- **Action Group**: Defines operations that the Portfolio Creator Agent can perform

## System Architecture

The system adopts a modular design with multiple collaborating components:

```
User --> Supervisor Agent --> Portfolio Creator Agent --> Knowledge Base --> S3 Bucket
                                                     --> Action Group
```

Detailed architecture design and component descriptions can be found in the [docs/design](docs/design) directory.

## Prerequisites

Before deploying and using this project, you need:

1. Install [Node.js](https://nodejs.org/) (version 14.x or higher)
2. Install [AWS CLI](https://aws.amazon.com/cli/) and configure your AWS credentials
3. Install [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
4. Ensure your AWS account has enabled the [Amazon Bedrock](https://aws.amazon.com/bedrock/) service and has access to Claude Haiku and Titan Embed models

## Installation and Deployment

Follow these steps to install and deploy the project:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/portfolio-creator-multi-bedrock-agents.git
   cd portfolio-creator-multi-bedrock-agents
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile TypeScript code:

   ```bash
   npm run build
   ```

4. Deploy to AWS:
   ```bash
   npx cdk deploy
   ```

After deployment, CDK will output important resource IDs, including Agent ID, Agent Alias ID, and Knowledge Base ID.

## Usage

### Using through AWS Console

1. Log in to the [AWS Console](https://console.aws.amazon.com/)
2. Navigate to [Amazon Bedrock](https://console.aws.amazon.com/bedrock)
3. Select "Agents" in the left navigation bar
4. Find the Agent named "supervisor-agent-xxx"
5. Click the "Test" button to start interacting with the Agent

### Using through API

You can use the AWS SDK to call the Bedrock Agent Runtime API to interact with the Agent:

```javascript
const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require("@aws-sdk/client-bedrock-agent-runtime");

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

async function invokeAgent(agentAliasId, sessionId, inputText) {
  const command = new InvokeAgentCommand({
    agentAliasId,
    sessionId,
    inputText,
  });

  const response = await client.send(command);
  return response;
}

// Use the Agent Alias ID obtained from CDK output
const agentAliasId = "your-agent-alias-id";
const sessionId = "unique-session-id";
const inputText = "Create a portfolio with tech stocks";

invokeAgent(agentAliasId, sessionId, inputText)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

### Example Queries

You can ask the Agent the following types of queries:

- "Create a portfolio with 3 real estate companies"
- "Analyze the FOMC meeting minutes from January 2023"
- "Summarize the discussions about inflation in the 2023 FOMC meetings"
- "Compare the monetary policy changes between the first and second half of 2023"

## Project Structure

```
portfolio-creator-multi-bedrock-agents/
├── bin/                    # CDK application entry point
├── lib/                    # Main code
│   ├── collaborator-portfolio-creator/  # Portfolio Creator Agent related code
│   │   ├── lambda/         # Lambda function code
│   │   ├── action-group-schema.ts  # Action Group API schema
│   │   ├── instructions.ts  # Agent instructions
│   │   └── portfolio-creator-stack.ts  # Portfolio Creator construct
│   ├── supervisor/         # Supervisor Agent related code
│   │   ├── instructions.ts  # Agent instructions
│   │   └── supervisor-stack.ts  # Supervisor construct
│   └── common/             # Shared code
├── docs/                   # Documentation
│   ├── design/             # Design documents
│   └── assets/             # FOMC report documents
└── test/                   # Test code
```

## Customization and Extension

### Modifying Agent Instructions

You can customize the Agent's instructions by modifying the `lib/collaborator-portfolio-creator/instructions.ts` and `lib/supervisor/instructions.ts` files.

### Adding More Documents

To add more documents to the knowledge base:

1. Place the documents in the `docs/assets` directory
2. Redeploy the project: `npx cdk deploy`

### Extending Action Group

To add more operations:

1. Modify the `lib/collaborator-portfolio-creator/action-group-schema.ts` file to add new API definitions
2. Implement the corresponding handling logic in `lib/collaborator-portfolio-creator/lambda/portfolio-creator-actions/index.py`
3. Redeploy the project: `npx cdk deploy`

## Troubleshooting

### Common Issues

1. **Deployment fails, resource already exists**:

   - Problem: Deployment fails with a message that the resource already exists
   - Solution: Ensure resource names are unique, or delete existing resources and retry

2. **Knowledge base synchronization fails**:

   - Problem: Documents are not properly indexed
   - Solution: Check the documents in the S3 bucket, ensure they are properly uploaded, then manually trigger knowledge base synchronization

3. **Agent responses are inaccurate**:
   - Problem: The Agent's responses do not meet expectations
   - Solution: Adjust Agent instructions, or add more examples to the instructions

## Contributing

Contributions of code, issue reports, or improvement suggestions are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgements

This project is based on the design and data from the [AWS Bedrock Agent Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/f8a7a3f8-1603-4b10-95cb-0b471db272d8/en-US). Thanks to AWS for providing this excellent workshop, which has been a valuable reference and inspiration for this project.

## Useful Commands

- `npm run build` compile TypeScript code
- `npm run watch` watch for changes and compile
- `npm run test` perform Jest unit tests
- `npx cdk deploy` deploy the stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emit the synthesized CloudFormation template

---

# Portfolio Creator Multi-Bedrock Agents (中文)

这是一个使用 AWS Bedrock 构建的多智能体系统，用于创建投资组合和分析 FOMC（美联储公开市场委员会）报告。该系统由两个主要的智能体组成：Portfolio Creator Agent 和 Supervisor Agent，它们协同工作，为用户提供投资组合创建和经济分析服务。

[English Version](#portfolio-creator-multi-bedrock-agents)

## 项目概述

本项目使用 AWS CDK（Cloud Development Kit）以基础设施即代码（IaC）的方式部署一个完整的多智能体系统。系统包括：

- **Supervisor Agent**：系统的主要入口点，负责接收用户请求并将任务委派给专业的 Portfolio Creator Agent
- **Portfolio Creator Agent**：专门负责创建投资组合和分析 FOMC 报告的智能体
- **知识库**：存储和索引 FOMC 报告，使 Portfolio Creator Agent 能够访问和分析这些信息
- **S3 存储桶**：用于存储 FOMC 报告文档
- **Action Group**：定义 Portfolio Creator Agent 可以执行的操作

## 系统架构

系统采用了模块化设计，由多个相互协作的组件组成：

```
用户 --> Supervisor Agent --> Portfolio Creator Agent --> 知识库 --> S3 存储桶
                                                     --> Action Group
```

详细的架构设计和组件说明可以在[docs/design](docs/design)目录中找到。

## 前提条件

在部署和使用本项目之前，您需要：

1. 安装[Node.js](https://nodejs.org/)（版本 14.x 或更高）
2. 安装[AWS CLI](https://aws.amazon.com/cli/)并配置您的 AWS 凭证
3. 安装[AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html)
4. 确保您的 AWS 账户已启用[Amazon Bedrock](https://aws.amazon.com/bedrock/)服务，并有权访问 Claude Haiku 和 Titan Embed 模型

## 安装和部署

按照以下步骤安装和部署项目：

1. 克隆仓库：

   ```bash
   git clone https://github.com/yourusername/portfolio-creator-multi-bedrock-agents.git
   cd portfolio-creator-multi-bedrock-agents
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 编译 TypeScript 代码：

   ```bash
   npm run build
   ```

4. 部署到 AWS：
   ```bash
   npx cdk deploy
   ```

部署完成后，CDK 将输出重要资源的 ID，包括 Agent ID、Agent Alias ID 和 Knowledge Base ID。

## 使用方法

### 通过 AWS 控制台使用

1. 登录[AWS 控制台](https://console.aws.amazon.com/)
2. 导航到[Amazon Bedrock](https://console.aws.amazon.com/bedrock)
3. 在左侧导航栏中选择"Agents"
4. 找到名为"supervisor-agent-xxx"的 Agent
5. 点击"Test"按钮开始与 Agent 交互

### 通过 API 使用

您可以使用 AWS SDK 调用 Bedrock Agent Runtime API 与 Agent 交互：

```javascript
const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require("@aws-sdk/client-bedrock-agent-runtime");

const client = new BedrockAgentRuntimeClient({ region: "us-east-1" });

async function invokeAgent(agentAliasId, sessionId, inputText) {
  const command = new InvokeAgentCommand({
    agentAliasId,
    sessionId,
    inputText,
  });

  const response = await client.send(command);
  return response;
}

// 使用从CDK输出获取的Agent Alias ID
const agentAliasId = "your-agent-alias-id";
const sessionId = "unique-session-id";
const inputText = "创建一个包含科技股的投资组合";

invokeAgent(agentAliasId, sessionId, inputText)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

### 示例查询

您可以向 Agent 提出以下类型的查询：

- "创建一个包含 3 家房地产公司的投资组合"
- "分析 2023 年 1 月的 FOMC 会议纪要"
- "总结 2023 年 FOMC 会议中关于通胀的讨论"
- "比较 2023 年上半年和下半年的货币政策变化"

## 项目结构

```
portfolio-creator-multi-bedrock-agents/
├── bin/                    # CDK应用入口点
├── lib/                    # 主要代码
│   ├── collaborator-portfolio-creator/  # Portfolio Creator Agent相关代码
│   │   ├── lambda/         # Lambda函数代码
│   │   ├── action-group-schema.ts  # Action Group API模式
│   │   ├── instructions.ts  # Agent指令
│   │   └── portfolio-creator-stack.ts  # Portfolio Creator构造
│   ├── supervisor/         # Supervisor Agent相关代码
│   │   ├── instructions.ts  # Agent指令
│   │   └── supervisor-stack.ts  # Supervisor构造
│   └── common/             # 共享代码
├── docs/                   # 文档
│   ├── design/             # 设计文档
│   └── assets/             # FOMC报告文档
└── test/                   # 测试代码
```

## 自定义和扩展

### 修改 Agent 指令

您可以通过修改`lib/collaborator-portfolio-creator/instructions.ts`和`lib/supervisor/instructions.ts`文件来自定义 Agent 的指令。

### 添加更多文档

要添加更多文档到知识库：

1. 将文档放入`docs/assets`目录
2. 重新部署项目：`npx cdk deploy`

### 扩展 Action Group

要添加更多操作：

1. 修改`lib/collaborator-portfolio-creator/action-group-schema.ts`文件，添加新的 API 定义
2. 在`lib/collaborator-portfolio-creator/lambda/portfolio-creator-actions/index.py`中实现相应的处理逻辑
3. 重新部署项目：`npx cdk deploy`

## 故障排除

### 常见问题

1. **部署失败，资源已存在**：

   - 问题：部署失败，提示资源已存在
   - 解决方案：确保资源名称唯一，或者删除现有资源后重试

2. **知识库同步失败**：

   - 问题：文档未被正确索引
   - 解决方案：检查 S3 存储桶中的文档，确保它们已正确上传，然后手动触发知识库同步

3. **Agent 响应不准确**：
   - 问题：Agent 的响应不符合预期
   - 解决方案：调整 Agent 指令，或者添加更多示例到指令中

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork 仓库
2. 创建您的特性分支：`git checkout -b feature/amazing-feature`
3. 提交您的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见[LICENSE](LICENSE)文件

## 致谢

本项目基于[AWS Bedrock Agent Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/f8a7a3f8-1603-4b10-95cb-0b471db272d8/en-US)的设计和数据。感谢 AWS 提供这个优秀的 workshop，为本项目提供了宝贵的参考和灵感。

## 有用的命令

- `npm run build` 编译 TypeScript 代码
- `npm run watch` 监视更改并编译
- `npm run test` 执行 Jest 单元测试
- `npx cdk deploy` 将堆栈部署到您的默认 AWS 账户/区域
- `npx cdk diff` 比较已部署的堆栈与当前状态
- `npx cdk synth` 生成 CloudFormation 模板
