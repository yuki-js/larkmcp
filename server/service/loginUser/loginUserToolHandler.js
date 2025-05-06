import { getOAuthConfig } from "./OAuthConfig.js";
import { LoginSession } from "./LoginSession.js";
import { exchangeCodeForToken } from "./oauthTokenExchange.js";

/**
 * loginUser MCPツールのstep分岐・状態管理・レスポンス生成
 * @param {Object} params - { step }
 * @returns {Promise<Object>} MCPツールレスポンス
 */
export async function loginUserStartHandler() {
  // シングルトンでセッション管理
  if (!global.__larkLoginSession) {
    global.__larkLoginSession = new LoginSession(getOAuthConfig());
  }
  const session = global.__larkLoginSession;

  await session.cleanup();
  await session.startOAuthServer();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          oauth_url: session.oauthUrl,
          message:
            "OAuth server started. Please present the URL to the user, and shortly after showing the URL, immediately call 'login_user_poll' to poll for the code. You don't need to ask the user if they have completed the login, just call 'login_user_poll' after a few seconds. But you must present the URL to the user first.",
        }),
      },
    ],
  };
}

export async function loginUserPollHandler() {
  // シングルトンでセッション管理
  if (!global.__larkLoginSession) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "OAuth server is not started. Please call 'login_user_start' first.",
        },
      ],
    };
  }
  const session = global.__larkLoginSession;

  if (!session.isStarted()) {
    await session.cleanup();
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "OAuth server is not started. Please call 'login_user_start' first.",
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
            message:
              "Waiting for user to complete OAuth login... Please call 'login_user_poll' again.",
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
    session.config,
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
