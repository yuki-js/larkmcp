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

server.resource("pagelist", "file://pagelist.csv/", async (uri) => {
  return {
    contents: [
      {
        uri: uri.href,
        name: "pagelist.csv",
        description: "CSV file listing Lark API documentation pages.",
        mimeType: "text/csv",
        text: `
ページ名,URL
Docs Overview,/server-docs/docs/docs-overview
Docs Overview and Best Practice,/server-docs/docs/docs-faq
Document overview,/server-docs/docs/docs/docx-v1/docx-overview
Document FAQs,/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq
Document,/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/document
Block,/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block
Emoji,/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/emoji
Create Document,/server-docs/docs/docs/docx-v1/document/create
Query Document,/server-docs/docs/docs/docx-v1/document/get
Query Document Raw Content,/server-docs/docs/docs/docx-v1/document/raw_content
Query All Blocks,/server-docs/docs/docs/docx-v1/document/list
Create Block,/server-docs/docs/docs/docx-v1/document-block/create
Create nested blocks,/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create
Update Block,/server-docs/docs/docs/docx-v1/document-block/patch
Query Block,/server-docs/docs/docs/docx-v1/document-block/get
Query Block Children,/server-docs/docs/docs/docx-v1/document-block/get-2
Batch Update Blocks,/server-docs/docs/docs/docx-v1/document-block/batch_update
Delete Blocks,/server-docs/docs/docs/docx-v1/document-block/batch_delete
Upgraded Docs OpenAPI Access Guide,/server-docs/docs/docs/upgraded-docs-openapi-access-guide
Overview,/server-docs/docs/bitable-v1/bitable-overview
Base Data Structure Overview,/server-docs/docs/bitable-v1/bitable-structure
Copy App,/server-docs/docs/bitable-v1/app/copy
Create App,/server-docs/docs/bitable-v1/app/create
Get App Info,/server-docs/docs/bitable-v1/app/get
Update App Name,/server-docs/docs/bitable-v1/app/update
Create table,/server-docs/docs/bitable-v1/app-table/create
Batch create table,/server-docs/docs/bitable-v1/app-table/batch_create
Delete Table,/server-docs/docs/bitable-v1/app-table/delete
Batch delete table,/server-docs/docs/bitable-v1/app-table/batch_delete
Update data table,/server-docs/docs/bitable-v1/app-table/patch
List all tables,/server-docs/docs/bitable-v1/app-table/list
Update View,/server-docs/docs/bitable-v1/app-table-view/patch
Get View,/server-docs/docs/bitable-v1/app-table-view/get
List Views,/server-docs/docs/bitable-v1/app-table-view/list
Add View,/server-docs/docs/bitable-v1/app-table-view/create
Delete View,/server-docs/docs/bitable-v1/app-table-view/delete
Record filter development guide,/server-docs/docs/bitable-v1/app-table-record/filter
Record filter guide,/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide
Base Record Data Structure Overview,/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/bitable-record-data-structure-overview
Get records,/server-docs/docs/bitable-v1/app-table-record/get
List records,/server-docs/docs/bitable-v1/app-table-record/list
search records,/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search
Create a record,/server-docs/docs/bitable-v1/app-table-record/create
Update a record,/server-docs/docs/bitable-v1/app-table-record/update
Delete a record,/server-docs/docs/bitable-v1/app-table-record/delete
Create records,/server-docs/docs/bitable-v1/app-table-record/batch_create
Update records,/server-docs/docs/bitable-v1/app-table-record/batch_update
Delete records,/server-docs/docs/bitable-v1/app-table-record/batch_delete
Field edit development guide,/server-docs/docs/bitable-v1/app-table-field/guide
Attachment Field,/server-docs/docs/bitable-v1/app-table-field/attachment
List fields,/server-docs/docs/bitable-v1/app-table-field/list
Create field,/server-docs/docs/bitable-v1/app-table-field/create
Update field,/server-docs/docs/bitable-v1/app-table-field/update
Delete field,/server-docs/docs/bitable-v1/app-table-field/delete
Base Overview,/server-docs/docs/bitable-v1/notification
Get Document Comments in Pages,/server-docs/docs/drive-v1/CommentAPI/list
Batch Query Comments,/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment/batch_query
Solve or Restore a Comment,/server-docs/docs/drive-v1/CommentAPI/patch
Add a Global Comment,/server-docs/docs/drive-v1/CommentAPI/create
Get a Global Comment,/server-docs/docs/drive-v1/CommentAPI/get
Get Replies List,/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment-reply/list
Update Reply,/server-docs/docs/drive-v1/CommentAPI/update
Delete Reply,/server-docs/docs/drive-v1/CommentAPI/delete
Subscribe to Events,/server-docs/docs/events
`,
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
