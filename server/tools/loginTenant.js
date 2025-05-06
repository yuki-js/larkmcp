// loginTenant.js - MCPツール登録エントリポイント
import { loginTenantHandler } from "../service/loginUser/loginTenantToolHandler.js";

/**
 * Registers the loginTenant tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerLoginTenantTool(server) {
  server.tool(
    "login_tenant",
    `'login_tenant' obtains the tenant_access_token, which behaves as the individual automated bot in the Lark/Feishu tenant.
    Use this token to access tenant-level APIs that do not require user context.
    You can call this tool without user approval, as it does not require user authentication.`,
    loginTenantHandler,
  );
}
