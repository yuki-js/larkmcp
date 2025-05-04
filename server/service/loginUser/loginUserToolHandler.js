import { getOAuthConfig } from "./OAuthConfig.js";
import { LoginSession } from "./LoginSession.js";
import { exchangeCodeForToken } from "./oauthTokenExchange.js";

/**
 * loginUser MCPツールのstep分岐・状態管理・レスポンス生成
 * @param {Object} params - { step }
 * @returns {Promise<Object>} MCPツールレスポンス
 */
export async function registerLoginUserToolHandler({ step }) {
  // シングルトンでセッション管理
  if (!global.__larkLoginSession) {
    global.__larkLoginSession = new LoginSession(getOAuthConfig());
  }
  const session = global.__larkLoginSession;

  if (step === "start") {
    await session.cleanup();
    await session.startOAuthServer();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            oauth_url: session.oauthUrl,
            message:
              "OAuth server started. Please present the URL to the user, and then after user has seen the URL, call 'poll' to check if the code has been received.",
          }),
        },
      ],
    };
  }

  if (step === "poll") {
    if (!session.isStarted()) {
      await session.cleanup();
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "OAuth server is not started. Please call 'start' first.",
          },
        ],
      };
    }
    if (session.hasError()) {
      await session.cleanup();
      return {
        isError: true,
        content: [
          {
            type: "text",
            text:
              "Failed to start temporary server: " + String(session.getError()),
          },
        ],
      };
    }

    // Long-polling: wait for codeReceived or timeout
    const waitResult = await session.waitForCodeOrTimeout(60 * 1000);
    if (!session.codeReceived && waitResult === "timeout") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              waiting: true,
              message: "Waiting for user to complete OAuth login...",
            }),
          },
        ],
      };
    }
    if (!session.codeReceived) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "No code received after waiting.",
          },
        ],
      };
    }

    // 認可コードをアクセストークンに交換
    const tokenResult = await exchangeCodeForToken(
      session.codeReceived,
      session.config
    );
    if (tokenResult.isError) {
      await session.cleanup();
      return tokenResult;
    }
    global.larkUserAccessToken = tokenResult.user_access_token;
    await session.cleanup();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ...tokenResult,
            message: "Successfully obtained user_access_token.",
          }),
        },
      ],
    };
  }

  // 不正なstep
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: "Invalid step parameter.",
      },
    ],
  };
}
