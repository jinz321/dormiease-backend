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
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    ArrowRight,
    Zap,
    Target,
    Award
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
    const [adminName, setAdminName] = useState("Admin")

    useEffect(() => {
        // Get admin name from localStorage
        const adminStr = localStorage.getItem("admin")
        if (adminStr) {
            try {
                const admin = JSON.parse(adminStr)
                setAdminName(admin.name || admin.staff_id || "Admin")
            } catch (error) {
                console.error("Error parsing admin data:", error)
            }
        }

        const fetchDashboardData = async () => {
            try {
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

                const totalCapacity = hostels.reduce((sum: number, h: any) => sum + (h.totalCapacity || 0), 0)
                const currentOccupancy = hostels.reduce((sum: number, h: any) => sum + (h.totalApprovedUsers || 0), 0)
                const activeComplaints = complaints.filter((c: any) => c.status === "open").length
                const maintenanceRequests = maintenances.filter((m: any) => m.status === "open").length

                setStats({
                    totalHostels: hostels.length,
                    totalRooms: rooms.length,
                    totalCapacity,
                    currentOccupancy,
                    pendingApplications: 0,
                    activeComplaints,
                    maintenanceRequests
                })

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

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return { text: "Good Morning", emoji: "☀️" }
        if (hour < 18) return { text: "Good Afternoon", emoji: "🌤️" }
        return { text: "Good Evening", emoji: "🌙" }
    }

    const greeting = getGreeting()

    const statCards = [
        {
            title: "Total Hostels",
            value: stats.totalHostels,
            icon: Building2,
            color: "from-primary to-primary/80",
            bgColor: "bg-primary/10",
            textColor: "text-primary",
            trend: "+12%",
            trendUp: true,
            subtitle: "Active buildings"
        },
        {
            title: "Total Rooms",
            value: stats.totalRooms,
            icon: Bed,
            color: "from-secondary to-secondary/80",
            bgColor: "bg-secondary/10",
            textColor: "text-secondary",
            trend: "+8%",
            trendUp: true,
            subtitle: "Available units"
        },
        {
            title: "Occupancy Rate",
            value: `${occupancyRate}%`,
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            progress: occupancyRate,
            subtitle: `${stats.currentOccupancy} / ${stats.totalCapacity} beds`,
            trend: "+5%",
            trendUp: true
        },
        {
            title: "Pending Applications",
            value: stats.pendingApplications,
            icon: FileText,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            subtitle: "Awaiting review",
            priority: stats.pendingApplications > 5 ? "high" : "normal"
        },
        {
            title: "Active Complaints",
            value: stats.activeComplaints,
            icon: AlertCircle,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            subtitle: "Needs attention",
            trend: "-3%",
            trendUp: false,
            priority: stats.activeComplaints > 3 ? "high" : "normal"
        },
        {
            title: "Maintenance Requests",
            value: stats.maintenanceRequests,
            icon: Wrench,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            subtitle: "Open tickets",
            trend: "-7%",
            trendUp: false,
            priority: stats.maintenanceRequests > 5 ? "high" : "normal"
        }
    ]

    const quickActions = [
        { label: "Add Hostel", path: "/hostels", icon: Building2, color: "primary" },
        { label: "Add Room", path: "/rooms", icon: Bed, color: "secondary" },
        { label: "View Applications", path: "/hostel-applications", icon: FileText, color: "blue" },
        { label: "View Reports", path: "/reports", icon: TrendingUp, color: "green" }
    ]

    if (loading) {
        return (
            <div className="pt-24 pb-10 px-4 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <div className="text-white text-xl font-semibold">Loading dashboard...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-24 pb-10 px-4 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header with Time-based Greeting */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-3xl blur-xl" />
                    <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-5xl">{greeting.emoji}</span>
                                    <h1 className="text-4xl font-bold text-white tracking-tight">
                                        {greeting.text}, Admin!
                                    </h1>
                                </div>
                                <p className="text-white/80 text-lg">Here's your hostel management overview for today.</p>
                            </div>
                            <div className="hidden md:flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-white/60 text-sm">Total Occupancy</div>
                                    <div className="text-3xl font-bold text-white">{occupancyRate}%</div>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Target className="text-white" size={36} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon
                        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown

                        return (
                            <Card
                                key={index}
                                className="bg-white rounded-2xl border-none shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group relative"
                            >
                                {/* Animated gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                {/* Priority badge */}
                                {stat.priority === "high" && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                            <Zap size={12} />
                                            HIGH
                                        </div>
                                    </div>
                                )}

                                <CardContent className="p-6 relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                                            <Icon className={`${stat.textColor}`} size={32} />
                                        </div>
                                        {stat.trend && (
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                <TrendIcon size={14} />
                                                <span className="text-xs font-bold">{stat.trend}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
                                        {stat.title}
                                    </h3>

                                    <div className="mb-3">
                                        <p className="text-5xl font-bold text-gray-800 group-hover:scale-105 transition-transform inline-block">
                                            {stat.value}
                                        </p>
                                    </div>

                                    {/* Progress bar for occupancy */}
                                    {stat.progress !== undefined && (
                                        <div className="mb-3">
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                                                    style={{ width: `${stat.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-400 font-medium">{stat.subtitle}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Recent Activity Feed */}
                    <Card className="lg:col-span-2 bg-white rounded-2xl border-none shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-gray-100 p-6 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Clock className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
                                        <p className="text-xs text-gray-500 mt-0.5">Latest updates from your system</p>
                                    </div>
                                </div>
                                <Award className="text-gray-300" size={24} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                        <Clock size={40} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No recent activity</p>
                                    <p className="text-gray-300 text-sm mt-1">Activity will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, idx) => {
                                        const isCompleted = activity.status === "completed"
                                        const StatusIcon = isCompleted ? CheckCircle : activity.status === "open" ? AlertCircle : Clock
                                        const statusColor = isCompleted ? "text-green-500" : activity.status === "open" ? "text-orange-500" : "text-blue-500"
                                        const bgColor = isCompleted ? "bg-green-50" : activity.status === "open" ? "bg-orange-50" : "bg-blue-50"

                                        return (
                                            <div
                                                key={activity.id}
                                                className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all border border-gray-100 hover:border-primary/20 hover:shadow-md cursor-pointer"
                                                style={{ animationDelay: `${idx * 100}ms` }}
                                            >
                                                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <StatusIcon className={statusColor} size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                                                        {activity.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                                                            {activity.type}
                                                        </span>
                                                        <span className="text-xs text-gray-300">•</span>
                                                        <span className={`text-xs font-bold capitalize ${statusColor}`}>
                                                            {activity.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ArrowRight className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced Quick Actions */}
                    <Card className="bg-white rounded-2xl border-none shadow-xl h-fit sticky top-24">
                        <CardHeader className="border-b border-gray-100 p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Zap className="text-primary" size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
                                    <p className="text-xs text-gray-500 mt-0.5">Common tasks</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-3">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon
                                return (
                                    <Button
                                        key={index}
                                        variant="outlined"
                                        onClick={() => navigate(action.path)}
                                        className="w-full justify-between gap-3 py-4 px-5 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 text-gray-700 hover:text-primary transition-all normal-case font-bold text-base group hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                                <Icon size={20} className="group-hover:scale-110 transition-transform" />
                                            </div>
                                            {action.label}
                                        </div>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
