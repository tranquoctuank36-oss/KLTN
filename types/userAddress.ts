export interface UserAddress {
  id?: string;            
  userId?: string;         
  recipientName: string;
  recipientPhone: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  addressLine: string;
  ghnDistrictId: number;
  ghnWardCode: string;
  isDefault: boolean;
}
