// Recipe Types - App format (camelCase, ingredients as array)
export type Difficulty = 'Легко' | 'Средне' | 'Сложно';
export type ApiComplexity = 'easy' | 'medium' | 'hard';

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  description?: string;
  cookingTime?: number; // in minutes
  difficulty?: Difficulty;
  calories?: number;
  servings?: number;
  tags?: string[];
  lastCooked?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecipeCreateInput {
  name: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  description?: string;
  cookingTime?: number;
  difficulty?: Difficulty;
  calories?: number;
  servings?: number;
  tags?: string[];
  lastCooked?: Date;
}

export interface RecipeUpdateInput extends Partial<RecipeCreateInput> {
  id: string;
  lastCooked?: Date;
}

// API format types (snake_case, ingredients as object)
export interface ApiRecipe {
  id: string;
  name: string;
  description?: string | null;
  ingredients: Record<string, string>;
  instructions: string;
  servings?: number | null;
  cooking_time?: number | null;
  complexity?: ApiComplexity | null;
  calories?: number | null;
  image?: string | null;
  tags?: string[] | null;
  last_cooked?: string | null;
  created_at: string;
}

export interface ApiRecipeCreate {
  name: string;
  description?: string | null;
  ingredients: Record<string, string>;
  instructions: string;
  servings?: number | null;
  cooking_time?: number | null;
  complexity?: ApiComplexity | null;
  calories?: number | null;
  image?: string | null;
  tags?: string[] | null;
  last_cooked?: string | null;
}

export interface ApiRecipeList {
  recipes: ApiRecipe[];
}

export interface ApiRecipeId {
  id: string;
}

export interface ApiDeleteResponse {
  status: string;
}

export interface ApiImageUploadResponse {
  image_path: string;
}

// User Types
export interface UserSettings {
  notificationsEnabled: boolean;
  notificationFrequencyDays: number;
}

export interface User {
  id: string;
  username: string;
  telegramHandle?: string;
  settings: UserSettings;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Filter Types
export type SortOption = 'createdAt' | 'cookingTime' | 'name';
export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  sortBy: SortOption;
  sortOrder: SortOrder;
  tags?: string[];
  ingredients?: string[];
  difficulty?: ('Легко' | 'Средне' | 'Сложно')[];
  maxCookingTime?: number;
}
