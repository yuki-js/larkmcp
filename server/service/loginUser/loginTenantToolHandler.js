// loginTenantToolHandler.js - Lark/Feishu テナント認証 (app_access_token取得) ハンドラ
import { getOAuthConfig } from "./OAuthConfig.js";

/**
 * Handler for the 'login_tenant' MCP tool.
 * Obtains the app_access_token for the Lark/Feishu tenant (app-level authentication).
 * @returns {Promise<object>} Tool result object
 */
export async function loginTenantHandler() {
  const { app_id, app_secret, origin } = getOAuthConfig();
  const baseDomain =
    origin === "feishu" ? "open.feishu.cn" : "open.larksuite.com";
  const url = `https://${baseDomain}/open-apis/auth/v3/tenant_access_token/internal`;

  let response, json, text;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        app_id,
        app_secret,
      }),
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
          text:
            `Failed to call ${
              origin === "feishu" ? "Feishu" : "Lark"
            } app_access_token API: ` + String(err),
        },
      ],
    };
  }

  if (!response.ok || !json || json.code !== 0) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: `${
              origin === "feishu" ? "Feishu" : "Lark"
            } app_access_token API returned error`,
            status: response.status,
            statusText: response.statusText,
            apiError: json,
            apiUrl: url,
          }),
        },
      ],
    };
  }
  // グローバルに tenant_access_token を記憶
  global.larkTenantAccessToken = json.tenant_access_token;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          expire: json.expire,
          apiUrl: url,
        }),
      },
    ],
  };
}
