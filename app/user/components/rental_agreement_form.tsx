import { Checkbox } from "@material-ui/core";
import { useContext, useState } from "react";
import {
  rentalAgreement,
  contractType,
  Status,
  currency,
  terminationReasons,
  User,
} from "@/app/components/types";
import Signature from "./signaturepad";
import {
  FormDataContext,
  ModalContext,
  SignaturepadContext,
} from "./dashboard";
import { v4 as uuidv4 } from "uuid";
import { useWallets } from "@web3-onboard/react";
import { ethers } from "ethers";
import { DappAbi } from "../exports";
import { encodeFunctionData, hexToString } from "viem";
import { advanceInput } from "@mugen-builders/client";
import { Spinner } from "./spinner";
const RentalAgreementForm = (props: any) => {
  const { finalFormData, setFinalFormData } = useContext(FormDataContext);
  const { isModalOpen, setIsModalOpen } = useContext(ModalContext);
  const [connectedWallet] = useWallets();
  const { sigpadData } = useContext(SignaturepadContext);
  const [spinner, setSpinner] = useState(false);

  const [formData, setFormData] = useState<rentalAgreement>({
    agreementId: uuidv4(),
    contractType: contractType.rental,
    contractCreator: connectedWallet.accounts[0].address
      .toString()
      .toLowerCase(),
    status: Status.inActive,
    property: {
      address: "Hyderabad",
      property_type: "House",
      bedrooms: 3,
      bathrooms: 3,
      total_area_sqft: 2000,
    },
    contractor: {
      name: "Adam",
      contact: {
        address: "hyderabad",
        phone: "1234567890",
        email: "adam@gmail.com",
      },
      wallet: connectedWallet.accounts[0].address.toString().toLowerCase(),
    },
    contractee: {
      name: "Paul",
      contact: {
        address: "secunderabad",
        phone: "9876543210",
        email: "paul@gmail.com",
      },
      wallet: String(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      ).toLowerCase(),
    },
    leaseTerms: {
      startDate: "",
      endDate: "",
      rent: {
        amount: 2000,
        currency: currency.USD,
        dueDate: 1,
      },
      securityDeposit: {
        amount: 1000,
        currency: currency.USD,
      },
      lateFee: {
        amount: 100,
        currency: currency.USD,
        gracePeriod: 0,
      },
    },
    utilities: {
      included: ["water", "electricity", "trash", "washing"],
      tenantResponsibilities: ["lights", "fans"],
    },
    maintenance: {
      landlordResponsibility: ["water", "electricity"],
      tenantResponsibility: ["lights", "ac"],
    },
    rules: {
      petsAllowed: false,
      smokingAllowed: false,
      sublettingAllowed: false,
    },
    termination: {
      noticePeriodDays: 0,
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
    try {
      e.preventDefault();
      if (!sigpadData) {
        alert(`signature is required to submit to the Dapp`);
        return;
      }
      formData.signatures.contractorSignature.physical_signature = sigpadData;
      const provider = new ethers.providers.Web3Provider(
        connectedWallet.provider
      );
      setSpinner(true);
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
      console.log("input is:", input, props.dapp);
      const result = await advanceInput(signer, props.dapp, input);
      console.log(result);
      alert(`success`);
      setSpinner(false);
      setIsModalOpen(false);
    } catch (e) {
      alert(`error:${e}`);
      setSpinner(false);
    }
  };

  return (
    <div className="container mx-auto">
      {spinner ? (
        <Spinner />
      ) : (
        <div>
          <form
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-5"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl text-black font-bold mb-4">
              Rental Agreement Form
            </h2>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="agreementId"
              >
                Agreement ID
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="agreementId"
                type="text"
                name="agreementId"
                value={formData.agreementId}
                onChange={handleChange}
                placeholder="Enter Agreement ID"
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
                disabled
              >
                <option value={contractType.rental}>Rental</option>
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
                <option value={Status.active}>Active</option>
                <option value={Status.inProcess}>In Process</option>
                <option value={Status.inActive}>Inactive</option>
                <option value={Status.terminated}>Terminated</option>
              </select>
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">
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
                type="text"
                name="contractor.contact.phone"
                value={formData.contractor.contact.phone}
                onChange={handleChange}
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                placeholder="123-456-7890"
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
                placeholder="123@gmail.com"
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
                type="text"
                name="contractee.contact.phone"
                value={formData.contractee.contact.phone}
                onChange={handleChange}
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                placeholder="123-456-7890"
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
                placeholder="123@gmail.com"
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
                htmlFor="contractorWallet"
              >
                Wallet
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="contractorAddress"
                type="text"
                name="contractee.wallet"
                value={formData.contractee.wallet}
                onChange={handleChange}
                placeholder="Enter Contractor wallet address"
                disabled
              />
            </div>
            <h3 className="text-xl text-slate-700 font-bold mb-2">
              Property Information
            </h3>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyAddress"
              >
                Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="propertyAddress"
                type="text"
                name="property.address"
                value={formData.property.address}
                onChange={handleChange}
                placeholder="Enter Property Address"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyType"
              >
                Property Type
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="propertyType"
                type="text"
                name="property.property_type"
                value={formData.property.property_type}
                onChange={handleChange}
                placeholder="Enter Property Type"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyBedrooms"
              >
                Bedrooms
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="propertyBedrooms"
                type="number"
                name="property.bedrooms"
                value={formData.property.bedrooms}
                onChange={handleChange}
                placeholder="Enter Number of Bedrooms"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyBathrooms"
              >
                Bathrooms
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="propertyBathrooms"
                type="number"
                name="property.bathrooms"
                value={formData.property.bathrooms}
                onChange={handleChange}
                placeholder="Enter Number of Bathrooms"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyTotalArea"
              >
                Total Area (sqft)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="propertyTotalArea"
                type="number"
                name="property.total_area_sqft"
                value={formData.property.total_area_sqft}
                onChange={handleChange}
                placeholder="Enter Total Area in sqft"
              />
            </div>

            <h3 className="text-xl text-slate-700 font-bold mb-2">
              Lease Terms
            </h3>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="leaseStartDate"
              >
                Start Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="leaseStartDate"
                type="date"
                name="leaseTerms.startDate"
                value={formData.leaseTerms.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="leaseEndDate"
              >
                End Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="leaseEndDate"
                type="date"
                name="leaseTerms.endDate"
                value={formData.leaseTerms.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="rentAmount"
              >
                Rent Amount
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="rentAmount"
                type="number"
                name="leaseTerms.rent.amount"
                value={formData.leaseTerms.rent.amount}
                onChange={handleChange}
                placeholder="Enter Rent Amount"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="rentcurrency"
              >
                Rent currency
              </label>
              <select
                id="rentcurrency"
                name="leaseTerms.rent.currency"
                value={formData.leaseTerms.rent.currency}
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
                htmlFor="rentDueDate"
              >
                Rent Due Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="rentDueDate"
                type="number"
                name="leaseTerms.rent.dueDate"
                value={formData.leaseTerms.rent.dueDate}
                onChange={handleChange}
                placeholder="Enter Rent Due Date"
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="securityDepositAmount"
              >
                Security Deposit Amount
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="securityDepositAmount"
                type="number"
                name="leaseTerms.securityDeposit.amount"
                value={formData.leaseTerms.securityDeposit.amount}
                onChange={handleChange}
                placeholder="Enter Security Deposit Amount"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="securityDepositcurrency"
              >
                Security Deposit currency
              </label>
              <select
                id="securityDepositcurrency"
                name="leaseTerms.securityDeposit.currency"
                value={formData.leaseTerms.securityDeposit.currency}
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
                htmlFor="lateFeeAmount"
              >
                Late Fee Amount
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="lateFeeAmount"
                type="number"
                name="leaseTerms.lateFee.amount"
                value={formData.leaseTerms.lateFee.amount}
                onChange={handleChange}
                placeholder="Enter Late Fee Amount"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="lateFeecurrency"
              >
                Late Fee currency
              </label>
              <select
                id="lateFeecurrency"
                name="leaseTerms.lateFee.currency"
                value={formData.leaseTerms.lateFee.currency}
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
                htmlFor="gracePeriod"
              >
                Grace Period
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="gracePeriod"
                type="number"
                name="leaseTerms.lateFee.gracePeriod"
                value={formData.leaseTerms.lateFee.gracePeriod}
                onChange={handleChange}
                placeholder="Enter Grace Period"
              />
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">Utilities</h3>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="utilitiesIncluded"
              >
                Included Utilities (comma separated)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="utilitiesIncluded"
                type="text"
                name="utilities.included"
                value={formData.utilities.included.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    utilities: {
                      ...formData.utilities,
                      included: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    },
                  })
                }
                placeholder="Enter Included Utilities"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tenantResponsibilities"
              >
                Tenant Responsibilities (comma separated)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="tenantResponsibilities"
                type="text"
                name="utilities.tenantResponsibilities"
                value={formData.utilities.tenantResponsibilities.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    utilities: {
                      ...formData.utilities,
                      tenantResponsibilities: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    },
                  })
                }
                placeholder="Enter Tenant Responsibilities"
              />
            </div>

            <h3 className="text-xl font-bold mb-2">Maintenance</h3>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="landlordResponsibility"
              >
                Landlord Responsibilities (comma separated)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="landlordResponsibility"
                type="text"
                name="maintenance.landlordResponsibility"
                value={formData.maintenance.landlordResponsibility.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenance: {
                      ...formData.maintenance,
                      landlordResponsibility: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    },
                  })
                }
                placeholder="Enter Landlord Responsibilities"
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tenantResponsibility"
              >
                Tenant Responsibilities (comma separated)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="tenantResponsibility"
                type="text"
                name="maintenance.tenantResponsibility"
                value={formData.maintenance.tenantResponsibility.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenance: {
                      ...formData.maintenance,
                      tenantResponsibility: e.target.value
                        .split(",")
                        .map((item) => item.trim()),
                    },
                  })
                }
                placeholder="Enter Tenant Responsibilities"
              />
            </div>

            <h3 className="text-xl text-slate-700 font-bold mb-2">Rules</h3>
            <div className="mb-4 check-side">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="petsAllowed"
              >
                Pets Alloweds
              </label>
              <input
                checked={formData.rules.petsAllowed}
                id="checked-checkbox"
                name="rules.petsAllowed"
                type="checkbox"
                value="off"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                onChange={handleChange}
              />
            </div>
            <div className="mb-4 check-side">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="smokingAllowed"
              >
                Smoking Allowed
              </label>
              <input
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                id="smokingAllowed"
                type="checkbox"
                name="rules.smokingAllowed"
                checked={formData.rules.smokingAllowed}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4 check-side">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="sublettingAllowed"
              >
                Subletting Allowed
              </label>
              <input
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                id="sublettingAllowed"
                type="checkbox"
                name="rules.sublettingAllowed"
                checked={formData.rules.sublettingAllowed}
                onChange={handleChange}
              />
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">
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
            <div className="mb-4 ">
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
                <option value={terminationReasons.redundancy}>
                  Redundancy
                </option>
                <option value={terminationReasons.mutual_agreement}>
                  Mutual Agreement
                </option>
                <option value={terminationReasons.contract_expired}>
                  Contract Expired
                </option>
                <option value={terminationReasons.other}>Other</option>
              </select>
            </div>
          </form>
          <div className="bg-white flex justify-center flex-col shadow-md rounded px-8 pb-8 mb-4">
            <h3 className="text-xl pb-4 justify-self-center self-center dark:text-slate-600 font-bold ">
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
            </div>

            <div className="submit-wrapper">
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
      )}
    </div>
  );
};

export default RentalAgreementForm;
