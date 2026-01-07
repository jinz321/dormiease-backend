import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DollarSign, Plus, TrendingUp, Clock, AlertCircle, CheckCircle2, Wallet, Calendar, Receipt } from 'lucide-react';
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

    return (
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
                        <p className="text-gray-500 mt-1">Manage student payments and fees</p>
                    </div>

                    <Button
                        variant="contained"
                        className="bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3 px-6 shadow-lg rounded-xl uppercase tracking-wide text-sm transition-transform active:scale-95"
                        onClick={() => setIsCreateDialogOpen(true)}
                        startIcon={<Plus size={20} />}
                    >
                        Create Payment
                    </Button>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Total Amount */}
                        <Card className="shadow-xl bg-white rounded-2xl overflow-hidden border-none ring-1 ring-gray-100 hover:shadow-2xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Amount</p>
                                        <h3 className="text-3xl font-bold text-gray-800">RM {stats.total_amount.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Wallet className="text-blue-500" size={28} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Paid */}
                        <Card className="shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl overflow-hidden border-none hover:shadow-2xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-green-100 uppercase tracking-wide mb-1">Paid ({stats.paid_count})</p>
                                        <h3 className="text-3xl font-bold text-white">RM {stats.paid_amount.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                        <CheckCircle2 className="text-white" size={28} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending */}
                        <Card className="shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl overflow-hidden border-none hover:shadow-2xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-yellow-100 uppercase tracking-wide mb-1">Pending ({stats.pending_count})</p>
                                        <h3 className="text-3xl font-bold text-white">RM {stats.pending_amount.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Clock className="text-white" size={28} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Overdue */}
                        <Card className="shadow-xl bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl overflow-hidden border-none hover:shadow-2xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-red-100 uppercase tracking-wide mb-1">Overdue ({stats.overdue_count})</p>
                                        <h3 className="text-3xl font-bold text-white">RM {stats.overdue_amount.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                        <AlertCircle className="text-white" size={28} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Payments Table */}
                <Card className="shadow-xl bg-white rounded-2xl overflow-hidden border-none ring-1 ring-gray-100">
                    <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-xl font-bold text-gray-800">Payment Records</CardTitle>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{payments.length} Records</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Student</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Due Date</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.id} className="hover:bg-gray-50/80 transition-all border-b border-gray-100 group">
                                        <TableCell className="px-6 py-4">
                                            <span className="font-bold text-gray-800 text-base">{payment.user_name}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center text-gray-800 font-bold">
                                                <DollarSign size={16} className="mr-1 text-gray-400" />
                                                RM {payment.amount.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium capitalize">
                                                <Calendar size={14} className="mr-2 text-gray-500" />
                                                {payment.fee_type.replace('_', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 font-medium">
                                            {new Date(payment.due_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${payment.status === 'paid'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : payment.status === 'pending'
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {payment.status === 'paid' && <CheckCircle2 size={14} className="mr-2" />}
                                                {payment.status === 'pending' && <Clock size={14} className="mr-2" />}
                                                {payment.status === 'overdue' && <AlertCircle size={14} className="mr-2" />}
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {payment.status === 'paid' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold"
                                                        onClick={() => window.open(`${API_BASE_URL}/receipts/${payment.id}/html`, '_blank')}
                                                        startIcon={<Receipt size={16} />}
                                                    >
                                                        Receipt
                                                    </Button>
                                                )}
                                                {payment.status !== 'paid' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        className="text-green-600 border-green-200 hover:bg-green-50 font-semibold"
                                                        onClick={() => handleMarkAsPaid(payment.id)}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    className="text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                                                    onClick={() => handleDeletePayment(payment.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create Payment Dialog */}
                {isCreateDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateDialogOpen(false)}>
                        <Card className="w-full max-w-md shadow-2xl bg-white rounded-2xl" onClick={(e) => e.stopPropagation()}>
                            <CardHeader className="p-6 pb-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Plus className="text-blue-500" size={24} />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-gray-800">Create New Payment</CardTitle>
                                </div>
                                <p className="text-sm text-gray-500 pl-1">Add a new fee record for a student</p>
                            </CardHeader>

                            <CardContent className="p-6">
                                <form onSubmit={handleCreatePayment} className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Student</Label>
                                        <FormControl fullWidth>
                                            <Select
                                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                                value={formData.user_id}
                                                onChange={(e: SelectChangeEvent) => setFormData({ ...formData, user_id: e.target.value })}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Select student</MenuItem>
                                                {users.map((user) => (
                                                    <MenuItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Amount (RM)</Label>
                                        <Input
                                            className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g. 200.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Fee Type</Label>
                                        <FormControl fullWidth>
                                            <Select
                                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                                value={formData.fee_type}
                                                onChange={(e: SelectChangeEvent) => setFormData({ ...formData, fee_type: e.target.value })}
                                            >
                                                <MenuItem value="monthly">Monthly</MenuItem>
                                                <MenuItem value="semester">Semester</MenuItem>
                                                <MenuItem value="annual">Annual</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div>
                                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Due Date</Label>
                                        <Input
                                            className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            className="flex-1 h-11 rounded-xl font-bold"
                                            onClick={() => setIsCreateDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="flex-1 bg-[#2196F3] hover:bg-blue-600 h-11 rounded-xl font-bold shadow-lg"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Payment'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
