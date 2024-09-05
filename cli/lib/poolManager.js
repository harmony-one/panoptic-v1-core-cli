const { exec } = require('child_process');
const { getAddress, calculateSalt, generateNonce, createEnvString } = require('./helpers/utils');


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

  const envString = createEnvString(envVars);

  exec(`${envString} forge script cli/lib/scripts/pool/DeployPool.s.sol --rpc-url $CLI_RPC_URL --broadcast --slow --legacy`, 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`DeployPool error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`DeployPool stderr: ${stderr}`);
        return;
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

  const envString = createEnvString(envVars);

    exec(`${envString} forge script cli/lib/scripts/pool/GetPool.s.sol --rpc-url $CLI_RPC_URL --slow --legacy`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`GetPool error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`GetPool stderr: ${stderr}`);
          return;
        }
    
        const relevantLogs = stdout
          // .split('\n')
          // .filter(line => line.includes("Uniswap V3 Pool Address") || line.includes("Panoptic Pool Address"))
          // .join('\n');
    
        if (relevantLogs) {
          console.log(`GetPool output:\n${relevantLogs}`);
        }
      }
    );
}

module.exports = { deploy, get }