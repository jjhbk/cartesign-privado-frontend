import { useContext, useState } from "react";

import {
  employmentAgreement,
  contractType,
  Status,
  currency,
  terminationReasons,
  frequency,
  User,
} from "@/app/components/types";
import Signature from "./signaturepad";
import {
  FormDataContext,
  ModalContext,
  SignaturepadContext,
} from "./dashboard";
import { v4 as uuidv4 } from "uuid";
import { useConnectWallet, useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { advanceInput } from "@mugen-builders/client";
import { DappAbi } from "../page";
import { encodeFunctionData } from "viem";
const EmploymentAgreementForm = (props: any) => {
  const [connectedWallet] = useWallets();
  const { sigpadData } = useContext(SignaturepadContext);
  const { finalFormData, setFinalFormData } = useContext(FormDataContext);
  const { isModalOpen, setIsModalOpen } = useContext(ModalContext);
  const [formData, setFormData] = useState<employmentAgreement>({
    agreementId: uuidv4(),
    contractType: contractType.employment,
    contractCreator: connectedWallet.accounts[0].address
      .toString()
      .toLowerCase()
      .toString()
      .toLowerCase(),
    status: Status.inActive,
    contractor: {
      name: "adam",
      contact: {
        address: "hyderabad",
        phone: "1234567890",
        email: "adam@cartesi.io",
      },
      wallet: connectedWallet.accounts[0].address.toString().toLowerCase(),
    },
    contractee: {
      name: "Paul",
      contact: {
        address: "secunderabad",
        phone: "0987654321",
        email: "Paul@cartesi.io",
      },
      wallet: String(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      ).toLowerCase(),
    },
    position: {
      title: "Software Developer",
      department: "Node Unit",
      startDate: "",
      endDate: "",
      fulltime: false,
    },
    compensation: {
      salary: {
        amount: 35000,
        currency: currency.USD,
        frequency: frequency.monthly,
      },
      bonuses: {
        eligibility: false,
        details: "",
        amount: 5000,
      },
      benefits: {
        healthInsurance: false,
        retirementPlan: false,
        paidTimeOff: {
          days: 0,
          type: frequency.annualy,
        },
      },
    },
    responsibilities: ["write & maintain high quality code", "create apps"],
    termination: {
      noticePeriodDays: 15,
      reason: terminationReasons.other,
      Signatures: {
        contractor: {
          timestamp: Date.now(),
          physical_signature: "",
          digital_signature: "",
        },
        contractee: {
          timestamp: Date.now(),
          physical_signature: "",
          digital_signature: "",
        },
      },
    },
    signatures: {
      contractorSignature: {
        timestamp: Date.now(),
        physical_signature: "",
        digital_signature: "",
      },
      contracteeSignature: {
        timestamp: Date.now(),
        physical_signature: "",
        digital_signature: "",
      },
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    console.log(name, value, type);

    const nameParts = name.split(".");

    const updateNestedState = (
      parts: string[],
      state: any,
      newValue: any
    ): any => {
      if (parts.length === 1) {
        if (type == "checkbox") {
          newValue = !state[parts[0]];
        }
        return {
          ...state,
          [parts[0]]: newValue,
        };
      }

      return {
        ...state,
        [parts[0]]: updateNestedState(
          parts.slice(1),
          state[parts[0]],
          newValue
        ),
      };
    };
    setFormData((prevState) => updateNestedState(nameParts, prevState, value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigpadData) {
      alert(`signature is required to submit to the Dapp`);
      return;
    }
    formData.signatures.contractorSignature.physical_signature = sigpadData;
    const provider = new ethers.providers.Web3Provider(
      connectedWallet.provider
    );
    const signer = await provider.getSigner();
    const dig_sig = await signer.signMessage(sigpadData);
    console.log(
      "digital signature is",
      dig_sig,
      "physical signature is:",
      sigpadData
    );
    formData.signatures.contractorSignature.digital_signature = dig_sig;

    setFinalFormData(formData);
    console.log(JSON.stringify(formData));

    const input = encodeFunctionData({
      abi: DappAbi,
      functionName: "createAgreement",
      args: [JSON.stringify(formData)],
    });
    console.log("input is:", input);
    const result = await advanceInput(signer, props.dapp, input);
    result ? alert("success") : alert("request failed");
    setIsModalOpen(false);
  };

  return (
    <div className="container  mx-auto p-4">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl text-black font-bold mb-4">
          Employment Agreement Form
        </h2>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="agreementId"
          >
            Agreement ID
          </label>
          <input
            className="shadow   appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="agreementId"
            type="text"
            name="agreementId"
            value={formData.agreementId}
            onChange={handleChange}
            placeholder="Enter Agreement ID"
            disabled
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractType"
          >
            Contract Type
          </label>
          <select
            id="contractType"
            name="contractType"
            value={formData.contractType}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={contractType.employment}>Employment</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractCreator"
          >
            Contract Creator
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractCreator"
            type="text"
            name="contractCreator"
            value={formData.contractCreator}
            onChange={handleChange}
            placeholder="Enter Contract Creator"
            disabled
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="status"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled
          >
            <option value={Status.inActive}>Inactive</option>
          </select>
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Contractor Information
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorName"
          >
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorName"
            type="text"
            name="contractor.name"
            value={formData.contractor.name}
            onChange={handleChange}
            placeholder="Enter Contractor Name"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorPhone"
          >
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorPhone"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            placeholder="123-456-7890"
            type="tel"
            name="contractor.contact.phone"
            value={formData.contractor.contact.phone}
            onChange={handleChange}
            required={true}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorEmail"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorEmail"
            type="email"
            name="contractor.contact.email"
            value={formData.contractor.contact.email}
            onChange={handleChange}
            placeholder="name@cartesi.io"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorAddress"
          >
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorAddress"
            type="text"
            name="contractor.contact.address"
            value={formData.contractor.contact.address}
            onChange={handleChange}
            placeholder="Enter Contractor Address"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorWallet"
          >
            Wallet
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contractorAddress"
            type="text"
            name="contractee.wallet"
            value={formData.contractor.wallet}
            onChange={handleChange}
            placeholder="Enter Contractor wallet address"
            disabled
          />
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Contractee Information
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeName"
          >
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeName"
            type="text"
            name="contractee.name"
            value={formData.contractee.name}
            onChange={handleChange}
            placeholder="Enter Contractee Name"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteePhone"
          >
            Phone
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteePhone"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            placeholder="123-456-7890"
            type="tel"
            name="contractee.contact.phone"
            value={formData.contractee.contact.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeEmail"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeEmail"
            type="email"
            name="contractee.contact.email"
            value={formData.contractee.contact.email}
            onChange={handleChange}
            placeholder="jj@cartesi.io"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contracteeAddress"
          >
            Address
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeAddress"
            type="text"
            name="contractee.contact.address"
            value={formData.contractee.contact.address}
            onChange={handleChange}
            placeholder="Enter Contractee Address"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractee Wallet"
          >
            Wallet
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="contracteeWallet"
            type="text"
            name="contractee.wallet"
            value={formData.contractee.wallet}
            onChange={handleChange}
            placeholder="Enter Contractor wallet address"
          />
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Position Information
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionTitle"
          >
            Title
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionTitle"
            type="text"
            name="position.title"
            value={formData.position.title}
            onChange={handleChange}
            placeholder="Enter Position Title"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionDepartment"
          >
            Department
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionDepartment"
            type="text"
            name="position.department"
            value={formData.position.department}
            onChange={handleChange}
            placeholder="Enter Position Department"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionStartDate"
          >
            Start Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionStartDate"
            type="date"
            name="position.startDate"
            value={formData.position.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionEndDate"
          >
            End Date
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="positionEndDate"
            type="date"
            name="position.endDate"
            value={formData.position.endDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="positionFulltime"
          >
            Full-time
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="positionFulltime"
            type="checkbox"
            name="position.fulltime"
            checked={formData.position.fulltime}
            onChange={handleChange}
          />
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Compensation Information
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="salaryAmount"
          >
            Salary Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="salaryAmount"
            type="number"
            name="compensation.salary.amount"
            value={formData.compensation.salary.amount}
            onChange={handleChange}
            placeholder="Enter Salary Amount"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="salarycurrency"
          >
            Salary currency
          </label>
          <select
            id="salarycurrency"
            name="compensation.salary.currency"
            value={formData.compensation.salary.currency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={currency.USD}>USD</option>
            <option value={currency.INR}>INR</option>
            <option value={currency.EUR}>EUR</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="salaryfrequency"
          >
            Salary frequency
          </label>
          <select
            id="salaryfrequency"
            name="compensation.salary.frequency"
            value={formData.compensation.salary.frequency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={frequency.weekly}>Weekly</option>
            <option value={frequency.biweekly}>Bi-weekly</option>
            <option value={frequency.monthly}>monthly</option>
            <option value={frequency.annualy}>Annually</option>
          </select>
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">Bonuses</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusEligibility"
          >
            Eligibility
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="bonusEligibility"
            type="checkbox"
            name="compensation.bonuses.eligibility"
            checked={formData.compensation.bonuses.eligibility}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusDetails"
          >
            Details
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bonusDetails"
            type="text"
            name="compensation.bonuses.details"
            value={formData.compensation.bonuses.details}
            onChange={handleChange}
            placeholder="Enter Bonus Details"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="bonusAmount"
          >
            Amount
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bonusAmount"
            type="number"
            name="compensation.bonuses.amount"
            value={formData.compensation.bonuses.amount}
            onChange={handleChange}
            placeholder="Enter Bonus Amount"
          />
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">Benefits</h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="healthInsurance"
          >
            Health Insurance
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="healthInsurance"
            type="checkbox"
            name="compensation.benefits.healthInsurance"
            checked={formData.compensation.benefits.healthInsurance}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="retirementPlan"
          >
            Retirement Plan
          </label>
          <input
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            id="retirementPlan"
            type="checkbox"
            name="compensation.benefits.retirementPlan"
            checked={formData.compensation.benefits.retirementPlan}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paidTimeOffDays"
          >
            Paid Time Off Days
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="paidTimeOffDays"
            type="number"
            name="compensation.benefits.paidTimeOff.days"
            value={formData.compensation.benefits.paidTimeOff.days}
            onChange={handleChange}
            placeholder="Enter Paid Time Off Days"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="paidTimeOfffrequency"
          >
            Paid Time Off frequency
          </label>
          <select
            id="paidTimeOfffrequency"
            name="compensation.benefits.paidTimeOff.type"
            value={formData.compensation.benefits.paidTimeOff.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={frequency.weekly}>Weekly</option>
            <option value={frequency.biweekly}>Bi-weekly</option>
            <option value={frequency.monthly}>monthly</option>
            <option value={frequency.annualy}>Annually</option>
          </select>
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Responsibilities
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="responsibilities"
          >
            List Responsibilities (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="responsibilities"
            type="text"
            name="responsibilities"
            value={formData.responsibilities.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                responsibilities: e.target.value
                  .split(",")
                  .map((res) => res.trim()),
              })
            }
            placeholder="Enter Responsibilities"
          />
        </div>

        <h3 className="text-xl text-slate-700 font-bold mb-2">
          Termination Information
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="noticePeriodDays"
          >
            Notice Period (days)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="noticePeriodDays"
            type="number"
            name="termination.noticePeriodDays"
            value={formData.termination.noticePeriodDays}
            onChange={handleChange}
            placeholder="Enter Notice Period in Days"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="terminationReason"
          >
            Termination Reason
          </label>
          <select
            id="terminationReason"
            name="termination.reason"
            value={formData.termination.reason}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value={terminationReasons.gross_misconduct}>
              Gross Misconduct
            </option>
            <option value={terminationReasons.violation_of_company_policy}>
              Violation of Company Policy
            </option>
            <option value={terminationReasons.fraud}>Fraud</option>
            <option value={terminationReasons.poor_performance}>
              Poor Performance
            </option>
            <option value={terminationReasons.redundancy}>Redundancy</option>
            <option value={terminationReasons.mutual_agreement}>
              Mutual Agreement
            </option>
            <option value={terminationReasons.contract_expired}>
              Contract Expired
            </option>
            <option value={terminationReasons.other}>other</option>
          </select>
        </div>
      </form>
      <div className="bg-white flex justify-center flex-col shadow-md rounded px-8 pb-8 mb-4">
        <h3 className="text-xl pb-4 justify-self-center self-center text-slate-700 dark:text-slate-600 font-bold ">
          Signatures
        </h3>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="contractorSignature"
          >
            Contractor Signature
          </label>
          <Signature />
          <input
            className="shadow mt-2  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="signature"
            type="text"
            value={sigpadData}
            placeholder="your signature"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmploymentAgreementForm;
