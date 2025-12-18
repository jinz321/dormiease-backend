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
    <div className="py-10 px-4">
      <div className="w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ================= ROOM TABLE ================= */}
        <Card className="md:col-span-2 shadow-lg bg-white border-gray-400">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Room List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Max Size</TableHead>
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Current Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.maxSize}</TableCell>
                    <TableCell>
                      {room.hostelId !== null
                        ? hostelMap[room.hostelId] ?? "—"
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {room.currentUsers}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ================= ADD ROOM FORM ================= */}
        <Card className="shadow-lg bg-white border-gray-400 h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Add New Room
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
              className="w-full"
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
