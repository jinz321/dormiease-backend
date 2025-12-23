import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';

interface OccupancyReport {
    total_rooms: number;
    occupied_rooms: number;
    vacant_rooms: number;
    total_capacity: number;
    current_occupancy: number;
    available_spaces: number;
    occupancy_rate: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
}

interface PaymentReport {
    total_payments: number;
    total_amount: number;
    paid: { count: number; amount: number; percentage: number };
    pending: { count: number; amount: number; percentage: number };
    overdue: { count: number; amount: number; percentage: number };
    collection_rate: number;
}

interface MaintenanceReport {
    total_requests: number;
    pending: { count: number; percentage: number };
    in_progress: { count: number; percentage: number };
    completed: { count: number; percentage: number };
    completion_rate: number;
}

interface ComplaintReport {
    total_complaints: number;
    pending: { count: number; percentage: number };
    in_progress: { count: number; percentage: number };
    resolved: { count: number; percentage: number };
    resolution_rate: number;
}

interface DashboardOverview {
    total_users: number;
    total_rooms: number;
    total_payments: number;
    total_maintenance: number;
    total_complaints: number;
    total_notifications: number;
}

export default function ReportsPage() {
    const [occupancyReport, setOccupancyReport] = useState<OccupancyReport | null>(null);
    const [paymentReport, setPaymentReport] = useState<PaymentReport | null>(null);
    const [maintenanceReport, setMaintenanceReport] = useState<MaintenanceReport | null>(null);
    const [complaintReport, setComplaintReport] = useState<ComplaintReport | null>(null);
    const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const [occupancy, payments, maintenance, complaints, dashboard] = await Promise.all([
                axios.get(`${API_BASE_URL}/report/occupancy`),
                axios.get(`${API_BASE_URL}/report/payments`),
                axios.get(`${API_BASE_URL}/report/maintenance`),
                axios.get(`${API_BASE_URL}/report/complaints`),
                axios.get(`${API_BASE_URL}/report/dashboard`)
            ]);

            setOccupancyReport(occupancy.data);
            setPaymentReport(payments.data);
            setMaintenanceReport(maintenance.data);
            setComplaintReport(complaints.data);
            setDashboardOverview(dashboard.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            alert('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-gray-500">System-wide statistics and reports</p>
                </div>
                <Button onClick={fetchAllReports} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Reports'}
                </Button>
            </div>

            {/* Dashboard Overview */}
            {dashboardOverview && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">System Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Users</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_users}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Rooms</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_rooms}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Payments</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_payments}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Maintenance</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_maintenance}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Complaints</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_complaints}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Notifications</CardDescription>
                                <CardTitle className="text-3xl">{dashboardOverview.total_notifications}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            )}

            {/* Occupancy Report */}
            {occupancyReport && (
                <Card>
                    <CardHeader>
                        <CardTitle>Occupancy Report</CardTitle>
                        <CardDescription>Room occupancy and availability statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Rooms</p>
                                <p className="text-2xl font-bold">{occupancyReport.total_rooms}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Occupied</p>
                                <p className="text-2xl font-bold text-green-600">{occupancyReport.occupied_rooms}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Vacant</p>
                                <p className="text-2xl font-bold">{occupancyReport.vacant_rooms}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600">Occupancy Rate</p>
                                <p className="text-2xl font-bold text-purple-600">{occupancyReport.occupancy_rate}%</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-600">Total Capacity</p>
                                <p className="text-xl font-semibold">{occupancyReport.total_capacity} students</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-600">Current Occupancy</p>
                                <p className="text-xl font-semibold">{occupancyReport.current_occupancy} students</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-gray-600">Available Spaces</p>
                                <p className="text-xl font-semibold">{occupancyReport.available_spaces} spaces</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Report */}
            {paymentReport && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Report</CardTitle>
                        <CardDescription>Fee collection and payment statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold">RM {paymentReport.total_amount.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Paid ({paymentReport.paid.count})</p>
                                <p className="text-2xl font-bold text-green-600">RM {paymentReport.paid.amount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{paymentReport.paid.percentage}%</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-600">Pending ({paymentReport.pending.count})</p>
                                <p className="text-2xl font-bold text-yellow-600">RM {paymentReport.pending.amount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{paymentReport.pending.percentage}%</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <p className="text-sm text-gray-600">Overdue ({paymentReport.overdue.count})</p>
                                <p className="text-2xl font-bold text-red-600">RM {paymentReport.overdue.amount.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{paymentReport.overdue.percentage}%</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">Collection Rate</p>
                            <p className="text-3xl font-bold text-purple-600">{paymentReport.collection_rate}%</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Maintenance Report */}
            {maintenanceReport && (
                <Card>
                    <CardHeader>
                        <CardTitle>Maintenance Report</CardTitle>
                        <CardDescription>Maintenance request statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Requests</p>
                                <p className="text-2xl font-bold">{maintenanceReport.total_requests}</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{maintenanceReport.pending.count}</p>
                                <p className="text-xs text-gray-500">{maintenanceReport.pending.percentage}%</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-orange-600">{maintenanceReport.in_progress.count}</p>
                                <p className="text-xs text-gray-500">{maintenanceReport.in_progress.percentage}%</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{maintenanceReport.completed.count}</p>
                                <p className="text-xs text-gray-500">{maintenanceReport.completed.percentage}%</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Completion Rate</p>
                            <p className="text-3xl font-bold text-green-600">{maintenanceReport.completion_rate}%</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Complaint Report */}
            {complaintReport && (
                <Card>
                    <CardHeader>
                        <CardTitle>Complaint Report</CardTitle>
                        <CardDescription>Complaint resolution statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Complaints</p>
                                <p className="text-2xl font-bold">{complaintReport.total_complaints}</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{complaintReport.pending.count}</p>
                                <p className="text-xs text-gray-500">{complaintReport.pending.percentage}%</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-orange-600">{complaintReport.in_progress.count}</p>
                                <p className="text-xs text-gray-500">{complaintReport.in_progress.percentage}%</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">{complaintReport.resolved.count}</p>
                                <p className="text-xs text-gray-500">{complaintReport.resolved.percentage}%</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Resolution Rate</p>
                            <p className="text-3xl font-bold text-green-600">{complaintReport.resolution_rate}%</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
