// loginUser.js - MCPツール登録エントリポイント
import { z } from "zod";
import { registerLoginUserToolHandler } from "../service/loginUser/loginUserToolHandler.js";

/**
 * Registers the loginUser tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerLoginUserTool(server) {
  server.tool(
    "login_user",
    {
      step: z
        .enum(["start", "poll"])
        .describe(
          "'start' returns the OAuth URL and starts the local server. 'poll' checks if the OAuth code has been received and, if so, exchanges it for a token."
        ),
    },
    // handlerはサービス層に委譲
    async (params) => registerLoginUserToolHandler(params)
  );
}
