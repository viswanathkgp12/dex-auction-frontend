import "../style/style.css";
import "../style/bootstrap.min.css";
import "../style/jquery.timepicker.css";

import $ from "jquery";
import { getOpByHashBcd, getOpByHashTzkt } from "../utils/api";
import { sleep } from "../utils/sleep";
import {
  isAvailable,
  connect,
  getWalletInfo,
  createInstance,
  configureAuction,
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
 * Contract
 * ---------------------------
 */

let contractAddress;

async function createAuctionInstance(assetName, auctionType) {
  const { err, opHash } = await createInstance(0, assetName, "english");
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Create Instance succeeded with: ", opHash);

  const { contractInstance } = await pollForAuctionAddress(opHash);
  console.log("Contract created at: ", contractInstance);

  return contractInstance;
}

async function pollForAuctionAddress(opHash, retries = 10) {
  try {
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

    if (
      tzktOpdata !== null &&
      tzktOpdata.length > 0 &&
      tzktOpdata.length == 2
    ) {
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
  } catch (error) {
    return pollForAuctionAddress(opHash, retries);
  }
}

async function configureAuctionInstance(
  contractInstance,
  increment,
  reservePrice,
  starttime,
  waittime
) {
  const configureAuctionResult = await configureAuction(
    contractInstance,
    increment,
    reservePrice,
    starttime,
    waittime
  );

  if (configureAuctionResult.err) {
    console.log("Error occured");
    return;
  }

  console.log(
    "Create Instance succeeded with: ",
    configureAuctionResult.opHash
  );
}

/**
 * ---------------------
 * UI Bindings
 * ----------------------
 */

$(".prodct").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  // Open slider
  $("body").addClass("openSlide");
  $(".menuBox ul li.prodct").addClass("active");
});

window.chooseAuction = async function () {
  // const auctionType = ;
  const assetName = $("#assetName").val();
  contractAddress = await createAuctionInstance(assetName, "english");

  // UI
  $(".tabHead ul li.two").removeClass("bold");

  $(".tabHead ul li.three").addClass("active");
  $(".tabHead ul li.three").addClass("bold");

  $("#three").addClass("active");
  $("#two").removeClass("active");
};

window.configureAuction = async function () {
  const reservePrice = $("#reservePrice").val();
  const increment = $("#increment").val();
  const datepicker = $("#datepicker").val();
  const timepicker = $("#timepicker").val();
  const waithour = $("#waithour").val();
  const waitmin = $("#waitmin").val();

  const month = datepicker.split("/")[0];
  const date = datepicker.split("/")[1];
  const year = datepicker.split("/")[2];

  let starttime;
  const tzOffset = new Date().getTimezoneOffset();

  const symbol = tzOffset < 0 ? "+" : "-";
  let tzOffsetHours = Math.floor(Number(Math.abs(tzOffset) / 60));
  const tzOffsetMins = Math.abs(tzOffset) - tzOffsetHours * 60;

  tzOffsetHours = tzOffsetHours < 10 ? "0" + tzOffsetHours : tzOffsetHours;

  const isAM = timepicker.includes("am");
  if (isAM) {
    let hour = timepicker.split(":")[0];
    const min = timepicker.slice(0, -2).split(":")[1];

    hour = Number(hour) < 10 ? "0" + hour : hour;

    starttime = `${year}-${month}-${date}T${hour}:${min}:00${symbol}${tzOffsetHours}:${tzOffsetMins}`;
  } else {
    let hour = timepicker.split(":")[0];
    const min = timepicker.slice(0, -2).split(":")[1];

    hour = hour + 12;
    starttime = `${year}-${month}-${date}T${hour}:${min}:00${symbol}${tzOffsetHours}:${tzOffsetMins}`;
  }

  const waittime = Number(waithour) * 60 * 60 + Number(waitmin) * 60;

  console.log(contractAddress, increment, reservePrice, starttime, waittime);

  await configureAuctionInstance(
    contractAddress,
    increment,
    reservePrice,
    starttime,
    waittime
  );

  // UI
  $("body").removeClass("openSlide");
  $(".menuBox ul li.prodct").removeClass("active");
};
