export interface UserAddress {
  id?: string;            
  userId?: string;         
  recipientName: string;
  recipientEmail?: string;
  recipientPhone: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  addressLine: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  isDefault: boolean;
}
