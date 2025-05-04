import { z } from "zod";
import removeKeysDeep from "../../utils/removeKeysDeep.js";

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
          "Human-facing Lark documentation URL (e.g. https://open.larksuite.com/document/server-docs/docs/docs/docx-v1/document/list) or a Lark doc path (e.g. /server-docs/docs/docs/docx-v1/document/list)"
        ),
    },
    async ({ url }) => {
      // Extract the fullPath from the human URL or accept a path directly
      let fullPath = null;
      try {
        // If it's a full URL, extract the path after /document/
        const m = url.match(/open\.larksuite\.com\/document\/([^?]+)/);
        if (m) {
          // m[1] is the path part, may or may not start with /
          fullPath = m[1].startsWith("/") ? m[1] : "/" + m[1];
        } else if (url.startsWith("/")) {
          fullPath = url;
        } else {
          // fallback: treat as path, add leading slash
          fullPath = "/" + url;
        }
      } catch (e) {
        // fallback: treat as path, add leading slash
        fullPath = "/" + url;
      }

      // Lark Document Fetch API endpoint for LLMs
      const apiUrl = `https://open.larksuite.com/document_portal/v1/document/get_detail?fullPath=${encodeURIComponent(
        fullPath
      )}`;
      let response;
      let json;
      try {
        response = await fetch(apiUrl, {
          headers: {
            "Accept-Language": "en-US",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            Cookie: "open_locale=en-US; open_locale=en-US",
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
                error: "Failed to fetch from Lark Document API",
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
                error: "Lark Document API returned error",
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
                description:
                  "This is the raw JSON documentation data for a Lark API doc page, fetched from the Lark Document Portal API. The 'fullPath' parameter is the path part of the human-facing Lark doc URL. See https://open.larksuite.com/document/server-docs/docs/docs/docx-v1/document/list for details.",
                docPath: fullPath,
                docApiUrl: apiUrl,
                humanDocUrl: "https://open.larksuite.com/document/" + fullPath,
                note: "The structure of the JSON is not fixed. LLMs should process and interpret the fields as needed.",
              },
              ...json,
            }),
          },
        ],
      };
    }
  );
}
