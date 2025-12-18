import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Pencil, Trash2, Clock, ChefHat, Users, Flame } from 'lucide-react-native';
import { Recipe } from '../../src/types';
import { getRecipeById, deleteRecipe } from '../../src/services';
import { Button, Loading, ConfirmDialog } from '../../src/components';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;
    try {
      const data = await getRecipeById(id);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/recipe/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteRecipe(id);
      router.back();
    } catch (error) {
      console.error('Error deleting recipe:', error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatCookingTime = (minutes?: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours} ч. ${mins} мин.` : `${hours} ч.`;
    }
    return `${mins} мин.`;
  };

  if (loading) {
    return <Loading message="Загрузка рецепта..." />;
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Рецепт не найден</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Recipe Image */}
        {recipe.image && (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        )}

        {/* Recipe Header */}
        <View style={styles.headerContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{recipe.name}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                <Pencil size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recipe Info Grid - only render if there's any info */}
        {(recipe.cookingTime || recipe.difficulty || recipe.servings || recipe.calories) && (
          <View style={styles.infoCard}>
            {recipe.cookingTime && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Время приготовления</Text>
                <Text style={styles.infoValue}>{formatCookingTime(recipe.cookingTime)}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Сложность</Text>
                <Text style={styles.infoValue}>{recipe.difficulty}</Text>
              </View>
            )}
            {recipe.servings && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Количество порций</Text>
                <Text style={styles.infoValue}>{recipe.servings} порции</Text>
              </View>
            )}
            {recipe.calories && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Калории</Text>
                <Text style={styles.infoValue}>{recipe.calories} калорий</Text>
              </View>
            )}
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ингредиенты</Text>
          <View style={styles.ingredientsCard}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Инструкция</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{recipe.instructions}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Удалить рецепт"
        message="Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        danger
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.borderLight,
  },
  headerContainer: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  deleteButton: {
    backgroundColor: colors.errorLight,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  ingredientsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  ingredientText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  instructionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  instructionsText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});
