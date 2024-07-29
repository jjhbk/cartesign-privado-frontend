import { useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import React from "react";
import { encodeFunctionData, parseAbi } from "viem";
import verifierAbi from "../../abi/CartesiUVerifier.json";
import QRCode from "react-qr-code";
export default function Modal(props: any) {
  const [showModal, setShowModal] = React.useState(props.show);
  const [connectedWallet] = useWallets();
  const UNIVERSAL_VERIFIER_ADDRESS =
    "0x70696036CA1868B42155b06235F95549667Eb0BE";
  const CARTESI_U_VERIFIER_ADDRESS =
    "0x70c0dE66524a14a55BDb18D00a50e32648dCAa4c";

  const provider = new ethers.providers.Web3Provider(connectedWallet.provider);
  const qrcodeJson = {
    id: "7f38a193-0918-4a48-9fac-36adfdb8b542",
    typ: "application/iden3comm-plain-json",
    type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
    thid: "7f38a193-0918-4a48-9fac-36adfdb8b542",
    body: {
      reason: "Cartesi Verification",
      transaction_data: {
        contract_address: "0x70696036CA1868B42155b06235F95549667Eb0BE",
        method_id: "b68967e2",
        chain_id: 80002,
        network: "polygon-amoy",
      },
      scope: [
        {
          id: 1717138699,
          circuitId: "credentialAtomicQuerySigV2OnChain",
          query: {
            allowedIssuers: ["*"],
            context:
              "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
            credentialSubject: { birthday: { $lt: 20020101 } },
            type: "KYCAgeCredential",
          },
        },
      ],
    },
  };
  const RequestWhiteList = async () => {
    try {
      // ############### Use this code to set request in Universal Verifier ############

      const contract = new ethers.Contract(
        CARTESI_U_VERIFIER_ADDRESS,
        verifierAbi.abi,
        provider
      );
      const signer = await provider.getSigner();
      const universalVerifier = contract.connect(signer);
      console.log(await signer.getAddress(), universalVerifier);
      // You can call this method on behalf of any signer which is supposed to be request controller
      const tx = await universalVerifier.whiteList(1717138699, props.dapp);

      console.log("Request set", tx);
      alert(`tx successful , user whitelisted : ${JSON.stringify(tx)}`);
      setShowModal(false);
    } catch (e) {
      console.log("error: ", e);
      alert(
        `Error: please generate and send a proof from you polygonID Wallet app first:${e}`
      );
    }
  };
  return (
    <>
      {!showModal && (
        <div className="flex">
          <button
            className="bg-sky-500 flex-1 mx-5 justify-self-center items-center  text-white shadow-sm focus:outline-none focus:ring  hover:bg-sky-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={() => setShowModal(true)}
          >
            Verify Account{" "}
          </button>
        </div>
      )}
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-pink-400">
            <div className="relative w-full items-center my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg items-center shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <h1 className="dark:text-slate-800 text-xl">
                  Scan this QR code with Polygon ID Wallet app to get registered
                </h1>
                <h2 className="dark:text-slate-800">
                  After successfully submitting proof request to get whitelisted{" "}
                </h2>
                <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 items-center flex-auto">
                  <QRCode level="Q" value={JSON.stringify(qrcodeJson)} />
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-sky-500 rounded-md p-2 text-sm shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
                    onClick={() => {
                      RequestWhiteList();
                    }}
                  >
                    addToWhiteList
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
