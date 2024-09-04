const fs = require('fs');
const path = require('path');

// .env file to be used in the cli folder
const ENV_FILE = path.join(__dirname, '../.env');

// check if the .env file exists
function envFileExists() {
  return fs.existsSync(ENV_FILE);
}

function storeKey(key) {
  if (!isValidKey(key)) {
    console.error('Error: Invalid private key format. It must be a 64-character hexadecimal string.');
    return;
  }

  const strippedKey = key.startsWith('0x') ? key.slice(2) : key;
  fs.writeFileSync(ENV_FILE, `CLI_PRIVATE_KEY=${strippedKey}`);
  console.log('Key stored successfully.');
}

function isValidKey(key) {
  // remove '0x' if present
  const strippedKey = key.startsWith('0x') ? key.slice(2) : key;

  // evm based keys are 64 hexadecimal characters
  const isValid = /^[0-9a-fA-F]{64}$/.test(strippedKey);
  
  return isValid;
}

function viewKey() {
  if (!envFileExists()) {
    console.error('Error: No key is set.');
    return;
  }

  const keyContent = fs.readFileSync(ENV_FILE, 'utf8');

  if (keyContent) {
    console.log(`${keyContent.split('=')[1]}`);
  } else {
    console.error('Error: No key is set.');
  }
}

function deleteKey() {
  if (!envFileExists()) {
    console.error('Error: No key to delete.');
    return;
  }

  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  const lines = envContent.split('\n');
  
  const updatedLines = lines.filter(line => !line.startsWith('CLI_PRIVATE_KEY='));
  fs.writeFileSync(ENV_FILE, updatedLines.join('\n'));

  console.log('Key deleted successfully.');
}

module.exports = { storeKey, viewKey, deleteKey };