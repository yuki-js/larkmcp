import { z } from "zod";
import removeKeysDeep from "../../utils/removeKeysDeep.js";
import { getOAuthConfig } from "../service/loginUser/OAuthConfig.js";

/**
 * Registers the fetchLarkDoc tool on the MCP server.
 * This version does NOT restrict doc paths to a whitelist.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerFetchLarkDocTool(server) {
  server.tool(
    "fetch_lark_doc",
    {
      url: z
        .string()
        .describe(
          "Human-facing Lark documentation URL (e.g. https://open.larksuite.com/document/server-docs/docs/docs/docx-v1/document/list) or a Lark doc path (e.g. /server-docs/docs/docs/docx-v1/document/list)",
        ),
    },
    async ({ url }) => {
      // Extract the fullPath from the human URL or accept a path directly
      let fullPath = null;
      let origin = "lark";
      try {
        origin = getOAuthConfig().origin;
      } catch {
        /* ignore */
      }
      try {
        // If it's a full URL, extract the path after /document/
        const m = url.match(
          /open\.(larksuite\.com|feishu\.cn)\/document\/([^?]+)/,
        );
        if (m) {
          // m[2] is the path part, may or may not start with /
          fullPath = m[2].startsWith("/") ? m[2] : "/" + m[2];
        } else if (url.startsWith("/")) {
          fullPath = url;
        } else {
          // fallback: treat as path, add leading slash
          fullPath = "/" + url;
        }
      } catch {
        // fallback: treat as path, add leading slash
        fullPath = "/" + url;
      }

      // Lark/Feishu Document Fetch API endpoint for LLMs
      const baseDomain =
        origin === "feishu" ? "open.feishu.cn" : "open.larksuite.com";
      const apiUrl = `https://${baseDomain}/document_portal/v1/document/get_detail?fullPath=${encodeURIComponent(
        fullPath,
      )}`;
      let response;
      let json;
      try {
        response = await fetch(apiUrl, {
          headers: {
            "Accept-Language": origin === "feishu" ? "zh-CN" : "en-US",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            Cookie:
              origin === "feishu"
                ? "open_locale=zh-CN; open_locale=zh-CN"
                : "open_locale=en-US; open_locale=en-US",
          },
        });
        json = await response.json();
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Failed to fetch from ${
                  origin === "feishu" ? "Feishu" : "Lark"
                } Document API`,
                detail: String(err),
                docPath: fullPath,
                docApiUrl: apiUrl,
              }),
            },
          ],
        };
      }

      // If the API returns an error, relay it as JSON
      if (!response.ok || json.code !== 0) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `${
                  origin === "feishu" ? "Feishu" : "Lark"
                } Document API returned error`,
                status: response.status,
                statusText: response.statusText,
                apiError: json,
                docPath: fullPath,
                docApiUrl: apiUrl,
              }),
            },
          ],
        };
      }

      // Return the raw JSON as the tool result, with a helpful description
      removeKeysDeep(json, [
        "golang-sdk",
        "java-sdk",
        "python-sdk",
        "nodejs-sdk",
        "c#-restsharp",
        "php-guzzle",
        "curl",
      ]);

      const contentInLine = json.data.content.split("\n");
      // if line count is more than 1200, truncate the intermediate content except the first 800 lines and last 400 lines
      if (contentInLine.length > 1200) {
        json.data.content =
          contentInLine.slice(0, 800).join("\n") +
          "\n\n\n...(Truncated due to line limit exceeded)...\n\n\n\n" +
          contentInLine.slice(-400).join("\n");
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              _mcp_tool_info: {
                description: `This is the raw JSON documentation data for a ${
                  origin === "feishu" ? "Feishu" : "Lark"
                } API doc page, fetched from the ${
                  origin === "feishu" ? "Feishu" : "Lark"
                } Document Portal API. The 'fullPath' parameter is the path part of the human-facing doc URL.`,
                docPath: fullPath,
                docApiUrl: apiUrl,
                humanDocUrl: `https://${baseDomain}/document/` + fullPath,
                note: "The structure of the JSON is not fixed. LLMs should process and interpret the fields as needed.",
              },
              ...json,
            }),
          },
        ],
      };
    },
  );
}
