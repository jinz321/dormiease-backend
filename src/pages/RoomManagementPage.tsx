import { useEffect, useState } from "react"
import axios from "axios"
import Button from "@mui/material/Button"
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
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { Bed, Plus, Building2, Users } from "lucide-react"

import type { Hostel, Room } from "@/lib/types"

const FETCH_ALL_HOSTELS_API =
  "http://localhost:3000/api/hostels/all"
const FETCH_ALL_ROOMS_API =
  "http://localhost:3000/api/room/all"
const CREATE_ROOM_API =
  "http://localhost:3000/api/room/create"

type NewRoomState = {
  name: string
  maxSize: number | null
  hostelId: string | null
}

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [newRoom, setNewRoom] = useState<NewRoomState>({
    name: "",
    maxSize: null,
    hostelId: null,
  })

  // ==============================
  // Fetch rooms & hostels
  // ==============================
  useEffect(() => {
    const fetchAllRooms = async () => {
      const res = await axios.get(FETCH_ALL_ROOMS_API)
      setRooms(res.data)
    }

    const fetchAllHostels = async () => {
      const res = await axios.get(FETCH_ALL_HOSTELS_API)
      setHostels(res.data)
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchAllRooms(),
          fetchAllHostels(),
        ])
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  // ==============================
  // Add room (NO page refresh)
  // ==============================
  const handleAddRoom = async () => {
    if (
      !newRoom.name ||
      !newRoom.maxSize ||
      !newRoom.hostelId
    ) {
      alert("Please fill in all fields")
      return
    }

    try {
      const res = await axios.post(CREATE_ROOM_API, {
        name: newRoom.name,
        maxSize: newRoom.maxSize,
        hostelId: newRoom.hostelId,
      })

      const room: Room = {
        id: res.data.id,
        name: newRoom.name,
        maxSize: newRoom.maxSize,
        currentUsers: 0,
        hostelId: newRoom.hostelId,
      }

      setRooms((prev) => [...prev, room])
      setNewRoom({
        name: "",
        maxSize: null,
        hostelId: null,
      })
    } catch (error) {
      console.error(error)
      alert("Failed to create room")
    }
  }

  // ==============================
  // Hostel lookup map
  // ==============================
  const hostelMap: Record<string, string> = {}
  hostels.forEach((h) => {
    hostelMap[h.id] = h.name
  })

  return (
    <div className="pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= ROOM TABLE ================= */}
        <Card className="lg:col-span-2 shadow-xl bg-white rounded-2xl overflow-hidden border-none ring-1 ring-gray-100">
          <CardHeader className="bg-white border-b border-gray-100 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold text-gray-800">All Rooms</CardTitle>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{rooms.length} Rooms</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Room Name</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Max Size</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Hostel</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Occupancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id} className="hover:bg-gray-50/80 transition-all border-b border-gray-100 group">
                    <TableCell className="px-6 py-4">
                      <span className="font-bold text-gray-800 text-base">{room.name}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center text-gray-600 font-medium">
                        <Bed size={18} className="mr-2 text-gray-400 group-hover:text-primary transition-colors" />
                        {room.maxSize} Beds
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {room.hostelId !== null
                        ? <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                          <Building2 size={14} className="mr-2 text-gray-500" />
                          {hostelMap[room.hostelId] ?? "—"}
                        </span>
                        : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${room.currentUsers >= (room.maxSize || 0)
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-green-50 text-green-700 border-green-100'
                        }`}>
                        <Users size={14} className={`mr-2 ${room.currentUsers >= (room.maxSize || 0) ? 'text-red-500' : 'text-green-600'}`} />
                        {room.currentUsers} / {room.maxSize}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ================= ADD ROOM FORM ================= */}
        <Card className="shadow-xl bg-white border-none ring-1 ring-gray-100 h-fit sticky top-24 rounded-2xl">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="text-primary" size={24} />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Add New Room
              </CardTitle>
            </div>
            <p className="text-sm text-gray-500 pl-1">Create a new room in a hostel.</p>
          </CardHeader>

          {/* NO <form> tag → prevents refresh */}
          <CardContent className="space-y-4">

            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Room Name</Label>
              <Input
                className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                placeholder="e.g. Room C"
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom({
                    ...newRoom,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Max Size</Label>
              <Input
                className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                type="number"
                placeholder="e.g. 4"
                value={newRoom.maxSize ?? ""}
                onChange={(e) =>
                  setNewRoom({
                    ...newRoom,
                    maxSize: Number(e.target.value),
                  })
                }
              />
            </div>

            <FormControl fullWidth>
              <InputLabel id="hostel-select-label" className="text-sm font-semibold text-gray-600">
                Select Hostel
              </InputLabel>
              <Select
                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                labelId="hostel-select-label"
                value={
                  newRoom.hostelId ?? ""
                }
                label="Select Hostel"
                onChange={(
                  e: SelectChangeEvent
                ) =>
                  setNewRoom({
                    ...newRoom,
                    hostelId: e.target.value,
                  })
                }
              >
                {hostels.map((h) => (
                  <MenuItem
                    key={h.id}
                    value={h.id}
                  >
                    {h.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="contained"
              className="w-full bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3.5 shadow-lg rounded-xl uppercase tracking-wide text-sm transition-transform active:scale-95"
              onClick={handleAddRoom}
            >
              Add Room
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
