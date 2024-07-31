import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { FC, useState } from "react";
import configFile from "../config.json";
const config: any = configFile;
export const Network: FC = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const [dappAddress, setDappAddress] = useState<string>(
    process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS
      ? process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS
      : "0x96Ef96d20a5b8b361A7d91318C12A75cDD7febc5"
  );
  console.log(process.env.NEXT_PUBLIC_DAPP_AMOY_ADDRESS);
  return (
    <div className="flex">
      {!wallet && (
        <button
          className="long-button-user bg-sky-500 flex-1 mx-5 justify-self-center self-center rounded-md p-1 text-2xl shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
          onClick={() => connect()}
        >
          {connecting ? "connecting" : "Connect-Wallet"}
        </button>
      )}
      {wallet && (
        <div className="mt-5">
          <div className="chain-info">
            <label className="change-color box-border p-2 border-2 mx-2 dark:text-slate-200">
              Switch Chain
            </label>
            {settingChain ? (
              <span>Switching chain...</span>
            ) : (
              <select
                className="change-color box-decoration-clone box-border p-2 border-2 mx-2 dark:text-slate-200 bg-transparent"
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
            <h2 className=" box-border border-2 mx-2 p-2 justify-self-center self-center ">
              Dapp Address {" "}
            </h2>
            <input
              className="change-color box-border border-2 p-2 mx-2 bg-transparent"
              type="text"
              value={dappAddress}
              onChange={(e) => setDappAddress(e.target.value)}
            />
            <button
              className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
              onClick={() => disconnect(wallet)}
            >
              Disconnect Wallet
            </button>
          </div>
       
          <div className="flex flex-col justify-center items-center mt-10">
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
