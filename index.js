#!/usr/bin/env node

async function main() {
  const subcommand = process.argv[2];

  if (!subcommand || subcommand === "stdio") {
    // Default: stdio mode
    const { startStdioServer } = await import("./server/stdioTransport.js");
    await startStdioServer();
  } else if (subcommand === "http") {
    const { startHttpServer } = await import("./server/httpTransport.js");
    await startHttpServer();
  } else if (
    subcommand === "help" ||
    subcommand === "--help" ||
    subcommand === "-h"
  ) {
    printHelp();
  } else {
    console.error(`Unknown subcommand: ${subcommand}\n`);
    printHelp();
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: larkmcp <mode>

Modes:
  stdio   Start MCP server in stdio mode (default)
  http    Start MCP server in HTTP mode (Streamable HTTP, Hono-based)
  help    Show this help message

Examples:
  larkmcp stdio
  larkmcp http
`);
}

await main();
