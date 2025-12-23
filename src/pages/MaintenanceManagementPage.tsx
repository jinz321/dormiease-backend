import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@mui/material"
import { Check, Wrench } from "lucide-react"

type Maintenance = {
  id: number
  studentName: string
  studentId: string
  title: string
  details: string
  reply: string
  status: "open" | "resolved"
}

// ==============================
// API ENDPOINTS (FIXED)
// ==============================
const FETCH_ALL_MAINTENANCES_API =
  "http://localhost:3000/api/maintenance/all"

const UPDATE_MAINTENANCES_API =
  "http://localhost:3000/api/admin/update-maintenance/"

const SUBMIT_MAINTENANCE_API =
  "http://localhost:3000/api/user/submit-maintenance"

// ==============================
// COMPONENT
// ==============================
export default function MaintenanceManagementPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [openCreateMaintenanceModal, setOpenCreateMaintenanceModal] =
    useState(false)
  const [maintenanceTitle, setMaintenanceTitle] = useState("")
  const [maintenanceDetails, setMaintenanceDetails] = useState("")
  const [studentId, setStudentId] = useState("")

  // ==============================
  // FETCH ALL MAINTENANCES
  // ==============================
  const fetchMaintenances = async () => {
    try {
      const res = await axios.get(FETCH_ALL_MAINTENANCES_API)
      setMaintenances(res.data)
    } catch (error) {
      console.error("Failed to fetch maintenances", error)
    }
  }

  useEffect(() => {
    fetchMaintenances()
  }, [])

  // ==============================
  // RESOLVE MAINTENANCE (ADMIN)
  // ==============================
  const handleResolve = async () => {
    if (!selectedMaintenance || !replyText.trim()) return

    try {
      const adminStr = localStorage.getItem("admin")
      if (!adminStr) {
        alert("Admin not logged in. Please log in again.")
        return
      }

      const admin = JSON.parse(adminStr)
      if (!admin.id) {
        alert("Admin ID not found. Please log in again.")
        console.error("Admin object:", admin)
        return
      }

      console.log("Resolving maintenance:", {
        maintenanceId: selectedMaintenance.id,
        adminId: admin.id,
        reply: replyText
      })

      await axios.put(
        `${UPDATE_MAINTENANCES_API}${selectedMaintenance.id}`,
        {
          adminId: admin.id,
          reply: replyText,
        }
      )

      setMaintenances((prev) =>
        prev.map((m) =>
          m.id === selectedMaintenance.id
            ? { ...m, reply: replyText, status: "resolved" }
            : m
        )
      )

      alert("Maintenance resolved successfully!")
      closeDialog()
    } catch (error: any) {
      console.error("Failed to resolve maintenance", error)
      console.error("Error response:", error.response?.data)
      const errorMsg = error.response?.data?.message || "Failed to resolve maintenance"
      alert(errorMsg)
    }
  }

  // ==============================
  // CREATE MAINTENANCE (STUDENT)
  // ==============================
  const createMaintenance = async () => {
    if (
      !studentId.trim() ||
      !maintenanceTitle.trim() ||
      !maintenanceDetails.trim()
    ) {
      alert("Please fill in all fields")
      return
    }

    try {
      await axios.post(SUBMIT_MAINTENANCE_API, {
        studentId: studentId,          // ✅ FIXED
        title: maintenanceTitle,
        details: maintenanceDetails,
      })

      await fetchMaintenances()
      handleCancelCreateMaintenance()
    } catch (error) {
      console.error("Failed to create maintenance", error)
      alert("Failed to submit maintenance")
    }
  }

  // ==============================
  // DIALOG HELPERS
  // ==============================
  const openDialog = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance)
    setReplyText(maintenance.reply || "")
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setSelectedMaintenance(null)
    setReplyText("")
    setIsDialogOpen(false)
  }

  const handleCancelCreateMaintenance = () => {
    setMaintenanceTitle("")
    setMaintenanceDetails("")
    setStudentId("")
    setOpenCreateMaintenanceModal(false)
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="min-h-screen pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
                <Wrench className="text-primary" /> Maintenance Requests
              </h2>
              <p className="text-gray-500 text-sm mt-1">Manage and track student maintenance reports</p>
            </div>
            <Button
              type="button"
              variant="contained"
              onClick={() => setOpenCreateMaintenanceModal(true)}
              className="bg-primary hover:bg-primary/90 shadow-lg rounded-xl px-6"
            >
              Submit New Maintenance
            </Button>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{m.studentName || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{m.studentId || "-"}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{m.title}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{m.details}</td>
                    <td className="px-6 py-4 text-center">
                      {m.status === "open" ? (
                        <button
                          onClick={() => openDialog(m)}
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 mx-auto"
                        >
                          <Wrench size={16} /> Reply
                        </button>
                      ) : (
                        <span className="flex items-center justify-center text-green-600 font-bold text-sm gap-1">
                          <Check size={16} /> Resolved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${m.status === "open"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                          }`}
                      >
                        {m.status === "open" ? (
                          <span className="flex items-center gap-1">⏱️ Open</span>
                        ) : (
                          <span className="flex items-center gap-1">✅ Done</span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= Reply Dialog ================= */}
      {isDialogOpen && selectedMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={closeDialog}
          />
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">
              Reply to Maintenance
            </h3>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button onClick={closeDialog}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleResolve}
                disabled={!replyText.trim()}
              >
                Resolve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Create Modal ================= */}
      {openCreateMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={handleCancelCreateMaintenance}
          />
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">
              Submit Maintenance
            </h3>

            <input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            />
            <input
              placeholder="Title"
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            />
            <textarea
              placeholder="Details"
              value={maintenanceDetails}
              onChange={(e) => setMaintenanceDetails(e.target.value)}
              rows={3}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button onClick={handleCancelCreateMaintenance}>
                Cancel
              </Button>
              <Button variant="contained" onClick={createMaintenance}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
