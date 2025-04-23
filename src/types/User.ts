export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    initials?: string;
    profile: UserProfile;
    settings: UserSettings;
    preferences?: UserPreferences;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserProfile {
    age?: number;
    gender?: string;
    health_conditions?: string[];
    avatar?: string;
    height?: number;
    weight?: number;
    blood_group?: string;
    date_of_birth?: string;
    phone_number?: string;
    address?: UserAddress;
    emergency_contact?: EmergencyContact;
  }
  
  export interface UserAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }
  
  export interface EmergencyContact {
    name: string;
    relationship: string;
    phone_number: string;
  }
  
  export interface UserSettings {
    preferred_units: 'metric' | 'imperial';
    notification_preferences: NotificationPreferences;
    theme: 'light' | 'dark' | 'system';
    dashboard_layout?: string;
    language?: string;
    privacy_settings?: PrivacySettings;
  }
  
  export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    report_ready: boolean;
    insights_update: boolean;
    recommendations: boolean;
  }
  
  export interface PrivacySettings {
    share_data_with_doctors: boolean;
    allow_anonymous_research: boolean;
    store_history: boolean;
  }
  
  export interface UserAuthResponse {
    user: User;
    token: string;
    refresh_token: string;
    expires_in: number;
  }
  
  export interface UserPreferences {
    notifications?: boolean;
    dataSharing?: boolean;
    units?: 'metric' | 'imperial';
  }
  