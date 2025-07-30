export interface AuthResponse {
  accessToken?: string;
  tokenType?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  profileImageUrl?: string;
  userType?: string;
  roles?: string[];
  businessId?: string;
  businessName?: string;
  welcomeMessage?: string;
}
