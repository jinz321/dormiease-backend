import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/config/api';

interface Payment {
    id: string;
    user_id: string;
    user_name: string;
    amount: number;
    fee_type: string;
    status: string;
    due_date: string;
    paid_date: string | null;
    payment_method: string | null;
}

interface PaymentStats {
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
    paid_count: number;
    pending_count: number;
    overdue_count: number;
}

export default function FeeManagementPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        fee_type: 'monthly',
        due_date: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchStats();
        fetchUsers();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/payment/all`);
            setPayments(response.data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/payment/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/all-users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleCreatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/payment/create`, formData);
            alert('Payment record created successfully!');
            setIsCreateDialogOpen(false);
            setFormData({ user_id: '', amount: '', fee_type: 'monthly', due_date: '' });
            fetchPayments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create payment');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (paymentId: string) => {
        if (!confirm('Mark this payment as paid?')) return;

        try {
            await axios.put(`${API_BASE_URL}/payment/update/${paymentId}`, {
                status: 'paid',
                paid_date: new Date().toISOString(),
                payment_method: 'manual'
            });
            alert('Payment marked as paid!');
            fetchPayments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update payment');
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!confirm('Are you sure you want to delete this payment record?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/payment/${paymentId}`);
            alert('Payment deleted successfully!');
            fetchPayments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete payment');
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Fee Management</h1>
                    <p className="text-gray-500">Manage student payments and fees</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Payment Record</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Payment</DialogTitle>
                            <DialogDescription>Add a new fee record for a student</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div>
                                <Label htmlFor="user">Student</Label>
                                <Select
                                    value={formData.user_id}
                                    onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="amount">Amount (RM)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="fee_type">Fee Type</Label>
                                <Select
                                    value={formData.fee_type}
                                    onValueChange={(value) => setFormData({ ...formData, fee_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="semester">Semester</SelectItem>
                                        <SelectItem value="annual">Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Creating...' : 'Create Payment'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Amount</CardDescription>
                            <CardTitle className="text-2xl">RM {stats.total_amount.toFixed(2)}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Paid ({stats.paid_count})</CardDescription>
                            <CardTitle className="text-2xl text-green-600">
                                RM {stats.paid_amount.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Pending ({stats.pending_count})</CardDescription>
                            <CardTitle className="text-2xl text-yellow-600">
                                RM {stats.pending_amount.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overdue ({stats.overdue_count})</CardDescription>
                            <CardTitle className="text-2xl text-red-600">
                                RM {stats.overdue_amount.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Records</CardTitle>
                    <CardDescription>All student payment records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Student</th>
                                    <th className="text-left p-2">Amount</th>
                                    <th className="text-left p-2">Type</th>
                                    <th className="text-left p-2">Due Date</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{payment.user_name}</td>
                                        <td className="p-2 font-semibold">RM {payment.amount.toFixed(2)}</td>
                                        <td className="p-2 capitalize">{payment.fee_type.replace('_', ' ')}</td>
                                        <td className="p-2">{new Date(payment.due_date).toLocaleDateString()}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-2 space-x-2">
                                            {payment.status !== 'paid' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMarkAsPaid(payment.id)}
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeletePayment(payment.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
