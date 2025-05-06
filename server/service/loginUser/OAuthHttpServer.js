import http from "http";
import WaitSignal from "../../../utils/waitSignal.js";

/**
 * OAuthHttpServer: HTTPサーバーの起動・停止・リクエスト処理専用クラス
 */
export class OAuthHttpServer {
  constructor(port, onRequest) {
    this.port = port;
    this.onRequest = onRequest;
    this.server = null;
    this.waitSignal = new WaitSignal();
    this.timeoutHandle = null;
  }

  createWaitSignal() {
    this.waitSignal = new WaitSignal();
    return this.waitSignal;
  }

  async start() {
    if (this.server) await this.stop();
    this.server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${this.port}`);
        const code = url.searchParams.get("code");
        if (code) {
          this.onRequest({ code });
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<html><body><h2>Login successful!</h2><p>You may close this window.</p></body></html>",
          );
          setTimeout(() => {
            if (this.server) this.server.close();
          }, 100);
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<html><body><h2>Missing code parameter.</h2></body></html>");
        }
      } catch (err) {
        this.onRequest({ error: err });
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Internal server error.</h2></body></html>");
      }
    });
    this.server.on("error", (err) => {
      this.onRequest({ error: err });
    });
    await new Promise((resolve) => this.server.listen(this.port, resolve));
    // 3分で自動停止
    this.timeoutHandle = setTimeout(
      () => {
        if (this.server) {
          this.server.close();
          this.server = null;
          this.timeoutHandle = null;
        }
      },
      3 * 60 * 1000,
    );
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
      this.server = null;
    }
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }
}
