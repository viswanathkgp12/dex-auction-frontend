import "../style/style.css";
import "../style/bootstrap.min.css";
import "../style/jquery.timepicker.css";

import { getOpByHashTzkt, getContractStorage } from "../utils/api";
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
let walletAddress;

export async function checkAvailability() {
  console.log("Checking thanos wallet availability ...");
  const available = await isAvailable();
  if (!available) {
    alert("Thanos Wallet is not available");
  }
}

export async function connectWallet() {
  console.log("Connecting to RPC ...");
  walletState = CONNECTING;
  await connect();

  console.log("Fetch wallet info ...");
  const { tezos, address } = await getWalletInfo();
  console.log("Address of wallet: ", address);
  walletState = CONNECTED;
  walletAddress = address;
}

/**
 * ---------------------------
 * Auction Contract
 * ---------------------------
 */

let contractAddress;

async function createAuctionInstance(assetName, auctionType) {
  const { err, opHash } = await createInstance(0, assetName, auctionType);
  $("#chooseAuctionResult").html(`${opHash}`);
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

    await sleep(5000);
    return pollForAuctionAddress(opHash, retries - 1);
  } catch (error) {
    console.log(error);
    return pollForAuctionAddress(opHash, retries - 1);
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

export function checkAndSetKeys() {
  const assetName = localStorage.getItem("assetName");
  if (!assetName) return;

  $("#assetName").val(assetName);
  $("li.one").addClass("active");
  $("li.one").addClass("bold");
  $("div#one.comnTab").addClass("active");

  auctionType = localStorage.getItem("auctionType");
  if (!auctionType) return;

  $("#auctionType").val(auctionType);

  if (localStorage.getItem("contractAddress")) {
    contractAddress = localStorage.getItem("contractAddress");
  } else {
    return;
  }

  $("li.two").addClass("active");
  $("li.one").removeClass("bold");
  $("li.two").addClass("bold");
  $("div#one.comnTab").removeClass("active");
  $("div#two.comnTab").addClass("active");
  // $(".tabHead ul li.one").addClass("disabled").css("opacity", 0.5);
  // $(".tabHead ul li.two").addClass("disabled").css("opacity", 0.5);
  // $("#chooseAuctionBtn").prop("disabled", true).css("opacity", 0.5);

  const reservePrice = localStorage.getItem("reservePrice");
  const increment = localStorage.getItem("increment");
  const datepicker = localStorage.getItem("datepicker");
  const timepicker = localStorage.getItem("timepicker");
  const waithour = localStorage.getItem("waithour");
  const waitmin = localStorage.getItem("waitmin");

  if (!reservePrice) return;
  $("#reservePrice").val(reservePrice);

  if (!increment) return;
  $("#increment").val(increment);

  if (!datepicker) return;
  $("#datepicker").val(datepicker);

  if (!timepicker) return;
  $("#timepicker").val(timepicker);

  if (!waithour) return;
  $("#waithour").val(waithour);

  if (!waitmin) return;
  $("#waitmin").val(waitmin);

  $("li.three").addClass("active");
  $("li.two").removeClass("bold");
  $("li.three").addClass("bold");
  $("div#two.comnTab").removeClass("active");
  $("div#three.comnTab").addClass("active");
  // $(".tabHead ul li.three").addClass("disabled").css("opacity", 0.5);
  // $("#configureAuctionBtn").prop("disabled", true).css("opacity", 0.5);
}

// Fill asset name and click
$(".sbmt.first").on("click", function () {
  const assetName = $("#assetName").val();

  if (assetName.length < 1) {
    $(".assetDetailsError").html("Please enter valid asset name");
    return;
  }

  localStorage.setItem("assetName", assetName);

  $(".tabHead ul li.two").addClass("active");
  $(".tabHead ul li.two").addClass("bold");

  $("#two").addClass("active");
  $("#one").removeClass("active");
  $(".one").removeClass("bold");
});

export function hideSlider() {
  // UI
  $("body").removeClass("openSlide");
  $(".menuBox ul li.prodct").removeClass("active");
}

/**
 * -------------------------
 * Choose Auction
 * -------------------------
 */

window.chooseAuction = async function () {
  const assetName = $("#assetName").val();

  localStorage.setItem("auctionType", auctionType);

  $("#chooseAuctionBtn").prop("disabled", true).css("opacity", 0.5);
  $(".tea-sip").show();
  const result = await createAuctionInstance(assetName, auctionType);

  if (result.err) {
    $("#chooseAuctionResult").html(result.err);
    $("#chooseAuctionBtn").prop("disabled", false).css("opacity", 1);
    return;
  }

  contractAddress = result.contractInstance;
  if (!contractAddress) {
    $("#chooseAuctionBtn").prop("disabled", false).css("opacity", 1);
    return;
  }

  localStorage.setItem("contractAddress", contractAddress);
  $("#chooseAuctionResult").html(`Contract Address: ${contractAddress}`);

  // UI
  $(".tabHead ul li.two").removeClass("bold");

  $(".tabHead ul li.three").addClass("active");
  $(".tabHead ul li.three").addClass("bold");

  $("#three").addClass("active");
  $("#two").removeClass("active");

  $(".tabHead ul li.one").addClass("disabled").css("opacity", 0.5);
  $(".tabHead ul li.two").addClass("disabled").css("opacity", 0.5);
  $(".tea-sip").hide();
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
    $(".configureAuctionError").html("Please enter valid wait time");
    return;
  }

  localStorage.setItem("reservePrice", reservePrice);
  localStorage.setItem("increment", increment);
  localStorage.setItem("datepicker", datepicker);
  localStorage.setItem("timepicker", timepicker);
  localStorage.setItem("waithour", waithour);
  localStorage.setItem("waitmin", waitmin);

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

    hour = Number(hour) + 12;
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
  const storage = await getContractStorage(contractAddress);
  setStorage(storage);
  await submitForm();

  hideSlider();
  $(".tabHead ul li.three").addClass("disabled").css("opacity", 0.5);
  $("#configureAuctionBtn").prop("disabled", true).css("opacity", 0.5);
};

let auctionType;

window.setAuctionType = function (type) {
  auctionType = type;
};

async function submitForm() {
  $("form#auction-details-form").submit(function (e) {
    e.preventDefault();
  });
}

function setStorage(instanceStorageDetails) {
  let assetId = "";
  let startTime = "";
  let waitTime = "";
  let auctionParams = {};
  instanceStorageDetails.children.forEach((element) => {
    switch (element.name) {
      // generic auction details
      case "asset_id":
        assetId = element.value;
        break;
      case "start_time":
        startTime = element.value;
        break;
      case "wait_time":
        waitTime = element.value;
        break;
      // English auction params
      case "current_bid":
        auctionParams.currentBid = element.value;
        break;
      case "min_increase":
        auctionParams.minIncrease = element.value;
        break;
      case "highest_bidder":
        auctionParams.highestBidder = element.value;
        break;
      // Dutch auction params
      case "current_price":
        auctionParams.currentPrice = element.value;
        break;
      case "reserve_price":
        auctionParams.reservePrice = element.value;
        break;
      // Sealed bid auction params
      case "participation_fee":
        auctionParams.participationFee = element.value;
        break;
      case "highest_bid":
        auctionParams.highestBid = element.value;
        break;
      case "highest_bidder":
        auctionParams.highestBidder = element.value;
        break;
      default:
      //
    }
  });

  $("#assetId").val(assetId);
  $("#auctionType").val(auctionType);
  $("#startTime").val(startTime);
  $("#waitTime").val(waitTime);
  $("#auctionParams").val(JSON.stringify(auctionParams));
  $("#userPubKey").val(walletAddress);
  $("#contractAddress").val(contractAddress);
}
