import $ from "jquery";
import { getOpByHashTzkt } from "../utils/api";
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
