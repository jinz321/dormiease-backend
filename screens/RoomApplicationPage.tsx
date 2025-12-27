import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import {
  Text,
  Button,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

interface Hostel {
  id: string;
  name: string;
  availableCapacity: number;
  totalCapacity: number;
  isFull: boolean;
  approvedUsers: string[];
  pendingUsers: string[];
  rejectedUsers: string[];
}

export default function HostelApplicationPage() {
  const navigation = useNavigation<any>();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [userApprovedHostel, setUserApprovedHostel] = useState<Hostel | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const loadHostels = async () => {
    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      const uid = user?.id || "";
      setUserId(uid);

      const res = await fetch(`${API_BASE_URL}/hostels/all`);
      const data = await res.json();

      const hostelsMapped: Hostel[] = data.map((h: any) => {
        const available = h.totalCapacity - h.totalApprovedUsers;

        return {
          id: h.id,
          name: h.name,
          availableCapacity: available,
          totalCapacity: h.totalCapacity,
          isFull: available <= 0,
          approvedUsers: h.approvedUsers ?? [],
          pendingUsers: h.pendingUsers ?? [],
          rejectedUsers: h.rejectedUsers ?? [],
        };
      });

      setHostels(hostelsMapped);

      const approved = hostelsMapped.find(h =>
        h.approvedUsers.includes(uid)
      );
      setUserApprovedHostel(approved || null);

    } catch (e) {
      Alert.alert("Error", "Failed to load hostels.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHostels();
    }, [])
  );

  const handleApply = async (hostelId: string) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      await axios.post(`${API_BASE_URL}/user/apply-hostel`, {
        userId: user.id,
        hostelId,
      });

      Alert.alert("Success", "Hostel applied successfully!");
      loadHostels();
    } catch (e) {
      Alert.alert("Error", "Failed to apply.");
    }
  };

  const getPercentage = (available: number, total: number) => {
    if (total === 0) return 0;
    const occupied = total - available;
    return occupied / total;
  };

  const renderHostel = ({ item, index }: any) => {
    const isApproved = item.approvedUsers.includes(userId);
    const isPending = item.pendingUsers.includes(userId);
    const isFull = item.isFull;
    const percentage = getPercentage(item.availableCapacity, item.totalCapacity);

    return (
      <Animatable.View animation="fadeInUp" delay={index * 100}>
        <ModernCard style={styles.card} shadow="medium">
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="bed-outline" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.hostelName}>{item.name}</Text>
              <Text style={styles.occupancy}>
                Occupancy: {item.totalCapacity - item.availableCapacity}/{item.totalCapacity}
              </Text>
            </View>
            {isApproved && (
              <Chip
                mode="flat"
                style={{ backgroundColor: theme.colors.success + '20' }}
                textStyle={{ color: theme.colors.success, fontWeight: '600' }}
                icon="check"
              >
                APPROVED
              </Chip>
            )}
            {isPending && (
              <Chip
                mode="flat"
                style={{ backgroundColor: theme.colors.warning + '20' }}
                textStyle={{ color: theme.colors.warning, fontWeight: '600' }}
                icon="clock-outline"
              >
                PENDING
              </Chip>
            )}
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={percentage}
              color={isFull ? theme.colors.error : theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.availableText}>
              {item.availableCapacity} beds available
            </Text>
          </View>

          <Button
            mode={isApproved || isPending || isFull ? "outlined" : "contained"}
            disabled={isApproved || isPending || isFull}
            onPress={() => handleApply(item.id)}
            style={styles.actionButton}
            buttonColor={isApproved || isPending || isFull ? undefined : theme.colors.accent}
          >
            {isApproved ? "Approved" : isPending ? "Application Pending" : isFull ? "Full" : "Apply Now"}
          </Button>
        </ModernCard>
      </Animatable.View>
    );
  };

  return (
    <GradientBackground colors={theme.gradients.primary}>
      <View style={styles.container}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <Text style={styles.headerTitle}>Available Hostels</Text>
          <Text style={styles.headerSubtitle}>Find your perfect accommodation</Text>
        </Animatable.View>

        {hostels.length === 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadHostels} tintColor="#fff" />
            }
            contentContainerStyle={styles.emptyContainer}
          >
            <Animatable.View animation="fadeIn" style={styles.emptyContent}>
              <Ionicons name="home-outline" size={80} color={theme.colors.text.white} opacity={0.5} />
              <Text style={styles.emptyText}>No hostels available</Text>
            </Animatable.View>
          </ScrollView>
        ) : (
          <FlatList
            data={hostels}
            keyExtractor={item => item.id.toString()}
            renderItem={renderHostel}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadHostels} tintColor="#fff" />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {userApprovedHostel && (
          <Animatable.View animation="bounceIn" style={styles.assignmentCard}>
            <ModernCard gradient={theme.gradients.success} shadow="large">
              <View style={styles.assignmentContent}>
                <Ionicons name="checkmark-circle" size={40} color="#fff" />
                <View style={styles.assignmentText}>
                  <Text style={styles.assignmentLabel}>CURRENT ASSIGNMENT</Text>
                  <Text style={styles.assignmentHostel}>{userApprovedHostel.name}</Text>
                  <Text style={styles.assignmentSubtext}>You have a confirmed bed</Text>
                </View>
              </View>
            </ModernCard>
          </Animatable.View>
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
    paddingBottom: 140,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  hostelName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  occupancy: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background,
  },
  availableText: {
    fontSize: 12,
    color: theme.colors.text.light,
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  actionButton: {
    borderRadius: theme.borderRadius.medium,
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
  assignmentCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  assignmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  assignmentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
    letterSpacing: 1,
  },
  assignmentHostel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  assignmentSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
});
