export function getEnglishAuctionTemplate(
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
  buyer,
  seller,
  userPubKey
) {
  let button = "",
    maxBidElement = "",
    ownerElement = "",
    startDateElement = "",
    roundDurationElement = "";
  if (auctionStatus == "upcoming") {
    if (userPubKey == seller) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Start"
          onclick="startAuction()"
        />
        `;
    } else if (userPubKey != seller && userPubKey != buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Shortlist"
          onclick="shortlistAuction()"
        />
        `;
    }

    ownerElement = `
    <h3>
        Owner:
        <span class="owner">
            <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
        </span>
    </h3>
    `;

    timeLeft += " left";
    startDateElement = `
    <li>
      <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
      <span class="auctionStartDate">${dateString}</span>
    </li>
    `;
    roundDurationElement = `
    <li>
        <span>Round Duration</span>
        <span class="auctionDuration">${auctionDuration}</span>
    </li>
    `;
  } else if (auctionStatus == "ongoing") {
    if (userPubKey == seller) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Resolve"
          onclick="resolveAuction()"
        />
        <input
          type="button"
          class="btn shortlistbtn"
          value="Cancel"
          onclick="cancelAuction()"
        />
        `;
    } else if (userPubKey != seller && userPubKey != buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Bid"
          onclick="bid()"
        />
        `;
    }

    maxBidElement = `
    <h3 style="width: 50%">
        Highest Bid <span class="auctionReservePrice">${auctionParams.highestBid} XTZ</span>
    </h3>
    `;
    ownerElement = `
    <h3>
        Owner:
        <span class="owner">
            <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
        </span>
    </h3>
    `;

    timeLeft = "Ongoing";
    startDateElement = `
    <li>
      <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
      <span class="auctionStartDate">${dateString}</span>
    </li>
    `;
    roundDurationElement = `
    <li>
        <span>Round Ends In</span>
        <span class="auctionDuration">${auctionDuration}</span>
    </li>
    `;
  } else {
    // TODO:
    if (userPubKey == buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Auction"
          onclick="configureAuction()"
        />
        `;
    }

    maxBidElement = `
    <h3 style="width: 50%">
        Winning Bid <span class="auctionReservePrice">${auctionParams.highestBid} XTZ</span>
    </h3>
    `;
    ownerElement = `
    <h3>
        Winner:
        <span class="owner">
            <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
        </span>
    </h3>
    `;
    startDateElement = `
    <li style="width: 100% !important">
      <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
      <span class="auctionStartDate">${dateString}</span>
    </li>
    `;
  }

  return `
    <div class="prod-card">
      <div class="lt auctionImage"><img alt="bid-item-image" src="${imgUrl}" /></div>
      <div class="rt">
          <div class="left">
            <h1 class="auctionName">${auctionName}</h1>
            <h2 class="auctionType">${auctionType}</h2>
            ${ownerElement}
            <div class="paragrph auctionDescription">
                <p>${auctionDescription}</p>
            </div>
          </div>
          <div class="right">
            <span>
              <h3 style="width: 50%">
                  Reserve Price <span class="auctionReservePrice">${auctionParams.reservePrice} XTZ</span>
              </h3>
              ${maxBidElement}
            </span>
            <h4>
                Min. Increment : <span class="auctionIncrement">${auctionParams.minIncrease} XTZ</span>
            </h4>
            <ul>
                ${startDateElement}
                ${roundDurationElement}
            </ul>
            ${button}
          </div>
      </div>
    </div>
    `;
}

export function getDutchAuctionTemplate(
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
  buyer,
  seller,
  userPubKey
) {
  let button = "",
    currPriceElement = "",
    ownerElement = "",
    roundDurationElement = "",
    startDateElement = "";
  if (auctionStatus == "upcoming") {
    if (userPubKey == seller) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Start"
          onclick="startAuction()"
        />
        `;
    } else if (userPubKey != seller && userPubKey != buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Shortlist"
          onclick="shortlistAuction()"
        />
        `;
    }

    ownerElement = `
      <h3>
          Owner:
          <span class="owner">
              <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
          </span>
      </h3>
      `;

    timeLeft += " left";
    startDateElement = `
      <li>
        <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
        <span class="auctionStartDate">${dateString}</span>
      </li>
      `;
    roundDurationElement = `
      <li>
          <span>Round Duration</span>
          <span class="auctionDuration">${auctionDuration}</span>
      </li>
      `;
  } else if (auctionStatus == "ongoing") {
    if (userPubKey == seller) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Drop Price"
          onclick="dropPrice()"
        />
        `;
    } else if (userPubKey != seller && userPubKey != buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Accept Price"
          onclick="acceptPrice()"
        />
        `;
    }

    currPriceElement = `
      <h3 style="width: 50%">
          Current Price <span class="auctionReservePrice">${auctionParams.currentPrice} XTZ</span>
      </h3>
      `;
    ownerElement = `
      <h3>
          Owner:
          <span class="owner">
              <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
          </span>
      </h3>
      `;

    timeLeft = "Ongoing";
    startDateElement = `
  <li>
    <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
    <span class="auctionStartDate">${dateString}</span>
  </li>
  `;
    roundDurationElement = `
      <li>
          <span>Round Ends In</span>
          <span class="auctionDuration">${auctionDuration}</span>
      </li>
      `;
  } else {
    // TODO:
    if (userPubKey == buyer) {
      button = `
        <input
          type="button"
          class="btn shortlistbtn"
          value="Auction"
          onclick="configureAuction()"
        />
        `;
    }

    currPriceElement = `
        <h3 style="width: 50%">
            Winning Price <span class="auctionReservePrice">${auctionParams.currentPrice} XTZ</span>
        </h3>
        `;
    ownerElement = `
      <h3>
          Winner:
          <span class="owner">
              <a class="carthagelink" href="https://carthage.tzkt.io/${owner}" target="blank">${owner}</a>
          </span>
      </h3>
      `;
    startDateElement = `
  <li style="width: 100% !important">
    <span>Start Date <cite class="timeLeft">${timeLeft}</cite></span>
    <span class="auctionStartDate">${dateString}</span>
  </li>
  `;
  }

  return `
      <div class="prod-card">
        <div class="lt auctionImage"><img alt="bid-item-image" src="${imgUrl}" /></div>
        <div class="rt">
            <div class="left">
              <h1 class="auctionName">${auctionName}</h1>
              <h2 class="auctionType">${auctionType}</h2>
              ${ownerElement}
              <div class="paragrph auctionDescription">
                  <p>${auctionDescription}</p>
              </div>
            </div>
            <div class="right">
              <span>
                <h3 style="width: 50%">
                    Reserve Price <span class="auctionReservePrice">${auctionParams.reservePrice} XTZ</span>
                </h3>
                ${currPriceElement}
              </span>
              <h4>
                  Current Price : <span class="auctionIncrement">${auctionParams.currentPrice} XTZ</span>
              </h4>
              <ul>
                  ${startDateElement}
                  ${roundDurationElement}
              </ul>
              ${button}
            </div>
        </div>
      </div>
      `;
}
