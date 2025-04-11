import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import { SUPERVISOR_AGENT_INSTRUCTION } from "./instructions";

export interface SupervisorConstructProps {
  portfolioCreatorAgentAlias: bedrock.AgentAlias;
  uniqueSuffix: string;
}

export class SupervisorConstruct extends Construct {
  public readonly agentAlias: bedrock.AgentAlias;

  constructor(scope: Construct, id: string, props: SupervisorConstructProps) {
    super(scope, id);

    const uniqueSuffix = props.uniqueSuffix;

    // 1. Create Supervisor Agent
    const supervisorAgent = new bedrock.Agent(this, "SupervisorAgent", {
      name: `supervisor-${uniqueSuffix}`,
      foundationModel: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_HAIKU_V1_0,
      instruction: SUPERVISOR_AGENT_INSTRUCTION,
      userInputEnabled: true,
      shouldPrepareAgent: true,
      agentCollaboration: bedrock.AgentCollaboratorType.SUPERVISOR,
    });

    // 2. Create Agent Collaborator, linking to Portfolio Creator Agent
    const portfolioCreatorCollaborator = new bedrock.AgentCollaborator({
      agentAlias: props.portfolioCreatorAgentAlias,
      collaborationInstruction:
        "You are a specialized agent for creating investment portfolios and analyzing FOMC reports. When asked about investment portfolios or FOMC reports, provide detailed analysis and recommendations.",
      collaboratorName: "portfolio-creator",
    });

    // 3. Add Collaborator to Supervisor Agent
    supervisorAgent.addAgentCollaborator(portfolioCreatorCollaborator);

    // 4. Create Agent alias
    this.agentAlias = new bedrock.AgentAlias(this, "SupervisorAgentAlias", {
      agent: supervisorAgent,
      aliasName: `supervisor-alias-${uniqueSuffix}`,
      description: "Alias for supervisor agent",
    });
  }
}
