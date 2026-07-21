module.exports = {
  apps: [
    {
      name: 'jothidam-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: 'c:\\WM Apps\\2026 Applications\\Astrology Project\\source code\\files\\AstrologyProject_SourceCode\\source',
      interpreter: 'node',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
}
