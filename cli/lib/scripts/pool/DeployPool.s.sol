// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.18;

// Foundry
import "forge-std/Script.sol";
// Uniswap - Panoptic's version 0.8
import {IUniswapV3Factory} from "v3-core/interfaces/IUniswapV3Factory.sol";
// Internal
import {PanopticFactory} from "@contracts/PanopticFactory.sol";
import {ERC20S} from "@contracts/tokens/ERC20S.sol";
// import {ERC20Minimal} from "@contracts/tokens/ERC20Minimal.sol";
import {IUniswapV3Pool} from "v3-core/interfaces/IUniswapV3Pool.sol";

contract DeployPool is Script {
    function run() public {
        uint256 PRIVATE_KEY = vm.envUint("CLI_PRIVATE_KEY");

        IUniswapV3Factory UNISWAP_V3_FACTORY = IUniswapV3Factory(
            vm.envAddress("CLI_UNISWAP_V3_FACTORY")
        );

        PanopticFactory PANOPTIC_FACTORY = PanopticFactory(vm.envAddress("CLI_PANOPTIC_FACTORY"));

        vm.startBroadcast(PRIVATE_KEY);

        ERC20S tokenA = ERC20S(vm.envAddress("TOKEN_A"));
        ERC20S tokenB = ERC20S(vm.envAddress("TOKEN_B"));

        tokenA.approve(address(PANOPTIC_FACTORY), type(uint256).max);
        tokenB.approve(address(PANOPTIC_FACTORY), type(uint256).max);

        uint24 fee = uint24(vm.envUint("FEE"));
        // address unipool = UNISWAP_V3_FACTORY.getPool(address(tokenA), address(tokenB), 300);
        address unipool = UNISWAP_V3_FACTORY.createPool(address(tokenA), address(tokenB), fee);

        //initialize at tick 0
        IUniswapV3Pool(unipool).initialize(0x1000000000000000000000000);
        // if (unipool == address(0)) {
        //     try UNISWAP_V3_FACTORY.createPool(address(tokenA), address(tokenB), fee) returns (address pool) {
        //         unipool = pool;
        //         IUniswapV3Pool(unipool).initialize(0x1000000000000000000000000);

        //         // uint160 tick = uint160(vm.envUint("TICK")); // convert tick to uint160 for pool initialization
        //         // if (tick == 0) {
        //         //     // default tick initialization (0)
        //             // IUniswapV3Pool(unipool).initialize(0x1000000000000000000000000);
        //         // } else {
        //         //     // initialize the pool with the provided tick (convert to required format)
        //         //     IUniswapV3Pool(unipool).initialize(tick);
        //         // }
        //     } catch (bytes memory reason) {}
        // } else {
        //     console.log("Pool already exists, skipping creation and initialization.");
        // }

        uint96 salt = uint96(vm.envUint("SALT"));
        PANOPTIC_FACTORY.deployNewPool(address(tokenA), address(tokenB), fee, salt);

        vm.stopBroadcast();
    }
}