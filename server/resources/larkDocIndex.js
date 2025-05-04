import fs from "fs/promises";
import path from "path";

/**
 * Registers the Lark documentation CSV index as a resource on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export async function registerLarkDocIndexResource(server) {
  const csvPath = path.resolve(
    "data/a-full-list-of-available-lark-document.csv"
  );
  const csvText = await fs.readFile(csvPath, "utf-8");

  server.resource(
    "a-full-list-of-available-lark-document",
    "file://a-full-list-of-available-lark-document.csv/",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          name: "a-full-list-of-available-lark-document.csv",
          description:
            "CSV file listing all available Lark documentation pages.",
          mimeType: "text/csv",
          text: csvText,
        },
      ],
    })
  );
}
