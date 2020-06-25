const axios = require("axios").default;

// // Better Call Dev
const BASE_URL = "https://api.better-call.dev/v1";

export async function getOpByHashBcd(hash) {
  console.log("Better call dev");
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 2000,
    responseType: "json",
  });
  return api.get(`/opg/${hash}`).then((res) => {
    if (res.status != 200) {
      throw new RequestFailedError(res);
    }
    return res.data;
  });
}

// TZKT
const TZKT_BASE_URL = "https://api.carthage.tzkt.io/v1";

export async function getOpByHashTzkt(hash) {
  const api = axios.create({
    baseURL: TZKT_BASE_URL,
    timeout: 2000,
    responseType: "json",
  });
  return api.get(`/operations/${hash}`).then((res) => {
    if (res.status != 200) {
      throw new RequestFailedError(res);
    }
    return res.data;
  });
}
