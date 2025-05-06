import { z } from "zod";
import { getOAuthConfig } from "../service/loginUser/OAuthConfig.js";

/**
 * Registers the testLarkApi tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerTestLarkApiTool(server) {
  server.tool(
    "test_lark_api",
    {
      endpoint: z
        .string()
        .describe("Lark API endpoint path, e.g. /open-apis/contact/v3/user/me"),
      method: z
        .string()
        .optional()
        .default("GET")
        .describe("HTTP method (GET, POST, etc.)"),
      body: z
        .any()
        .optional()
        .describe("Request body for POST/PUT requests (JSON object)"),
    },
    async ({ endpoint, method = "GET", body }) => {
      let token = null;
      let tokenType = null;
      if (global.larkUserAccessToken) {
        token = global.larkUserAccessToken;
        tokenType = "user";
      } else if (global.larkTenantAccessToken) {
        token = global.larkTenantAccessToken;
        tokenType = "tenant";
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No user_access_token or tenant_access_token found. Please login first using the 'login_user' tool or 'login_tenant' tool.",
            },
          ],
        };
      }
      const origin = getOAuthConfig().origin;
      const baseDomain =
        origin === "feishu" ? "open.feishu.cn" : "open.larksuite.com";
      const apiUrl = `https://${baseDomain}${endpoint}`;
      let response, json, text;
      try {
        response = await fetch(apiUrl, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });
        text = await response.text();
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                `Failed to call ${
                  origin === "feishu" ? "Feishu" : "Lark"
                } API: ` + String(err),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              body: json ?? text,
              apiUrl,
              method,
              token_type: tokenType,
            }),
          },
        ],
      };
    },
  );
}
