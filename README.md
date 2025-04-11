# Portfolio Creator Multi-Bedrock Agents

A multi-agent system built with AWS Bedrock for creating investment portfolios and analyzing FOMC (Federal Open Market Committee) reports. The system consists of two main agents: Portfolio Creator Agent and Supervisor Agent, working together to provide investment portfolio creation and economic analysis services.

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

3. Compile TypeScript code (optional):

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
4. Find the Agent named "supervisor-xxxxxxxxxx"
5. Click the "Test" button to start interacting with the Agent

### Using through AWS Console

You can also use the [Bedrock Agent Streamlit UI](https://github.com/awsxuhi/bedrock-agent-streamlit-ui) to communicate with the supervisor agent (by configuring the config.py and demo_ui.py)

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgements

This project is based on the design and data from the [AWS Bedrock Agent Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/f8a7a3f8-1603-4b10-95cb-0b471db272d8/en-US). Thanks to AWS for providing this excellent workshop, which has been a valuable reference and inspiration for this project.
