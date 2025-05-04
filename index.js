/**
 * 🚨🚨🚨
 * ATTENTION: ALL AGENTS (LLMs, HUMANS, ETC.)
 *
 * Before attempting to fetch or guess any Lark API documentation path,
 * you MUST consult the documentation index:
 *   "a-full-list-of-available-lark-document.csv"
 *
 * This file contains the authoritative list of all available Lark documentation pages and their correct paths.
 *
 * Any agent that skips this step is likely to waste time, make mistakes, and repeat the same errors as previous LLMs.
 *
 * DO NOT GUESS DOC PATHS. ALWAYS CHECK THE INDEX FIRST.
 * 🚨🚨🚨
 */

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

// WaitSignal: simple wait/signal channel for async notification
class WaitSignal {
  constructor() {
    this.waiters = [];
    this.signaled = false;
  }
  wait(timeoutMs) {
    if (this.signaled) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = timeoutMs
        ? setTimeout(() => {
            this._remove(resolve);
            resolve();
          }, timeoutMs)
        : null;
      this.waiters.push(() => {
        if (timer) clearTimeout(timer);
        resolve();
      });
    });
  }
  signal() {
    this.signaled = true;
    this.waiters.forEach((resolve) => resolve());
    this.waiters = [];
  }
  reset() {
    this.signaled = false;
  }
  _remove(fn) {
    this.waiters = this.waiters.filter((f) => f !== fn);
  }
}
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import http from "http";

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

server.resource(
  "a-full-list-of-available-lark-document",
  "file://a-full-list-of-available-lark-document.csv/",
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          name: "a-full-list-of-available-lark-document.csv",
          description:
            "CSV file listing all available Lark documentation pages.",
          mimeType: "text/csv",
          text: `
Page Title,Document Path
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
  }
);

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
    // 🚨 New logic: Always check the documentation index before proceeding!
    // Embedded CSV from the resource definition above
    const docIndexCsv = `
Page Title,Document Path
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
`.trim();

    // Parse CSV to get all valid doc paths
    const validDocPaths = new Set(
      docIndexCsv
        .split("\n")
        .slice(1)
        .map((line) => line.split(",")[1]?.trim())
        .filter(Boolean)
    );

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

    // 🚨 Enforce: Only allow doc fetch if path is in the index!
    if (!validDocPaths.has(fullPath)) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `ERROR: The requested documentation path "${fullPath}" is not listed in the documentation index (a-full-list-of-available-lark-document.csv).
You MUST consult the documentation index and use a listed path. Do not guess or invent documentation paths.
If you believe this is an error, update the index first.`,
          },
        ],
      };
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
server.tool(
  "login_user",
  {
    step: z
      .enum(["start", "poll"])
      .describe(
        "'start' returns the OAuth URL and starts the local server. 'poll' checks if the OAuth code has been received and, if so, exchanges it for a token."
      ),
  },
  async ({ step }) => {
    // Helper: safely stop and cleanup the login state/server
    function cleanupLoginState() {
      if (global.larkLoginState) {
        const state = global.larkLoginState;
        if (state.server) {
          try {
            state.server.close();
          } catch {}
          state.server = null;
        }
        if (state.timeoutHandle) {
          clearTimeout(state.timeoutHandle);
          state.timeoutHandle = null;
        }
        state.started = false;
      }
    }

    // Helper: create a fresh login state object
    function createFreshLoginState() {
      return {
        server: null,
        codeReceived: null,
        serverError: null,
        started: false,
        port: 14514,
        oauthUrl: null,
        codeExchanged: false,
        tokenResult: null,
        waitSignal: new WaitSignal(),
        timeoutHandle: null,
      };
    }

    const APP_ID = process.env.LARK_APP_ID || "YOUR_APP_ID";
    const APP_SECRET = process.env.LARK_APP_SECRET || "YOUR_APP_SECRET";
    const REDIRECT_URI = "http://localhost:14514";
    const PORT = 14514;

    // Generate OAuth URL
    const oauthUrl = `https://open.larksuite.com/open-apis/authen/v1/index?app_id=${encodeURIComponent(
      APP_ID
    )}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&state=login`;

    if (step === "start") {
      // Always cleanup previous state/server before starting new session
      cleanupLoginState();
      global.larkLoginState = createFreshLoginState();
      const loginState = global.larkLoginState;

      // Start the server
      loginState.server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const code = url.searchParams.get("code");
        if (code) {
          loginState.codeReceived = code;
          // Signal all poll waiters
          if (loginState.waitSignal) {
            loginState.waitSignal.signal();
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Login successful!</h2><p>You may close this window.</p></body></html>"
          );
          setTimeout(() => {
            if (loginState.server) loginState.server.close();
            loginState.started = false;
          }, 100);
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h2>Missing code parameter.</h2></body></html>");
        }
      });
      loginState.server.on("error", (err) => {
        loginState.serverError = err;
        loginState.started = false;
      });
      loginState.server.listen(PORT, () => {
        // Server started
      });
      // Set a timeout to close the server after 3 minutes
      loginState.timeoutHandle = setTimeout(() => {
        if (loginState.server) {
          loginState.server.close();
          loginState.started = false;
          loginState.server = null;
          loginState.timeoutHandle = null;
        }
      }, 3 * 60 * 1000);
      loginState.started = true;
      loginState.oauthUrl = oauthUrl;
      loginState.codeReceived = null;
      loginState.serverError = null;
      loginState.codeExchanged = false;
      loginState.tokenResult = null;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              oauth_url: oauthUrl,
              message:
                "OAuth server started. Please present the URL to the user, and then after user has seen the URL, call 'poll' to check if the code has been received.",
            }),
          },
        ],
      };
    }

    // Always get the latest state for poll
    const loginState = global.larkLoginState;

    if (step === "poll") {
      if (!loginState || !loginState.started) {
        // If state is missing or not started, force cleanup and error
        cleanupLoginState();
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "OAuth server is not started. Please call 'start' first.",
            },
          ],
        };
      }
      if (loginState.serverError) {
        // On error, cleanup and error
        cleanupLoginState();
        return {
          isError: true,
          content: [
            {
              type: "text",
              text:
                "Failed to start temporary server: " +
                String(loginState.serverError),
            },
          ],
        };
      }

      // ロングポーリング: codeReceivedがセットされるか、タイムアウトまで返さない
      if (!loginState.codeReceived) {
        const waitResult = await Promise.race([
          (async () => {
            await loginState.waitSignal.wait(60 * 1000);
            return "signaled";
          })(),
          (async () => {
            await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
            return "timeout";
          })(),
        ]);
        if (!loginState.codeReceived && waitResult === "timeout") {
          // タイムアウト時のみ返す
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  waiting: true,
                  message: "Waiting for user to complete OAuth login...",
                }),
              },
            ],
          };
        }
        // シグナルで抜けた場合は次の処理へ進む
      }

      // Exchange code for user_access_token
      if (!loginState.codeReceived) {
        // それでもcodeReceivedが無い場合は異常
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "No code received after waiting.",
            },
          ],
        };
      }

      const tokenUrl =
        "https://open.larksuite.com/open-apis/authen/v1/access_token";
      let response, json;
      try {
        response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            app_id: APP_ID,
            app_secret: APP_SECRET,
            grant_type: "authorization_code",
            code: loginState.codeReceived,
            redirect_uri: REDIRECT_URI,
          }),
        });
        json = await response.json();
      } catch (err) {
        loginState.tokenResult = {
          isError: true,
          content: [
            {
              type: "text",
              text: "Failed to exchange code for token: " + String(err),
            },
          ],
        };
        loginState.codeExchanged = true;
        cleanupLoginState();
        return loginState.tokenResult;
      }
      if (!response.ok || json.code !== 0) {
        loginState.tokenResult = {
          isError: true,
          content: [
            {
              type: "text",
              text: "Lark OAuth API error: " + JSON.stringify(json),
            },
          ],
        };
        loginState.codeExchanged = true;
        cleanupLoginState();
        return loginState.tokenResult;
      }
      loginState.tokenResult = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              user_access_token: json.data.access_token,
              expires_in: json.data.expires_in,
              refresh_token: json.data.refresh_token,
              open_id: json.data.open_id,
              union_id: json.data.union_id,
              message: "Successfully obtained user_access_token.",
            }),
          },
        ],
      };
      global.larkUserAccessToken = json.data.access_token;
      loginState.codeExchanged = true;
      cleanupLoginState();
      return loginState.tokenResult;
    }

    // Should not reach here
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Invalid step parameter.",
        },
      ],
    };
  }
);

// Add a tool to test Lark API with the saved user_access_token
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
    if (!global.larkUserAccessToken) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "No user_access_token found. Please login first using the 'login_user' tool with step='start'.",
          },
        ],
      };
    }
    const apiUrl = `https://open.larksuite.com${endpoint}`;
    let response, json, text;
    try {
      response = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${global.larkUserAccessToken}`,
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
            text: "Failed to call Lark API: " + String(err),
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
          }),
        },
      ],
    };
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
