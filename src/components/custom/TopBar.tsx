import { Link, useNavigate, useLocation } from "react-router-dom"
import {
    Home,
    Building2,
    FileText,
    Bed,
    AlertCircle,
    Wrench,
    Bell,
    CreditCard,
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
        { path: "/payments", label: "Payments", icon: CreditCard },
        { path: "/reports", label: "Reports", icon: BarChart3 }
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Navigation Links */}
                    <div className="flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        group relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                                        flex items-center gap-2
                                        ${active
                                            ? "text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30"
                                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={18}
                                        className={`transition-transform duration-300 ${active ? "" : "group-hover:scale-110"}`}
                                    />
                                    <span className="hidden lg:inline">{item.label}</span>

                                    {/* Active indicator dot */}
                                    {active && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Section */}
                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md">
                                <User size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-500 font-medium">Welcome back</p>
                                <p className="text-sm font-bold text-gray-800">{userName || "Admin"}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            className="group relative px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}