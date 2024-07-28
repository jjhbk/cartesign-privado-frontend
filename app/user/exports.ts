import { hexToString, parseAbi } from "viem";
import configFile from "./config.json";
import { createContext } from "vm";
const config: any = configFile;
export const InspectCall = async (
  path: string,
  chainid: string
): Promise<any> => {
  let apiURL = "http://127.0.0.1:8080/inspect";
  let payload;
  if (config[chainid]?.inspectAPIURL) {
    apiURL = `${config[chainid].inspectAPIURL}/inspect`;
  } else {
    console.error(`No inspect interface defined for chain ${chainid}`);
    return new Error(`No inspect interface defined for chain ${chainid}`);
  }
  console.log(`${apiURL}/${path}`);
  await fetch(`${apiURL}/${path}`, {
    method: "get",
    headers: new Headers({
      "ngrok-skip-browser-warning": "9999",
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("inspect result is:", data);
      payload = hexToString(data.reports[0]?.payload);
    });
  return payload;
};

export const DappAbi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
  "function createAgreement(string agreement)",
  "function acceptAgreement(string id,string signature)",
  "function endAgreement(string id,string signature)",
  "function terminateAgreement(string id,string signature,uint32 reason)",
]);
