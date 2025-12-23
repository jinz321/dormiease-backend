import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
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
    User,
    Menu,
    X,
    ChevronDown
} from "lucide-react"

type Props = {
    userName: string
}

export default function TopBar({ userName }: Props) {
    const navigate = useNavigate();
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => location.pathname.startsWith(path)

    const handleLogout = () => {
        localStorage.removeItem("admin")
        navigate("/login")
    }

    const navItems = [
        { path: "/home", label: "Home", icon: Home },
        { path: "/hostels", label: "Hostels", icon: Building2 },
        { path: "/hostel-applications", label: "Applications", icon: FileText, badge: 3 },
        { path: "/rooms", label: "Rooms", icon: Bed },
        { path: "/complaints", label: "Complaints", icon: AlertCircle, badge: 5 },
        { path: "/maintenances", label: "Maintenance", icon: Wrench, badge: 2 },
        { path: "/notifications", label: "Notifications", icon: Bell, badge: 8 },
        { path: "/payments", label: "Payments", icon: CreditCard },
        { path: "/reports", label: "Reports", icon: BarChart3 }
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                            <Building2 className="text-white" size={20} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                DormiEase
                            </h1>
                            <p className="text-xs text-gray-500 -mt-1">Admin Portal</p>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden xl:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.path)

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        group relative px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                                        flex items-center gap-2
                                        ${active
                                            ? "text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30"
                                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={16}
                                        className={`transition-transform duration-300 ${active ? "" : "group-hover:scale-110"}`}
                                    />
                                    <span className="text-xs">{item.label}</span>

                                    {/* Badge for notifications */}
                                    {item.badge && item.badge > 0 && (
                                        <span className={`
                                            absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold
                                            flex items-center justify-center
                                            ${active
                                                ? "bg-white text-primary"
                                                : "bg-red-500 text-white animate-pulse"
                                            }
                                        `}>
                                            {item.badge}
                                        </span>
                                    )}

                                    {/* Active underline animation */}
                                    {active && (
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                                    )}

                                    {/* Hover underline */}
                                    {!active && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* User Section */}
                    <div className="hidden xl:flex items-center gap-3">
                        {/* User Info */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md ring-2 ring-white">
                                <User size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Welcome back</p>
                                <p className="text-sm font-bold text-gray-800">{userName || "Admin"}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            className="group relative px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="xl:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-300">
                        <div className="space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const active = isActive(item.path)

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                                            flex items-center justify-between px-4 py-3 rounded-xl transition-all
                                            ${active
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} />
                                            <span className="font-semibold">{item.label}</span>
                                        </div>
                                        {item.badge && item.badge > 0 && (
                                            <span className={`
                                                w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                                                ${active ? "bg-white text-primary" : "bg-red-500 text-white"}
                                            `}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}

                            {/* Mobile User Info */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Logged in as</p>
                                        <p className="font-bold text-gray-800">{userName || "Admin"}</p>
                                    </div>
                                </div>
                                <button
                                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}