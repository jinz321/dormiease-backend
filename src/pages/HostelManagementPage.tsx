import { useEffect, useState } from "react"
import axios from 'axios';
import Button from '@mui/material/Button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"
import type { Hostel } from "@/lib/types";

const FETCH_ALL_HOSTELS_API = 'http://localhost:3000/api/hostels/all';
const CREATE_HOSTEL_API = 'http://localhost:3000/api/hostels/create';

export default function HostelManagementPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [newHostel, setNewHostel] = useState({ name: "", maxSize: "" });

    const handleAddHostel = async () => {
        if (!newHostel.name) return

        const createHostel = await axios.post(CREATE_HOSTEL_API, { name: newHostel.name, maxSize: newHostel.maxSize });

        const hostel: Hostel = {
            id: createHostel.data['id'],
            name: newHostel.name,
            // Initialize missing properties
            totalRooms: 0,
            totalCapacity: 0,
            totalApprovedUsers: 0,
            isFull: false,
            approvedUsers: [],
            pendingUsers: [],
            rejectedUsers: [],
            rooms: []
        }

        setHostels([...hostels, hostel])
        setNewHostel({ name: "", maxSize: "" })
    }

    useEffect(() => {
        const fetchAllHostels = async () => {
            const hostels = await axios.get(FETCH_ALL_HOSTELS_API);
            setHostels(hostels.data);
        };

        fetchAllHostels();
    }, []);

    return (
        <div className="py-10 px-4">
            <div className="w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Table Section */}
                <Card className="md:col-span-2 shadow-lg bg-white border-gray-400">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Hostel List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hostels.map((hostel) => (
                                    <TableRow key={hostel.id} className="text-left">
                                        <TableCell>{hostel.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Form Section */}
                <Card className="shadow-lg h-fit bg-white border-gray-400">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Add New Hostel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hostelName">Hostel Name</Label>
                            <Input
                                id="hostelName"
                                placeholder="e.g. Hostel C"
                                value={newHostel.name}
                                onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                            />
                        </div>

                        <Button variant="contained" onClick={handleAddHostel} className="w-full">
                            Add Hostel
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}