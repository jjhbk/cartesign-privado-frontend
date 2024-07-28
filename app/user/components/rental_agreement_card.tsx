import React, { useEffect, useState } from "react";

import {
  Status,
  rentalAgreement,
  currency,
  terminationReasons,
} from "@/app/components/types";
import sample_rental_agreement from "./sample_rent_alagreement.json";
import { InspectCall } from "../page";
interface RentalAgreementCardProps {
  agreementId: string | undefined;
  chainId: string | null;
}

const RentalAgreementCard: React.FC<RentalAgreementCardProps> = ({
  agreementId,
  chainId,
}) => {
  const [agreement, setAgreement] = useState(sample_rental_agreement);
  const fetchSingleContract = async (contract_id: string, chainid: string) => {
    console.log("fetching contract...");
    const response = await InspectCall(`contract/${contract_id}`, chainid);
    const contract = JSON.parse(response);
    setAgreement(contract.result);
    console.log("response is ", response);

    return response;
  };
  useEffect(() => {
    if (agreementId && chainId != null) {
      fetchSingleContract(agreementId, chainId);
    }
  }, []);
  const currencySymbol = (_currency: currency) => {
    switch (_currency) {
      case currency.USD:
        return "$";
      case currency.INR:
        return "₹";
      case currency.EUR:
        return "€";
      default:
        return "";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-cyan-400 shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Rental Agreement
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="font-bold text-gray-700">Agreement Details</h3>
            <p>
              <strong>Agreement ID:</strong> {agreement.agreementId}
            </p>
            <p>
              <strong>Contract Creator:</strong> {agreement.contractCreator}
            </p>
            <p>
              <strong>Status:</strong> {Status[agreement.status]}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Property Details</h3>
            <p>
              <strong>Address:</strong> {agreement.property.address}
            </p>
            <p>
              <strong>Property Type:</strong> {agreement.property.property_type}
            </p>
            <p>
              <strong>Bedrooms:</strong> {agreement.property.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {agreement.property.bathrooms}
            </p>
            <p>
              <strong>Total Area (sqft):</strong>{" "}
              {agreement.property.total_area_sqft}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Contractor Details</h3>
            <p>
              <strong>Name:</strong> {agreement.contractor.name}
            </p>
            <p>
              <strong>Contact Address:</strong>{" "}
              {agreement.contractor.contact.address}
            </p>
            <p>
              <strong>Phone:</strong> {agreement.contractor.contact.phone}
            </p>
            <p>
              <strong>Email:</strong> {agreement.contractor.contact.email}
            </p>
            <p>
              <strong>Wallet:</strong> {agreement.contractor.wallet}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Contractee Details</h3>
            <p>
              <strong>Name:</strong> {agreement.contractee.name}
            </p>
            <p>
              <strong>Contact Address:</strong>{" "}
              {agreement.contractee.contact.address}
            </p>
            <p>
              <strong>Phone:</strong> {agreement.contractee.contact.phone}
            </p>
            <p>
              <strong>Email:</strong> {agreement.contractee.contact.email}
            </p>
            <p>
              <strong>Wallet:</strong> {agreement.contractee.wallet}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Lease Terms</h3>
            <p>
              <strong>Start Date:</strong> {agreement.leaseTerms.startDate}
            </p>
            <p>
              <strong>End Date:</strong> {agreement.leaseTerms.endDate}
            </p>
            <p>
              <strong>Rent:</strong>{" "}
              {currencySymbol(agreement.leaseTerms.rent.currency)}
              {agreement.leaseTerms.rent.amount}
            </p>
            <p>
              <strong>Rent Due Date:</strong>{" "}
              {agreement.leaseTerms.rent.dueDate}
            </p>
            <p>
              <strong>Security Deposit:</strong>{" "}
              {currencySymbol(agreement.leaseTerms.securityDeposit.currency)}
              {agreement.leaseTerms.securityDeposit.amount}
            </p>
            <p>
              <strong>Late Fee:</strong>{" "}
              {currencySymbol(agreement.leaseTerms.lateFee.currency)}
              {agreement.leaseTerms.lateFee.amount}
            </p>
            <p>
              <strong>Grace Period:</strong>{" "}
              {agreement.leaseTerms.lateFee.gracePeriod} days
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Utilities</h3>
            <p>
              <strong>Included:</strong>{" "}
              {agreement.utilities.included.join(", ")}
            </p>
            <p>
              <strong>Tenant Responsibilities:</strong>{" "}
              {agreement.utilities.tenantResponsibilities.join(", ")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Maintenance</h3>
            <p>
              <strong>Landlord Responsibilities:</strong>{" "}
              {agreement.maintenance.landlordResponsibility.join(", ")}
            </p>
            <p>
              <strong>Tenant Responsibilities:</strong>{" "}
              {agreement.maintenance.tenantResponsibility.join(", ")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Rules</h3>
            <p>
              <strong>Pets Allowed:</strong>{" "}
              {agreement.rules.petsAllowed ? "Yes" : "No"}
            </p>
            <p>
              <strong>Smoking Allowed:</strong>{" "}
              {agreement.rules.smokingAllowed ? "Yes" : "No"}
            </p>
            <p>
              <strong>Subletting Allowed:</strong>{" "}
              {agreement.rules.sublettingAllowed ? "Yes" : "No"}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Termination</h3>
            <p>
              <strong>Notice Period:</strong>{" "}
              {agreement.termination.noticePeriodDays} days
            </p>
            <p>
              <strong>Reason:</strong>{" "}
              {terminationReasons[agreement.termination.reason]}
            </p>

            <p>
              <strong>Contractor Signature Date:</strong>{" "}
              {formatDate(
                agreement.termination.Signatures.contractor.timestamp
              )}
            </p>
            <p>
              <strong>Contractor physical Signature:</strong>{" "}
              {agreement.termination.Signatures.contractor
                .physical_signature ? (
                <img
                  className={"sigImage"}
                  src={
                    agreement.termination.Signatures.contractor
                      .physical_signature
                  }
                  alt="user generated signature"
                />
              ) : null}{" "}
            </p>
            <p>
              <strong>Contractee Signature Date:</strong>{" "}
              {formatDate(
                agreement.termination.Signatures.contractee.timestamp
              )}
            </p>
            <p>
              <strong>Contractee physical Signature:</strong>{" "}
              {agreement.termination.Signatures.contractee
                .physical_signature ? (
                <img
                  className={"sigImage"}
                  src={
                    agreement.termination.Signatures.contractee
                      .physical_signature
                  }
                  alt="user generated signature"
                />
              ) : null}{" "}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-700">Signatures</h3>

            <p>
              <strong>Contractor Signature Date:</strong>{" "}
              {formatDate(agreement.signatures.contractorSignature.timestamp)}
            </p>
            <p>
              <strong>Contractor physical Signature:</strong>{" "}
              {agreement.signatures.contractorSignature.physical_signature ? (
                <img
                  className={"sigImage"}
                  src={
                    agreement.signatures.contractorSignature.physical_signature
                  }
                  alt="user generated signature"
                />
              ) : null}{" "}
            </p>
            <p>
              <strong>Contractee Signature Date:</strong>{" "}
              {formatDate(agreement.signatures.contracteeSignature.timestamp)}
            </p>
            <p>
              <strong>Contractee physical Signature:</strong>{" "}
              {agreement.signatures.contracteeSignature.physical_signature ? (
                <img
                  className={"sigImage"}
                  src={
                    agreement.signatures.contracteeSignature.physical_signature
                  }
                  alt="user generated signature"
                />
              ) : null}{" "}
            </p>
            <p>
              <strong>Contractee digital Signature :</strong>{" "}
              {agreement.signatures.contracteeSignature.digital_signature}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalAgreementCard;
