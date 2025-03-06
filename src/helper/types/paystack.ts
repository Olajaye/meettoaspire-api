export type PaystackMetadata = {
  user: string;
  expert: string;
  callback_url?: string;
  custom_fields: PaystackMetadataCustomField[];
};

export type PaystackMetadataCustomField = {
  display_name: string;
  variable_name: string;
  value: string | number;
};

export type PaystackCreateTransactionResponseDto = {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
};



export type PaystackVerifyTransactionResponseDto = {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
  };
};

export enum PaymentStatus {
  paid = 'PAID',
  notPaid = 'NOT-PAID',
}

