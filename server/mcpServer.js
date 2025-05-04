/**
 * MCP Server setup and export.
 * This file instantiates and configures the MCP server.
 * Tools and resources are registered here via imports.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerFetchLarkDocTool } from "./tools/fetchLarkDoc.js";
import { registerLoginUserTool } from "./tools/loginUser.js";
import { registerTestLarkApiTool } from "./tools/testLarkApi.js";
import { registerFetchLarkDocIndexTool } from "./tools/fetchLarkDocIndex.js";

/**
 * Creates and configures the MCP server.
 * @returns {McpServer}
 */
export function createMcpServer() {
  const server = new McpServer({
    name: "Lark API Documentation MCP",
    description:
      "Proxies Lark Document Fetch API for LLM consumption. Exposes Lark documentation as a resource.",
    version: "0.1.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  registerFetchLarkDocTool(server);
  registerLoginUserTool(server);
  registerTestLarkApiTool(server);
  registerFetchLarkDocIndexTool(server);

  return server;
}

/**
 * Starts the MCP server with stdio transport.
 */
export async function startServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
