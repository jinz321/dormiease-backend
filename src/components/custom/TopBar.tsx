import { Link, useNavigate, useLocation } from "react-router-dom"
import {
    Home,
    Building2,
    FileText,
    Bed,
    AlertCircle,
    Wrench,
    Bell,
    BarChart3,
    LogOut,
    User
} from "lucide-react"

type Props = {
    userName: string
}

export default function TopBar({ userName }: Props) {
    const navigate = useNavigate();
    const location = useLocation()

    const isActive = (path: string) => location.pathname.startsWith(path)

    const handleLogout = () => {
        localStorage.removeItem("admin")
        navigate("/login")
    }

    const navItems = [
        { path: "/home", label: "Home", icon: Home },
        { path: "/hostels", label: "Hostels", icon: Building2 },
        { path: "/hostel-applications", label: "Applications", icon: FileText },
        { path: "/rooms", label: "Rooms", icon: Bed },
        { path: "/complaints", label: "Complaints", icon: AlertCircle },
        { path: "/maintenances", label: "Maintenance", icon: Wrench },
        { path: "/notifications", label: "Notifications", icon: Bell },
        { path: "/reports", label: "Reports", icon: BarChart3 }
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Thin Gradient Top Bar */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600" />

            {/* Main Navigation */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left: Logo & Branding */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                <Building2 className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-gray-800">DormiEase</h1>
                                <p className="text-xs text-gray-500 -mt-0.5">Admin Portal</p>
                            </div>
                        </div>

                        {/* Center: Horizontal Menu */}
                        <div className="flex items-center gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.path)

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${active
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                                            }
                                        `}
                                    >
                                        <Icon size={16} />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Right: User Profile */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm">
                                    <User size={14} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Welcome Back</p>
                                    <p className="text-sm font-bold text-gray-800">{userName || "Admin"}</p>
                                </div>
                            </div>

                            <button
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}