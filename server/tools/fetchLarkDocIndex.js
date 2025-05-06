import fs from "fs/promises";
import path from "path";

const csvPath = path.join(
  path.dirname(import.meta.url.replace("file://", "")),
  "..",
  "..",
  "data",
  "a-full-list-of-available-lark-document.csv",
);
let csvText;
try {
  csvText = await fs.readFile(csvPath, "utf-8");
} catch (err) {
  console.error("Error reading CSV file:", err);
  throw new Error("Failed to read CSV file");
}

/**
 * Registers the fetchLarkDocIndex tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerFetchLarkDocIndexTool(server) {
  server.tool(
    "fetch_lark_doc_index",
    `Returns a table of contents of Lark API documentation. 
    You are strongly advised to call this for the first time, in order to know what documents are available and what you can do with Lark APIs. 
    This is a CSV file containing the full list of available Lark documents. Use fetch_lark_doc to fetch a specific document contents.`,
    async () => {
      return {
        content: [
          {
            type: "text",
            text: csvText,
          },
        ],
      };
    },
  );
}
