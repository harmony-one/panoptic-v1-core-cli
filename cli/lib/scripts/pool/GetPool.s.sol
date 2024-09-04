// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.18;

// Foundry
import "forge-std/Script.sol";
import "forge-std/console.sol";
// Uniswap - Panoptic's version 0.8
import {IUniswapV3Factory} from "v3-core/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "v3-core/interfaces/IUniswapV3Pool.sol";
// Internal
import {PanopticFactory} from "@contracts/PanopticFactory.sol";
import {PanopticPool} from "@contracts/PanopticPool.sol";
import {ERC20S} from "@contracts/tokens/ERC20S.sol";

contract DeployPool is Script {
    function run() public {
        IUniswapV3Factory UNISWAP_V3_FACTORY = IUniswapV3Factory(
            vm.envAddress("CLI_UNISWAP_V3_FACTORY")
        );

        PanopticFactory PANOPTIC_FACTORY = PanopticFactory(vm.envAddress("CLI_PANOPTIC_FACTORY"));

        ERC20S tokenA = ERC20S(vm.envAddress("TOKEN_A"));
        ERC20S tokenB = ERC20S(vm.envAddress("TOKEN_B"));

        uint24 fee = uint24(vm.envUint("FEE"));
        address unipoolAddress = UNISWAP_V3_FACTORY.getPool(address(tokenA), address(tokenB), fee);

        require(unipoolAddress != address(0), "Uniswap V3 pool does not exist");
        console.log("Uniswap V3 Pool Address:", unipoolAddress);
        
        IUniswapV3Pool uniswapPool = IUniswapV3Pool(unipoolAddress);
        PanopticPool panopticPool = PANOPTIC_FACTORY.getPanopticPool(uniswapPool);
        address poolAddress = address(panopticPool);

        require(poolAddress != address(0), "Panoptic pool does not exist");
        console.log("Panoptic Pool Address:", poolAddress);
    }
}