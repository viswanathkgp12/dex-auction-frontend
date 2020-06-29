import { getOpByHashTzkt, getAuctions } from "../utils/api";
import { sleep } from "../utils/sleep";
import { startAuction, bid } from "../utils/thanos";
import { connectWallet, checkAvailability, checkAndSetKeys } from "../common";

/**
 * ---------------------------
 * Auction Contract
 * ---------------------------
 */

async function createBid(contractAddress, amount) {
  await checkAvailability();
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

function myFunction() {
  var x = document.getElementById("myFile");
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

$("#prodct").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  checkAndSetKeys();
  myFunction();

  // Open slider
  $("body").addClass("openSlide");
  $(".menuBox ul li.prodct").addClass("active");
});

window.shortlistAuction = async function shortlistAuction() {
  console.log("---------------");
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  const contractAddress = "KT19uwQwQjeqgH9tyrzWFEHeiqBVChVVfZB1";
  const amount = 1e-6;

  await createBid(contractAddress, amount);
};

// Auctions populate

let upcomingAuctionsCount = 0,
  ongoingAuctionsCount = 0,
  completedAuctionsCount = 0;

function getAuctionType(auctionType) {
  const auctionTypeMapping = {
    english: "English Auction",
    dutch: "Dutch Auction",
    vickery: "Vickery",
    sealed_bid: "Sealed Bid",
  };

  return auctionTypeMapping[auctionType];
}

function populateAuctions(auctionJson) {
  const auctionStatus = auctionJson.auctionStatus;
  const auctionName = auctionJson.assetName;
  const auctionType = getAuctionType(auctionJson.auctionType);
  const auctionDescription = auctionJson.assetDescription;

  let auctionReservePrice, auctionIncrement, priceElement;

  if (auctionType === "English Auction") {
    auctionReservePrice = auctionJson.auctionParams.currentBid;
    auctionIncrement = auctionJson.auctionParams.minIncrease;
    priceElement = `
    <h4>
      Min. Increment : <span class="auctionIncrement">${auctionIncrement} XTZ</span>
    </h4>
    `;
  } else {
    auctionReservePrice = auctionJson.auctionParams.reservePrice;
    const auctionCurrentPrice = auctionJson.auctionParams.currentPrice;
    priceElement = `
    <h4>
      Curr. Price : <span class="auctionIncrement">${auctionCurrentPrice} XTZ</span>
    </h4>
    `;
  }

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

  const auctionStartDate = new Date(auctionJson.startTime);
  const dateString =
    auctionStartDate.getDate() +
    " " +
    monthNames[auctionStartDate.getMonth()] +
    ", " +
    auctionStartDate.getHours() +
    ":" +
    auctionStartDate.getMinutes()
    + " UTC";
  const assetImageFileName = auctionJson.assetImageFileName;

  const imgUrl =
    assetImageFileName == ""
      ? ""
      : `http://54.172.0.221:8080/images/${assetImageFileName}`;

  const diffTime = Math.abs(auctionStartDate - Date.now());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const rem = diffTime - diffDays * (1000 * 60 * 60 * 24);
  const diffHours = Math.ceil(rem / (1000 * 60 * 60));
  let timeLeft = `${diffDays} day ${diffHours} hrs`;

  const waitTime = auctionJson.roundTime;
  const waitHours = Math.floor(waitTime / (60 * 60));
  const waitMins = Math.ceil((waitTime - waitHours * (60 * 60)) / 60);

  const auctionDuration = `${waitHours} hr ${waitMins} mins`;
  let owner, button;

  if (auctionStatus == "upcoming") {
    owner = auctionJson.seller;
    button = `
    <input
      type="button"
      class="btn shortlistbtn"
      value="Shortlist"
      onclick="shortlistAuction()"
    />
    `;
    timeLeft += " left";
  } else if (auctionStatus == "ongoing") {
    owner = auctionJson.seller;
    button = `
    <input
      type="button"
      class="btn shortlistbtn"
      value="Bid"
      onclick="shortlistAuction()"
    />
    `;
    timeLeft = "Ongoing";
  } else if (auctionStatus == "completed") {
    owner = auctionJson.buyer;
    timeLeft += " ago";
  }

  const auctionItemCard = `
    <div class="prod-card">
      <div class="lt auctionImage"><img alt="bid-item-image" src="${imgUrl}" /></div>
      <div class="rt">
          <div class="left">
            <h1 class="auctionName">${auctionName}</h1>
            <h2 class="auctionType">${auctionType}</h2>
            <h3>
                Owner:
                <span class="owner">
                  <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
                </span>
            </h3>
            <div class="paragrph auctionDescription">
                <p>${auctionDescription}</p>
            </div>
          </div>
          <div class="right">
            <h3>
                Reserve Price <span class="auctionReservePrice">${auctionReservePrice} XTZ</span>
            </h3>
            ${priceElement}
            <ul>
                <li>
                  <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
                  <span class="auctionStartDate">${dateString}</span>
                </li>
                <li>
                  <span>Round Duration</span>
                  <span class="auctionDuration">${auctionDuration}</span>
                </li>
            </ul>
            ${button}
          </div>
      </div>
    </div>
    `;

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

async function updateAuctionData() {
  upcomingAuctionsCount = 0;
  ongoingAuctionsCount = 0;
  completedAuctionsCount = 0;

  const auctions = await getAuctions();

  auctions.forEach((auction) => {
    populateAuctions(auction);
  });
}

$(document).ready(function () {
  updateAuctionData();
});
