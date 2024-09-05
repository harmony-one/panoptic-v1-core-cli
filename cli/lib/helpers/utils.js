const dotenv = require('dotenv');
const { ethers } = require('ethers');

// load .env from /cli/.env
dotenv.config({ path: './cli/.env' });

// // refer to the following link for explanation on tick and sqrtPriceX96
// // https://docs.uniswap.org/contracts/v4/concepts/managing-positions#tick
// function calculateSqrtPriceX96(tick) {
//   const sqrt1_0001 = Math.sqrt(1.0001);
  
//   // calculate the price ratio using the tick value
//   const ratio = sqrt1_0001 ** tick;

//   // calculate sqrtPriceX96: ratio * 2^96
//   const sqrtPriceX96 = ratio * 2 ** 96;

//   // convert to BigNumber and return
//   return BigNumber.from(Math.floor(sqrtPriceX96).toString());
// }

const provider = new ethers.providers.JsonRpcProvider(process.env.CLI_RPC_URL);
const signer = new ethers.Wallet(process.env.CLI_PRIVATE_KEY, provider);

function calculateSalt(nonce) {
  const uint96Nonce = ethers.BigNumber.from(nonce).mask(96);
  const salt = ethers.utils.solidityKeccak256(['uint96'], [uint96Nonce]);
  return ethers.BigNumber.from(salt).mask(96);
}

function generateNonce() {
  return ethers.BigNumber.from(ethers.utils.randomBytes(4)).toNumber(); // 4 bytes
}

async function getAddress() {
  return await signer.getAddress();
}

function createEnvString(envVars) {
  return Object.keys(envVars)
    .map(key => `${key}=${envVars[key]}`)
    .join(' ');
}

module.exports = { calculateSalt, generateNonce, getAddress, createEnvString };