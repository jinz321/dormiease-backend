import { useEffect, useState } from "react"
import axios from 'axios';
import { Button } from "@mui/material";
import {
    Check,
    ShieldAlert,
    MessageCircle,
    User,
    Calendar,
    AlertCircle,
    X,
    Send,
    Plus,
    Clock,
    CheckCircle2
} from "lucide-react"

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
    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [openCreateComplaintModal, setOpenCreateComplaintModal] = useState(false);
    const [complaintTitle, setComplaintTitle] = useState("");
    const [complaintDetails, setComplaintDetails] = useState("");
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);

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
                return;
            }

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
            }
        } catch (error: any) {
            console.error("Failed to resolve complaint", error);
            alert(error.response?.data?.message || "Failed to resolve complaint");
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
        try {
            const complaints = await axios.get(FETCH_ALL_COMPLAINTS_API);
            setComplaints(complaints.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    const handleClickCreateComplaint = () => {
        setOpenCreateComplaintModal(true);
    }

    const handleCancelCreateComplaint = () => {
        setComplaintTitle("");
        setComplaintDetails("");
        setStudentId("");
        setOpenCreateComplaintModal(false);
    }

    useEffect(() => {
        handleFetchComplaints();
    }, []);

    if (loading) {
        return (
            <div className="pt-24 pb-10 px-4 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 text-lg font-semibold">Loading complaints...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <ShieldAlert className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Complaints Management</h1>
                                <p className="text-white/80 text-sm">Review and resolve student grievances</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        className="bg-white text-primary hover:bg-white/90 shadow-lg rounded-xl px-6 py-3 font-bold"
                        variant="contained"
                        onClick={handleClickCreateComplaint}
                        startIcon={<Plus size={20} />}
                    >
                        Submit New Complaint
                    </Button>
                </div>

                {/* Complaints Grid */}
                {complaints.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={40} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium text-lg">No complaints yet</p>
                        <p className="text-gray-300 text-sm mt-1">All student grievances will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {complaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Complaint Info */}
                                        <div className="flex-1 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="text-purple-600" size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{complaint.title}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={14} />
                                                            <span className="font-medium">{complaint.studentName || "Unknown"}</span>
                                                        </div>
                                                        <span className="text-gray-300">•</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-xs">{complaint.studentId || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <p className="text-gray-700 leading-relaxed">{complaint.details}</p>
                                            </div>

                                            {/* Reply if resolved */}
                                            {complaint.status === "resolved" && complaint.reply && (
                                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle2 className="text-green-600" size={16} />
                                                        <span className="text-xs font-bold text-green-700 uppercase">Admin Reply</span>
                                                    </div>
                                                    <p className="text-green-800 text-sm leading-relaxed">{complaint.reply}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Status & Action */}
                                        <div className="flex flex-col items-end gap-3">
                                            {/* Status Badge */}
                                            <span className={`
                                                px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2
                                                ${complaint.status === "open"
                                                    ? "bg-red-100 text-red-700 border border-red-200"
                                                    : "bg-green-100 text-green-700 border border-green-200"
                                                }
                                            `}>
                                                {complaint.status === "open" ? (
                                                    <>
                                                        <AlertCircle size={14} />
                                                        Open
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={14} />
                                                        Resolved
                                                    </>
                                                )}
                                            </span>

                                            {/* Action Button */}
                                            {complaint.status === "open" && (
                                                <button
                                                    onClick={() => openDialog(complaint)}
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                                >
                                                    <MessageCircle size={16} />
                                                    Reply & Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reply Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto animate-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <MessageCircle className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Reply to Complaint</h3>
                                        <p className="text-white/80 text-sm">Provide resolution details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeDialog}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title</label>
                                <input
                                    type="text"
                                    value={selectedComplaint?.title || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Details</label>
                                <textarea
                                    value={selectedComplaint?.details || ""}
                                    readOnly
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Reply *</label>
                                <textarea
                                    placeholder="Type your resolution message here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={closeDialog}
                                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={!replyText.trim()}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                            >
                                <Send size={16} />
                                Resolve Complaint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Complaint Dialog */}
            {openCreateComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Plus className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Submit New Complaint</h3>
                                        <p className="text-white/80 text-sm">Create a complaint on behalf of a student</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelCreateComplaint}
                                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Student ID *</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="e.g. S12345"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={complaintTitle}
                                    onChange={(e) => setComplaintTitle(e.target.value)}
                                    placeholder="Brief description of the issue"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Details *</label>
                                <textarea
                                    value={complaintDetails}
                                    onChange={(e) => setComplaintDetails(e.target.value)}
                                    placeholder="Provide detailed information about the complaint..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={handleCancelCreateComplaint}
                                className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createComplaint}
                                disabled={!complaintTitle.trim() || !complaintDetails.trim() || !studentId.trim()}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                            >
                                <Send size={16} />
                                Submit Complaint
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}