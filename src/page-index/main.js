import "../style/style.css";
import "../style/bootstrap.min.css";
import "../style/jquery.timepicker.css";

import $ from "jquery";
import { connectWallet, checkAvailability, checkAndSetKeys } from "../common";

/**
 * ---------------------
 * UI Bindings
 * ----------------------
 */

$(".prodct").on("click", async function () {
  // Check Thanos Availability
  await checkAvailability();
  await connectWallet();

  checkAndSetKeys();

  // Open slider
  $("body").addClass("openSlide");
  $(".menuBox ul li.prodct").addClass("active");
});
