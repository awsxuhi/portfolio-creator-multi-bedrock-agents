import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PortfolioCreatorConstruct } from "./collaborator-portfolio-creator/portfolio-creator";
import { SupervisorConstruct } from "./supervisor/supervisor";
import { StackIdSuffix } from "./common/utils";

export class PortfolioCreatorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackIdSuffix = StackIdSuffix(this.stackId);

    // Create Portfolio Creator Construct
    const portfolioCreator = new PortfolioCreatorConstruct(this, "PortfolioCreator", {
      uniqueSuffix: stackIdSuffix,
    });

    // Create Supervisor Construct
    const supervisor = new SupervisorConstruct(this, "Supervisor", {
      portfolioCreatorAgentAlias: portfolioCreator.agentAlias,
      uniqueSuffix: stackIdSuffix,
    });

    // Output important resource IDs
    new cdk.CfnOutput(this, "PortfolioCreatorKnowledgeBaseId", { value: portfolioCreator.kb.knowledgeBaseId });
    new cdk.CfnOutput(this, "PortfolioCreatorDocumentBucketName", { value: portfolioCreator.docBucket.bucketName });
    new cdk.CfnOutput(this, "PortfolioCreatorAgentAliasId", { value: portfolioCreator.agentAlias.aliasId });
    new cdk.CfnOutput(this, "SupervisorAgentAliasId", { value: supervisor.agentAlias.aliasId });
    new cdk.CfnOutput(this, "SupervisorAgentId", { value: supervisor.agentAlias.agent.agentId });
    new cdk.CfnOutput(this, "SupervisorAgentName", { value: `supervisor-${stackIdSuffix}` });
  }
}
