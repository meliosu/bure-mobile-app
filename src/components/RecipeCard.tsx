import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, ImageSourcePropType } from 'react-native';
import { Clock, CalendarDays } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Recipe } from '../types';
import { colors, borderRadius, spacing, typography, shadows } from '../constants';

const defaultImage = require('../../assets/default-image.png');

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onUpdateLastCooked?: (id: string, date: Date) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, onUpdateLastCooked }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatCookingTime = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}:00`;
    }
    return `0:${minutes.toString().padStart(2, '0')}`;
  };

  const formatLastCooked = (date?: Date): string => {
    if (!date) return 'Не готовили';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate && onUpdateLastCooked) {
      onUpdateLastCooked(recipe.id, selectedDate);
    }
  };

  const handleLastCookedPress = (e: any) => {
    e.stopPropagation();
    setShowDatePicker(true);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={recipe.image ? { uri: recipe.image } : defaultImage}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {recipe.name}
          </Text>
          {recipe.cookingTime && (
            <View style={styles.timeContainer}>
              <Clock size={14} color={colors.textTertiary} />
              <Text style={styles.time}>{formatCookingTime(recipe.cookingTime)}</Text>
            </View>
          )}
        </View>
        {recipe.description && (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}
        <View style={styles.bottomRow}>
          <View style={styles.tagsContainer}>
            {recipe.tags && recipe.tags.length > 0 && (
              recipe.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))
            )}
          </View>
          <TouchableOpacity
            style={styles.lastCookedButton}
            onPress={handleLastCookedPress}
            activeOpacity={0.7}
          >
            <CalendarDays size={12} color={colors.primary} />
            <Text style={styles.lastCookedText}>{formatLastCooked(recipe.lastCooked)}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={recipe.lastCooked ? new Date(recipe.lastCooked) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lastCookedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLighter,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginLeft: spacing.xs,
  },
  lastCookedText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});
