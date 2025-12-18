import {
  Recipe,
  RecipeCreateInput,
  RecipeUpdateInput,
  User,
  UserSettings,
  ChatMessage,
  FilterOptions,
} from '../types';

// Mock data for recipes
const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Борщ очень вкусный (бабушкин рецепт)',
    ingredients: ['Вода, 500 мл.', 'Свекла, 2 шт.', 'Картошка, 4 шт.', 'Сметана, 2 ст. л.', 'Зелень'],
    instructions: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut finibus orci commodo a. Etiam id erat at mauris dapibus tempus. Nulla ut magna magna. Maecenas fermentum sem sit amet mollis consequat.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut fini...',
    cookingTime: 90,
    difficulty: 'Сложно',
    calories: 300,
    servings: 2,
    tags: ['суп', 'русское'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Блины с орехами и сиропом',
    ingredients: ['Мука, 200 г.', 'Молоко, 500 мл.', 'Яйца, 2 шт.', 'Орехи, 100 г.', 'Кленовый сироп'],
    instructions: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut finibus orci commodo a.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut fini...',
    cookingTime: 40,
    difficulty: 'Легко',
    tags: ['легко', 'блины'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    name: 'Пельмени',
    ingredients: ['Мука, 400 г.', 'Фарш, 500 г.', 'Лук, 2 шт.', 'Соль', 'Перец'],
    instructions: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut finibus orci commodo a.',
    image: 'https://images.unsplash.com/photo-1583394293214-28ez963ed9a0?w=400',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis. Curabitur tincidunt orci turpis, ut finibus orci commodo a.',
    tags: ['быстро', 'вкусно', 'русское'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    name: 'Торт "Красный бархат"',
    ingredients: ['Мука, 300 г.', 'Какао, 30 г.', 'Красный краситель', 'Сливочный сыр, 500 г.', 'Сахар, 300 г.'],
    instructions: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean finibus lacinia turpis molestie lobortis.',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean...',
    cookingTime: 180,
    difficulty: 'Сложно',
    calories: 450,
    servings: 8,
    tags: ['десерт', 'торт', 'праздник'],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
];

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

// Mock chat messages
let mockChatMessages: ChatMessage[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ RECIPE API ============

export const getRecipes = async (): Promise<Recipe[]> => {
  await delay(300);
  return [...mockRecipes];
};

export const getRecipeById = async (id: string): Promise<Recipe | null> => {
  await delay(200);
  return mockRecipes.find(r => r.id === id) || null;
};

export const createRecipe = async (input: RecipeCreateInput): Promise<Recipe> => {
  await delay(400);
  const newRecipe: Recipe = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockRecipes.unshift(newRecipe);
  return newRecipe;
};

export const updateRecipe = async (input: RecipeUpdateInput): Promise<Recipe> => {
  await delay(400);
  const index = mockRecipes.findIndex(r => r.id === input.id);
  if (index === -1) {
    throw new Error('Рецепт не найден');
  }
  const updated: Recipe = {
    ...mockRecipes[index],
    ...input,
    updatedAt: new Date(),
  };
  mockRecipes[index] = updated;
  return updated;
};

export const deleteRecipe = async (id: string): Promise<void> => {
  await delay(300);
  const index = mockRecipes.findIndex(r => r.id === id);
  if (index !== -1) {
    mockRecipes.splice(index, 1);
  }
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  await delay(200);
  const lowerQuery = query.toLowerCase();
  return mockRecipes.filter(
    r =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.ingredients.some(i => i.toLowerCase().includes(lowerQuery)) ||
      r.tags?.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

export const filterRecipes = async (
  recipes: Recipe[],
  filters: FilterOptions
): Promise<Recipe[]> => {
  await delay(100);
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

export const getAllTags = async (): Promise<string[]> => {
  await delay(100);
  const tags = new Set<string>();
  mockRecipes.forEach(r => r.tags?.forEach(t => tags.add(t)));
  return Array.from(tags);
};

// ============ USER API ============

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

// ============ CHAT API ============

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
