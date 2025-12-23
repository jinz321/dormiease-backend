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
import { Bed, Plus, Hash, Building2, Users } from "lucide-react"

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
        <Card className="lg:col-span-2 shadow-xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-gray-100/50 p-6">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
              <Bed className="text-primary" /> Room Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-100">
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Room Name</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Max Size</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Hostel</TableHead>
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Occupancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id} className="hover:bg-white/40 transition-colors border-b border-gray-50">
                    <TableCell className="px-6 py-4 font-medium text-gray-900">{room.name}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      <span className="flex items-center gap-1"><Hash size={14} /> {room.maxSize} Beds</span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      {room.hostelId !== null
                        ? <span className="flex items-center gap-1"><Building2 size={14} /> {hostelMap[room.hostelId] ?? "—"}</span>
                        : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.currentUsers >= (room.maxSize || 0)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                        }`}>
                        <Users size={12} className="mr-1" />
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
        <Card className="shadow-2xl bg-white/90 backdrop-blur-xl border border-white/20 h-fit rounded-2xl">
          <CardHeader className="bg-primary/5 border-b border-gray-100 p-6">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="text-primary" /> Add New Room
            </CardTitle>
          </CardHeader>

          {/* NO <form> tag → prevents refresh */}
          <CardContent className="space-y-4">

            <div>
              <Label>Room Name</Label>
              <Input
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
              <Label>Max Size</Label>
              <Input
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
              <InputLabel id="hostel-select-label">
                Select Hostel
              </InputLabel>
              <Select
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
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 shadow-lg rounded-xl"
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
