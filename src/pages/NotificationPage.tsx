import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Bell,
    Plus,
    Clock,
    CheckCircle2,
    Sparkles,
    Send,
    Trash2
} from "lucide-react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

const FETCH_ALL_NOTIFICATIONS_API = "http://localhost:3000/api/notification/all";
const CREATE_NOTIFICATION_API = "http://localhost:3000/api/notification/create";

interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

export default function NotificationManagementPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newNotif, setNewNotif] = useState({ title: "", message: "" });
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(FETCH_ALL_NOTIFICATIONS_API);
            setNotifications(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setLoading(false);
        }
    };

    const handleAddNotification = async () => {
        if (!newNotif.title || !newNotif.message) return;

        try {
            await axios.post(CREATE_NOTIFICATION_API, {
                title: newNotif.title,
                message: newNotif.message,
            });
            setNewNotif({ title: "", message: "" });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="pt-24 pb-10 px-4 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 text-lg font-semibold">Loading notifications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Bell className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-white/80 text-sm">Manage and broadcast announcements</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Notifications List */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="bg-white rounded-2xl border-none shadow-xl">
                            <CardHeader className="border-b border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold text-gray-800">All Notifications</CardTitle>
                                            <p className="text-xs text-gray-500 mt-0.5">{notifications.length} total announcements</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                            <Bell size={40} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 font-medium">No notifications yet</p>
                                        <p className="text-gray-300 text-sm mt-1">Create your first announcement</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="group p-5 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50/50 hover:from-primary/5 hover:to-secondary/5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                                <Bell className="text-primary" size={18} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-primary transition-colors">
                                                                    {notif.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                    <Clock size={12} />
                                                                    <span>{formatTimeAgo(notif.created_at)}</span>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span>{new Date(notif.created_at).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Create Notification Form */}
                    <Card className="bg-white rounded-2xl border-none shadow-xl h-fit sticky top-24">
                        <CardHeader className="border-b border-gray-100 p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Plus className="text-primary" size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">New Notification</CardTitle>
                                    <p className="text-xs text-gray-500 mt-0.5">Broadcast to all users</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                                    Title
                                </Label>
                                <Input
                                    id="notifTitle"
                                    placeholder="e.g. System Maintenance"
                                    value={newNotif.title}
                                    onChange={(e) =>
                                        setNewNotif({ ...newNotif, title: e.target.value })
                                    }
                                    className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                                    Message
                                </Label>
                                <textarea
                                    id="notifMessage"
                                    placeholder="Enter your announcement message..."
                                    value={newNotif.message}
                                    onChange={(e) =>
                                        setNewNotif({ ...newNotif, message: e.target.value })
                                    }
                                    className="w-full min-h-[120px] rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50/50 p-3 text-sm outline-none transition-all placeholder:text-gray-400 resize-none"
                                />
                            </div>

                            <Button
                                variant="contained"
                                onClick={handleAddNotification}
                                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-3.5 shadow-lg rounded-xl uppercase tracking-wide text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Send size={16} />
                                Send Notification
                            </Button>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <CheckCircle2 className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        This notification will be sent to all registered users immediately.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}