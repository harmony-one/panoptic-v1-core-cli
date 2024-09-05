const dotenv = require('dotenv');
const { Command } = require('commander');
const fs = require('fs');
const program = new Command();
const keyManager = require('./lib/keyManager');
const poolManager = require('./lib/poolManager');
const optionManager = require('./lib/optionManager');

// load .env from /cli/.env
dotenv.config({ path: './cli/.env' });

program
  .name('pcli')
  .description('CLI to interact with Panoptic Protocol');
  
// KEY MANAGEMENT
const key = program.command('key').description('Manage private keys');

key
  .command('store')
  .description('Store a private key.')
  .requiredOption('-s, --store <key>', 'Private key used to interact with the CLI')
  .action((options) => {
    const key = options.store;
    keyManager.storeKey(key);
  });

key
  .command('view')
  .description('View the stored private key.')
  .action(keyManager.viewKey);

key
  .command('delete')
  .description('Delete the stored private key.')
  .action(keyManager.deleteKey);

// POOL MANAGER
const pool = program.command('pool').description('Manage Panoptic pools');

pool
  .command('deploy')
  .description('Deploy a new Panoptic pool, and if necessary, a Uniswap V3 pool based on the provided token pair and fee tier.')
  .requiredOption('-a, --tokenA <address>', 'The contract address of the first token in the pair (e.g., WONE).')
  .requiredOption('-b, --tokenB <address>', 'The contract address of the second token in the pair (e.g., USDC).')
  .requiredOption('-f, --fee <fee>', 'The fee tier for the pool, specified in hundredths of a basis point (e.g., 500 for 0.05%).')
  .option('-t, --tick <tick>', '(Optional) The initial tick value for setting the price of the pool. If not provided, a default tick is used that corresponds to a 1:1 price ratio.')
  .action(async (options) => {
    const { tokenA, tokenB, fee, tick } = options;
    try {
      await poolManager.deploy(tokenA, tokenB, fee, tick);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

pool
  .command('get')
  .description('Retrieve the Panoptic pool associated with the provided token pair and fee tier.')
  .requiredOption('-a, --tokenA <address>', 'The contract address of the first token in the pair (e.g., WONE).')
  .requiredOption('-b, --tokenB <address>', 'The contract address of the second token in the pair (e.g., USDC).')
  .requiredOption('-f, --fee <fee>', 'The fee tier for the Uniswap V3 pool, specified in hundredths of a basis point (e.g., 500 for 0.05%).')
  .action(async (options) => {
    const { tokenA, tokenB, fee } = options;
    try {
      await poolManager.get(tokenA, tokenB, fee);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

// OPTION MANAGER
const option = program.command('option').description('Manage options');

// TODO: include leg configuration as part of the requiredOption
option
  .command('mint')
  .description('Mint a new Panoptic option.')
  .requiredOption('-a, --tokenA <address>', 'The contract address of the first token in the pair (e.g., WONE).')
  .requiredOption('-b, --tokenB <address>', 'The contract address of the second token in the pair (e.g., USDC).')
  .requiredOption('-f, --fee <fee>', 'The fee tier for the Uniswap V3 pool, specified in hundredths of a basis point (e.g., 500 for 0.05%).')
  .requiredOption('-x, --aAmount <amount>', 'The amount of token A to be deposited as a collateral for the minted option.')
  .requiredOption('-y, --bAmount <amount>', 'The amount of token B to be deposited as a collateral for the minted option.')
  // .requiredOption('-l0, --leg0 <configuration>', `Configuration for the first leg in JSON format:
  //   {
  //     "legIndex": <uint256>,          // The leg index of this position (in {0, 1, 2, 3})
  //     "optionRatio": <uint256>,       // The relative size of the leg
  //     "asset": <uint256>,             // The asset of the leg (e.g., tokenA or tokenB)
  //     "isLong": <uint256>,            // Whether the leg is long (1) or short (0)
  //     "tokenType": <uint256>,         // The type of token involved in the leg
  //     "riskPartner": <uint256>,       // The associated risk partner of the leg
  //     "strike": <int24>,              // The strike price tick of the leg
  //     "width": <int24>                // The width of the leg (in ticks)
  //   }`)  
  .action(async (options) => {
    const { tokenA, tokenB, fee, aAmount, bAmount } = options;
    // const { tokenA, tokenB, fee, aAmount, bAmount, leg0 } = options;

    // // leg config is a file
    // let leg0Config;
    // if (fs.existsSync(leg0)) {
    //   try {
    //     const fileContent = fs.readFileSync(leg0, 'utf-8');
    //     leg0Config = JSON.parse(fileContent);
    //     console.log('Parsed leg0 configuration from file:', leg0Config);
    //   } catch (error) {
    //     console.error('Error reading or parsing leg0 JSON file:', error.message);
    //     return ;
    //   }
    // } else {
    //   try {
    //     leg0Config = JSON.parse(leg0);
    //     console.log('Parsed leg0 configuration from JSON string:', leg0Config);
    //   } catch (error) {
    //     console.error('Error parsing leg0 JSON string:', error.message);
    //     return ;
    //   }
    // }

    try {
      await optionManager.mint(tokenA, tokenB, fee, aAmount, bAmount);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

// CLI FLOW
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);