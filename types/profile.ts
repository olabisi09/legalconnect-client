export interface ClientProfile {
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  locale: string;
  timezone: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  locale?: string;
  timezone?: string;
}
