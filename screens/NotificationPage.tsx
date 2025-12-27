import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Text, Badge } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

import { API_URL } from '../config';

const API_BASE = API_URL;

export default function NotificationPage({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    const json = await AsyncStorage.getItem("user");
    if (!json) {
      navigation.replace("Login");
      return;
    }
    setUser(JSON.parse(json));
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/notification/user/${user.id}`);
      setNotifications(res.data);
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notif: any) => {
    if (notif.is_read) return;

    try {
      await axios.put(`${API_BASE}/notification/read/${notif.id}`);
      setNotifications((prev) =>
        prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchNotifications();
      }
    }, [user])
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'construct';
      case 'complaint':
        return 'alert-circle';
      case 'payment':
        return 'card';
      case 'announcement':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'maintenance':
        return theme.colors.warning;
      case 'complaint':
        return theme.colors.error;
      case 'payment':
        return theme.colors.success;
      case 'announcement':
        return theme.colors.primary;
      default:
        return theme.colors.secondary;
    }
  };

  const renderNotification = ({ item, index }: any) => {
    // Access nested notification data
    const notificationData = item.notification || {};
    const iconColor = getNotificationColor(notificationData.type || 'default');
    const isUnread = !item.is_read;

    return (
      <Animatable.View animation="fadeInRight" delay={index * 80}>
        <ModernCard
          style={styles.card}
          shadow="small"
          onPress={() => markAsRead(item)}
        >
          <View style={[styles.cardContent, isUnread && styles.unreadBorder]}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Ionicons
                name={getNotificationIcon(notificationData.type) as any}
                size={24}
                color={iconColor}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{notificationData.title || 'Notification'}</Text>
                {isUnread && (
                  <Badge size={8} style={{ backgroundColor: theme.colors.primary }} />
                )}
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {notificationData.message || 'No message'}
              </Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        </ModernCard>
      </Animatable.View>
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <GradientBackground colors={theme.gradients.primary}>
      <View style={styles.container}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>Stay updated with latest news</Text>
            </View>
            {unreadCount > 0 && (
              <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                <Badge size={32} style={styles.badge}>{unreadCount}</Badge>
              </Animatable.View>
            )}
          </View>
        </Animatable.View>

        {/* List */}
        {notifications.length === 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor="#fff" />
            }
            contentContainerStyle={styles.emptyContainer}
          >
            <Animatable.View animation="fadeIn" style={styles.emptyContent}>
              <Ionicons name="notifications-off-outline" size={80} color={theme.colors.text.white} opacity={0.5} />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </Animatable.View>
          </ScrollView>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor="#fff" />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.white,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.text.white,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.text.white,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
  },
  unreadBorder: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: theme.colors.text.light,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.white,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.text.white,
    opacity: 0.7,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
