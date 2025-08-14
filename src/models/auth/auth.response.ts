export interface UserAuthResponse {
  accessToken?: string;
  tokenType?: string;
  userId?: string;
  userIdentifier?: string;
  email?: string;
  fullName?: string;
  profileImageUrl?: string;
  userType?: string;
  roles?: string[];
  businessId?: string;
  businessName?: string;
  welcomeMessage?: string;
}

export interface RegisterAuthResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  userIdentifier: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  profileImageUrl: string;
  userType: string;
  accountStatus: string;
  businessId: string;
  businessName: string;
  roles: string[];
  position: string;
  address: string;
  notes: string;
}
