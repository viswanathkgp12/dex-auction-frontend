import "../style/style.css";
import "../style/bootstrap.min.css";
import "../style/jquery.timepicker.css";

import {
  isAvailable,
  connect,
  getWalletInfo,
  createInstance,
  configureAuction,
} from "../utils/thanos";
import { getOpByHashBcd, getOpByHashTzkt } from "../utils/api";
import { sleep } from "../utils/sleep";

const NOT_CONNECTED = "not-connected";
const CONNECTING = "connecting";
const CONNECTED = "connected";

let walletState = NOT_CONNECTED;

async function checkAvailability() {
  console.log("Checking thanos wallet availability ...");
  const available = await isAvailable();
  if (!available) {
    alert("Thanos Wallet is not available");
  }

  console.log("Connecting to RPC ...");
  walletState = CONNECTING;
  await connect();

  console.log("Fetch wallet info ...");
  const { tezos, address } = await getWalletInfo();

  // Uncomment if you want to display in UI
  // document.getElementById("address").innerHTML = address;

  console.log("Address of wallet: ", address);
  walletState = CONNECTED;

  // Test
  const { err, opHash } = await createInstance(0, "name", "english");
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Create Instance succeeded with: ", opHash);

  const { contractInstance } = await pollForAuctionAddress(opHash);
  console.log("Contract created at: ", contractInstance);

  const configureAuctionResult = await configureAuction(
    contractInstance,
    1,
    1,
    "2020-06-27T02:10:00+05:30",
    1
  );

  if (configureAuctionResult.err) {
    console.log("Error occured");
    return;
  }

  console.log("Create Instance succeeded with: ", configureAuctionResult.opHash);
}

async function pollForAuctionAddress(opHash, retries = 10) {
  if (!retries) {
    return {
      err: "Timeout exceeded",
      contractInstance: null,
    };
  }

  // const opData = await getOpByHashBcd(opHash);
  // console.log("BCD Operation data received: ", opData);

  // if (opData !== null && opData.length > 0 && opData.length == 2) {
  //   const status = opData[1].status;
  //   if (status === "applied") {
  //     return {
  //       err: null,
  //       contractInstance: opData[1].destination,
  //     };
  //   }
  // }

  const tzktOpdata = await getOpByHashTzkt(opHash);
  console.log("TZKT Operation data received: ", tzktOpdata);

  if (tzktOpdata !== null && tzktOpdata.length > 0 && tzktOpdata.length == 2) {
    const status = tzktOpdata[1].status;
    if (status === "applied") {
      return {
        err: null,
        contractInstance: tzktOpdata[1].originatedContract.address,
      };
    }
  }

  retries--;

  await sleep(5000);
  return pollForAuctionAddress(opHash, retries);
}

window.onload = function () {
  checkAvailability();
};

window.chooseAuction = function () {
  createInstance(0, "name", "english");
};
