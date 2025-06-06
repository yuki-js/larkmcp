# LarkMCP

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@yuki-js/larkmcp.svg)](https://www.npmjs.com/package/@yuki-js/larkmcp)

A powerful Model Context Protocol (MCP) server that exposes Lark OpenAPI documentation and API endpoints as structured, machine-consumable resources and tools.  
Designed for seamless integration with LLMs, automation agents, and advanced developer workflows.

## Feishu（飞书）対応

- 環境変数 `LARK_ORIGIN` を `feishu` に設定することで、Lark（グローバル）だけでなく Feishu（中国版）API・ドキュメントにも対応できます。
- OAuth 認証・API リクエスト・ドキュメント取得時に自動的に `open.feishu.cn` ドメインや中国語リソースを利用します。
- 例: Feishu で起動する場合
  ```sh
  LARK_ORIGIN=feishu node index.js
  ```
- デフォルト（Lark グローバル）は `LARK_ORIGIN` を省略または `lark` にしてください。

## Usage

You can run the MCP server directly via npx (after publishing to npm):

```sh
npx @yuki-js/larkmcp
```

---

## Features

- **MCP Server**: Provides Lark documentation and API access via the Model Context Protocol.
- **Lark Docs as Resources**: Full index of Lark OpenAPI documentation available as a CSV resource.
- **Fetch Lark Docs**: Retrieve any Lark documentation page as structured JSON, ready for LLM consumption.
- **User OAuth & API Proxy**: Authenticate via OAuth and proxy requests to Lark OpenAPI endpoints.
- **Extensible**: Easily add new tools or resources for your own LLM/MCP workflows.
- **Modern Node.js**: Built with ES modules, async/await, and strong typing via Zod.

---

## Architecture

```
+-------------------+      MCP Protocol      +-----------------------------+
|   LLM / Client    | <------------------->  |  Lark OpenAPI Docs MCP      |
+-------------------+                        +-----------------------------+
                                                  |   |   |   |
                                                  |   |   |   |
                                                  v   v   v   v
                                         [Lark Docs] [Lark API] [OAuth]
```

- **MCP Server**: Handles all requests via the Model Context Protocol (stdio transport).
- **Tools**: Expose Lark doc fetch, user login, and API proxy as callable MCP tools.
- **Resources**: Serve a full CSV index of Lark documentation.

---

## Getting Started

### Prerequisites

- Node.js v22+ recommended
- npm

### Installation

```bash
git clone https://github.com/yuki-js/larkmcp.git
cd larkmcp
npm install @yuki-js/larkmcp
```

### Running the MCP Server

```bash
node index.js
```

The server will start and listen for MCP stdio connections.

---

## Usage

You can connect to this MCP server from any MCP-compatible client, LLM, or automation agent.

### Example: Fetching Lark Documentation

#### 1. List all available Lark docs

Access the resource:

```
Resource URI: file://a-full-list-of-available-lark-document.csv/
Description: CSV file listing all available Lark documentation pages.
```

#### 2. Fetch a specific Lark doc as JSON

Call the `fetch_lark_doc` tool:

```json
{
  "tool": "fetch_lark_doc",
  "arguments": {
    "url": "https://open.larksuite.com/document/server-docs/docs/docs/docx-v1/document/list"
  }
}
```

#### 3. Authenticate and Call Lark API

- Use the `login_user` tool to start OAuth and obtain a user access token.
- Use the `test_lark_api` tool to call any Lark OpenAPI endpoint.

Example:

```json
{
  "tool": "login_user",
  "arguments": { "step": "start" }
}
```

Then poll for completion:

```json
{
  "tool": "login_user",
  "arguments": { "step": "poll" }
}
```

Once authenticated, call the API:

```json
{
  "tool": "test_lark_api",
  "arguments": {
    "endpoint": "/open-apis/contact/v3/user/me",
    "method": "GET"
  }
}
```

---

## MCP Tools & Resources

### Tools

#### `fetch_lark_doc`

- **Description**: Fetches a Lark documentation page as raw JSON.
- **Arguments**:
  - `url` (string): Human-facing Lark doc URL or path.
- **Returns**: JSON with doc content and metadata.

#### `login_user`

- **Description**: Initiates OAuth login flow for Lark API.
- **Arguments**:
  - `step` ("start" | "poll"): Start OAuth or poll for completion.
- **Returns**: OAuth URL (start) or access token (poll).

#### `test_lark_api`

- **Description**: Calls any Lark OpenAPI endpoint with the authenticated user.
- **Arguments**:
  - `endpoint` (string): Lark API endpoint path.
  - `method` (string, optional): HTTP method (default: GET).
  - `body` (object, optional): Request body for POST/PUT.
- **Returns**: API response (status, headers, body).

### Resources

#### `a-full-list-of-available-lark-document`

- **URI**: `file://a-full-list-of-available-lark-document.csv/`
- **Description**: CSV file listing all available Lark documentation pages.

---

## Developer Experience

### Recommended VSCode Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

> 推奨拡張は `.vscode/extensions.json` でも自動提案されます。

### Code Linting & Formatting

- 静的解析:
  ```sh
  npm run lint
  ```
- コード整形:
  ```sh
  npm run format
  ```

`.eslintrc.json` でESLintルールをカスタマイズできます。

Prettierの設定はプロジェクトで強制していません。各自の好みに合わせて`.prettierrc`を編集・利用してください（デフォルトは空設定です）。

---

## Development

### Project Structure

```
.
├── index.js
├── package.json
├── server/
│   ├── mcpServer.js
│   ├── resources/
│   │   └── larkDocIndex.js
│   └── tools/
│       ├── fetchLarkDoc.js
│       ├── loginUser.js
│       └── testLarkApi.js
├── data/
│   └── a-full-list-of-available-lark-document.csv
└── utils/
```

### Adding New Tools/Resources

- Implement your tool/resource in `server/tools/` or `server/resources/`.
- Register it in `server/mcpServer.js`.

### Contributing

Pull requests and issues are welcome!  
Please open an issue to discuss your ideas or report bugs.

---

## License

This project is licensed under the ISC License.

---

## Acknowledgements

- [Lark Open Platform](https://open.larksuite.com/)
- [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol)
- [Zod](https://github.com/colinhacks/zod)
