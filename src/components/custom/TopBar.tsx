import { Link, useNavigate, useLocation } from "react-router-dom"

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

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-8">
                        <Link
                            to="/home"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/home")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            HOME
                        </Link>
                        <Link
                            to="/hostels"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/hostels")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            HOSTELS
                        </Link>
                        <Link
                            to="/hostel-applications"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/hostel-applications")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            HOSTEL APPLICATION
                        </Link>
                        <Link
                            to="/rooms"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/rooms")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            ROOMS
                        </Link>
                        <Link
                            to="/complaints"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/complaints")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            COMPLAINTS
                        </Link>
                        <Link
                            to="/maintenances"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/maintenances")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            MAINTENANCE
                        </Link>
                        <Link
                            to="/notifications"
                            className={`px-3 py-2 text-sm font-medium ${isActive("/notifications")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-900 hover:text-gray-700"
                                }`}
                        >
                            NOTIFICATIONS
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 text-sm">Hello, <span className="font-medium">{userName || "Admin"}</span></span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors" onClick={handleLogout}>LOGOUT</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}