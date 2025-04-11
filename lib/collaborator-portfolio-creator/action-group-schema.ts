export const actionGroupSchema = {
  openapi: "3.0.1",
  info: {
    title: "PortfolioCreatorAssistant API",
    description: "API for creating a company portfolio, search company data, and send summarized emails",
    version: "1.0.0",
  },
  paths: {
    "/companyResearch": {
      post: {
        description: "Get financial data for a company by name",
        operationId: "companyResearch",
        parameters: [
          {
            name: "name",
            in: "query",
            description: "Name of the company to research",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successful response with company data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CompanyData",
                },
              },
            },
          },
        },
      },
    },
    "/createPortfolio": {
      post: {
        description: "Create a company portfolio of top profit earners by specifying number of companies and industry",
        operationId: "createPortfolio",
        parameters: [
          {
            name: "numCompanies",
            in: "query",
            description: "Number of companies to include in the portfolio",
            required: true,
            schema: {
              type: "integer",
              format: "int32",
            },
          },
          {
            name: "industry",
            in: "query",
            description: "Industry sector for the portfolio companies",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Successful response with generated portfolio",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Portfolio",
                },
              },
            },
          },
        },
      },
    },
    "/sendEmail": {
      post: {
        description: "Send an email with FOMC search summary and created portfolio",
        operationId: "sendEmail",
        parameters: [
          {
            name: "emailAddress",
            in: "query",
            description: "Recipient's email address",
            required: true,
            schema: {
              type: "string",
              format: "email",
            },
          },
          {
            name: "fomcSummary",
            in: "query",
            description: "Summary of FOMC search results",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "portfolio",
            in: "query",
            description: "Details of the created stock portfolio",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Email sent successfully",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  description: "Confirmation message",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CompanyData: {
        type: "object",
        description: "Financial data for a single company",
        properties: {
          companyName: {
            type: "string",
            description: "Company name",
          },
          expenses: {
            type: "number",
            description: "Annual expenses",
          },
          revenue: {
            type: "number",
            description: "Annual revenue",
          },
          profit: {
            type: "number",
            description: "Annual profit",
          },
          employees: {
            type: "number",
            description: "Number of employees",
          },
          industrySector: {
            type: "string",
            description: "Industry sector",
          },
        },
      },
      Portfolio: {
        type: "array",
        description: "Stock portfolio with specified number of companies",
        items: {
          $ref: "#/components/schemas/CompanyData",
        },
      },
    },
  },
};
