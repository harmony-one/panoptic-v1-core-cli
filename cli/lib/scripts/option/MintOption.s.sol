// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.18;

// Foundry
import "forge-std/Script.sol";
// Uniswap - Panoptic's version 0.8
import {IUniswapV3Factory} from "v3-core/interfaces/IUniswapV3Factory.sol";
import {IUniswapV3Pool} from "v3-core/interfaces/IUniswapV3Pool.sol";
// Internal
import {PanopticFactory} from "@contracts/PanopticFactory.sol";
import {PanopticPool} from "@contracts/PanopticPool.sol";
import {CollateralTracker} from "@contracts/CollateralTracker.sol";
import {SemiFungiblePositionManager} from "@contracts/SemiFungiblePositionManager.sol";
import {ERC20S} from "@contracts/tokens/ERC20S.sol";
// Types
import {TokenId} from "@types/TokenId.sol";

contract MintOption is Script {
    using TokenId for uint256;
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
        
        IUniswapV3Pool uniswapPool = IUniswapV3Pool(unipoolAddress);
        PanopticPool panopticPool = PANOPTIC_FACTORY.getPanopticPool(uniswapPool);
        address poolAddress = address(panopticPool);

        require(poolAddress != address(0), "Panoptic pool does not exist");

        // 0. broadcast from this point
        uint256 PRIVATE_KEY = vm.envUint("CLI_PRIVATE_KEY");
        vm.startBroadcast(PRIVATE_KEY);

        // 1. approve and deposit tokens to collateral tracker
        // ensure the deposit amount is valid
        // - balance of user
        // - doesn't exceed the approved amount

        // 2. create the position with provided configurations
        // - allow for multiple leg configurations
        positionIdList[0] = uint256(0)
            .addUniv3pool(SFPM.getPoolId(address(pp.univ3pool())))
            .addLeg({
                legIndex: 0,
                _optionRatio: 1,
                _asset: 1,
                _isLong: 0,
                _tokenType: 1,
                _riskPartner: 0,
                _strike: -5000,
                _width: 2
            });

        // 3. mint option
        pp.mintOptions({
            positionIdList: positionIdList,
            positionSize: 10 * 10 ** 18,
            effectiveLiquidityLimitX32: 0,
            tickLimitLow: 0,
            tickLimitHigh: 0
        });

        vm.stopBroadcast();
    }
}