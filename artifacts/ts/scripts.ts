/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  ExecutableScript,
  ExecuteScriptParams,
  ExecuteScriptResult,
  Script,
  SignerProvider,
  HexString,
} from "@alephium/web3";
import { default as AddAllowedConsumerScriptJson } from "../oracles/tx-scripts/AddAllowedConsumer.ral.json";
import { default as CompletePriceFetchScriptJson } from "../usage-example/scripts/CompletePriceFetch.ral.json";
import { default as FetchPriceScriptJson } from "../usage-example/scripts/FetchPrice.ral.json";
import { default as FulfillPriceRequestScriptJson } from "../oracles/tx-scripts/FulfillPriceRequest.ral.json";
import { default as RegisterSubscriptionScriptJson } from "../oracles/tx-scripts/RegisterSubscription.ral.json";
import { default as RequestPriceScriptJson } from "../oracles/tx-scripts/RequestPrice.ral.json";

export const AddAllowedConsumer = new ExecutableScript<{
  subscription: HexString;
  address: Address;
}>(Script.fromJson(AddAllowedConsumerScriptJson));
export const CompletePriceFetch = new ExecutableScript<{
  myExchange: HexString;
}>(Script.fromJson(CompletePriceFetchScriptJson));
export const FetchPrice = new ExecutableScript<{ myExchange: HexString }>(
  Script.fromJson(FetchPriceScriptJson)
);
export const FulfillPriceRequest = new ExecutableScript<{
  priceRequest: HexString;
  amount: bigint;
  decimals: bigint;
}>(Script.fromJson(FulfillPriceRequestScriptJson));
export const RegisterSubscription = new ExecutableScript<{
  operator: HexString;
}>(Script.fromJson(RegisterSubscriptionScriptJson));
export const RequestPrice = new ExecutableScript<{
  subscription: HexString;
  from: HexString;
  to: HexString;
}>(Script.fromJson(RequestPriceScriptJson));
