#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PortfolioCreatorStack } from "../lib";

const app = new cdk.App();

new PortfolioCreatorStack(app, "PortfolioCreatorStack", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  description:
    "(xuhi@) - This is a stack to deploy Portfolio Creator and Supervisor Agents using Amazon Bedrock. The agents work together to create investment portfolios and analyze FOMC reports. [2025.04.11]",
});
