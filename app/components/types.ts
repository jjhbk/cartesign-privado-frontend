export enum currency {
  USD = 1,
  INR,
  EUR,
}

export enum frequency {
  weekly = 1,
  biweekly,
  monthly,
  annualy,
}

export enum Status {
  active = 1,
  inProcess,
  inActive,
  terminated,
  initialized,
}

export enum contractType {
  employment = 1,
  rental,
}
export enum terminationReasons {
  gross_misconduct = 1,
  violation_of_company_policy,
  fraud,
  poor_performance,
  redundancy,
  mutual_agreement,
  contract_expired,
  other,
}

export type User = {
  name: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  wallet: string;
};

export type Signature = {
  timestamp: number;
  physical_signature: string;
  digital_signature: string;
};

export type termination = {
  noticePeriodDays: number;
  reason: terminationReasons;
  Signatures: {
    contractor: Signature;
    contractee: Signature;
  };
};

export type property = {
  address: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  total_area_sqft: number;
};

export type ContractStatus = {
  id: string;
  contractType: contractType;
  status: Status;
};

export interface Agreement {
  agreementId: string;
  contractType: contractType;
  contractCreator: string;
  status: Status;
  contractor: User;
  contractee: User;
  termination: termination;
  signatures: {
    contractorSignature: Signature;
    contracteeSignature: Signature;
  };
}

export type employmentAgreement = {
  agreementId: string;
  contractType: contractType;
  contractCreator: string;
  status: Status;
  contractor: User;
  contractee: User;
  position: {
    title: string;
    department: string;
    startDate: string;
    endDate: string;
    fulltime: boolean;
  };
  compensation: {
    salary: {
      amount: number;
      currency: currency;
      frequency: frequency;
    };
    bonuses: {
      eligibility: boolean;
      details: string;
      amount: number;
    };
    benefits: {
      healthInsurance: boolean;
      retirementPlan: boolean;
      paidTimeOff: {
        days: number;
        type: frequency;
      };
    };
  };

  responsibilities: Array<string>;
  termination: termination;
  signatures: {
    contractorSignature: Signature;
    contracteeSignature: Signature;
  };
};

export type rentalAgreement = {
  agreementId: string;
  contractType: contractType;
  contractCreator: string;
  status: Status;
  property: property;
  contractor: User;
  contractee: User;
  leaseTerms: {
    startDate: string;
    endDate: string;
    rent: {
      amount: number;
      currency: currency;
      dueDate: number;
    };
    securityDeposit: {
      amount: number;
      currency: currency;
    };
    lateFee: {
      amount: number;
      currency: currency;
      gracePeriod: number;
    };
  };
  utilities: {
    included: Array<string>;
    tenantResponsibilities: Array<string>;
  };
  maintenance: {
    landlordResponsibility: Array<string>;
    tenantResponsibility: Array<string>;
  };
  rules: {
    petsAllowed: boolean;
    smokingAllowed: boolean;
    sublettingAllowed: boolean;
  };
  termination: termination;
  signatures: {
    contractorSignature: Signature;
    contracteeSignature: Signature;
  };
};
