export interface LoginCredentials {
  userIdentifier: string;
  password: string;
}

export interface RegisterCredentials {
  userIdentifier: string;
  email?: string;
  password: string;
  userType?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  address?: string;
  accountStatus?: string;
}
