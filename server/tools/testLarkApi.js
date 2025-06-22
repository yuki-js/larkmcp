import { z } from "zod";
import { getOAuthConfig } from "../service/loginUser/OAuthConfig.js";

/**
 * Registers the testLarkApi tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerTestLarkApiTool(server) {
  server.tool(
    "test_lark_api",
    `Test Lark's actual API calls. To use this tool, you need to know about how API works and how to make the API calls.
    To learn about the API, you can use the 'fetch_lark_doc_index' tool to learn about the API specification.`,
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
      iKnewTheApiSpec: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          "Set to true to confirm that you learned about the API specification via fetch_lark_doc_index or you already have correct knowledge about the API. For the first call, please set it to false.",
        ),
    },
    async ({ endpoint, method = "GET", body, iKnewTheApiSpec = false }) => {
      if (!iKnewTheApiSpec) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Have you learned about the API specification via fetch_lark_doc_index? If not, please use the 'fetch_lark_doc_index' tool to learn about the API specification first. If you already have correct knowledge about the API, please set iKnewTheApiSpec to true.",
            },
          ],
        };
      }
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
