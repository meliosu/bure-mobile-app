import {
  Recipe,
  RecipeCreateInput,
  RecipeUpdateInput,
  User,
  UserSettings,
  ChatMessage,
  FilterOptions,
  ApiRecipe,
  ApiRecipeCreate,
  ApiRecipeList,
  ApiRecipeId,
  ApiDeleteResponse,
  ApiImageUploadResponse,
  Difficulty,
  ApiComplexity,
} from '../types';

// API Configuration
// TODO: Move to environment variable for production
const API_BASE_URL = 'http://192.168.1.73:8000'; 

// ============ TRANSFORMATION HELPERS ============

const complexityToApiMap: Record<Difficulty, ApiComplexity> = {
  'Легко': 'easy',
  'Средне': 'medium',
  'Сложно': 'hard',
};

const apiToComplexityMap: Record<ApiComplexity, Difficulty> = {
  'easy': 'Легко',
  'medium': 'Средне',
  'hard': 'Сложно',
};

const difficultyToApi = (difficulty?: Difficulty): ApiComplexity | null => {
  if (!difficulty) return null;
  return complexityToApiMap[difficulty];
};

const apiToDifficulty = (complexity?: ApiComplexity | null): Difficulty | undefined => {
  if (!complexity) return undefined;
  return apiToComplexityMap[complexity];
};

// Convert ingredients array to object (for API)
const ingredientsArrayToObject = (ingredients: string[]): Record<string, string> => {
  const result: Record<string, string> = {};
  ingredients.forEach((ingredient, index) => {
    // Try to parse "ingredient, amount" format
    const parts = ingredient.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      result[parts[0]] = parts.slice(1).join(', ');
    } else {
      // If no comma, use the whole string as key with empty amount
      result[ingredient] = '';
    }
  });
  return result;
};

// Convert ingredients object to array (from API)
const ingredientsObjectToArray = (ingredients: Record<string, string>): string[] => {
  return Object.entries(ingredients).map(([name, amount]) => {
    if (amount && amount.trim()) {
      return `${name}, ${amount}`;
    }
    return name;
  });
};

// Build full image URL from API path
const buildImageUrl = (imagePath?: string | null): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // API returns paths like "/images/filename.jpg"
  return `${API_BASE_URL}${imagePath}`;
};

// Transform API recipe to app format
const transformApiRecipeToApp = (apiRecipe: ApiRecipe): Recipe => {
  return {
    id: apiRecipe.id,
    name: apiRecipe.name,
    description: apiRecipe.description || undefined,
    ingredients: ingredientsObjectToArray(apiRecipe.ingredients),
    instructions: apiRecipe.instructions,
    servings: apiRecipe.servings || undefined,
    cookingTime: apiRecipe.cooking_time || undefined,
    difficulty: apiToDifficulty(apiRecipe.complexity),
    calories: apiRecipe.calories || undefined,
    image: buildImageUrl(apiRecipe.image),
    tags: apiRecipe.tags || undefined,
    lastCooked: apiRecipe.last_cooked ? new Date(apiRecipe.last_cooked) : undefined,
    createdAt: new Date(apiRecipe.created_at),
  };
};

// Transform app recipe input to API format
const transformAppRecipeToApi = (input: RecipeCreateInput): ApiRecipeCreate => {
  return {
    name: input.name,
    description: input.description || null,
    ingredients: ingredientsArrayToObject(input.ingredients),
    instructions: input.instructions,
    servings: input.servings || null,
    cooking_time: input.cookingTime || null,
    complexity: difficultyToApi(input.difficulty),
    calories: input.calories || null,
    image: input.image || null,
    tags: input.tags || null,
    last_cooked: input.lastCooked ? input.lastCooked.toISOString().split('T')[0] : null,
  };
};

// ============ API FETCH HELPERS ============

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiFetch = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============ USER API (MOCKED - not in API spec) ============

// Mock user data
let mockUser: User = {
  id: '1',
  username: 'Александр Артёмович',
  telegramHandle: '@telegram-handle',
  settings: {
    notificationsEnabled: true,
    notificationFrequencyDays: 7,
  },
};

// Simulate API delay for mocked endpoints
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getUser = async (): Promise<User> => {
  await delay(200);
  return { ...mockUser };
};

export const updateUser = async (updates: Partial<User>): Promise<User> => {
  await delay(300);
  mockUser = { ...mockUser, ...updates };
  return { ...mockUser };
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<User> => {
  await delay(300);
  mockUser.settings = { ...mockUser.settings, ...settings };
  return { ...mockUser };
};

// ============ CHAT API (MOCKED - not in API spec) ============

// Mock chat messages
let mockChatMessages: ChatMessage[] = [];

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  await delay(100);
  return [...mockChatMessages];
};

export const sendChatMessage = async (content: string): Promise<ChatMessage> => {
  await delay(500);
  
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
  mockChatMessages.push(userMessage);

  // Simulate AI response
  await delay(1000);
  const aiResponses = [
    'Отличный вопрос! Для приготовления этого блюда вам понадобится около 30 минут и следующие ингредиенты:...',
    'Из ваших ингредиентов можно сделать следующее блюдо: ...'
  ];
  
  const assistantMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
    timestamp: new Date(),
  };
  mockChatMessages.push(assistantMessage);

  return assistantMessage;
};

export const clearChatHistory = async (): Promise<void> => {
  await delay(200);
  mockChatMessages = [];
};

// ============ RECIPE API ============

export const getRecipes = async (): Promise<Recipe[]> => {
  const response = await apiFetch<ApiRecipeList>('/recipes');
  return response.recipes.map(transformApiRecipeToApp);
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const response = await apiFetch<ApiRecipe>(`/recipes/${id}`);
    return transformApiRecipeToApp(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createRecipe = async (input: RecipeCreateInput): Promise<Recipe> => {
  const apiInput = transformAppRecipeToApi(input);
  const response = await apiFetch<ApiRecipeId>('/recipes', {
    method: 'POST',
    body: JSON.stringify(apiInput),
  });
  
  // Fetch the created recipe to return full data
  const created = await getRecipeById(response.id);
  if (!created) {
    throw new Error('Failed to fetch created recipe');
  }
  return created;
};

export const updateRecipe = async (input: RecipeUpdateInput): Promise<Recipe> => {
  const { id, ...rest } = input;
  const apiInput = transformAppRecipeToApi(rest as RecipeCreateInput);
  
  const response = await apiFetch<ApiRecipe>(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(apiInput),
  });
  
  return transformApiRecipeToApp(response);
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await apiFetch<ApiDeleteResponse>(`/recipes/${id}`, {
    method: 'DELETE',
  });
};

export const updateLastCooked = async (id: string, date: Date): Promise<Recipe> => {
  // Fetch current recipe, update last_cooked, and save
  const current = await getRecipeById(id);
  if (!current) {
    throw new Error('Рецепт не найден');
  }
  
  const updateInput: RecipeUpdateInput = {
    id,
    name: current.name,
    ingredients: current.ingredients,
    instructions: current.instructions,
    description: current.description,
    image: current.image,
    cookingTime: current.cookingTime,
    difficulty: current.difficulty,
    calories: current.calories,
    servings: current.servings,
    tags: current.tags,
    lastCooked: date,
  };
  
  return updateRecipe(updateInput);
};

// Client-side search (API doesn't have search endpoint)
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const recipes = await getRecipes();
  const lowerQuery = query.toLowerCase();
  return recipes.filter(
    r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some(i => i.toLowerCase().includes(lowerQuery)) ||
      r.tags?.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

// Client-side filtering (API doesn't have filter endpoint)
export const filterRecipes = async (
  recipes: Recipe[],
  filters: FilterOptions
): Promise<Recipe[]> => {
  let result = [...recipes];

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(r =>
      r.tags?.some(t => filters.tags!.includes(t))
    );
  }

  // Filter by ingredients
  if (filters.ingredients && filters.ingredients.length > 0) {
    result = result.filter(r =>
      r.ingredients.some(i =>
        filters.ingredients!.some(fi =>
          i.toLowerCase().includes(fi.toLowerCase())
        )
      )
    );
  }

  // Filter by difficulty
  if (filters.difficulty && filters.difficulty.length > 0) {
    result = result.filter(r =>
      r.difficulty && filters.difficulty!.includes(r.difficulty)
    );
  }

  // Filter by max cooking time
  if (filters.maxCookingTime) {
    result = result.filter(
      r => !r.cookingTime || r.cookingTime <= filters.maxCookingTime!
    );
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'createdAt':
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        break;
      case 'cookingTime':
        comparison = (a.cookingTime || 0) - (b.cookingTime || 0);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
};

// Get all unique tags from recipes
export const getAllTags = async (): Promise<string[]> => {
  const recipes = await getRecipes();
  const tags = new Set<string>();
  recipes.forEach(r => r.tags?.forEach(t => tags.add(t)));
  return Array.from(tags);
};

// ============ IMAGE API ============

export const uploadImage = async (imageUri: string): Promise<string> => {
  // Get filename from URI
  const filename = imageUri.split('/').pop() || 'image.jpg';
  
  // Determine MIME type
  const extension = filename.split('.').pop()?.toLowerCase();
  let mimeType = 'image/jpeg';
  if (extension === 'png') mimeType = 'image/png';
  else if (extension === 'gif') mimeType = 'image/gif';
  else if (extension === 'webp') mimeType = 'image/webp';

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }

  const result: ApiImageUploadResponse = await response.json();
  return result.image_path;
};

// Get full image URL
export const getImageUrl = (imagePath: string): string => {
  return buildImageUrl(imagePath) || '';
};

// Export API base URL for components that need it
export const getApiBaseUrl = (): string => API_BASE_URL;
