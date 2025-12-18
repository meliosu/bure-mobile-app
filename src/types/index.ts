// Recipe Types
export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  description?: string;
  cookingTime?: number; // in minutes
  difficulty?: 'Легко' | 'Средне' | 'Сложно';
  calories?: number;
  servings?: number;
  tags?: string[];
  lastCooked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeCreateInput {
  name: string;
  ingredients: string[];
  instructions: string;
  image?: string;
  description?: string;
  cookingTime?: number;
  difficulty?: 'Легко' | 'Средне' | 'Сложно';
  calories?: number;
  servings?: number;
  tags?: string[];
}

export interface RecipeUpdateInput extends Partial<RecipeCreateInput> {
  id: string;
  lastCooked?: Date;
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
