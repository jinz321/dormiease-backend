import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  MD3Colors,
  Chip,
  Title,
  Paragraph,
  Avatar,
  Surface,
  useTheme
} from 'react-native-paper';

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
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [userApprovedHostel, setUserApprovedHostel] = useState<Hostel | null>(null);
  const [userId, setUserId] = useState<string>("");
  const theme = useTheme();

  // Fetch hostels on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadHostels = async () => {
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
        }
      };

      loadHostels();
    }, [])
  );

  // Apply for hostel
  const handleApply = async (hostelId: string) => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      await axios.post(`${API_BASE_URL}/user/apply-hostel`, {
        userId: user.id,
        hostelId,
      });

      setHostels(prev =>
        prev.map(h =>
          h.id === hostelId ? { ...h } : h
        )
      );

      Alert.alert("Success", "Hostel applied successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to apply.");
    }
  };

  const getPercentage = (available: number, total: number) => {
    if (total === 0) return 0;
    const occupied = total - available;
    return occupied / total;
  };

  return (
    <View style={styles.container}>
      <Title style={styles.headerTitle}>Available Hostels</Title>

      <FlatList
        data={hostels}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isApproved = item.approvedUsers.includes(userId);
          const isPending = item.pendingUsers.includes(userId);
          const isFull = item.isFull;
          const percentage = getPercentage(item.availableCapacity, item.totalCapacity);

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Title style={styles.hostelName}>{item.name}</Title>
                  {isApproved && <Chip icon="check" style={styles.approvedChip} textStyle={{ color: 'white' }}>Approved</Chip>}
                  {isPending && <Chip icon="clock" style={styles.pendingChip}>Pending</Chip>}
                </View>

                <View style={styles.capacityContainer}>
                  <Paragraph style={styles.capacityText}>
                    Occupancy: {item.totalCapacity - item.availableCapacity}/{item.totalCapacity}
                  </Paragraph>
                  <ProgressBar
                    progress={percentage}
                    color={isFull ? MD3Colors.error50 : '#FF6B35'}
                    style={styles.progressBar}
                  />
                  <Paragraph style={styles.availableText}>{item.availableCapacity} beds available</Paragraph>
                </View>
              </Card.Content>

              <Card.Actions>
                <Button
                  mode={isApproved || isPending || isFull ? "outlined" : "contained"}
                  disabled={isApproved || isPending || isFull}
                  onPress={() => handleApply(item.id)}
                  style={styles.actionButton}
                  buttonColor={isApproved || isPending || isFull ? undefined : '#FF6B35'}
                >
                  {isApproved ? "Approved" : isPending ? "Application Pending" : isFull ? "Full" : "Apply Now"}
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
      />

      {userApprovedHostel && (
        <Surface style={styles.assignmentSurface} elevation={4}>
          <Avatar.Icon size={50} icon="home-account" style={{ backgroundColor: '#FF6B35' }} />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text variant="labelMedium" style={{ color: '#666' }}>CURRENT ASSIGNMENT</Text>
            <Title style={{ color: '#FF6B35', fontWeight: 'bold' }}>{userApprovedHostel.name}</Title>
            <Paragraph style={{ fontSize: 12 }}>You have a confirmed bed in this hostel.</Paragraph>
          </View>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6f9"
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b'
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  hostelName: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  pendingChip: {
    backgroundColor: '#ffedd5',
  },
  approvedChip: {
    backgroundColor: '#22c55e', // Green
  },
  capacityContainer: {
    marginVertical: 8
  },
  capacityText: {
    marginBottom: 5,
    fontSize: 14,
    color: '#64748b'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0'
  },
  availableText: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'right'
  },
  actionButton: {
    flex: 1,
    borderRadius: 8
  },
  assignmentSurface: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  }
});
