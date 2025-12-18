import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { FilterOptions, SortOption, SortOrder } from '../src/types';
import { getAllTags } from '../src/services';
import { Button, Tag, Input } from '../src/components';
import { colors, spacing, borderRadius, typography, shadows } from '../src/constants';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'createdAt', label: 'По дате создания' },
  { value: 'cookingTime', label: 'По времени приготовления' },
  { value: 'name', label: 'По названию' },
];

const difficultyOptions: ('Легко' | 'Средне' | 'Сложно')[] = ['Легко', 'Средне', 'Сложно'];

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filters?: string }>();
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const defaultFilters: FilterOptions = {
    sortBy: 'createdAt',
    sortOrder: 'desc',
    tags: [],
    difficulty: [],
    maxCookingTime: undefined,
  };

  const [filters, setFilters] = useState<FilterOptions>(() => {
    if (params.filters) {
      try {
        return JSON.parse(params.filters);
      } catch {
        return defaultFilters;
      }
    }
    return defaultFilters;
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    if (currentTags.includes(tag)) {
      updateFilter('tags', currentTags.filter((t) => t !== tag));
    } else {
      updateFilter('tags', [...currentTags, tag]);
    }
  };

  const toggleDifficulty = (difficulty: 'Легко' | 'Средне' | 'Сложно') => {
    const currentDifficulty = filters.difficulty || [];
    if (currentDifficulty.includes(difficulty)) {
      updateFilter('difficulty', currentDifficulty.filter((d) => d !== difficulty));
    } else {
      updateFilter('difficulty', [...currentDifficulty, difficulty]);
    }
  };

  const toggleSortOrder = () => {
    updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleApply = () => {
    // Pass filters back via route params
    router.back();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Фильтры</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetButton}>Сбросить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сортировка</Text>
          <View style={styles.sortOptionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  filters.sortBy === option.value && styles.sortOptionActive,
                ]}
                onPress={() => updateFilter('sortBy', option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    filters.sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.orderToggle} onPress={toggleSortOrder}>
            <Text style={styles.orderText}>
              {filters.sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            </Text>
            {filters.sortOrder === 'asc' ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сложность</Text>
          <View style={styles.tagsContainer}>
            {difficultyOptions.map((difficulty) => (
              <Tag
                key={difficulty}
                label={difficulty}
                selected={(filters.difficulty || []).includes(difficulty)}
                onPress={() => toggleDifficulty(difficulty)}
              />
            ))}
          </View>
        </View>

        {/* Max Cooking Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Максимальное время (мин)</Text>
          <Input
            value={filters.maxCookingTime?.toString() || ''}
            onChangeText={(text) =>
              updateFilter('maxCookingTime', text ? parseInt(text) : undefined)
            }
            placeholder="Например: 60"
            keyboardType="numeric"
            containerStyle={styles.timeInput}
          />
        </View>

        {/* Tags */}
        {availableTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Теги</Text>
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => (
                <Tag
                  key={tag}
                  label={`#${tag}`}
                  selected={(filters.tags || []).includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Применить фильтры" onPress={handleApply} />
      </View>
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
  resetButton: {
    ...typography.body,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sortOptionsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  sortOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLighter,
  },
  sortOptionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  orderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  orderText: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeInput: {
    marginBottom: 0,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: spacing.xl,
  },
});
