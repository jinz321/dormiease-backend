import { Search, MapPin, Star, Calendar, Users, ArrowRight, Shield, Heart } from "lucide-react";
import PublicNavbar from "@/components/custom/PublicNavbar";

export default function LandingPage() {
    return (
        <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
            <PublicNavbar />

            {/* HERO SECTION */}
            <header id="home" className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=2000&q=80"
                        alt="Hostel Vibe"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-4 text-center text-white mt-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        🚀 Your Next Adventure Awaits
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                        Find Your Perfect <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-white">Hostel Stay</span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-white/90 font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Connect with travelers, explore new cities, and save money with the world's best hostels.
                    </p>

                    {/* Glass Search Bar */}
                    <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl md:rounded-full shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center animate-in scale-in zoom-in-95 duration-500 delay-300 ring-1 ring-white/50">
                        <div className="flex-1 w-full md:border-r border-gray-200 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-primary">Location</label>
                            <div className="flex items-center text-gray-800">
                                <MapPin size={18} className="mr-2 text-primary" />
                                <input type="text" placeholder="Where are you going?" className="bg-transparent outline-none w-full font-medium placeholder-gray-400" />
                            </div>
                        </div>

                        <div className="flex-1 w-full md:border-r border-gray-200 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-primary">Dates</label>
                            <div className="flex items-center text-gray-800">
                                <Calendar size={18} className="mr-2 text-primary" />
                                <span className="font-medium">Check-in — Check-out</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 group-hover:text-primary">Guests</label>
                            <div className="flex items-center text-gray-800">
                                <Users size={18} className="mr-2 text-primary" />
                                <span className="font-medium">1 Guest</span>
                            </div>
                        </div>

                        <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white p-4 md:px-8 rounded-xl md:rounded-full font-bold shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                            <Search size={20} className="mr-2" />
                            Search
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-white rounded-full" />
                    </div>
                </div>
            </header>

            {/* FEATURED DESTINATIONS */}
            <section id="destinations" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm">Explore the World</span>
                        <h2 className="text-4xl font-bold mt-2 mb-4 text-gray-900">Trending Destinations</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destinations.map((dest, idx) => (
                            <div key={idx} className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300">
                                <img
                                    src={dest.img}
                                    alt={dest.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-2xl font-bold mb-1">{dest.name}</h3>
                                    <p className="text-white/80 text-sm font-medium flex items-center">
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm mr-2">{dest.count} Hostels</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POPULAR HOSTELS */}
            <section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2">Popular Hostels</h2>
                            <p className="text-gray-500">Top-rated stays loved by travelers.</p>
                        </div>
                        <button className="hidden md:flex items-center text-primary font-bold hover:text-primary/80 transition-colors group">
                            View All <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {hostels.map((hostel, idx) => (
                            <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group border border-gray-100">
                                <div className="relative h-64">
                                    <img src={hostel.img} alt={hostel.name} className="w-full h-full object-cover" />
                                    <button className="absolute top-4 right-4 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center shadow-sm">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                        {hostel.rating} ({hostel.reviews})
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{hostel.name}</h3>
                                            <p className="text-gray-500 text-sm flex items-center">
                                                <MapPin size={14} className="mr-1" /> {hostel.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 my-4">
                                        {hostel.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold tracking-wide px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs text-gray-400 block">Starting from</span>
                                            <span className="text-2xl font-bold text-primary">${hostel.price}</span>
                                            <span className="text-gray-400 text-sm">/night</span>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-colors shadow-lg">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST INDICATORS */}
            <section id="about" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                                <Shield size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">100% Secure Booking</h3>
                            <p className="text-gray-500 leading-relaxed max-w-xs">We use bank-level encryption to ensure your data and payments are always safe.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                                <Users size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
                            <p className="text-gray-500 leading-relaxed max-w-xs">Our team of travel experts is always here to help you, day or night.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6">
                                <Star size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Verified Reviews</h3>
                            <p className="text-gray-500 leading-relaxed max-w-xs">Over 1 million real reviews from travelers just like you to help you choose.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEWSLETTER / FOOTER CTA */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for your next adventure?</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join our newsletter to get the latest travel deals, hostel tips, and inspiration.</p>
                    <div className="max-w-lg mx-auto flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold shadow-lg">D</div>
                                <span className="text-xl font-bold text-white">DormiEase</span>
                            </div>
                            <p className="text-sm">Making hostel booking easy, secure, and fun for students and travelers worldwide.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Company</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Support</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Cancellation Options</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Legal</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-900 pt-8 text-center text-sm">
                        &copy; 2025 DormiEase Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// MOCK DATA
const destinations = [
    { name: "Bali, Indonesia", count: 128, img: "https://images.unsplash.com/photo-1552853872-969c3a3cb84d?auto=format&fit=crop&w=800&q=80" },
    { name: "Barcelona, Spain", count: 85, img: "https://images.unsplash.com/photo-1546726588-4366dc71cb53?auto=format&fit=crop&w=400&q=80" },
    { name: "Bangkok, Thailand", count: 210, img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=400&q=80" },
    { name: "Kyoto, Japan", count: 64, img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80" },
];

const hostels = [
    { name: "The Dreamer Hostel", location: "Santa Marta, Colombia", rating: 4.8, reviews: 342, price: 18, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80", tags: ["Pool", "Party", "WiFi"] },
    { name: "Lub d Philippines", location: "Makati, Philippines", rating: 4.9, reviews: 1205, price: 24, img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80", tags: ["Modern", "Gym", "Bar"] },
    { name: "Selina Secret Garden", location: "Lisbon, Portugal", rating: 4.7, reviews: 890, price: 32, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80", tags: ["Coworking", "Pool", "Art"] },
];
