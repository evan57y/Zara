/**
 * Replit Optimized GoatBot Runner
 * Original: NTKhang
 * Optimized by Siyuuuuu → Replit Edition
 */

const { spawn } = require("child_process");
const express = require("express");
const os = require("os");
const log = require("./logger/log.js");

const app = express();
const PORT = process.env.PORT || 3000;

let restartCount = 0;
const MAX_RESTARTS = 20;
const RESTART_DELAY = 2000;
const MEMORY_LIMIT_MB = 500;
const MEMORY_CHECK_INTERVAL = 20000;

// ─────────────────────────
// Health Endpoint (for uptime)
app.get("/", (req, res) => {
  res.send("Siyuu GoatBot Running 🚀");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    uptime: process.uptime().toFixed(0),
    memory: (process.memoryUsage().rss >> 20) + " MB",
    cpu: os.loadavg()[0].toFixed(2),
    restarts: restartCount,
    time: Date.now()
  });
});

// Replit friendly listen
app.listen(PORT, "0.0.0.0", () => {
  log.info(`🌐 Web running on port ${PORT}`);
});

// ─────────────────────────
// Bot Start Function
function startBot() {
  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: process.env
  });

  log.info(`🚀 GoatBot starting... attempt #${restartCount + 1}`);

  child.on("close", (code) => {
    if (code === 0) {
      log.info("Bot exited normally");
      return;
    }

    restartCount++;

    if (restartCount >= MAX_RESTARTS) {
      log.error("❌ Too many restarts. Stopping...");
      process.exit(1);
    }

    log.warn(`⚡ Restarting in ${RESTART_DELAY/1000}s...`);
    setTimeout(startBot, RESTART_DELAY);
  });

  child.on("error", (err) => {
    log.error("Spawn error:", err.message);
  });
}

// ─────────────────────────
// Memory Guard
setInterval(() => {
  const used = process.memoryUsage().rss >> 20;
  if (used > MEMORY_LIMIT_MB) {
    log.warn(`💥 Memory exceeded (${used}MB). Restarting...`);
    process.exit(1);
  }
}, MEMORY_CHECK_INTERVAL);

// ─────────────────────────
// Graceful Shutdown
["SIGINT", "SIGTERM"].forEach(sig =>
  process.on(sig, () => {
    log.info(`👋 Shutdown signal received (${sig})`);
    process.exit(0);
  })
);

// ─────────────────────────
// Start Bot
startBot();
