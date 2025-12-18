import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Plus, Trash2, CalendarDays } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RecipeCreateInput } from '../../src/types';
import { createRecipe } from '../../src/services';
import { Button, Input, Tag } from '../../src/components';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants';

const difficultyOptions: ('Легко' | 'Средне' | 'Сложно')[] = ['Легко', 'Средне', 'Сложно'];

export default function RecipeCreateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<RecipeCreateInput>({
    name: '',
    ingredients: [''],
    instructions: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof RecipeCreateInput>(
    field: K,
    value: RecipeCreateInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length <= 1) return;
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase();
    if (formData.tags?.includes(newTag)) {
      setTagInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag],
    }));
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    }
    
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Инструкция обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const cleanData: RecipeCreateInput = {
        ...formData,
        ingredients: formData.ingredients.filter((i) => i.trim()),
      };
      await createRecipe(cleanData);
      router.back();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать рецепт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новый рецепт</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Name */}
        <Input
          label="Название *"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="Введите название рецепта"
          error={errors.name}
        />

        {/* Description */}
        <Input
          label="Описание"
          value={formData.description || ''}
          onChangeText={(text) => updateField('description', text)}
          placeholder="Краткое описание рецепта"
          multiline
          numberOfLines={3}
        />

        {/* Image URL */}
        <Input
          label="URL изображения"
          value={formData.image || ''}
          onChangeText={(text) => updateField('image', text)}
          placeholder="https://example.com/image.jpg"
        />

        {/* Cooking Time */}
        <Input
          label="Время приготовления (минуты)"
          value={formData.cookingTime?.toString() || ''}
          onChangeText={(text) => updateField('cookingTime', text ? parseInt(text) : undefined)}
          placeholder="30"
          keyboardType="numeric"
        />

        {/* Difficulty */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Сложность</Text>
          <View style={styles.difficultyContainer}>
            {difficultyOptions.map((option) => (
              <Tag
                key={option}
                label={option}
                selected={formData.difficulty === option}
                onPress={() => updateField('difficulty', formData.difficulty === option ? undefined : option)}
              />
            ))}
          </View>
        </View>

        {/* Servings */}
        <Input
          label="Количество порций"
          value={formData.servings?.toString() || ''}
          onChangeText={(text) => updateField('servings', text ? parseInt(text) : undefined)}
          placeholder="4"
          keyboardType="numeric"
        />

        {/* Calories */}
        <Input
          label="Калории"
          value={formData.calories?.toString() || ''}
          onChangeText={(text) => updateField('calories', text ? parseInt(text) : undefined)}
          placeholder="300"
          keyboardType="numeric"
        />

        {/* Last Cooked Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Последний раз готовили</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarDays size={20} color={colors.primary} />
            <Text style={styles.datePickerText}>
              {formData.lastCooked
                ? new Date(formData.lastCooked).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Выбрать дату'}
            </Text>
          </TouchableOpacity>
          {formData.lastCooked && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => updateField('lastCooked', undefined)}
            >
              <Text style={styles.clearDateText}>Очистить дату</Text>
            </TouchableOpacity>
          )}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={formData.lastCooked ? new Date(formData.lastCooked) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                updateField('lastCooked', selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Tags */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Теги</Text>
          <View style={styles.tagInputContainer}>
            <Input
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Добавить тег"
              containerStyle={styles.tagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          {formData.tags && formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tagItem}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagItemText}>#{tag}</Text>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Ingredients */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Ингредиенты *</Text>
          {errors.ingredients && <Text style={styles.error}>{errors.ingredients}</Text>}
          {formData.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Input
                value={ingredient}
                onChangeText={(text) => updateIngredient(index, text)}
                placeholder={`Ингредиент ${index + 1}`}
                containerStyle={styles.ingredientInput}
              />
              {formData.ingredients.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Trash2 size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Plus size={20} color={colors.primary} />
            <Text style={styles.addButtonText}>Добавить ингредиент</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Input
          label="Инструкция *"
          value={formData.instructions}
          onChangeText={(text) => updateField('instructions', text)}
          placeholder="Опишите процесс приготовления..."
          multiline
          numberOfLines={6}
          error={errors.instructions}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Создать рецепт"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: spacing.md,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLighter,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagItemText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  datePickerText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  clearDateButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    ...typography.bodySmall,
    color: colors.error,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  removeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
});
