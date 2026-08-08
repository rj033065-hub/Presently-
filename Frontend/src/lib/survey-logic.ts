import { SurveyStateData } from '@/types/survey';

export function getDefaultSurveyState(): SurveyStateData {
  return {
    occasion: 'Birthday',
    custom_occasion: '',
    relationship: 'Friend',
    custom_relationship: '',
    profile: {
      name: '',
      age: 28,
      gender: 'Prefer not to say',
      country: 'United States',
      language: 'English',
    },
    budget: {
      min: 25,
      max: 150,
      currency: 'USD',
      is_custom: false,
    },
    interests: ['Technology', 'Music', 'Books'],
    personality: ['Creative', 'Practical'],
    favorites: {
      colors: [],
      brands: [],
      foods: [],
      drinks: [],
      movies: [],
      tv_shows: [],
      games: [],
      hobbies: [],
      animals: [],
      flowers: [],
      music: [],
      celebrities: [],
    },
    lifestyle: {
      works_from_home: false,
      is_student: false,
      is_traveler: false,
      is_pet_owner: false,
      coffee_lover: false,
      tea_lover: false,
      fitness_enthusiast: false,
      eco_friendly: false,
      luxury_buyer: false,
      diy_lover: false,
    },
    preferences: {
      gift_types: ['Practical gifts', 'Personalized gifts'],
      dislikes_and_restrictions: '',
    },
    memories: {
      shared_memory: '',
      special_date: '',
      funny_moment: '',
      meaningful_experience: '',
      nicknames: '',
      special_message: '',
    },
    additional_notes: '',
  };
}

export function shouldShowLuxuryQuestions(state: SurveyStateData): boolean {
  const isHighBudget =
    (state.budget.currency === 'INR' && state.budget.max >= 50000) ||
    (state.budget.currency !== 'INR' && state.budget.max >= 500);
  const isLuxuryLifestyle = state.lifestyle.luxury_buyer;
  const isLuxuryPersonality = state.personality.includes('Luxury Lover');
  return isHighBudget || isLuxuryLifestyle || isLuxuryPersonality;
}

export function shouldShowPartnerMemories(state: SurveyStateData): boolean {
  const partnerRoles = ['Girlfriend', 'Boyfriend', 'Wife', 'Husband'];
  const partnerOccasions = ['Anniversary', "Valentine's Day"];
  return partnerRoles.includes(state.relationship) || partnerOccasions.includes(state.occasion);
}

export function shouldShowGamingQuestions(state: SurveyStateData): boolean {
  return state.interests.includes('Gaming');
}

export function shouldShowAcademicQuestions(state: SurveyStateData): boolean {
  return state.lifestyle.is_student;
}

export function shouldShowParentQuestions(state: SurveyStateData): boolean {
  const parentRoles = ['Mother', 'Father'];
  const parentOccasions = ["Mother's Day", "Father's Day"];
  return parentRoles.includes(state.relationship) || parentOccasions.includes(state.occasion);
}
