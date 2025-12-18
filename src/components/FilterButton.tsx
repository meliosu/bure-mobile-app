import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { colors, borderRadius, spacing } from '../constants';

interface FilterButtonProps {
  onPress: () => void;
  hasActiveFilters?: boolean;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  onPress,
  hasActiveFilters = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, hasActiveFilters && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <SlidersHorizontal
        size={22}
        color={hasActiveFilters ? colors.primary : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLighter,
  },
});
