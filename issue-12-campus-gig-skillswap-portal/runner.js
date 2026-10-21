const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting CampusConnect (Backend: http://localhost:5000 | Frontend: http://localhost:5173)...');

const backend = spawn('node', ['backend/server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev', '--', '--host'], {
  cwd: __dirname,
  stdio: 'inherit'
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Shutting down CampusConnect services...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
