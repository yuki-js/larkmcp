import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcpServer.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { toFetchResponse, toReqRes } from "fetch-to-node";
/**
 * Starts the MCP server with HTTP (Streamable HTTP) transport using Hono.
 * MCP endpoint: /mcp
 * Listens on process.env.PORT or 3000 by default.
 */
export async function startHttpServer() {
  const app = new Hono();
  app.use("*", async (c, next) => {
    // CORS and security headers (optional, can be extended)
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    c.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    if (c.req.method === "OPTIONS") return c.text("ok", 204);
    return await next();
  });

  // POST /mcp: main MCP endpoint (stateless, new transport/server per request)
  app.post("/:secret/mcp", async (c) => {
    // Ensure the secret matches the configured secret
    if (
      process.env.MCP_SECRET.length < 32 ||
      c.req.param("secret") !== process.env.MCP_SECRET
    ) {
      return c.text("Forbidden", 403);
    }
    const { req, res } = toReqRes(c.req.raw);
    const server = createMcpServer();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, await c.req.json());
      res.on("close", () => {
        transport.close();
        server.close();
      });
      return toFetchResponse(res);
    } catch (error) {
      return c.json({ error: error?.message || String(error) }, 500);
    }
  });
  // health check endpoint
  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  // Start the Hono server
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  console.log(
    `[MCP] MCP server, HTTP transport mode, is listening on port ${port}/tcp`,
  );
  serve({ fetch: app.fetch, port });
}
