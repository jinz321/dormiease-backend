import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform group-hover:scale-110 transition-transform">
                            D
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'} transition-colors`}>
                            Dormi<span className="text-primary">Ease</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {["Home", "Destinations", "About", "Features"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-gray-700' : 'text-white/90 hover:text-white'}`}
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <button
                            onClick={() => navigate("/login")}
                            className={`px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${isScrolled
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-white text-primary hover:bg-gray-100"
                                }`}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2 rounded-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 md:hidden shadow-xl animate-in slide-in-from-top-5">
                    <div className="flex flex-col space-y-4">
                        {["Home", "Destinations", "About", "Features"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-gray-800 font-medium py-2 hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-md"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
