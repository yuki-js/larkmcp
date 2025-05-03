// 指定したキー群を再帰的に削除する（in-place）関数のみを残す
function removeKeysDeep(obj, keysToRemove) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => removeKeysDeep(item, keysToRemove));
  } else if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (keysToRemove.includes(key)) {
        delete obj[key];
      } else {
        removeKeysDeep(obj[key], keysToRemove);
      }
    }
  }
}

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// MCP Server definition
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

// pagelist.csv をリソースとして提供
import { promises as fs } from "fs";
import path from "path";
server.resource("pagelist", "file://pagelist.csv", async (uri) => {
  // pagelist.csv is in the same directory as this script
  const filePath = path.resolve(process.cwd(), "pagelist.csv");
  let text;
  try {
    text = await fs.readFile(filePath, "utf8");
  } catch (err) {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: `Error reading pagelist.csv: ${err.message}`,
        },
      ],
    };
  }
  return {
    contents: [
      {
        uri: uri.href,
        name: "pagelist.csv",
        description: "CSV file listing Lark API documentation pages.",
        mimeType: "text/csv",
        text,
      },
    ],
  };
});

// Add a tool for Lark API documentation fetch
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
          // JSONかつen=USのデータを希望
          "Accept-Language": "en-US",
          Accept: "application/json",
          // Lark Document API requires a User-Agent header
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          // open_locale	"en-US"
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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
