import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
    Building2,
    Bed,
    Users,
    FileText,
    AlertCircle,
    Wrench,
    Plus,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@mui/material"

type DashboardStats = {
    totalHostels: number
    totalRooms: number
    totalCapacity: number
    currentOccupancy: number
    pendingApplications: number
    activeComplaints: number
    maintenanceRequests: number
}

type RecentActivity = {
    id: string
    type: "application" | "complaint" | "maintenance"
    title: string
    timestamp: string
    status: "pending" | "completed" | "open"
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<DashboardStats>({
        totalHostels: 0,
        totalRooms: 0,
        totalCapacity: 0,
        currentOccupancy: 0,
        pendingApplications: 0,
        activeComplaints: 0,
        maintenanceRequests: 0
    })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data in parallel
                const [hostelsRes, roomsRes, complaintsRes, maintenanceRes] = await Promise.all([
                    axios.get("http://localhost:3000/api/hostels/all"),
                    axios.get("http://localhost:3000/api/room/all"),
                    axios.get("http://localhost:3000/api/complaints/all"),
                    axios.get("http://localhost:3000/api/maintenances/all")
                ])

                const hostels = hostelsRes.data
                const rooms = roomsRes.data
                const complaints = complaintsRes.data
                const maintenances = maintenanceRes.data

                // Calculate stats
                const totalCapacity = hostels.reduce((sum: number, h: any) => sum + (h.totalCapacity || 0), 0)
                const currentOccupancy = hostels.reduce((sum: number, h: any) => sum + (h.totalApprovedUsers || 0), 0)
                const activeComplaints = complaints.filter((c: any) => c.status === "open").length
                const maintenanceRequests = maintenances.filter((m: any) => m.status === "open").length

                setStats({
                    totalHostels: hostels.length,
                    totalRooms: rooms.length,
                    totalCapacity,
                    currentOccupancy,
                    pendingApplications: 0, // Will be updated when applications API is available
                    activeComplaints,
                    maintenanceRequests
                })

                // Create recent activity feed
                const activities: RecentActivity[] = [
                    ...complaints.slice(0, 3).map((c: any) => ({
                        id: c.id,
                        type: "complaint" as const,
                        title: c.title,
                        timestamp: new Date().toISOString(),
                        status: c.status === "open" ? "open" as const : "completed" as const
                    })),
                    ...maintenances.slice(0, 3).map((m: any) => ({
                        id: m.id,
                        type: "maintenance" as const,
                        title: m.title,
                        timestamp: new Date().toISOString(),
                        status: m.status === "open" ? "open" as const : "completed" as const
                    }))
                ]

                setRecentActivity(activities.slice(0, 5))
                setLoading(false)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const occupancyRate = stats.totalCapacity > 0
        ? Math.round((stats.currentOccupancy / stats.totalCapacity) * 100)
        : 0

    const statCards = [
        {
            title: "Total Hostels",
            value: stats.totalHostels,
            icon: Building2,
            color: "from-primary to-primary/80",
            bgColor: "bg-primary/10",
            textColor: "text-primary"
        },
        {
            title: "Total Rooms",
            value: stats.totalRooms,
            icon: Bed,
            color: "from-secondary to-secondary/80",
            bgColor: "bg-secondary/10",
            textColor: "text-secondary"
        },
        {
            title: "Occupancy Rate",
            value: `${occupancyRate}%`,
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            subtitle: `${stats.currentOccupancy} / ${stats.totalCapacity} beds`
        },
        {
            title: "Pending Applications",
            value: stats.pendingApplications,
            icon: FileText,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: "Active Complaints",
            value: stats.activeComplaints,
            icon: AlertCircle,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
        },
        {
            title: "Maintenance Requests",
            value: stats.maintenanceRequests,
            icon: Wrench,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600"
        }
    ]

    const quickActions = [
        { label: "Add Hostel", path: "/hostels", icon: Building2 },
        { label: "Add Room", path: "/rooms", icon: Bed },
        { label: "View Applications", path: "/hostel-applications", icon: FileText },
        { label: "View Reports", path: "/reports", icon: TrendingUp }
    ]

    if (loading) {
        return (
            <div className="pt-24 pb-10 px-4 min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-white">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back, Admin! 👋</h1>
                    <p className="text-white/80 text-lg">Here's what's happening with your hostels today.</p>
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <Card
                                key={index}
                                className="bg-white rounded-2xl border-none shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon className={`${stat.textColor}`} size={28} />
                                        </div>
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color} animate-pulse`} />
                                    </div>
                                    <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                                        {stat.title}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                                        {stat.subtitle && (
                                            <span className="text-sm text-gray-400">{stat.subtitle}</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Two Column Layout: Recent Activity + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Feed */}
                    <Card className="lg:col-span-2 bg-white rounded-2xl border-none shadow-xl">
                        <CardHeader className="border-b border-gray-100 p-6">
                            <div className="flex items-center gap-3">
                                <Clock className="text-primary" size={24} />
                                <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No recent activity</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => {
                                        const isCompleted = activity.status === "completed"
                                        const StatusIcon = isCompleted ? CheckCircle : activity.status === "open" ? AlertCircle : Clock
                                        const statusColor = isCompleted ? "text-green-500" : activity.status === "open" ? "text-orange-500" : "text-blue-500"

                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                                            >
                                                <div className={`w-10 h-10 rounded-lg ${isCompleted ? 'bg-green-50' : 'bg-orange-50'} flex items-center justify-center flex-shrink-0`}>
                                                    <StatusIcon className={statusColor} size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{activity.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 capitalize">{activity.type}</span>
                                                        <span className="text-xs text-gray-300">•</span>
                                                        <span className={`text-xs font-medium capitalize ${statusColor}`}>
                                                            {activity.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-white rounded-2xl border-none shadow-xl h-fit sticky top-24">
                        <CardHeader className="border-b border-gray-100 p-6">
                            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="text-primary" size={24} />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon
                                return (
                                    <Button
                                        key={index}
                                        variant="outlined"
                                        onClick={() => navigate(action.path)}
                                        className="w-full justify-start gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-700 hover:text-primary transition-all normal-case font-semibold"
                                    >
                                        <Icon size={20} />
                                        {action.label}
                                    </Button>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
