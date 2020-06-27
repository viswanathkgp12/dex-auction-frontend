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

$("#prodct").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  checkAndSetKeys();

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

function populateAuctions(auctionJson) {
  const auctionStatus = auctionJson.auctionStatus;
  const auctionName = auctionJson.auctionName;
  const auctionType = auctionJson.auctionType;
  const auctionDescription = auctionJson.assetDescription;
  const auctionReservePrice = auctionJson.auctionParams.currentBid;
  const auctionIncrement = auctionJson.auctionParams.minIncrease;
  const auctionStartDate = "29th June, 8:00pm";
  const timeLeft = "2 days"; // from start date
  const auctionDuration = "1 hr 10 mins";
  const owner = auctionJson.auctionParams.highestBidder;

  const auctionItemCard = `
    <div class="prod-card">
      <div class="lt auctionImage"><img src="src/images/Image-8.jpg" /></div>
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
            <h4>
                Min. Increment : <span class="auctionIncrement">${auctionIncrement} XTZ</span>
            </h4>
            <ul>
                <li>
                  <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
                  <span class="auctionStartDate">${auctionStartDate}</span>
                </li>
                <li>
                  <span>Round Duration</span>
                  <span class="auctionDuration">${auctionDuration}</span>
                </li>
            </ul>
            <input
                type="button"
                class="btn shortlistbtn"
                value="Shortlist"
                />
          </div>
      </div>
    </div>
    `;

  $("#upcoming-list").append(auctionItemCard);
}

async function updateAuctionData() {
  const auctions = await getAuctions();

  auctions.forEach((auction) => {
    populateAuctions(auction);
  });
}

$(document).ready(function () {
  updateAuctionData();
});
