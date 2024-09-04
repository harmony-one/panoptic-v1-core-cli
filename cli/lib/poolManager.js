const { exec } = require('child_process');
const { getAddress, calculateSalt, generateNonce } = require('./helpers/utils');


function deploy(tokenA, tokenB, fee, tick = null) {
  const nonce = generateNonce();
  const salt = calculateSalt(nonce); // big number

  const envVars = {
    TOKEN_A: tokenA,
    TOKEN_B: tokenB,
    FEE: fee,
    TICK: tick ? tick : 0, // default to 0 if tick is not provided
    SALT: salt.toString() // convert salt (BigNumber) to string
  };

  const envString = Object.keys(envVars)
    .map(key => `${key}=${envVars[key]}`)
    .join(' ');

  exec(`${envString} forge script cli/lib/scripts/pool/DeployPool.s.sol --rpc-url $CLI_RPC_URL --broadcast --slow --legacy`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`DeployPool error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`DeployPool stderr: ${stderr}`);
        // return;
      }
      console.log(`DeployPool output: ${stdout}`);
    }
  );
}

function get(tokenA, tokenB, fee) {
  const envVars = {
    TOKEN_A: tokenA,
    TOKEN_B: tokenB,
    FEE: fee
  };

  const envString = Object.keys(envVars)
    .map(key => `${key}=${envVars[key]}`)
    .join(' ');

  exec(`${envString} forge script cli/lib/scripts/pool/GetPool.s.sol --rpc-url $CLI_RPC_URL --broadcast --slow --legacy`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`GetPool error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`GetPool stderr: ${stderr}`);
        // return;
      }
      console.log(`GetPool output: ${stdout}`);
    }
  );
}

// exec('forge script cli/lib/scripts/pool/DeployPool.s.sol --rpc-url $CLI_RPC_URL --broadcast --slow --legacy', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`Error executing script: ${error.message}`);
//     return;
//   }
  // if (stderr) {
  //   console.error(`Script stderr: ${stderr}`);
  //   return;
  // }
  // console.log(`Script output: ${stdout}`);
// });

module.exports = { deploy, get }