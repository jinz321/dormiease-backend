import React, { useEffect, useState, useCallback } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { useFocusEffect } from "@react-navigation/native"
import { Title, Text, Surface, Badge, useTheme } from "react-native-paper"

import { API_URL } from '../config';

const API_BASE = API_URL;

export default function NotificationPage({ navigation }: any) {
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const theme = useTheme();

  // ------------------------------
  // Load current user
  // ------------------------------
  const loadUser = async () => {
    const json = await AsyncStorage.getItem("user")
    if (!json) {
      navigation.replace("Login")
      return
    }
    setUser(JSON.parse(json))
  }

  // ------------------------------
  // Fetch notifications
  // ------------------------------
  const fetchNotifications = async () => {
    if (!user?.id) return
    setLoading(true)

    try {
      const res = await axios.get(
        `${API_BASE}/notification/user/${user.id}`
      )
      setNotifications(res.data)
    } catch (error: any) {
      console.error(
        "Failed to fetch notifications:",
        error.response?.data || error.message
      )
      // Don't show alert for empty notifications
      if (error.response?.status !== 404) {
        Alert.alert("Error", "Failed to fetch notifications")
      }
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------
  // Mark notification as read
  // ------------------------------
  const markAsRead = async (notif: any) => {
    if (notif.is_read) return

    try {
      await axios.put(
        `${API_BASE}/notification/read/${notif.id}`
      )

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: true } : n
        )
      )
    } catch (error) {
      console.error("Failed to mark notification as read", error)
    }
  }

  // ------------------------------
  // Effects
  // ------------------------------
  useEffect(() => {
    loadUser()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchNotifications()
      }
    }, [user])
  )

  // ------------------------------
  // Render notification
  // ------------------------------
  const renderItem = ({ item }: any) => {
    const isUnread = !item.is_read

    return (
      <TouchableOpacity onPress={() => markAsRead(item)} activeOpacity={0.8}>
        <Surface style={[styles.card, isUnread && styles.unreadCard]} elevation={isUnread ? 2 : 0}>
          <View style={styles.row}>
            <Title style={[styles.title, isUnread && styles.unreadTitle]}>
              {item.notification?.title || 'Notification'}
            </Title>
            {isUnread && <Badge size={10} style={{ backgroundColor: theme.colors.primary }} />}
          </View>
          <Text variant="bodyMedium" style={{ color: '#4b5563' }}>
            {item.notification?.message || 'No message'}
          </Text>
          <Text variant="labelSmall" style={{ color: '#94a3b8', marginTop: 8 }}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </Surface>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Notifications</Title>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchNotifications}
          />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30, color: '#94a3b8' }}>
            No notifications yet.
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  header: {
    margin: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  unreadCard: {
    backgroundColor: "#eff6ff", // Light blue bg
    borderColor: '#bfdbfe',
    borderWidth: 1
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
    color: '#334155'
  },
  unreadTitle: {
    fontWeight: "bold",
    color: '#1e293b'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
})
