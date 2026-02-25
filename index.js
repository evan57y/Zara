/**
 * @author NTKhang & Optimized by siyuuuuu→ Ultra-fast smooth version
 * ! Original: https://github.com/ntkhang03/Goat-Bot-V2
 */

const { spawn } = require("child_process");
const express = require("express");
const os = require("os");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 3000;

// ────────────────────────────────────────────────
// Fast & lightweight health endpoint
app.get(["/", "/health", "/status"], (req, res) => {
  res.json({
    status: "online ✅",
    uptimeSec: process.uptime().toFixed(0),
    memoryMB: (process.memoryUsage().rss >> 20).toFixed(1),
    cpuLoad: os.loadavg()[0].toFixed(2),
    restarts: restartCount,
    ts: Date.now()
  });
});

app.listen(PORT, () => log.info(`🌐 Status server → http://localhost:${PORT}`));

// ────────────────────────────────────────────────
// Bot Restart Logic
let restartCount = 0;
const MAX_RESTARTS = 15;
const RESTART_DELAY = 1500; // 1.5s fast but safe
const MEMORY_LIMIT_MB = 500; // higher tolerance for smooth run
const MEMORY_CHECK_INTERVAL = 20000; // 20s

function startBot() {
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_NO_WARNINGS: "1" }
  });

  log.info(`🚀 Siyuuus GoatBot starting... attempt #${restartCount + 1}`);

  child.on("close", (code) => {
    if (code === 0) return log.info("Bot exited normally ✅");

    restartCount++;
    if (restartCount >= MAX_RESTARTS) {
      log.error(`❌ Too many restarts (${restartCount})`);
      process.exit(1);
    }

    log.warn(`⚡ Restarting in ${RESTART_DELAY / 1000}s → [${restartCount}/${MAX_RESTARTS}] (code: ${code})`);
    setTimeout(startBot, RESTART_DELAY);
  });

  child.on("error", (err) => log.error("Spawn error:", err.message));
}

// ────────────────────────────────────────────────
// Ultra-light memory guard
setInterval(() => {
  const usedMB = process.memoryUsage().rss >> 20;
  if (usedMB > MEMORY_LIMIT_MB) {
    log.warn(`💥 Memory limit exceeded: ${usedMB}MB → restarting`);
    process.exit(1);
  }
}, MEMORY_CHECK_INTERVAL);

// ────────────────────────────────────────────────
// Clean graceful shutdown
["SIGINT", "SIGTERM"].forEach(sig =>
  process.on(sig, () => {
    log.info(`👋 Received ${sig}, shutting down...`);
    process.exit(0);
  })
);

// ────────────────────────────────────────────────
// Start bot
startBot();
