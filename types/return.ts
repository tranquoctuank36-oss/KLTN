export type ReturnRequest = {
  id: string;
  returnCode: string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
  orderCode: string;
  reason: string;
  customerNote?: string;
  calculatedRefundAmount?: string;
  refundAmount?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  status: string;
  rejectedReason?: string;
  refundCompletedAt?: string;
  receivedAt?: string;
  images?: Array<{
    id: string;
    publicUrl: string;
    altText?: string;
    sortOrder: number;
  }>;
};

export type CreateReturnRequestPayload = {
  reason: string;
  customerNote?: string;
  imageIds?: string[];
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
};
