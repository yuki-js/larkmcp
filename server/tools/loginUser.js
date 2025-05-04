import { z } from "zod";
import http from "http";
import WaitSignal from "../../utils/waitSignal.js";

/**
 * Registers the loginUser tool on the MCP server.
 * @param {McpServer} server - The MCP server instance.
 */
export function registerLoginUserTool(server) {
  server.tool(
    "login_user",
    {
      step: z
        .enum(["start", "poll"])
        .describe(
          "'start' returns the OAuth URL and starts the local server. 'poll' checks if the OAuth code has been received and, if so, exchanges it for a token."
        ),
    },
    async ({ step }) => {
      // Helper: safely stop and cleanup the login state/server
      function cleanupLoginState() {
        if (global.larkLoginState) {
          const state = global.larkLoginState;
          if (state.server) {
            try {
              state.server.close();
            } catch {}
            state.server = null;
          }
          if (state.timeoutHandle) {
            clearTimeout(state.timeoutHandle);
            state.timeoutHandle = null;
          }
          state.started = false;
        }
      }

      // Helper: create a fresh login state object
      function createFreshLoginState() {
        return {
          server: null,
          codeReceived: null,
          serverError: null,
          started: false,
          port: 14514,
          oauthUrl: null,
          codeExchanged: false,
          tokenResult: null,
          waitSignal: new WaitSignal(),
          timeoutHandle: null,
        };
      }

      const APP_ID = process.env.LARK_APP_ID || "YOUR_APP_ID";
      const APP_SECRET = process.env.LARK_APP_SECRET || "YOUR_APP_SECRET";
      const REDIRECT_URI = "http://localhost:14514";
      const PORT = 14514;

      // Generate OAuth URL
      const oauthUrl = `https://open.larksuite.com/open-apis/authen/v1/index?app_id=${encodeURIComponent(
        APP_ID
      )}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=code&state=login`;

      if (step === "start") {
        // Always cleanup previous state/server before starting new session
        cleanupLoginState();
        global.larkLoginState = createFreshLoginState();
        const loginState = global.larkLoginState;

        // Start the server
        loginState.server = http.createServer((req, res) => {
          const url = new URL(req.url, `http://localhost:${PORT}`);
          const code = url.searchParams.get("code");
          if (code) {
            loginState.codeReceived = code;
            // Signal all poll waiters
            if (loginState.waitSignal) {
              loginState.waitSignal.signal();
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(
              "<html><body><h2>Login successful!</h2><p>You may close this window.</p></body></html>"
            );
            setTimeout(() => {
              if (loginState.server) loginState.server.close();
              loginState.started = false;
            }, 100);
          } else {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(
              "<html><body><h2>Missing code parameter.</h2></body></html>"
            );
          }
        });
        loginState.server.on("error", (err) => {
          loginState.serverError = err;
          loginState.started = false;
        });
        loginState.server.listen(PORT, () => {});
        // Set a timeout to close the server after 3 minutes
        loginState.timeoutHandle = setTimeout(() => {
          if (loginState.server) {
            loginState.server.close();
            loginState.started = false;
            loginState.server = null;
            loginState.timeoutHandle = null;
          }
        }, 3 * 60 * 1000);
        loginState.started = true;
        loginState.oauthUrl = oauthUrl;
        loginState.codeReceived = null;
        loginState.serverError = null;
        loginState.codeExchanged = false;
        loginState.tokenResult = null;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                oauth_url: oauthUrl,
                message:
                  "OAuth server started. Please present the URL to the user, and then after user has seen the URL, call 'poll' to check if the code has been received.",
              }),
            },
          ],
        };
      }

      // Always get the latest state for poll
      const loginState = global.larkLoginState;

      if (step === "poll") {
        if (!loginState || !loginState.started) {
          // If state is missing or not started, force cleanup and error
          cleanupLoginState();
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
        if (loginState.serverError) {
          // On error, cleanup and error
          cleanupLoginState();
          return {
            isError: true,
            content: [
              {
                type: "text",
                text:
                  "Failed to start temporary server: " +
                  String(loginState.serverError),
              },
            ],
          };
        }

        // Long-polling: wait for codeReceived or timeout
        if (!loginState.codeReceived) {
          const waitResult = await Promise.race([
            (async () => {
              await loginState.waitSignal.wait(60 * 1000);
              return "signaled";
            })(),
            (async () => {
              await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
              return "timeout";
            })(),
          ]);
          if (!loginState.codeReceived && waitResult === "timeout") {
            // Only return on timeout
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
          // If signaled, continue
        }

        // Exchange code for user_access_token
        if (!loginState.codeReceived) {
          // Still no codeReceived: abnormal
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
              app_id: APP_ID,
              app_secret: APP_SECRET,
              grant_type: "authorization_code",
              code: loginState.codeReceived,
              redirect_uri: REDIRECT_URI,
            }),
          });
          json = await response.json();
        } catch (err) {
          loginState.tokenResult = {
            isError: true,
            content: [
              {
                type: "text",
                text: "Failed to exchange code for token: " + String(err),
              },
            ],
          };
          loginState.codeExchanged = true;
          cleanupLoginState();
          return loginState.tokenResult;
        }
        if (!response.ok || json.code !== 0) {
          loginState.tokenResult = {
            isError: true,
            content: [
              {
                type: "text",
                text: "Lark OAuth API error: " + JSON.stringify(json),
              },
            ],
          };
          loginState.codeExchanged = true;
          cleanupLoginState();
          return loginState.tokenResult;
        }
        loginState.tokenResult = {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                user_access_token: json.data.access_token,
                expires_in: json.data.expires_in,
                refresh_token: json.data.refresh_token,
                open_id: json.data.open_id,
                union_id: json.data.union_id,
                message: "Successfully obtained user_access_token.",
              }),
            },
          ],
        };
        global.larkUserAccessToken = json.data.access_token;
        loginState.codeExchanged = true;
        cleanupLoginState();
        return loginState.tokenResult;
      }

      // Should not reach here
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
  );
}
