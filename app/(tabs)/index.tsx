import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Recipe, FilterOptions } from '../../src/types';
import { getRecipes, searchRecipes, filterRecipes, updateLastCooked } from '../../src/services';
import { SearchBar, FilterButton, RecipeCard, Loading } from '../../src/components';
import { colors, spacing, borderRadius, shadows } from '../../src/constants';

const defaultFilters: FilterOptions = {
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function RecipeListScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      const data = await getRecipes();
      setRecipes(data);
      const filtered = await filterRecipes(data, filters);
      setFilteredRecipes(filtered);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    const applySearch = async () => {
      let results = recipes;
      if (searchQuery.trim()) {
        results = await searchRecipes(searchQuery);
      }
      const filtered = await filterRecipes(results, filters);
      setFilteredRecipes(filtered);
    };
    applySearch();
  }, [searchQuery, recipes, filters]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecipes();
  }, [loadRecipes]);

  const hasActiveFilters =
    filters.tags?.length ||
    filters.ingredients?.length ||
    filters.difficulty?.length ||
    filters.maxCookingTime ||
    filters.sortBy !== 'createdAt';

  const navigateToRecipe = (id: string) => {
    router.push(`/recipe/${id}`);
  };

  const navigateToCreate = () => {
    router.push('/recipe/create');
  };

  const navigateToFilter = () => {
    router.push({
      pathname: '/filter',
      params: { filters: JSON.stringify(filters) },
    });
  };

  const handleUpdateLastCooked = async (id: string, date: Date) => {
    try {
      await updateLastCooked(id, date);
      // Update local state
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lastCooked: date } : r))
      );
      setFilteredRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, lastCooked: date } : r))
      );
    } catch (error) {
      console.error('Error updating last cooked:', error);
    }
  };

  if (loading) {
    return <Loading message="Загрузка рецептов..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Найти рецепт..."
        />
        <View style={styles.filterButtonContainer}>
          <FilterButton onPress={navigateToFilter} hasActiveFilters={!!hasActiveFilters} />
        </View>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigateToRecipe(item.id)}
            onUpdateLastCooked={handleUpdateLastCooked}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Рецепты не найдены' : 'Нет рецептов'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Попробуйте изменить поисковый запрос'
                : 'Добавьте свой первый рецепт!'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={navigateToCreate} activeOpacity={0.8}>
        <Plus size={28} color={colors.white} />
      </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  filterButtonContainer: {
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});
