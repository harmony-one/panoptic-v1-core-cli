const { exec } = require('child_process');
const { createEnvString, getAddress } = require('./helpers/utils');

async function mint(tokenA, tokenB, fee, aAmount, bAmount) {
  // TODO: retrieve public key
  const publicKey = await getAddress();
  const envVars = {
    TOKEN_A: tokenA,
    TOKEN_B: tokenB,
    FEE: fee,
    A_AMOUNT: aAmount,
    B_AMOUNT: bAmount,
    PUBLIC_KEY: publicKey,
    // LEG_0: // leg config
  }

  const envString = createEnvString(envVars);

  exec(`${envString} forge script cli/lib/scripts/option/MintOption.s.sol --rpc-url $CLI_RPC_URL --broadcast --slow --legacy --via-ir`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`MintOption error: ${error.message}`);
        // return;
      }
      if (stderr) {
        console.error(`MintOption stderr: ${stderr}`);
        // return;
      }
      console.log(`MintOption output: ${stdout}`);
    }
  )
}

module.exports = { mint }