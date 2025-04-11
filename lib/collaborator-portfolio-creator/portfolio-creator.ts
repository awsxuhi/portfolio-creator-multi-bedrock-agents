import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cr from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import * as path from "path";
import { actionGroupSchema } from "./action-group-schema";
import { StackIdSuffix } from "../common/utils";
import { PORTFOLIO_CREATOR_AGENT_INSTRUCTION, KNOWLEDGE_BASE_INSTRUCTION } from "./instructions";

export interface PortfolioCreatorConstructProps {
  uniqueSuffix: string;
}

export class PortfolioCreatorConstruct extends Construct {
  // Expose agentAlias property for use in other Constructs
  public readonly agentAlias: bedrock.AgentAlias;
  public readonly docBucket: s3.Bucket;
  public readonly kb: bedrock.VectorKnowledgeBase;

  constructor(scope: Construct, id: string, props: PortfolioCreatorConstructProps) {
    super(scope, id);

    const uniqueSuffix = props.uniqueSuffix;

    // 1. Create S3 bucket for storing FOMC reports
    this.docBucket = new s3.Bucket(this, "KnowledgeBaseBucket", {
      bucketName: `knowledgebase-bedrock-agent-portfolio-creator-${uniqueSuffix}`,
      enforceSSL: true,
      versioned: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 2. Create Lambda function implementing portfolio creator business logic
    const actionGroupFunction = new lambda.Function(this, "PortfolioCreatorActions", {
      functionName: `portfolio-actions-${uniqueSuffix}`,
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.lambda_handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/portfolio-creator-actions")),
      timeout: cdk.Duration.minutes(2),
    });

    // 3. Create Bedrock knowledge base
    this.kb = new bedrock.VectorKnowledgeBase(this, "PortfolioCreatorKB", {
      embeddingsModel: bedrock.BedrockFoundationModel.TITAN_EMBED_TEXT_V2_1024,
      instruction: KNOWLEDGE_BASE_INSTRUCTION,
    });

    // 4. Create S3 data source, linking FOMC report documents
    const dataSource = new bedrock.S3DataSource(this, "FOMCReportsDataSource", {
      bucket: this.docBucket,
      knowledgeBase: this.kb,
      dataSourceName: "fomc-reports",
      chunkingStrategy: bedrock.ChunkingStrategy.fixedSize({
        maxTokens: 500,
        overlapPercentage: 20,
      }),
    });

    // 5. Deploy documents to S3 bucket
    const deployment = new s3deploy.BucketDeployment(this, "DeployFOMCReports", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../docs/assets"))],
      destinationBucket: this.docBucket,
      prune: false, // Set to true to delete files in S3 that don't exist in the source directory
    });

    // 6. Create Lambda function to synchronize knowledge base
    const syncKnowledgeBaseFunction = new lambda.Function(this, "SyncKnowledgeBaseFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.lambda_handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/sync-knowledge-base")),
      timeout: cdk.Duration.minutes(15),
      environment: {
        KNOWLEDGE_BASE_ID: this.kb.knowledgeBaseId,
      },
    });

    // 7. Grant Lambda function permission to call Bedrock API
    syncKnowledgeBaseFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock-agent-runtime:StartIngestionJob", "bedrock-agent-runtime:GetIngestionJob", "bedrock-agent-runtime:ListIngestionJobs"],
        resources: ["*"],
      })
    );

    // 8. Create custom resource to trigger knowledge base synchronization
    const syncKnowledgeBase = new cr.AwsCustomResource(this, "SyncKnowledgeBase", {
      onUpdate: {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: syncKnowledgeBaseFunction.functionName,
          Payload: JSON.stringify({
            RequestType: "Update",
            ResourceProperties: {
              KnowledgeBaseId: this.kb.knowledgeBaseId,
            },
          }),
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${this.kb.knowledgeBaseId}-sync`),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["lambda:InvokeFunction"],
          resources: [syncKnowledgeBaseFunction.functionArn],
        }),
      ]),
    });

    // Ensure knowledge base synchronization is triggered after file deployment is complete
    syncKnowledgeBase.node.addDependency(deployment);

    // 9. Create Bedrock Agent
    const agent = new bedrock.Agent(this, "PortfolioCreatorAgent", {
      name: `portfolio-creator-${uniqueSuffix}`,
      foundationModel: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_HAIKU_V1_0,
      instruction: PORTFOLIO_CREATOR_AGENT_INSTRUCTION,
      knowledgeBases: [this.kb],
      userInputEnabled: true,
      shouldPrepareAgent: true,
    });

    // 10. Create Action Group
    const actionGroup = new bedrock.AgentActionGroup({
      name: `portfolio-ag-${uniqueSuffix}`,
      description: "API for creating a company portfolio, search company data, and send summarized emails",
      executor: bedrock.ActionGroupExecutor.fromlambdaFunction(actionGroupFunction),
      apiSchema: bedrock.ApiSchema.fromInline(JSON.stringify(actionGroupSchema)),
    });

    // 11. Add Action Group to Agent
    agent.addActionGroup(actionGroup);

    // 12. Create Agent alias
    this.agentAlias = new bedrock.AgentAlias(this, "PortfolioCreatorAgentAlias", {
      agent: agent,
      aliasName: `portfolio-alias-${uniqueSuffix}`,
      description: "Alias for portfolio creator agent",
    });

    // 13. Grant Bedrock Agent permission to invoke Lambda function
    actionGroupFunction.addPermission("AllowBedrockAgentInvoke", {
      principal: new iam.ServicePrincipal("bedrock.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:bedrock:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:agent/*`,
    });
  }
}
