/* eslint-disable prefer-const */ // to satisfy AS compiler

import { AcalaEvmEvent } from "@subql/acala-evm-processor";
import { updateCommonCTokenStats } from "../utils/helpers";
import { BigNumber } from "ethers";
import { getAccount, getComptroller, getMarket } from "../utils/records";

// Setup types from ABI
type MarketListedEventArgs = [string] & {cToken: string};
type MarketEnteredEventArgs = [string, string] & { cToken: string; account: string; };
type MarketExitedEventArgs = [string, string] & { cToken: string; account: string; };
type NewCloseFactorEventArgs = [BigNumber, BigNumber] & {oldCloseFactorMantissa: BigNumber, newCloseFactorMantissa: BigNumber};
type NewCollateralFactorEventArgs = [string, BigNumber, BigNumber] & {cToken: string, oldCollateralFactorMantissa: BigNumber, newCollateralFactorMantissa: BigNumber};
type NewLiquidationIncentiveEventArgs = [BigNumber, BigNumber] & {oldLiquidationIncentiveMantissa: BigNumber, newLiquidationIncentiveMantissa: BigNumber};
type NewPriceOracleEventArgs = [string, string] & {oldPriceOracle: string, newPriceOracle: string};

export async function handleMarketListed(event: AcalaEvmEvent): Promise<void> {
    const market = await getMarket(event.args.cToken);
    logger.info(`Market listed: ${market.id}`)
}

export async function handleMarketEntered(event: AcalaEvmEvent<MarketEnteredEventArgs>): Promise<void> {
    // Ensures that the market is created if absent
    const market = await getMarket(event.args.cToken);
    // Ensures that the account is created if absent
    const account = await getAccount(event.args.account);
    logger.info(`Account ${account.id} enters market ${market.name}`);

    const cTokenStats = await updateCommonCTokenStats(
        market.id,
        market.symbol,
        account.id,
        event.transactionHash,
        BigInt(event.blockTimestamp.getTime()),
        event.blockNumber,
        event.logIndex,
    );
    cTokenStats.enteredMarket = true;
    await cTokenStats.save();
}

export async function handleMarketExited(event: AcalaEvmEvent<MarketExitedEventArgs>): Promise<void> {
    // Ensures that the market is created if absent
    const market = await getMarket(event.args.cToken);
    // Ensures that the account is created if absent
    const account = await getAccount(event.args.account);
    logger.info(`Account ${account.id} exits market ${market.name}`);

    const cTokenStats = await updateCommonCTokenStats(
        market.id,
        market.symbol,
        account.id,
        event.transactionHash,
        BigInt(event.blockTimestamp.getTime()),
        event.blockNumber,
        event.logIndex,
    );
    cTokenStats.enteredMarket = false;
    await cTokenStats.save();
}

export async function handleNewCloseFactor(event: AcalaEvmEvent<NewCloseFactorEventArgs>): Promise<void> {
    // Ensures Comptroller is created if absent
    const comptroller = await getComptroller("1");
    comptroller.closeFactor = BigInt(event.args.newCloseFactorMantissa.toString());
    logger.info(`Close factor updated: Old = ${event.args.oldCloseFactorMantissa.toString()}, new = ${event.args.newCloseFactorMantissa.toString()}`);
    comptroller.save();
}

export async function handleNewCollateralFactor(event: AcalaEvmEvent<NewCollateralFactorEventArgs>): Promise<void> {
    // Ensures that the market is created if absent
    const market = await getMarket(event.args.cToken);
    market.collateralFactor = BigInt(event.args.newCollateralFactorMantissa.toString());
    logger.info(`Collateral factor updated: Old = ${event.args.oldCollateralFactorMantissa.toString()}, new = ${event.args.newCollateralFactorMantissa.toString()}`);
    market.save();
}

export async function handleNewLiquidationIncentive(event: AcalaEvmEvent<NewLiquidationIncentiveEventArgs>): Promise<void> {
    // Ensures Comptroller is created if absent
    const comptroller = await getComptroller("1");
    comptroller.liquidationIncentive = BigInt(event.args.newLiquidationIncentiveMantissa.toString());
    logger.info(`Liquidation incentive updated: Old = ${event.args.oldLiquidationIncentiveMantissa.toString()}, new = ${event.args.newLiquidationIncentiveMantissa.toString()}`)
    comptroller.save();
}

export async function handleNewPriceOracle(event: AcalaEvmEvent<NewPriceOracleEventArgs>): Promise<void> {
    // Ensures Comptroller is created if absent
    const comptroller = await getComptroller("1");
    comptroller.priceOracle = event.args.newPriceOracle;
    logger.info(`Price oracle updated: Old = ${event.args.oldPriceOracle}, new = ${event.args.newPriceOracle}`);
    comptroller.save();
}
