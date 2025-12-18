import { useEffect, useState } from "react"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

type Application = {
  id: number
  user: {
    name: string
    student_id: string
  }
  room: {
    name: string
    userRooms: { status: string }[]
    maxCount: number
  }
}

const FETCH_ALL_APPLICATIONS_API =
  "http://localhost:3000/api/room/all-applications"
const UPDATE_APPLICATIONS_API =
  "http://localhost:3000/api/admin/update-application/"

export default function RoomApplicationPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // ==============================
  // Fetch Applications
  // ==============================
  const fetchAllApplications = async () => {
    try {
      const res = await axios.get(FETCH_ALL_APPLICATIONS_API)
      setApplications(res.data)
    } catch (error) {
      console.error("Failed to fetch applications", error)
    }
  }

  useEffect(() => {
    fetchAllApplications()
  }, [refreshKey])

  // ==============================
  // Approve / Reject Action
  // ==============================
  const handleAction = async (
    id: number,
    action: "approve" | "reject"
  ) => {
    try {
      await axios.put(`${UPDATE_APPLICATIONS_API}${id}`, { action })

      // trigger re-fetch
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error(`Failed to ${action} application`, error)
      alert("Action failed. Please try again.")
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Room Applications
      </h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Approved Count</TableHead>
            <TableHead>Max Count</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applications.map((app) => {
            const approvedCount =
              app.room.userRooms.filter(
                (r) => r.status === "approved"
              ).length

            return (
              <TableRow key={app.id}>
                <TableCell>{app.user.name}</TableCell>
                <TableCell>{app.user.student_id}</TableCell>
                <TableCell>{app.room.name}</TableCell>
                <TableCell>{approvedCount}</TableCell>
                <TableCell>{app.room.maxCount}</TableCell>

                <TableCell className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={approvedCount >= app.room.maxCount}
                    onClick={() =>
                      handleAction(app.id, "approve")
                    }
                  >
                    Approve
                  </Button>

                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() =>
                      handleAction(app.id, "reject")
                    }
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
