import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, MenuItem, FormControl } from '@mui/material';
import axios from "axios";
import { useEffect, useState } from "react";
import type { Hostel } from "@/lib/types";

// Define Room type locally if not imported
type Room = {
    id: string;
    name: string;
    maxSize: number;
    currentUsers: number;
    hostelId: string;
}

type Application = {
    applicationId: string;
    userId: string;
    studentName: string;
    studentId: string;
    hostelId: string;
    hostelName: string;
    roomId: string | null;
    roomName: string | null;
    status: string;
    approvedCount: number;
    maxCount: number;
}

const FETCH_ALL_APPLICATIONS_API = `http://localhost:3000/api/hostels/all-applications`;
const FETCH_ALL_HOSTELS_API = `http://localhost:3000/api/hostels/all`;
const FETCH_ALL_ROOMS_API = `http://localhost:3000/api/room/all`;
const UPDATE_APPLICATION_API = `http://localhost:3000/api/admin/update-hostel-application`;
const CHANGE_ROOM_API = `http://localhost:3000/api/admin/change-room`;

export default function HostelApplicationPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    const fetchApplications = async () => {
        const applications = await axios.get(FETCH_ALL_APPLICATIONS_API);
        setApplications(applications.data);
    }

    const fetchHostels = async () => {
        const hostels = await axios.get(FETCH_ALL_HOSTELS_API);
        setHostels(hostels.data);
    }

    const fetchRooms = async () => {
        const res = await axios.get(FETCH_ALL_ROOMS_API);
        setRooms(res.data);
    }

    const getAvailableRooms = (hostelId: string) => {
        // Filter rooms that belong to the hostel and have space
        return rooms.filter(room => room.hostelId === hostelId && room.currentUsers < room.maxSize);
    }

    const handleRoomChange = async (applicationId: string, newRoomId: string) => {
        try {
            const payload = {
                applicationId,
                newRoomId
            };

            await axios.put(CHANGE_ROOM_API, payload);
            await fetchApplications();
            // await fetchHostels(); 
            // await fetchRooms(); // Refresh rooms if needed, though room logic is usually static unless updated
        } catch (error) {
            console.error("Error changing room:", error);
        }
    }

    const handleUpdateApplication = async (applicationId: string, status: string) => {
        try {
            const payload = {
                applicationId,
                status
            };

            await axios.put(UPDATE_APPLICATION_API, payload);
            await fetchApplications();
            await fetchHostels();
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchApplications(),
                    fetchHostels(),
                    fetchRooms()
                ]);
            } catch (error) {
                console.error(error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Hostel Applications</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Hostel</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                        <TableHead className="text-center">Change Room</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applications.map((app) => (
                        <TableRow key={app.applicationId}>
                            <TableCell>{app.studentName}</TableCell>
                            <TableCell>{app.studentId}</TableCell>
                            <TableCell>{app.hostelName}</TableCell>
                            <TableCell>{app.roomName}</TableCell>
                            <TableCell>{app.status}</TableCell>
                            <TableCell className="flex gap-2 justify-center">
                                <Button
                                    className="border-green-600 text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                                    disabled={app.status == "approved" || app.status == "rejected"}
                                    onClick={() => handleUpdateApplication(app.applicationId, "approved")}
                                >
                                    Approve
                                </Button>
                                <Button
                                    className="border-red-600 text-white bg-red-500 hover:bg-red-700 cursor-pointer"
                                    disabled={app.status == "approved" || app.status == "rejected"}
                                    onClick={() => handleUpdateApplication(app.applicationId, "rejected")}
                                >
                                    Reject
                                </Button>
                            </TableCell>
                            <TableCell>
                                {app.status === "approved" && (
                                    <FormControl size="small" fullWidth>
                                        <Select
                                            value={app.roomId || ""}
                                            onChange={(e) => handleRoomChange(app.applicationId, e.target.value as string)}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                Select Room
                                            </MenuItem>
                                            {getAvailableRooms(app.hostelId).map((room) => (
                                                <MenuItem key={room.id} value={room.id}>
                                                    {room.name} ({room.currentUsers}/{room.maxSize})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}