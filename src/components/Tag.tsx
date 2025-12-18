import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../constants';

interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Tag: React.FC<TagProps> = ({ label, selected = false, onPress }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {label}
      </Text>
    </Component>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagSelected: {
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tagTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
});
