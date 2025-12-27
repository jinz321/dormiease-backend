// ComplaintListPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

interface Complaint {
  id: number;
  title: string;
  details: string;
  status: 'open' | 'resolved';
  created_at?: string;
}

export default function ComplaintListPage({ navigation }: any) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (!user) return;

      const res = await axios.get(`${API_BASE_URL}/complaint/${user.id}`);
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [])
  );

  const handleClickFAB = () => {
    navigation.navigate('AddNewComplaint');
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? theme.colors.success : theme.colors.error;
  };

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? 'checkmark-circle' : 'alert-circle';
  };

  const renderComplaint = ({ item, index }: any) => {
    const statusColor = getStatusColor(item.status);
    const isResolved = item.status === 'resolved';

    return (
      <Animatable.View animation="fadeInUp" delay={index * 100}>
        <ModernCard
          style={styles.card}
          shadow="medium"
          onPress={() => navigation.navigate('ComplaintDetails', { complaint: item })}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={getStatusIcon(item.status) as any} size={28} color={statusColor} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.details} numberOfLines={2}>{item.details}</Text>
              {item.created_at && (
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
            textStyle={{ color: statusColor, fontWeight: '600' }}
            icon={isResolved ? 'check' : 'alert'}
          >
            {isResolved ? 'RESOLVED' : 'OPEN'}
          </Chip>
        </ModernCard>
      </Animatable.View>
    );
  };

  return (
    <GradientBackground colors={theme.gradients.primary}>
      <View style={styles.container}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <Text style={styles.headerTitle}>My Complaints</Text>
          <Text style={styles.headerSubtitle}>Track your complaint status</Text>
        </Animatable.View>

        {complaints.length === 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchComplaints} tintColor="#fff" />
            }
            contentContainerStyle={styles.emptyContainer}
          >
            <Animatable.View animation="fadeIn" style={styles.emptyContent}>
              <Ionicons name="chatbox-ellipses-outline" size={80} color={theme.colors.text.white} opacity={0.5} />
              <Text style={styles.emptyText}>No complaints yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to file one</Text>
            </Animatable.View>
          </ScrollView>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComplaint}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchComplaints} tintColor="#fff" />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        <FloatingActionButton
          icon="add"
          onPress={handleClickFAB}
          gradient={theme.gradients.warm}
        />
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
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: theme.colors.text.light,
  },
  statusChip: {
    alignSelf: 'flex-start',
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
