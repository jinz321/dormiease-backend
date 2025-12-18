import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

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

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            console.log('Fetching notifications from:', FETCH_ALL_NOTIFICATIONS_API);
            const res = await axios.get(FETCH_ALL_NOTIFICATIONS_API);
            console.log('Notifications fetched:', res.data);
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Add notification
    const handleAddNotification = async () => {
        if (!newNotif.title || !newNotif.message) return;

        try {
            console.log('Creating notification at:', CREATE_NOTIFICATION_API);
            await axios.post(CREATE_NOTIFICATION_API, {
                title: newNotif.title,
                message: newNotif.message,
            });
            console.log('Notification created successfully');
            setNewNotif({ title: "", message: "" });
            fetchNotifications(); // refresh
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="py-10 px-4">
            <div className="w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Notification Table Section */}
                <Card className="md:col-span-2 shadow-lg bg-white border-gray-400">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Notification List
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {notifications.map((notif) => (
                                    <TableRow key={notif.id} className="text-left">
                                        <TableCell>{notif.title}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            {notif.message}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(notif.created_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Add Notification Form Section */}
                <Card className="shadow-lg h-fit bg-white border-gray-400">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Create Notification
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notifTitle">Title</Label>
                            <Input
                                id="notifTitle"
                                placeholder="Enter title"
                                value={newNotif.title}
                                onChange={(e) =>
                                    setNewNotif({ ...newNotif, title: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notifMessage">Message</Label>
                            <Input
                                id="notifMessage"
                                placeholder="Enter message"
                                value={newNotif.message}
                                onChange={(e) =>
                                    setNewNotif({ ...newNotif, message: e.target.value })
                                }
                            />
                        </div>

                        <Button
                            variant="contained"
                            onClick={handleAddNotification}
                            className="w-full"
                        >
                            Create Notification
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}