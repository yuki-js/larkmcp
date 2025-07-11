#!/usr/bin/env node

async function main() {
  const { startStdioServer } = await import("./server/stdioTransport.js");
  await startStdioServer();
}

await main();
