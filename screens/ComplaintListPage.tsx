// ComplaintListPage.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import { FAB, Card, Text, Chip, Avatar, useTheme, Title } from 'react-native-paper';

import { API_URL } from '../config';

const API_BASE_URL = API_URL;

interface Complaint {
  id: number;
  title: string;
  details: string;
  status: 'open' | 'resolved';
}

export default function ComplaintListPage({ navigation }: any) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchComplaints = async () => {
        try {
          const userJson = await AsyncStorage.getItem('user');
          const user = userJson ? JSON.parse(userJson) : null;

          if (!user) return;

          const res = await axios.get(
            `${API_BASE_URL}/complaint/${user.id}`
          );

          setComplaints(res.data);
        } catch (err) {
          console.error('Failed to fetch complaints', err);
        }
      };

      fetchComplaints();
    }, [])
  );

  const handleClickFAB = () => {
    navigation.navigate('AddNewComplaint');
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? '#22c55e' : '#f59e0b';
  };

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? 'check-circle' : 'clock';
  };

  return (
    <View style={styles.container}>
      <Title style={styles.headerTitle}>My Complaints</Title>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Card
            style={[styles.card, item.status === 'resolved' && styles.resolvedCard]}
            onPress={() =>
              navigation.navigate('ComplaintDetails', { complaint: item })
            }
          >
            <Card.Title
              title={item.title}
              titleStyle={styles.cardTitle}
              left={(props) => <Avatar.Icon {...props} icon="alert-circle-outline" style={{ backgroundColor: theme.colors.primary }} />}
              right={(props) => (
                <Chip
                  icon={getStatusIcon(item.status)}
                  style={{ backgroundColor: getStatusColor(item.status), marginRight: 16 }}
                  textStyle={{ color: 'white' }}
                >
                  {item.status.toUpperCase()}
                </Chip>
              )}
            />
            <Card.Content>
              <Text numberOfLines={2} variant="bodyMedium" style={{ color: '#64748b' }}>
                {item.details}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleClickFAB}
        label="New Complaint"
      />
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b'
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  resolvedCard: {
    opacity: 0.8,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B35'
  },
});
