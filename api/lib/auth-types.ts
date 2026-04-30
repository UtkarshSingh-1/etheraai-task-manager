export interface SessionPayload {
  unionId: string;
  clientId: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
