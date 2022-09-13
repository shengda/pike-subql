import { Account, Comptroller, Market } from "../types";
import { ethers } from 'ethers';
import CTokenAbi from '../abis/CToken.abi.json';
import ERC20Abi from '../abis/ERC20.abi.json';
import FrontierEthProvider from '@subql/acala-evm-processor/dist/acalaEthProvider';

export async function getComptroller(comptrollerId: string): Promise<Comptroller> {
    let comptroller = await Comptroller.get(comptrollerId);
    if (!comptroller) {
        comptroller = new Comptroller(comptrollerId);
        await comptroller.save();
    }

    return comptroller;
}

export async function getMarket(marketId: string): Promise<Market> {
    let market = await Market.get(marketId);
    if (!market) {
        market = new Market(marketId);

        // Fill cToken market data
        const cToken = new ethers.Contract(marketId, CTokenAbi, new FrontierEthProvider());
        market.name = await cToken.name();
        market.symbol = await cToken.symbol();
        market.underlyingAddress = await cToken.underlying();
        market.interestRateModelAddress = await cToken.interestRateModel();
        market.reserveFactor = await cToken.reserveFactorMantissa();

        const underlying = new ethers.Contract(market.underlyingAddress, ERC20Abi, new FrontierEthProvider());
        market.underlyingName = await underlying.name();
        market.underlyingSymbol = await underlying.symbol();
        market.underlyingDecimals = parseInt((await underlying.decimals()).toString());
        market.underlyingPriceUSD = BigInt(0);

        market.borrowRate = BigInt(0);
        market.supplyRate = BigInt(0);
        market.cash = BigInt(0);
        market.reserves = BigInt(0);
        market.totalBorrows = BigInt(0);
        market.totalSupply = BigInt(0);
        market.collateralFactor = BigInt(0);
        market.exchangeRate = BigInt(0);
        market.accrualBlockNumber = 0;
        market.blockTimestamp = 0;
        market.borrowIndex = BigInt(0);

        await market.save();
    }

    return market;
}

export async function getAccount(accountId: string): Promise<Account> {
    let account = await Account.get(accountId);
    if (!account) {
        account = new Account(accountId);
        account.countLiquidated = 0;
        account.countLiquidator = 0;
        account.hasBorrowed = false;
        await account.save();
    }

    return account;
}