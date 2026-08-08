export type OccasionType =
  | 'Birthday'
  | 'Anniversary'
  | 'Wedding'
  | 'Graduation'
  | "Valentine's Day"
  | 'Christmas'
  | "Mother's Day"
  | "Father's Day"
  | 'Friendship'
  | 'Congratulations'
  | 'Other';

export type RelationshipType =
  | 'Girlfriend'
  | 'Boyfriend'
  | 'Wife'
  | 'Husband'
  | 'Friend'
  | 'Mother'
  | 'Father'
  | 'Sister'
  | 'Brother'
  | 'Child'
  | 'Colleague'
  | 'Boss'
  | 'Teacher'
  | 'Other';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface RecipientProfileData {
  name?: string;
  age?: number;
  gender?: string;
  country: string;
  language: string;
}

export interface BudgetData {
  min: number;
  max: number;
  currency: CurrencyCode;
  is_custom: boolean;
}

export interface FavoritesData {
  colors: string[];
  brands: string[];
  foods: string[];
  drinks: string[];
  movies: string[];
  tv_shows: string[];
  games: string[];
  hobbies: string[];
  animals: string[];
  flowers: string[];
  music: string[];
  celebrities?: string[];
}

export interface LifestyleData {
  works_from_home: boolean;
  is_student: boolean;
  is_traveler: boolean;
  is_pet_owner: boolean;
  coffee_lover: boolean;
  tea_lover: boolean;
  fitness_enthusiast: boolean;
  eco_friendly: boolean;
  luxury_buyer: boolean;
  diy_lover: boolean;
}

export interface PreferencesData {
  gift_types: string[]; // Handmade, Digital, Experiences, Luxury, Practical, Personalized, Subscription
  dislikes_and_restrictions: string;
}

export interface MemoriesData {
  shared_memory?: string;
  special_date?: string;
  funny_moment?: string;
  meaningful_experience?: string;
  nicknames?: string;
  special_message?: string;
}

export interface SurveyStateData {
  occasion: OccasionType;
  custom_occasion?: string;
  relationship: RelationshipType;
  custom_relationship?: string;
  profile: RecipientProfileData;
  budget: BudgetData;
  interests: string[];
  personality: string[];
  favorites: FavoritesData;
  lifestyle: LifestyleData;
  preferences: PreferencesData;
  memories: MemoriesData;
  additional_notes: string;
}

export interface SurveyRecord {
  id: string;
  user_id?: string;
  recipient_id?: string;
  occasion: string;
  min_budget: number;
  max_budget: number;
  status: 'draft' | 'submitted' | 'archived';
  current_step: number;
  survey_payload: SurveyStateData;
  created_at: string;
  updated_at: string;
}

export interface SurveySubmitResponse {
  success: boolean;
  survey_id: string;
  status: string;
  message: string;
  estimated_ai_processing_time: string;
}
