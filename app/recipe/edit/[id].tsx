import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Plus, Trash2, CalendarDays, Camera, ImageIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Recipe, RecipeUpdateInput } from '../../../src/types';
import { getRecipeById, updateRecipe, uploadImage, getApiBaseUrl } from '../../../src/services';
import { Button, Input, Tag, Loading } from '../../../src/components';
import { colors, spacing, borderRadius, typography } from '../../../src/constants';

const difficultyOptions: ('Легко' | 'Средне' | 'Сложно')[] = ['Легко', 'Средне', 'Сложно'];

export default function RecipeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<RecipeUpdateInput>({
    id: '',
    name: '',
    ingredients: [''],
    instructions: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;
    try {
      const recipe = await getRecipeById(id);
      if (recipe) {
        setFormData({
          id: recipe.id,
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          image: recipe.image,
          description: recipe.description,
          cookingTime: recipe.cookingTime,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          servings: recipe.servings,
          tags: recipe.tags,
          lastCooked: recipe.lastCooked,
        });
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof RecipeUpdateInput>(
    field: K,
    value: RecipeUpdateInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ''],
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    if ((formData.ingredients?.length || 0) <= 1) return;
    const newIngredients = (formData.ingredients || []).filter((_, i) => i !== index);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужен доступ к галерее для выбора изображения');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateField('image', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужен доступ к камере для съёмки');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateField('image', result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Сделать фото', 'Выбрать из галереи'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          if (buttonIndex === 2) pickImage();
        }
      );
    } else {
      Alert.alert(
        'Выберите изображение',
        '',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Сделать фото', onPress: takePhoto },
          { text: 'Из галереи', onPress: pickImage },
        ]
      );
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    const validIngredients = (formData.ingredients || []).filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'Добавьте хотя бы один ингредиент';
    }
    
    if (!formData.instructions?.trim()) {
      newErrors.instructions = 'Инструкция обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      let imagePathForApi: string | undefined = formData.image;
      
      // Upload image if it's a new local file (not already an API path or external URL)
      if (formData.image && 
          !formData.image.startsWith('/images/') && 
          !formData.image.startsWith(getApiBaseUrl())) {
        try {
          imagePathForApi = await uploadImage(formData.image);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert('Ошибка', 'Не удалось загрузить изображение. Изменения будут сохранены без нового фото.');
          // Keep old image or no image
          imagePathForApi = undefined;
        }
      } else if (formData.image?.startsWith(getApiBaseUrl())) {
        // Convert full URL back to relative path for API
        imagePathForApi = formData.image.replace(getApiBaseUrl(), '');
      }

      const cleanData: RecipeUpdateInput = {
        ...formData,
        ingredients: (formData.ingredients || []).filter((i) => i.trim()),
        image: imagePathForApi,
      };
      await updateRecipe(cleanData);
      router.back();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Загрузка рецепта..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Редактировать</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        extraHeight={120}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Name */}
          <Input
            label="Название *"
            value={formData.name || ''}
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

        {/* Image */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Изображение</Text>
          {formData.image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.image }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity style={styles.changeImageButton} onPress={showImageOptions}>
                  <Camera size={16} color={colors.white} />
                  <Text style={styles.changeImageText}>Изменить</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => updateField('image', undefined)}
                >
                  <Trash2 size={16} color={colors.white} />
                  <Text style={styles.removeImageText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={showImageOptions}>
              <ImageIcon size={48} color={colors.primary} />
              <Text style={styles.imagePickerText}>Добавить изображение</Text>
              <Text style={styles.imagePickerHint}>Нажмите для выбора из галереи или камеры</Text>
            </TouchableOpacity>
          )}
        </View>

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
          {(formData.ingredients || []).map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Input
                value={ingredient}
                onChangeText={(text) => updateIngredient(index, text)}
                placeholder={`Ингредиент ${index + 1}`}
                containerStyle={styles.ingredientInput}
              />
              {(formData.ingredients?.length || 0) > 1 && (
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
          value={formData.instructions || ''}
          onChangeText={(text) => updateField('instructions', text)}
          placeholder="Опишите процесс приготовления..."
          multiline
          numberOfLines={6}
          error={errors.instructions}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Сохранить изменения"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  changeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  changeImageText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  removeImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
  },
  removeImageText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  imagePickerText: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.md,
  },
  imagePickerHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
