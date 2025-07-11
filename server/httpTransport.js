import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./mcpServer.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

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
    c.header("Access-Control-Allow-Headers", "Content-Type, MCP-Session-Id");
    c.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    if (c.req.method === "OPTIONS") return c.text("ok", 204);
    return await next();
  });

  // Session management for MCP
  const transports = new Map();

  // POST /mcp: main MCP endpoint
  app.post("/mcp", async (c) => {
    const sessionId = c.req.header("mcp-session-id");
    let transport;

    if (sessionId && transports.has(sessionId)) {
      // Existing session: reuse transport
      transport = transports.get(sessionId);
    } else {
      // New session: must be an initialize request
      const body = await c.req.json();
      if (!isInitializeRequest(body)) {
        return c.json(
          {
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: No valid session ID provided",
            },
            id: null,
          },
          400,
        );
      }
      // Create new transport and MCP server for this session
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports.set(sid, transport);
        },
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };
      const server = createMcpServer();
      await server.connect(transport);
    }
    // Handle the request
    await transport.handleRequest(c.req.raw, c.res, await c.req.json());
    return c.res;
  });

  // GET /mcp: SSE for server-to-client notifications
  app.get("/mcp", async (c) => {
    const sessionId = c.req.header("mcp-session-id");
    if (!sessionId || !transports.has(sessionId)) {
      return c.text("Invalid or missing session ID", 400);
    }
    const transport = transports.get(sessionId);
    await transport.handleRequest(c.req.raw, c.res);
    return c.res;
  });

  // DELETE /mcp: session termination
  app.delete("/mcp", async (c) => {
    const sessionId = c.req.header("mcp-session-id");
    if (!sessionId || !transports.has(sessionId)) {
      return c.text("Invalid or missing session ID", 400);
    }
    const transport = transports.get(sessionId);
    await transport.handleRequest(c.req.raw, c.res);
    return c.res;
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
