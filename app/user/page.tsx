"use client";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { getAddress, hexToString } from "viem";
import {
  useState,
  useRef,
  FC,
  useEffect,
  useContext,
  createContext,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { parseAbi } from "viem";
import {
  advanceDAppRelay,
  advanceERC20Deposit,
  advanceERC721Deposit,
  advanceEtherDeposit,
  advanceInput,
} from "@mugen-builders/client";
import "../globals.css";
import Modal from "./components/modal";
import EmploymentAgreementForm from "./components/employment_agreement_form";
import RentalAgreementForm from "./components/rental_agreement_form";
import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Network } from "./components/network";
import Dashboard from "./components/dashboard";
import configFile from "./config.json";
import { InspectCall } from "./exports";
const config: any = configFile;
const injected = injectedModule();

init({
  wallets: [injected],
  chains: Object.entries(config).map(([k, v]: [string, any], i) => ({
    id: k,
    token: v.token,
    label: v.label,
    rpcUrl: v.rpcUrl,
  })),
  appMetadata: {
    name: "Cartesi-Privado Verifier",
    icon: "<svg>CarteSign<svg/>",
    description: "Cartesi Dapp with PrivadoID Verification",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});

const dappAbi = parseAbi([
  "function checkWhiteList(address user)",
  "function addToWhiteList(address user)",
]);

/*export const InspectCall = async (
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
*/

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [isWhiteListed, setIsWhiteListed] = useState(false);
  const [contracts, setContracts] = useState(undefined);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [dappAddress, setDappAddress] = useState<string>(
    process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS
      ? process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS
      : "0x96Ef96d20a5b8b361A7d91318C12A75cDD7febc5"
  );
  console.log(process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS);

  // "0xFa7Cc7fBa257b915B7dE86bE3Eb3114FbA94701E"); //"0x48383296da5f7Ce3408Cf98445289daF48488607"
  const [connectedWallet] = useWallets();
  const addCustomInput = async (input: any): Promise<any> => {
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );

    console.log("adding input");
    const signer = await provider.getSigner();
    console.log(signer);
    advanceInput(signer, dappAddress, input);
  };

  const checkWhitelist = async (id: string) => {
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );
    setProvider(provider);

    const _signer = await provider.getSigner();
    setSigner(signer);
    const address = await _signer.getAddress();
    console.log(_signer, address, id);

    const payload = await InspectCall(`whiteList/${address.toLowerCase()}`, id);
    console.log("payload is", payload);
    if (JSON.parse(payload)?.result) {
      console.log("whitelist status is:", JSON.parse(payload)?.result);

      alert("You are a registered user on Cartesign");
      setIsWhiteListed(true);
    } else {
      alert(
        "you are not a registered user on Cartesign please verify your identity using Privado ID"
      );
    }
  };
  useEffect(() => {
    if (connectedWallet && connectedChain) {
      checkWhitelist(connectedChain.id);
    }
  }, [connectedWallet]);
  return (
    <div className="w-screen overflow-y-auto  h-dvh  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ">
      <div className="relative  divide-y divide-dashed divide-blue-400 flex flex-col">
        <div className="flex justify-between  flex-row w-full">
          <img
            className=" rounded-full h-32 w-32"
            src="https://jjhbk.github.io/assets/images/cartesign_logo.png"
          />
          <h1 className="font-bold font-sans text-2xl self-center justify-self-center">
            Cartesi-Privado Verifier
          </h1>
          <Link href={"/"}>
            <HomeIcon className="h-20 w-20 active:scale-110 text-blue-300 " />
          </Link>
        </div>
        <Network />

        <br />
      </div>
      (
      {!isWhiteListed && connectedWallet && (
        <div>
          <Modal dapp={dappAddress} show={!isWhiteListed} />
        </div>
      )}
      <div className="p-6">
        {isWhiteListed && connectedWallet && <Dashboard dapp={dappAddress} />}
      </div>
      )
    </div>
  );
}
