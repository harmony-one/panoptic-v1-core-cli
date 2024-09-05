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
        SemiFungiblePositionManager SFPM = SemiFungiblePositionManager(vm.envAddress("CLI_SFPM"));

        ERC20S tokenA = ERC20S(vm.envAddress("TOKEN_A"));
        ERC20S tokenB = ERC20S(vm.envAddress("TOKEN_B"));

        uint24 fee = uint24(vm.envUint("FEE"));
        address unipoolAddress = UNISWAP_V3_FACTORY.getPool(address(tokenA), address(tokenB), fee);

        require(unipoolAddress != address(0), "Uniswap V3 pool does not exist");
        
        IUniswapV3Pool uniswapPool = IUniswapV3Pool(unipoolAddress);
        PanopticPool panopticPool = PANOPTIC_FACTORY.getPanopticPool(uniswapPool);
        address poolAddress = address(panopticPool);

        require(poolAddress != address(0), "Panoptic pool does not exist");

        uint256 PRIVATE_KEY = vm.envUint("CLI_PRIVATE_KEY");
        vm.startBroadcast(PRIVATE_KEY);

        // TODO
        // 0. The LP needs to have liquidity as it's used when depositing
        // fund uniswap v3 lp with the tokens

        // NOTE: vm.addr() does not work on Harmony
        // 1. approve and deposit tokens to collateral tracker
        // ensure the deposit amount is valid
        // - balance of user
        // - doesn't exceed the approved amount
        tokenA.approve(address(panopticPool.collateralToken0()), type(uint256).max);
        uint24 aAmount = uint24(vm.envUint("A_AMOUNT"));
        address userAddress = vm.envAddress("PUBLIC_KEY");
        uint256 aBalance = tokenA.balanceOf(userAddress);
        require(aAmount * 10 ** tokenA.decimals() <= aBalance, "Insufficient tokenA balance");  

        // TODO: fix the deposit
        panopticPool.collateralToken0().deposit(
            aAmount * 10 ** tokenA.decimals(),
            userAddress
        );

        tokenB.approve(address(panopticPool.collateralToken1()), type(uint256).max);
        uint24 bAmount = uint24(vm.envUint("B_AMOUNT"));
        uint256 bBalance = tokenB.balanceOf(userAddress);
        require(bAmount * 10 ** tokenB.decimals() <= bBalance, "Insufficient tokenB balance");   
        panopticPool.collateralToken1().deposit(
            bAmount * 10 ** tokenB.decimals(),
            userAddress
        );

        // 2. create the position with provided configurations
        // - allow for multiple leg configurations
        uint256[] memory positionIdList = new uint256[](1);
        positionIdList[0] = uint256(0)
            .addUniv3pool(SFPM.getPoolId(address(panopticPool.univ3pool())))
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
        panopticPool.mintOptions({
            positionIdList: positionIdList,
            positionSize: 10 * 10 ** 18,
            effectiveLiquidityLimitX32: 0,
            tickLimitLow: 0,
            tickLimitHigh: 0
        });

        vm.stopBroadcast();
    }
}