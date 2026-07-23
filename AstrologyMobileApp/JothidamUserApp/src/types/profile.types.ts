// Verified against source/src/app/api/profile/{create,list,[id]}/route.ts.

export interface BirthProfile {
  id: string;
  fullName: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateProfileRequest {
  fullName: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface ProfileResponse {
  profile: BirthProfile;
}

export interface ProfileListResponse {
  profiles: BirthProfile[];
}
