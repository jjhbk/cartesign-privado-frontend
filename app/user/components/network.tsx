import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FC, useState } from "react";
import configFile from "../config.json";
const config: any = configFile;
export const Network: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [dappAddress, setDappAddress] = useState<string>(
    "0xccf6a46CF287e1f8e1b2981c1f5B92BA77F3e9Ed"
  );

  return (
    <div className="flex">
      {!wallet && (
        <button
          className="bg-sky-500 flex-1 mx-5 justify-self-center self-center rounded-md p-5 text-2xl shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
          onClick={() => connect()}
        >
          {connecting ? "connecting" : "Connect-Wallet"}
        </button>
      )}
      {wallet && (
        <div>
          <label className=" box-border p-2 border-2 mx-2 dark:text-slate-200">
            Switch Chain
          </label>
          {settingChain ? (
            <span>Switching chain...</span>
          ) : (
            <select
              className="box-decoration-clone box-border p-2 border-2 mx-2 dark:text-slate-200 bg-orange-500"
              onChange={({ target: { value } }) => {
                if (config[value] !== undefined) {
                  setChain({ chainId: value });
                } else {
                  alert("No deploy on this chain");
                }
              }}
              value={connectedChain?.id}
            >
              {chains.map(({ id, label }) => {
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
          <button
            className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
            onClick={() => disconnect(wallet)}
          >
            Disconnect Wallet
          </button>
          <div className="flex flex-row my-2 justify-start">
            <h2 className=" box-border border-2 mx-2 p-2 justify-self-center self-center ">
              Dapp Address :{" "}
            </h2>
            <input
              className="box-border border-2 p-2 mx-2 bg-orange-500"
              type="text"
              value={dappAddress}
              onChange={(e) => setDappAddress(e.target.value)}
            />
            <br />
            <br />
          </div>
          <div className="flex flex-col justify-center items-center">
            <h2 className="self-center mx-5">
              Verify your Age Using Privado ID to start Interacting with Cartesi
              DApp greater than 18 years of age
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};
