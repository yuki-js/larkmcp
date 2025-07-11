/**
 * OAuthConfig: 環境変数や定数からOAuth設定を取得
 */
export function getOAuthConfig() {
  const origin = process.env.LARK_ORIGIN === "feishu" ? "feishu" : "lark";
  return {
    app_id: process.env.LARK_APP_ID || "YOUR_APP_ID",
    app_secret: process.env.LARK_APP_SECRET || "YOUR_APP_SECRET",
    redirect_uri: process.env.REDIRECT_URL || "http://localhost:14514",
    port: 14514,
    origin, // "lark" or "feishu"
  };
}
