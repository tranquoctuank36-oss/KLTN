export type ShippingFeePayload = {
  toDistrictId: number;
  toWardCode: string;
  codValue: number;
  serviceTypeId: number;
  weight?: number;
  insuranceValue?: number;
};
