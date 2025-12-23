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
import { Title, Text, Surface, Card, useTheme, Chip, Divider, Button, Portal, Dialog, RadioButton } from "react-native-paper";

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
    const theme = useTheme();

    // Load current user
    const loadUser = async () => {
        const json = await AsyncStorage.getItem("user");
        if (!json) {
            navigation.replace("Login");
            return;
        }
        setUser(JSON.parse(json));
    };

    // Fetch user payments
    const fetchPayments = async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const res = await axios.get(`${API_BASE}/payment/user/${user.id}`);
            setPayments(res.data);

            // Calculate stats
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
            if (error.response?.status !== 404) {
                Alert.alert("Error", "Failed to fetch payments");
            }
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
                "Payment Successful!",
                `Transaction ID: ${res.data.transaction_id}\nAmount: RM ${selectedPayment.amount.toFixed(2)}\nMethod: ${paymentMethod.replace('_', ' ').toUpperCase()}`,
                [{
                    text: "OK", onPress: () => {
                        setShowPaymentDialog(false);
                        fetchPayments(); // Refresh payments
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
                return '#22c55e';
            case 'pending':
                return '#f59e0b';
            case 'overdue':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Paid ✓';
            case 'pending':
                return 'Pending';
            case 'overdue':
                return 'Overdue';
            default:
                return status;
        }
    };

    const renderPayment = ({ item }: any) => {
        const statusColor = getStatusColor(item.status);
        const isPending = item.status === 'pending';

        return (
            <Card style={styles.card} mode="elevated">
                <Card.Content>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={styles.feeType}>
                                {item.fee_type?.replace('_', ' ').toUpperCase() || 'Fee'}
                            </Text>
                            <Text variant="bodySmall" style={styles.date}>
                                Due: {new Date(item.due_date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="titleLarge" style={styles.amount}>
                                RM {item.amount?.toFixed(2) || '0.00'}
                            </Text>
                            <Chip
                                mode="flat"
                                style={{ backgroundColor: statusColor + '20', marginTop: 4 }}
                                textStyle={{ color: statusColor, fontWeight: 'bold', fontSize: 12 }}
                            >
                                {getStatusLabel(item.status)}
                            </Chip>
                        </View>
                    </View>

                    {item.paid_date && (
                        <Text variant="bodySmall" style={styles.paidDate}>
                            Paid on: {new Date(item.paid_date).toLocaleDateString()}
                        </Text>
                    )}

                    {item.payment_method && (
                        <Text variant="bodySmall" style={styles.method}>
                            Method: {item.payment_method.replace('_', ' ').toUpperCase()}
                        </Text>
                    )}

                    {item.transaction_id && (
                        <Text variant="bodySmall" style={styles.method}>
                            Transaction: {item.transaction_id}
                        </Text>
                    )}

                    {isPending && (
                        <Button
                            mode="contained"
                            onPress={() => handlePayNow(item)}
                            style={{ marginTop: 12, backgroundColor: '#FF6B35' }}
                            icon="credit-card"
                        >
                            Pay Now
                        </Button>
                    )}
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchPayments} />
                }
            >
                {/* Header */}
                <Surface style={styles.header} elevation={2}>
                    <Title style={styles.headerTitle}>Fee Management</Title>

                    {stats && (
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Text variant="labelSmall" style={styles.statLabel}>Total Fees</Text>
                                <Text variant="headlineSmall" style={styles.statValue}>
                                    RM {stats.total?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text variant="labelSmall" style={styles.statLabel}>Paid</Text>
                                <Text variant="headlineSmall" style={[styles.statValue, { color: '#22c55e' }]}>
                                    RM {stats.paid?.toFixed(2) || '0.00'}
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text variant="labelSmall" style={styles.statLabel}>Pending</Text>
                                <Text variant="headlineSmall" style={[styles.statValue, { color: '#f59e0b' }]}>
                                    RM {stats.pending?.toFixed(2) || '0.00'}
                                </Text>
                            </View>
                        </View>
                    )}
                </Surface>

                {/* Payment List */}
                <View style={{ padding: 16 }}>
                    <Title style={styles.sectionTitle}>Payment History</Title>

                    {payments.length === 0 ? (
                        <Text style={styles.emptyText}>No payment records found.</Text>
                    ) : (
                        <FlatList
                            data={payments}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPayment}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Payment Dialog */}
            <Portal>
                <Dialog visible={showPaymentDialog} onDismiss={() => !processing && setShowPaymentDialog(false)}>
                    <Dialog.Title>Select Payment Method</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                            Amount: RM {selectedPayment?.amount?.toFixed(2)}
                        </Text>
                        <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                            <RadioButton.Item label="Bank Transfer" value="bank_transfer" />
                            <RadioButton.Item label="Credit/Debit Card" value="credit_card" />
                            <RadioButton.Item label="E-Wallet" value="e_wallet" />
                        </RadioButton.Group>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowPaymentDialog(false)} disabled={processing}>Cancel</Button>
                        <Button onPress={processPayment} loading={processing} disabled={processing}>
                            Confirm Payment
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f9",
    },
    header: {
        padding: 20,
        backgroundColor: "white",
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    statLabel: {
        color: '#64748b',
        marginBottom: 4,
    },
    statValue: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 12,
    },
    card: {
        marginBottom: 12,
        backgroundColor: "white",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    feeType: {
        fontWeight: 'bold',
        color: '#1e293b',
        textTransform: 'capitalize',
    },
    amount: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    date: {
        color: '#64748b',
        marginTop: 4,
    },
    paidDate: {
        color: '#22c55e',
        marginTop: 8,
    },
    method: {
        color: '#64748b',
        marginTop: 4,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 30,
        color: '#94a3b8',
    },
});
