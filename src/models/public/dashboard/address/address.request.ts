export interface AddressRequest {
  village?: string;
  commune?: string;
  district: string;
  province: string;
  streetNumber?: string;
  houseNumber?: string;
  note?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}
