const path = require('path')

module.exports = {
  apps: [
    {
      name: 'jothidam-backend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
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
    },
    {
      name: 'jothidam-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: path.join(__dirname, '..', 'frontend'),
      interpreter: 'node',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOSTNAME: '0.0.0.0'
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000
    }
  ]
}
