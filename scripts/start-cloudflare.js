const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

console.log('🚀 Starting Cloudflare Tunnel (100% Free, Zero Warning Pages, HTTP/2)...');

// Always use --protocol http2 to avoid UDP/QUIC drops and Error 1033
const cf = spawn('cloudflared', ['tunnel', '--protocol', 'http2', '--url', 'http://localhost:3000'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let urlFound = false;
let app = null;

function handleOutput(data) {
  const str = data.toString();
  
  if (!urlFound) {
    const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      urlFound = true;
      const tunnelUrl = match[0];
      
      console.log('\n======================================================');
      console.log('🎉 ZERO-WARNING TUNNEL IS READY & ONLINE:');
      console.log(`👉 ${tunnelUrl}`);
      console.log('======================================================\n');
      
      // Update .env file
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('APP_URL=')) {
          envContent = envContent.replace(/APP_URL=.*(\r?\n|$)/, `APP_URL=${tunnelUrl}$1`);
        } else {
          envContent += `\nAPP_URL=${tunnelUrl}\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log(`✅ Updated APP_URL in .env to: ${tunnelUrl}\n`);
      }

      // Now start nodemon with the updated .env so Telegram bot gets the new URL immediately
      app = spawn('npx', ['nodemon', 'server.js'], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      app.on('close', (code) => {
        cf.kill();
        process.exit(code || 0);
      });
    }
  }
}

cf.stdout.on('data', handleOutput);
cf.stderr.on('data', handleOutput);

cf.on('close', (code) => {
  console.log(`cloudflared exited with code ${code}`);
  if (app) app.kill();
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  if (cf) cf.kill();
  if (app) app.kill();
  process.exit(0);
});
