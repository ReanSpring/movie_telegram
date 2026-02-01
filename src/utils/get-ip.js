const axios = require('axios');

async function getPublicIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    console.log('\n----------------------------------------');
    console.log('🔓 Your Localtunnel Password (Public IP):');
    console.log(`📡 \x1b[32m${response.data.ip}\x1b[0m`);
    console.log('----------------------------------------\n');
  } catch (error) {
    console.error('❌ Failed to fetch public IP:', error.message);
  }
}

if (require.main === module) {
  getPublicIP();
}

module.exports = getPublicIP;
