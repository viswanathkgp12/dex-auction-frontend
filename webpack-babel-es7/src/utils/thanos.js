import { ThanosWallet } from "@thanos-wallet/dapp";

let wallet, tzs, pkh;

export const APP_NAME = "Auction dApp";
export const NETWORK = "carthagenet";
export const AUCTION_ADDRESS = "KT1L8DPX3bbdpZGFURDRzk9FLNqv9qK9khAe";

export async function isAvailable() {
  return ThanosWallet.isAvailable;
}

export async function connect(appName = APP_NAME, network=NETWORK) {
  wallet = new ThanosWallet(appName);
  await wallet.connect(network);
}

export async function getWalletInfo() {
  tzs = wallet.toTezos();
  pkh = await tzs.wallet.pkh();

  return {
    tezos: tzs,
    address: pkh,
  };
}

// Contract Related
const fetchContract = (tezos, address) => tezos.wallet.at(address);

export async function createInstance(assetID, assetName, auctionType) {
  const auction = await fetchContract(tzs, AUCTION_ADDRESS);
  console.log(auction);
  await auction.methods.createInstance(assetID, assetName, auctionType);
}
