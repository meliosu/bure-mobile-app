import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, ChevronRight, User as UserIcon, Send } from 'lucide-react-native';
import { User } from '../../src/types';
import { getUser } from '../../src/services';
import { Loading } from '../../src/components';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const navigateToSettings = () => {
    router.push('/settings');
  };

  if (loading) {
    return <Loading message="Загрузка профиля..." />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профиль</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <UserIcon size={40} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.username}</Text>
            {user.telegramHandle && (
              <View style={styles.telegramContainer}>
                <Send size={14} color={colors.textTertiary} />
                <Text style={styles.telegramHandle}>{user.telegramHandle}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.primaryLighter }]}>
                <Settings size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Уведомления</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.appName}>BuRe</Text>
            <Text style={styles.appVersion}>Версия 1.0.0</Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  telegramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  telegramHandle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  aboutCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  appName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: 50,
  },
});
