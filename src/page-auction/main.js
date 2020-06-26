import "../style/style.css";
import "../style/bootstrap.min.css";
import "../style/jquery.timepicker.css";

import $ from "jquery";
import { getOpByHashTzkt } from "../utils/api";
import { sleep } from "../utils/sleep";
import {
  isAvailable,
  connect,
  getWalletInfo,
  startAuction,
  bid,
} from "../utils/thanos";

/**
 * --------------------------------
 * Wallet
 * --------------------------------
 */

// Wallet State
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
}

async function connectWallet() {
  console.log("Connecting to RPC ...");
  walletState = CONNECTING;
  await connect();

  console.log("Fetch wallet info ...");
  const { tezos, address } = await getWalletInfo();
  console.log("Address of wallet: ", address);
  walletState = CONNECTED;
}

/**
 * ---------------------------
 * Auction Contract
 * ---------------------------
 */

async function createBid(contractAddress, amount) {
  await startAuction(contractAddress);
  const { err, opHash } = await bid(contractAddress, amount);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Bid for auction succeeded with: ", opHash);

  //   return poll(opHash);
}

async function poll(opHash, retries = 10) {
  try {
    if (!retries) {
      return {
        err: "Timeout exceeded",
        contractInstance: null,
      };
    }

    const tzktOpdata = await getOpByHashTzkt(opHash);
    console.log("TZKT Operation data received: ", tzktOpdata);

    if (
      tzktOpdata !== null &&
      tzktOpdata.length > 0 &&
      tzktOpdata.length == 4
    ) {
      const status = tzktOpdata[2].status;
      if (status === "applied") {
        return {
          err: null,
          contractInstance: tzktOpdata[2].originatedContract.address,
        };
      }
    }

    retries--;

    await sleep(5000);
    return pollForAuctionAddress(opHash, retries);
  } catch (error) {
    return pollForAuctionAddress(opHash, retries);
  }
}

/**
 * ---------------------
 * UI Bindings
 * ----------------------
 */

/**
 * ---------------------
 * UI Bindings
 * ----------------------
 */

$("#prodct").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  // Open slider
  $("body").addClass("openSlide");
  $(".menuBox ul li.prodct").addClass("active");
});

$(".shortlistbtn").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  const contractAddress = "KT19uwQwQjeqgH9tyrzWFEHeiqBVChVVfZB1";
  const amount = 1e-6;

  await createBid(contractAddress, amount);
});
