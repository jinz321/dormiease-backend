import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';
import apiClient from '../utils/apiClient';

export default function DashboardPage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [hostelInfo, setHostelInfo] = useState<any>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const json = await AsyncStorage.getItem('user');
            if (json) {
                const userData = JSON.parse(json);
                console.log('User data from AsyncStorage:', userData);
                console.log('User ID:', userData.id);
                setUser(userData);

                // Fetch payment info
                try {
                    console.log('Fetching payment for user:', userData.id);
                    const paymentResponse = await apiClient.get(`/payment/user/${userData.id}`);
                    // API returns an array, get the first/latest payment
                    if (paymentResponse.data && paymentResponse.data.length > 0) {
                        setPaymentInfo(paymentResponse.data[0]);
                    }
                } catch (error) {
                    console.log('No payment info found:', error);
                }

                // Fetch hostel application info
                try {
                    console.log('Fetching hostel application for user:', userData.id);
                    const hostelResponse = await apiClient.get(`/hostels/user-application/${userData.id}`);
                    console.log('Hostel response:', hostelResponse.data);
                    setHostelInfo(hostelResponse.data);
                } catch (error) {
                    console.log('No hostel application found:', error);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <GradientBackground colors={theme.gradients.primary}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground colors={theme.gradients.primary}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Welcome Header */}
                <Animatable.View animation="fadeInDown" style={styles.header}>
                    <Text style={styles.greeting}>Home</Text>
                </Animatable.View>

                <View style={styles.contentContainer}>
                    {/* Student Profile Card */}
                    <Animatable.View animation="fadeInUp" delay={100}>
                        <ModernCard style={styles.infoCard} shadow="medium">
                            <Text style={styles.cardTitle}>Student Profile</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name</Text>
                                <Text style={styles.infoValue}>{user?.name || '--'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Student ID</Text>
                                <Text style={styles.infoValue}>{user?.studentId || '--'}</Text>
                            </View>
                        </ModernCard>
                    </Animatable.View>

                    {/* Hostel Application Card */}
                    <Animatable.View animation="fadeInUp" delay={200}>
                        <ModernCard style={styles.infoCard} shadow="medium">
                            <Text style={styles.cardTitle}>Hostel Application</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Applied Hostel</Text>
                                <Text style={styles.infoValue}>{hostelInfo?.hostelName || '--'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Assigned Hostel</Text>
                                <Text style={styles.infoValue}>
                                    {hostelInfo?.status === 'approved' ? hostelInfo?.hostelName : '--'}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Room</Text>
                                <Text style={styles.infoValue}>{hostelInfo?.roomName || '--'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Move In</Text>
                                <Text style={styles.infoValue}>
                                    {hostelInfo?.moveInDate
                                        ? new Date(hostelInfo.moveInDate).toLocaleDateString()
                                        : '--'}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Move Out</Text>
                                <Text style={styles.infoValue}>
                                    {hostelInfo?.moveOutDate
                                        ? new Date(hostelInfo.moveOutDate).toLocaleDateString()
                                        : '--'}
                                </Text>
                            </View>
                        </ModernCard>
                    </Animatable.View>

                    {/* Room Payment Card */}
                    <Animatable.View animation="fadeInUp" delay={300}>
                        <ModernCard style={styles.infoCard} shadow="medium">
                            <Text style={styles.cardTitle}>Room Payment</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Amount</Text>
                                <Text style={styles.infoValue}>
                                    {paymentInfo?.amount
                                        ? `RM ${paymentInfo.amount.toFixed(2)}`
                                        : 'RM --'}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Status</Text>
                                <View style={[
                                    styles.statusBadge,
                                    paymentInfo?.status === 'paid'
                                        ? styles.statusPaid
                                        : paymentInfo?.status === 'pending'
                                            ? styles.statusPending
                                            : styles.statusDefault
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        paymentInfo?.status === 'paid'
                                            ? styles.statusTextPaid
                                            : paymentInfo?.status === 'pending'
                                                ? styles.statusTextPending
                                                : styles.statusTextDefault
                                    ]}>
                                        {paymentInfo?.status
                                            ? paymentInfo.status.charAt(0).toUpperCase() + paymentInfo.status.slice(1)
                                            : 'Not assigned'}
                                    </Text>
                                </View>
                            </View>
                        </ModernCard>
                    </Animatable.View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: theme.spacing.xl,
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.md,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text.white,
    },
    contentContainer: {
        padding: theme.spacing.lg,
        paddingTop: 0,
    },
    infoCard: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.lg,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    infoLabel: {
        fontSize: 15,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 15,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.background,
        marginVertical: theme.spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.small,
    },
    statusDefault: {
        backgroundColor: theme.colors.background,
    },
    statusPaid: {
        backgroundColor: theme.colors.success + '20',
    },
    statusPending: {
        backgroundColor: theme.colors.warning + '20',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusTextDefault: {
        color: theme.colors.text.secondary,
    },
    statusTextPaid: {
        color: theme.colors.success,
    },
    statusTextPending: {
        color: theme.colors.warning,
    },
});
