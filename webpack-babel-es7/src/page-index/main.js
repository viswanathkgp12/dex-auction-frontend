import {
  isAvailable,
  connect,
  getWalletInfo,
  chooseAuction,
} from "../utils/thanos";

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

  console.log("Connecting to RPC ...");
  walletState = CONNECTING;
  await connect();

  console.log("Fetch wallet info ...");
  const { tezos, address } = await getWalletInfo();

  // Uncomment if you want to display in UI
  // document.getElementById("address").innerHTML = address;

  console.log("Address of wallet: ", address);
  walletState = CONNECTED;
}

window.onload = function () {
  checkAvailability();
};

window.chooseAuction = function () {
  chooseAuction(0, "name", "english");
};