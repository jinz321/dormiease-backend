import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    Alert,
    ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Text, Chip, Button, Portal, Dialog, RadioButton } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { ModernCard } from '../components/ModernCard';
import { theme } from '../theme/theme';
import * as Animatable from 'react-native-animatable';

import { API_URL } from '../config';

const API_BASE = API_URL;

export default function PaymentPage({ navigation }: any) {
    const [user, setUser] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) {
            navigation.replace("Login");
            return;
        }
        setUser(JSON.parse(json));
    };

    const fetchPayments = async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/payment/user/${user.id}`);
            setPayments(res.data);

            const totalAmount = res.data.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
            const paidAmount = res.data.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
            const pendingAmount = res.data.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

            setStats({
                total: totalAmount,
                paid: paidAmount,
                pending: pendingAmount
            });
        } catch (error: any) {
            console.error("Failed to fetch payments:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchPayments();
            }
        }, [user])
    );

    const handlePayNow = (payment: any) => {
        setSelectedPayment(payment);
        setPaymentMethod('bank_transfer');
        setShowPaymentDialog(true);
    };

    const processPayment = async () => {
        if (!selectedPayment) return;

        setProcessing(true);
        try {
            const res = await axios.post(`${API_BASE}/payment/process/${selectedPayment.id}`, {
                payment_method: paymentMethod
            });

            Alert.alert(
                "Payment Successful! 🎉",
                `Transaction ID: ${res.data.transaction_id}\nAmount: RM ${selectedPayment.amount.toFixed(2)}\nMethod: ${paymentMethod.replace('_', ' ').toUpperCase()}`,
                [{
                    text: "OK", onPress: () => {
                        setShowPaymentDialog(false);
                        fetchPayments();
                    }
                }]
            );
        } catch (error: any) {
            console.error("Payment failed:", error.response?.data || error.message);
            Alert.alert("Payment Failed", error.response?.data?.message || "Failed to process payment");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return theme.colors.success;
            case 'pending':
                return theme.colors.warning;
            case 'overdue':
                return theme.colors.error;
            default:
                return theme.colors.text.secondary;
        }
    };

    const renderPayment = ({ item, index }: any) => {
        const statusColor = getStatusColor(item.status);
        const isPending = item.status === 'pending';

        return (
            <Animatable.View animation="fadeInUp" delay={index * 100}>
                <ModernCard style={styles.paymentCard} shadow="medium">
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
                            <Ionicons
                                name={isPending ? "time-outline" : "checkmark-circle"}
                                size={32}
                                color={statusColor}
                            />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.feeType}>
                                {item.fee_type?.replace('_', ' ').toUpperCase() || 'Fee'}
                            </Text>
                            <Text style={styles.dueDate}>
                                Due: {new Date(item.due_date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={styles.amount}>RM {item.amount?.toFixed(2)}</Text>
                            <Chip
                                mode="flat"
                                style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                                textStyle={{ color: statusColor, fontWeight: '600' }}
                            >
                                {item.status.toUpperCase()}
                            </Chip>
                        </View>
                    </View>

                    {item.paid_date && (
                        <Text style={styles.paidDate}>
                            ✓ Paid on {new Date(item.paid_date).toLocaleDateString()}
                        </Text>
                    )}

                    {item.transaction_id && (
                        <Text style={styles.transactionId}>
                            Transaction: {item.transaction_id}
                        </Text>
                    )}

                    {isPending && (
                        <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                            <Button
                                mode="contained"
                                onPress={() => handlePayNow(item)}
                                style={styles.payButton}
                                icon="credit-card"
                                buttonColor={theme.colors.accent}
                            >
                                Pay Now
                            </Button>
                        </Animatable.View>
                    )}
                </ModernCard>
            </Animatable.View>
        );
    };

    return (
        <GradientBackground colors={theme.gradients.primary}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchPayments} tintColor="#fff" />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animatable.View animation="fadeInDown" style={styles.header}>
                    <Text style={styles.headerTitle}>Fee Management</Text>
                    <Text style={styles.headerSubtitle}>Track and pay your fees</Text>
                </Animatable.View>

                {stats && (
                    <View style={styles.statsContainer}>
                        <Animatable.View animation="fadeInLeft" delay={200} style={{ flex: 1 }}>
                            <ModernCard style={styles.statCard} shadow="small">
                                <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
                                <Text style={styles.statLabel}>Total</Text>
                                <Text style={styles.statValue}>RM {stats.total?.toFixed(2)}</Text>
                            </ModernCard>
                        </Animatable.View>

                        <Animatable.View animation="fadeInUp" delay={300} style={{ flex: 1 }}>
                            <ModernCard style={styles.statCard} shadow="small">
                                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                                <Text style={styles.statLabel}>Paid</Text>
                                <Text style={[styles.statValue, { color: theme.colors.success }]}>
                                    RM {stats.paid?.toFixed(2)}
                                </Text>
                            </ModernCard>
                        </Animatable.View>

                        <Animatable.View animation="fadeInRight" delay={400} style={{ flex: 1 }}>
                            <ModernCard style={styles.statCard} shadow="small">
                                <Ionicons name="time-outline" size={24} color={theme.colors.warning} />
                                <Text style={styles.statLabel}>Pending</Text>
                                <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                                    RM {stats.pending?.toFixed(2)}
                                </Text>
                            </ModernCard>
                        </Animatable.View>
                    </View>
                )}

                <View style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>Payment History</Text>

                    {payments.length === 0 ? (
                        <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={theme.colors.text.white} opacity={0.5} />
                            <Text style={styles.emptyText}>No payment records found</Text>
                        </Animatable.View>
                    ) : (
                        <FlatList
                            data={payments}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPayment}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Portal>
                <Dialog visible={showPaymentDialog} onDismiss={() => !processing && setShowPaymentDialog(false)}>
                    <Dialog.Title>Select Payment Method</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 16, fontWeight: '600' }}>
                            Amount: RM {selectedPayment?.amount?.toFixed(2)}
                        </Text>
                        <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                            <RadioButton.Item label="🏦 Bank Transfer" value="bank_transfer" />
                            <RadioButton.Item label="💳 Credit/Debit Card" value="credit_card" />
                            <RadioButton.Item label="📱 E-Wallet" value="e_wallet" />
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowPaymentDialog(false)} disabled={processing}>Cancel</Button>
                        <Button onPress={processPayment} loading={processing} disabled={processing} mode="contained">
                            Confirm Payment
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
    statsContainer: {
        flexDirection: 'row',
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    statCard: {
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.sm,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginTop: 4,
    },
    listContainer: {
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.white,
        marginBottom: theme.spacing.md,
    },
    paymentCard: {
        marginBottom: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.medium,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    cardInfo: {
        flex: 1,
    },
    feeType: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    dueDate: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    statusChip: {
        height: 24,
    },
    paidDate: {
        fontSize: 14,
        color: theme.colors.success,
        marginTop: theme.spacing.sm,
    },
    transactionId: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    payButton: {
        marginTop: theme.spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
        fontSize: 18,
        color: theme.colors.text.white,
        marginTop: theme.spacing.lg,
        opacity: 0.8,
    },
});
