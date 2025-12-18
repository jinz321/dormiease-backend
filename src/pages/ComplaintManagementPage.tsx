import { useEffect, useState } from "react"
import axios from 'axios';
import { Button } from "@mui/material";


type Complaint = {
    id: number
    studentName: string
    studentId: string
    title: string
    details: string
    reply: string
    status: "open" | "resolved"
}

const FETCH_ALL_COMPLAINTS_API = 'http://localhost:3000/api/complaint/all';
const UPDATE_COMPLAINTS_API = 'http://localhost:3000/api/admin/update-complaint/';
const SUBMIT_COMPLAINT_API = 'http://localhost:3000/api/admin/submit-complaint';

export default function ComplaintManagementPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([
        // {
        //     id: 1,
        //     studentName: "Ali Karim",
        //     studentId: "S001",
        //     title: "Fan not working",
        //     details: "The ceiling fan in Room 12 is not functioning.",
        //     reply: "",
        //     status: "open"
        // },
        // {
        //     id: 2,
        //     studentName: "Nora Lee",
        //     studentId: "S002",
        //     title: "Water leakage",
        //     details: "There is a leaking pipe in the shared bathroom.",
        //     reply: "",
        //     status: "resolved"
        // }
    ])

    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [openCreateComplaintModal, setOpenCreateComplaintModal] = useState(false);
    const [complaintTitle, setComplaintTitle] = useState("");
    const [complaintDetails, setComplaintDetails] = useState("");
    const [studentId, setStudentId] = useState("");

    const handleResolve = async () => {
        if (!selectedComplaint || !replyText.trim()) return;

        try {
            const adminStr = localStorage.getItem("admin");
            if (!adminStr) {
                alert("Admin not logged in. Please log in again.");
                return;
            }

            const admin = JSON.parse(adminStr);
            if (!admin.id) {
                alert("Admin ID not found. Please log in again.");
                console.error("Admin object:", admin);
                return;
            }

            console.log("Resolving complaint:", {
                complaintId: selectedComplaint.id,
                adminId: admin.id,
                reply: replyText
            });

            const url = UPDATE_COMPLAINTS_API + selectedComplaint.id;
            const resolve = await axios.put(url, { adminId: admin.id, reply: replyText });

            if (resolve.status == 200) {
                setComplaints(prev =>
                    prev.map(c =>
                        c.id === selectedComplaint.id
                            ? { ...c, reply: replyText, status: "resolved" }
                            : c
                    )
                );
                alert("Complaint resolved successfully!");
                closeDialog();
            } else {
                alert('Something went wrong');
            }
        } catch (error: any) {
            console.error("Failed to resolve complaint", error);
            console.error("Error response:", error.response?.data);
            const errorMsg = error.response?.data?.message || "Failed to resolve complaint";
            alert(errorMsg);
        }
    }

    const createComplaint = async () => {
        try {
            const payload = {
                title: complaintTitle,
                details: complaintDetails,
                userId: studentId
            }

            await axios.post(SUBMIT_COMPLAINT_API, payload);
            await handleFetchComplaints();
            handleCancelCreateComplaint();
        } catch (error) {
            console.error(error);
        }
    }

    const openDialog = (complaint: Complaint) => {
        setSelectedComplaint(complaint)
        setReplyText(complaint.reply)
        setIsDialogOpen(true)
    }

    const closeDialog = () => {
        setSelectedComplaint(null)
        setReplyText("")
        setIsDialogOpen(false)
    }

    const handleFetchComplaints = async () => {
        const complaints = await axios.get(FETCH_ALL_COMPLAINTS_API);
        setComplaints(complaints.data);
    }

    const handleClickCreateComplaint = () => {
        setOpenCreateComplaintModal(true);
    }

    const handleCancelCreateComplaint = () => {
        setComplaintTitle("");
        setComplaintDetails("");
        setOpenCreateComplaintModal(false);
    }

    useEffect(() => {
        handleFetchComplaints();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Navigation Bar */}

            {/* Main Content */}
            <div className="pt-20 pb-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Complaint List</h2>

                            <Button className="cursor-pointer " variant="contained" onClick={handleClickCreateComplaint}>
                                Submit New Complaint
                            </Button>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {complaints.map((complaint) => (
                                            <tr key={complaint.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.studentName || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.studentId || "-"}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{complaint.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{complaint.details}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {complaint.status === "open" ? (
                                                        <button
                                                            onClick={() => openDialog(complaint)}
                                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium border border-blue-500"
                                                        >
                                                            Reply
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">Resolved</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`capitalize px-3 py-1 rounded-full text-xs font-semibold ${complaint.status === "open"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                        }`}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog/Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Background overlay */}
                    <div
                        className="fixed inset-0 transition-opacity"
                        onClick={closeDialog}
                    ></div>

                    {/* Dialog content */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Reply to Complaint</h3>
                                <button
                                    onClick={closeDialog}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={selectedComplaint?.title || ""}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea
                                        value={selectedComplaint?.details || ""}
                                        readOnly
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                                    <textarea
                                        placeholder="Type your reply here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                onClick={handleResolve}
                                disabled={!replyText.trim()}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Resolve
                            </button>
                            <button
                                onClick={closeDialog}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {openCreateComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Background overlay */}
                    <div
                        className="fixed inset-0 transition-opacity"
                        onClick={handleCancelCreateComplaint}
                    ></div>

                    {/* Dialog content */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={complaintTitle}
                                        onChange={(e) => setComplaintTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea
                                        value={complaintDetails}
                                        onChange={(e) => setComplaintDetails(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                onClick={() => createComplaint()}
                                disabled={!complaintTitle.trim() || !complaintDetails.trim()}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Submit
                            </button>
                            <button
                                onClick={handleCancelCreateComplaint}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}