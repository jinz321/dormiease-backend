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
import { Building2, Plus, Home } from "lucide-react"
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
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table Section */}
                <Card className="lg:col-span-2 shadow-xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-gray-100/50 p-6">
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
                            <Building2 className="text-primary" /> Hostel List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                                    <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Hostel Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hostels.map((hostel) => (
                                    <TableRow key={hostel.id} className="hover:bg-white/40 transition-colors border-b border-gray-50">
                                        <TableCell className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Home size={16} />
                                            </div>
                                            {hostel.name}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Form Section */}
                <Card className="shadow-2xl bg-white/90 backdrop-blur-xl border border-white/20 h-fit rounded-2xl">
                    <CardHeader className="bg-primary/5 border-b border-gray-100 p-6">
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Plus className="text-primary" /> Add New Hostel
                        </CardTitle>
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

                        <Button
                            variant="contained"
                            onClick={handleAddHostel}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 shadow-lg rounded-xl"
                        >
                            Add Hostel
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}