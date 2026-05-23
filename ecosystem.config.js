// ecosystem.config.js
// PM2 process manager config for VPS deployment
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    // ─── Watcher Orchestrator ────────────────────────────────
    {
      name: 'xelpay-watcher',
      script: 'src/workers/watcher-orchestrator.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx/esm',
      cwd: '/home/ubuntu/xelpay',  // Update to your project root
      instances: 1,                // MUST be 1 — single orchestrator
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
      env_file: '.env.local',     // Load from your existing .env.local
      error_file: 'logs/watcher-error.log',
      out_file: 'logs/watcher-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
