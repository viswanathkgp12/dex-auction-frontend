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
 * Auction Contract
 * ---------------------------
 */

let contractAddress;

async function createAuctionInstance(assetName, auctionType) {
  const { err, opHash } = await createInstance(0, assetName, auctionType);
  $("#chooseAuctionResult").html(`OpHash: ${opHash}`);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Create Instance succeeded with: ", opHash);

  const pollResult = await pollForAuctionAddress(opHash);
  console.log("Contract created at: ", pollResult.contractInstance);

  return pollResult;
}

async function pollForAuctionAddress(opHash, retries = 10) {
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

// Configure auction
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

// Fill asset name and click
$(".sbmt.first").on("click", function () {
  const assetName = $("#assetName").val();
  const assetNameRegex = /^([A-Za-z0-9])+$/;

  if (assetName.length < 1 || !assetNameRegex.test(assetName)) {
    $(".assetDetailsError").html("Please enter valid asset name");
    return;
  }

  $(".tabHead ul li.two").addClass("active");
  $(".tabHead ul li.two").addClass("bold");

  $("#two").addClass("active");
  $("#one").removeClass("active");
  $(".one").removeClass("bold");
});

/**
 * -------------------------
 * Choose Auction
 * -------------------------
 */

window.chooseAuction = async function () {
  const assetName = $("#assetName").val();

  // const auctionType = ;

  $("#chooseAuctionBtn").prop("disabled", true).css("opacity", 0.5);
  const result = await createAuctionInstance(assetName, "english");

  if (result.err) {
    $("#chooseAuctionResult").html(result.err);
    $("#chooseAuctionBtn").prop("disabled", false).css("opacity", 1);
    return;
  }

  contractAddress = result.contractInstance;
  if (!contractAddress) {
    return;
  }

  $("#chooseAuctionResult").html(`Contract Address: ${contractAddress}`);

  // UI
  $("#chooseAuctionBtn").prop("disabled", false).css("opacity", 1);
  $(".tabHead ul li.two").removeClass("bold");

  $(".tabHead ul li.three").addClass("active");
  $(".tabHead ul li.three").addClass("bold");

  $("#three").addClass("active");
  $("#two").removeClass("active");
};

/**
 * ------------------------------
 * Configure Auction
 * ------------------------------
 */

window.configureAuction = async function () {
  const reservePrice = $("#reservePrice").val();
  const increment = $("#increment").val();
  const datepicker = $("#datepicker").val();
  const timepicker = $("#timepicker").val();
  const waithour = $("#waithour").val();
  const waitmin = $("#waitmin").val();

  if (isNaN(reservePrice)) {
    $(".configureAuctionError").html("Reserve price should be integer");
    return;
  }

  if (isNaN(increment)) {
    $(".configureAuctionError").html("Min. increment should be integer");
    return;
  }

  if (!timepicker) {
    $(".configureAuctionError").html("Please select time");
    return;
  }

  if (!datepicker) {
    $(".configureAuctionError").html("Please select date");
    return;
  }

  if (!waithour || !waitmin) {
    $(".configureAuctionError").html("Please enter vlid wait time");
    return;
  }

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
