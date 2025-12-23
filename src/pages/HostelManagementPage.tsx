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
import { Plus, Bed, DoorOpen, Users, Pencil, Trash2 } from "lucide-react"
import type { Hostel } from "@/lib/types";

const FETCH_ALL_HOSTELS_API = 'http://localhost:3000/api/hostels/all';
const CREATE_HOSTEL_API = 'http://localhost:3000/api/hostels/create';

export default function HostelManagementPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [newHostel, setNewHostel] = useState({ name: "", location: "", description: "" });

    const handleAddHostel = async () => {
        if (!newHostel.name) return

        // Note: Location and Description are UI-only fields for now as per design prompt
        const createHostel = await axios.post(CREATE_HOSTEL_API, { name: newHostel.name });

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
        setNewHostel({ name: "", location: "", description: "" })
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
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="text-white">
                    <h1 className="text-3xl font-bold tracking-tight">Hostel Management</h1>
                    <p className="text-white/80 mt-1">Manage all registered hostels in the system</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: HOSTELS LIST */}
                    <Card className="lg:col-span-2 shadow-xl bg-white rounded-2xl border-none ring-1 ring-gray-100 overflow-hidden h-fit">
                        <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl font-bold text-gray-800">All Hostels</CardTitle>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{hostels.length} Hostels</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 bg-gray-50/50 min-h-[500px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hostels.map((hostel) => (
                                    <div key={hostel.id} className="group bg-[#FAFAFA] border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl shadow-inner">
                                                🏢
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm">
                                                    <Pencil size={14} />
                                                </button>
                                                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors shadow-sm">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors">{hostel.name}</h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                                                <Bed size={16} className="text-primary mr-3" />
                                                <span className="font-semibold mr-1">{hostel.totalCapacity}</span> Beds
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                                                <DoorOpen size={16} className="text-secondary mr-3" />
                                                <span className="font-semibold mr-1">{hostel.totalRooms}</span> Rooms
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                                                <Users size={16} className="text-green-500 mr-3" />
                                                <span className="font-semibold mr-1">{hostel.totalApprovedUsers}</span> Occupied
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>


                    {/* RIGHT COLUMN: STICKY FORM */}
                    <Card className="shadow-xl bg-white border-none ring-1 ring-gray-100 h-fit sticky top-24 rounded-2xl lg:w-[400px]">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Plus className="text-primary" size={24} />
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                    Add New Hostel
                                </CardTitle>
                            </div>
                            <p className="text-sm text-gray-500 pl-1">Create a new hostel building.</p>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6 pt-4">
                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Hostel Name</Label>
                                <Input
                                    className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                                    placeholder="e.g. Hostel C"
                                    value={newHostel.name}
                                    onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Location</Label>
                                <Input
                                    className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                                    placeholder="e.g. Main Campus, Building A"
                                    value={newHostel.location}
                                    onChange={(e) => setNewHostel({ ...newHostel, location: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Description</Label>
                                <textarea
                                    className="w-full min-h-[100px] rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-gray-50/50 p-3 text-sm outline-none transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Brief description of the hostel..."
                                    value={newHostel.description}
                                    onChange={(e) => setNewHostel({ ...newHostel, description: e.target.value })}
                                />
                            </div>

                            <Button
                                variant="contained"
                                onClick={handleAddHostel}
                                className="w-full bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3.5 shadow-lg rounded-xl uppercase tracking-wide text-sm transition-transform active:scale-95 mt-2"
                            >
                                Add Hostel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}