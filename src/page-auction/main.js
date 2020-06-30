import { getOpByHashTzkt, getAuctions } from "../utils/api";
import { sleep } from "../utils/sleep";
import {
  startAuction,
  bid,
  resolveAuction,
  cancelAuction,
  dropPrice,
  acceptPrice,
} from "../utils/thanos";
import { connectWallet, checkAvailability, checkAndSetKeys } from "../common";
import {
  getEnglishAuctionTemplate,
  getDutchAuctionTemplate,
} from "./templates";

/**
 * ---------------------------
 * Auction Contract
 * ---------------------------
 */

let walletAddress;

async function connectToThanos() {
  await checkAvailability();
  const walletInfo = await connectWallet();
  walletAddress = walletInfo.walletAddress;
}

async function onClickAuctionStart() {
  await connectToThanos();

  const { err, opHash } = await startAuction(contractAddress);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Start auction succeeded with: ", opHash);
  return poll(opHash);
}

async function onClickResolveAuction(contractAddress) {
  await connectToThanos();

  const { err, opHash } = await resolveAuction(contractAddress);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Resolve auction succeeded with: ", opHash);
  return poll(opHash);
}

async function onClickCancelAuction(contractAddress) {
  await connectToThanos();

  const { err, opHash } = await cancelAuction(contractAddress);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Cancel auction succeeded with: ", opHash);
  return poll(opHash);
}

async function onClickDropPrice(contractAddress) {
  await connectToThanos();

  const { err, opHash } = await dropPrice(contractAddress);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Drop price succeeded with: ", opHash);
  return poll(opHash);
}

async function onClickAcceptPrice(contractAddress, amount) {
  await connectToThanos();

  const { err, opHash } = await acceptPrice(contractAddress, amount);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Accept price succeeded with: ", opHash);
  return poll(opHash);
}

async function createBid(contractAddress, amount) {
  await connectToThanos();

  const { err, opHash } = await bid(contractAddress, amount);
  if (err) {
    console.log("Error occured");
    return;
  }

  console.log("Bid for auction succeeded with: ", opHash);
  return poll(opHash);
}

async function poll(opHash, retries = 10) {
  try {
    if (!retries) {
      return {
        err: "Timeout exceeded",
      };
    }

    const tzktOpdata = await getOpByHashTzkt(opHash);
    console.log("TZKT Operation data received: ", tzktOpdata);

    if (tzktOpdata !== null && tzktOpdata.length > 0) {
      const status = tzktOpdata[0].status;
      if (status === "applied") {
        return {
          err: null,
        };
      }
    }

    retries--;

    await sleep(5000);
    return poll(opHash, retries);
  } catch (error) {
    return poll(opHash, retries);
  }
}

/**
 * ---------------------
 * UI Bindings
 * ----------------------
 */

$("#prodct").on("click", async function () {
  // Check Thanos Availability
  await connectToThanos();

  checkAndSetKeys();
  checkImageFileSelection();

  // Open slider
  $("body").addClass("openSlide");
  $(".menuBox ul li.prodct").addClass("active");
});

function checkImageFileSelection() {
  const x = document.getElementById("myFile");
  var txt = "";
  if ("files" in x) {
    if (x.files.length == 0) {
      txt = "Select one or more files.";
    } else {
      for (var i = 0; i < x.files.length; i++) {
        txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
        var file = x.files[i];
        if ("name" in file) {
          //txt += "name: " + file.name + "<br>";
          element.classList.add("mystyle");
        }
      }
    }
  }

  document.getElementById("fileError").innerHTML = txt;
}

window.bid = async function () {
  const contractAddress = localStorage.getItem("contractAddress");
  const amount = 1e-6;

  await createBid(contractAddress, amount);
};

window.startAuction = async function () {
  await onClickAuctionStart();
};

// TODO: fill this with API
window.shortlistAuction = function () {
  console.log("Shortlist auction invoked");
};

window.resolveAuction = async function () {
  const contractAddress = localStorage.getItem("contractAddress");
  await onClickResolveAuction(contractAddress);
};

window.cancelAuction = async function () {
  const contractAddress = localStorage.getItem("contractAddress");
  await onClickCancelAuction(contractAddress);
};

window.dropPrice = async function () {
  const contractAddress = localStorage.getItem("contractAddress");
  await onClickDropPrice(contractAddress);
};

window.acceptPrice = async function () {
  const contractAddress = localStorage.getItem("contractAddress");
  await onClickAcceptPrice(contractAddress);
};

$(document).ready(async function () {
  await connectToThanos();
  updateAuctionData();
});

/**
 * ----------------------
 * Auctions populate
 * ----------------------
 */

let upcomingAuctionsCount = 0,
  ongoingAuctionsCount = 0,
  completedAuctionsCount = 0;

async function updateAuctionData() {
  upcomingAuctionsCount = 0;
  ongoingAuctionsCount = 0;
  completedAuctionsCount = 0;

  const auctions = await getAuctions();

  auctions.forEach((auction) => {
    populateAuctions(auction);
  });
}

function populateAuctions(auctionJson) {
  const auctionStatus = auctionJson.auctionStatus;
  const auctionName = auctionJson.assetName;
  const auctionType = getAuctionType(auctionJson.auctionType);
  const auctionDescription = auctionJson.assetDescription;
  const auctionParams = auctionJson.auctionParams;

  const auctionStartDate = new Date(auctionJson.startTime);
  const dateString =
    auctionStartDate.getDate() +
    " " +
    getMonthName(auctionStartDate.getMonth()) +
    ", " +
    auctionStartDate.getHours() +
    ":" +
    auctionStartDate.getMinutes() +
    " UTC";
  const assetImageFileName = auctionJson.assetImageFileName;
  const imgUrl = getImageUrl(assetImageFileName);
  const timeLeft = getTimeLeftForAuctionStart(auctionStartDate);

  const waitTime = auctionJson.roundTime;
  const auctionDuration = getAuctionDuration(waitTime);

  let owner;

  if (auctionStatus == "upcoming") {
    owner = auctionJson.seller;
  } else if (auctionStatus == "ongoing") {
    owner = auctionJson.seller;
  } else if (auctionStatus == "completed") {
    owner = auctionJson.buyer;
  }

  // Get templates
  let auctionItemCard;

  if (auctionJson.auctionType === "english") {
    auctionItemCard = getEnglishAuctionTemplate(
      imgUrl,
      auctionName,
      auctionType,
      auctionStatus,
      owner,
      auctionDescription,
      auctionParams,
      timeLeft,
      dateString,
      auctionDuration,
      auctionJson.buyer,
      auctionJson.seller,
      walletAddress
    );
  } else if (auctionJson.auctionType === "dutch") {
    auctionItemCard = getDutchAuctionTemplate(
      imgUrl,
      auctionName,
      auctionType,
      auctionStatus,
      owner,
      auctionDescription,
      auctionParams,
      timeLeft,
      dateString,
      auctionDuration,
      auctionJson.buyer,
      auctionJson.seller,
      walletAddress
    );
  }

  if (auctionStatus == "upcoming") {
    upcomingAuctionsCount++;
    $("#upcoming-count").html(upcomingAuctionsCount);
    $("#upcoming-list").append(auctionItemCard);
  } else if (auctionStatus == "ongoing") {
    ongoingAuctionsCount++;
    $("#ongoing-count").html(ongoingAuctionsCount);
    $("#ongoing-list").append(auctionItemCard);
  } else if (auctionStatus == "completed") {
    completedAuctionsCount++;
    $("#completed-count").html(completedAuctionsCount);
    $("#completed-list").append(auctionItemCard);
  }
}

function getAuctionType(auctionType) {
  const auctionTypeMapping = {
    english: "English Auction",
    dutch: "Dutch Auction",
    vickery: "Vickery",
    sealed_bid: "Sealed Bid",
  };

  return auctionTypeMapping[auctionType];
}

function getMonthName(monthNumber) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return monthNames[monthNumber];
}

function getAuctionDuration(waitTime) {
  const waitHours = Math.floor(waitTime / (60 * 60));
  const waitMins = Math.ceil((waitTime - waitHours * (60 * 60)) / 60);

  return `${waitHours} hr ${waitMins} mins`;
}

function getTimeLeftForAuctionStart(auctionStartDate) {
  const diffTime = Math.abs(auctionStartDate - Date.now());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const rem = diffTime - diffDays * (1000 * 60 * 60 * 24);
  const diffHours = Math.ceil(rem / (1000 * 60 * 60));
  return `${diffDays} day ${diffHours} hrs`;
}

function getImageUrl(assetImageFileName) {
  return assetImageFileName == ""
    ? ""
    : `http://54.172.0.221:8080${assetImageFileName}`;
}
