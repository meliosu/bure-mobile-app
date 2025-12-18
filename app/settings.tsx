import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Clock } from 'lucide-react-native';
import { User } from '../src/types';
import { getUser, updateUserSettings } from '../src/services';
import { Loading, Input } from '../src/components';
import { colors, spacing, borderRadius, typography, shadows } from '../src/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUserSettings({ notificationsEnabled: enabled });
      setUser(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (days: string) => {
    if (!user) return;
    const numDays = parseInt(days) || 1;
    if (numDays < 1 || numDays > 30) return;
    
    setSaving(true);
    try {
      const updated = await updateUserSettings({ notificationFrequencyDays: numDays });
      setUser(updated);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Загрузка настроек..." />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Не удалось загрузить настройки</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уведомления</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryLighter }]}>
                  <Bell size={20} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Включить уведомления</Text>
                  <Text style={styles.settingDescription}>
                    Получать напоминания о рецептах, которые Вы давно не готовили
                  </Text>
                </View>
              </View>
              <Switch
                value={user.settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={user.settings.notificationsEnabled ? colors.primary : colors.white}
                disabled={saving}
              />
            </View>

            {user.settings.notificationsEnabled && (
              <View style={styles.frequencyContainer}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
                      <Clock size={20} color={colors.success} />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>Частота уведомлений</Text>
                      <Text style={styles.settingDescription}>
                         частота уведомлений (дней)
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.frequencyInputContainer}>
                  <Input
                    value={user.settings.notificationFrequencyDays.toString()}
                    onChangeText={handleFrequencyChange}
                    keyboardType="numeric"
                    containerStyle={styles.frequencyInput}
                    placeholder="7"
                  />
                  <Text style={styles.frequencyUnit}>дней</Text>
                </View>
              </View>
            )}
          </View>
        </View>
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
  backButton: {
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  frequencyContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  frequencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  frequencyInput: {
    width: 80,
    marginBottom: 0,
    marginRight: spacing.md,
  },
  frequencyUnit: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.primaryLighter,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: 50,
  },
});
