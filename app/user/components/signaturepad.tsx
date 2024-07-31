import SignaturePad from "react-signature-canvas";
import { useContext, useRef, useState } from "react";
import { SignaturepadContext } from "./dashboard";
export default function Signature() {
  let { sigpadData, setSigpadData } = useContext(SignaturepadContext);

  let padRef: any = useRef({});
  const [dataURL, setDataURL] = useState(sigpadData);
  const clear = () => {
    padRef.current?.clear();
    setSigpadData("");
    setDataURL("");
  };
  const trim = async () => {
    var url = "";
    url = padRef.current?.getCanvas().toDataURL("image/png");
    setDataURL(url);
    setSigpadData(url);
    console.log(url);
  };
  return (
    <div>
      <div className="flex justify-center bg-slate-600 mb-2">
        <div
          style={{
            backgroundColor: "white",
            width: 250,
            margin: 10,
            alignItems: "center",
            alignContent: "center",
            alignSelf: "center",
          }}
          className="aspect-[3/1]"
        >
          <SignaturePad
            ref={padRef}
            canvasProps={{
              className: "sigCanvas",
              width: 250,
              height: 80,
            }}
          />
        </div>
      </div>

      <div className="signer-buttons-wrapper">
        <button
          className="bg-sky-500 rounded-md px-4 mx-4 p-2 shadow-sm focus:outline-none focus:ring  hover:bg-sky-700"
          onClick={trim}
        >
          Sign
        </button>
        <button
          className="bg-red-400 rounded-md p-2 text-sm shadow-sm hover:bg-red-600"
          onClick={clear}
        >
          Clear
        </button>
      </div>
      <div>
        {dataURL ? (
          <img
            className={"sigImage"}
            src={dataURL}
            alt="user generated signature"
          />
        ) : null}
      </div>
    </div>
  );
}
