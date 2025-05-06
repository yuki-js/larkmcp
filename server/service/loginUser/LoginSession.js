import { OAuthHttpServer } from "./OAuthHttpServer.js";

/**
 * LoginSession: OAuth認可フローの状態・セッション管理
 */
export class LoginSession {
  constructor(config) {
    this.config = config;
    this.httpServer = new OAuthHttpServer(
      config.port,
      this._onRequest.bind(this),
    );
    this.oauthUrl = this._buildOAuthUrl();
    this.codeReceived = null;
    this.serverError = null;
    this.started = false;
    this.waitSignal = null;
  }

  _buildOAuthUrl() {
    const { app_id, redirect_uri } = this.config;
    return `https://open.larksuite.com/open-apis/authen/v1/index?app_id=${encodeURIComponent(
      app_id,
    )}&redirect_uri=${encodeURIComponent(
      redirect_uri,
    )}&response_type=code&state=login`;
  }

  async startOAuthServer() {
    this.codeReceived = null;
    this.serverError = null;
    this.started = false;
    this.waitSignal = this.httpServer.createWaitSignal();
    await this.httpServer.start();
    this.started = true;
  }

  async cleanup() {
    await this.httpServer.stop();
    this.started = false;
    this.codeReceived = null;
    this.serverError = null;
    this.waitSignal = null;
  }

  isStarted() {
    return this.started;
  }

  hasError() {
    return !!this.serverError;
  }

  getError() {
    return this.serverError;
  }

  async waitForCodeOrTimeout(timeoutMs) {
    if (this.codeReceived) return "signaled";
    return (await this.waitSignal.wait(timeoutMs)) ? "signaled" : "timeout";
  }

  // HTTPサーバーから呼ばれる
  _onRequest({ code, error }) {
    if (code) {
      this.codeReceived = code;
      if (this.waitSignal) this.waitSignal.signal();
    }
    if (error) {
      this.serverError = error;
      if (this.waitSignal) this.waitSignal.signal();
    }
  }
}
