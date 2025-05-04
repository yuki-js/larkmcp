/**
 * 認可コードをLark OAuth APIでアクセストークンに交換する純粋関数
 * @param {string} code
 * @param {object} config - { app_id, app_secret, redirect_uri }
 * @returns {Promise<object>} { user_access_token, expires_in, refresh_token, open_id, union_id } or { isError, content }
 */
export async function exchangeCodeForToken(code, config) {
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
        app_id: config.app_id,
        app_secret: config.app_secret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirect_uri,
      }),
    });
    json = await response.json();
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Failed to exchange code for token: " + String(err),
        },
      ],
    };
  }
  if (!response.ok || json.code !== 0) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Lark OAuth API error: " + JSON.stringify(json),
        },
      ],
    };
  }
  return {
    user_access_token: json.data.access_token,
    expires_in: json.data.expires_in,
    refresh_token: json.data.refresh_token,
    open_id: json.data.open_id,
    union_id: json.data.union_id,
  };
}
