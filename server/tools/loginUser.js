// loginUser.js - MCPツール登録エントリポイント
import {
  loginUserStartHandler,
  loginUserPollHandler,
} from "../service/loginUser/loginUserToolHandler.js";
import { z } from "zod";

/**
 * Registers the loginUser tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerLoginUserTool(server) {
  // "start" tool
  server.tool(
    "login_user_start",
    `'login_user_start' starts the 3-legged OAuth process. It starts an HTTP server and returns the URL to the user. 
    It can be used to get the user_access_token. user_access_token represents the user who is logged in to Lark. You can use this token to behave as the user.
    If you don't need to behave as the user, you can use the tenant_access_token instead, which can be obtained from the login_tenant tool.
    If the user doesn't request to login as a user, login_tenant tool is preferred over this tool.`,
    {
      iAskedUser: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Set to true if you asked to login as a user and user has really intended to login as a user. Set to false if user has not explicitly intended to login as a user.",
        ),
    },
    async ({ iAskedUser }) => {
      if (!iAskedUser) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Please use the login_tenant tool instead.",
            },
          ],
        };
      }
      return loginUserStartHandler();
    },
  );

  // "poll" tool
  server.tool(
    "login_user_poll",
    "'login_user_poll' checks if the OAuth code has been received and, if so, exchanges it for a token.",
    loginUserPollHandler,
  );
}
