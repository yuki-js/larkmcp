# MCP HTTP Server Usage (Hono)

This server supports both stdio and HTTP (Streamable HTTP) transports.

## Starting the HTTP Server

To start the MCP server in HTTP mode (using Hono):

```sh
larkmcp http
```

- The server will listen on the port specified by the `PORT` environment variable, or `3000` by default.
- Besides the main MCP endpoint, it also provides a OAuth redirect endpoint for user login, with dedicated port `14514` for OAuth redirection.
- The main MCP endpoint is `/mcp`.

## Endpoints

- `POST [::]:3000/mcp` — Main MCP endpoint for JSON-RPC requests (Streamable HTTP transport)
- `GET [::]:3000/mcp` — For server-to-client notifications (SSE, with session management)
- `DELETE [::]:3000/mcp` — For session termination
- `GET [::]:3000/health` — Health check endpoint to verify server status
- `GET [::]:14514/` — OAuth redirect endpoint for user login 

## Setting Load Balancer, L7 routing

If you use a load balancer, you need to treat both two ports (`3000` for MCP and `14514` for OAuth).
If you have set up the route to 14514, don't forget to set the `redirect_uri` in env var to match the load balancer's URL, and add it to white list in Lark developer console.

## Session Management

- The server supports session management as per the MCP Streamable HTTP spec.
- Each session is identified by the `MCP-Session-Id` header.

## CORS and Security

- CORS headers are set to allow all origins by default.
- For production, restrict allowed origins as needed.

## Example: Running the Server

```sh
PORT=8080 larkmcp http
```

## Example: MCP Inspector

You can test the HTTP server using the MCP Inspector:

```sh
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

## Notes

- The HTTP server is implemented using [Hono](https://hono.dev/), not Express.
- For more details on the MCP HTTP transport, see the [MCP documentation](https://modelcontextprotocol.io/docs/concepts/transports).