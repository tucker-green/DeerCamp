import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Map,
    Users,
    TrendingUp,
    Target,
    ChevronRight,
    Smartphone,
    Calendar
} from 'lucide-react';
import heroBg from '../assets/generated/hero-bg.png';
import harvestCard from '../assets/generated/harvest-card.png';
import avatar1 from '../assets/generated/testimonial-avatar.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Map className="w-6 h-6 text-[#e9c46a]" />,
            title: "Interactive Mapping",
            description: "Map stands, trails, access routes, and boundaries so every member knows the plan."
        },
        {
            icon: <Users className="w-6 h-6 text-[#e9c46a]" />,
            title: "Club Management",
            description: "Manage members, guests, and club rules with roles, approvals, and clear visibility."
        },
        {
            icon: <TrendingUp className="w-6 h-6 text-[#e9c46a]" />,
            title: "Harvest Analytics",
            description: "Track harvests and trends across the club to learn what’s working on your property."
        },
        {
            icon: <Calendar className="w-6 h-6 text-[#e9c46a]" />,
            title: "Smart Scheduling",
            description: "Reserve stands and coordinate hunts in minutes — no conflicts, no drama."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0c08] text-white overflow-hidden font-['Inter']">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0c08]/90 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target className="w-8 h-8 text-[#3a6326]" />
                        <span className="font-['Outfit'] text-2xl font-bold tracking-tight text-white">DEERCAMP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-gray-300 hover:text-white font-medium text-sm transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                            className="bg-[#3a6326] hover:bg-[#4a7c31] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-[#3a6326]/30 flex items-center gap-2"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${heroBg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c08]/90 via-[#0a0c08]/70 to-[#0a0c08]/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c08] via-transparent to-transparent" />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 w-fit">
                                <span className="w-2 h-2 rounded-full bg-[#e9c46a] animate-pulse" />
                                <span className="text-xs font-semibold tracking-wide uppercase text-gray-300">Built for hunting clubs & leases</span>
                            </div>
                            <h1 className="font-['Outfit'] text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                                Run Your Club <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74d4a8] to-[#3a6326]">Smarter This Season</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-lg">
                                DeerCamp keeps members aligned with stand reservations, real-time availability, harvest tracking, and club rules — without the group-text chaos.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                                    className="bg-[#3a6326] px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#4a7c31] transition-all shadow-[0_0_30px_rgba(58,99,38,0.3)] hover:shadow-[0_0_40px_rgba(58,99,38,0.5)] group"
                                >
                                    Start Your Club
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => {
                                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-4 rounded-xl font-bold text-lg border border-white/10 hover:bg-white/5 transition-all text-white flex items-center justify-center"
                                >
                                    Explore Features
                                </button>
                            </div>

                            <div className="mt-10 flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0c08] bg-gray-700 flex items-center justify-center text-xs text-white bg-gradient-to-br from-gray-700 to-gray-800">
                                            {i === 4 ? '+' : ''}
                                        </div>
                                    ))}
                                </div>
                                <p>Trusted by <span className="text-white font-semibold">1,000+</span> club members nationwide</p>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{ y: y1 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative z-10 bg-[#141812]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl skew-y-[-3deg] transform hover:skew-y-0 transition-transform duration-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#3a6326]/20 flex items-center justify-center">
                                            <Target className="w-6 h-6 text-[#3a6326]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Big Buck Down</h3>
                                            <p className="text-xs text-gray-400">Just now • North Ridge Stand</p>
                                        </div>
                                    </div>
                                    <span className="bg-[#3a6326] text-xs font-bold px-2 py-1 rounded text-white">VERIFIED</span>
                                </div>
                                <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden relative group">
                                    <img
                                        src={harvestCard}
                                        alt="Trophy Buck"
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6">
                                        <p className="text-white font-bold text-lg">12 Pointer - 160"</p>
                                        <p className="text-gray-300 text-sm">Rifle Season • 30 Yard Shot</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex gap-4 text-gray-400">
                                        <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Score: 165 </span>
                                        <span className="flex items-center gap-1"><Smartphone className="w-4 h-4" /> Weight: 210lbs</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative floating card */}
                            <motion.div
                                style={{ y: y2 }}
                                className="absolute -bottom-10 -right-10 z-20 bg-[#1a1f18] p-4 rounded-xl border border-white/10 shadow-xl w-64"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-[#e9c46a]/20 rounded-lg">
                                        <Calendar className="w-5 h-5 text-[#e9c46a]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Stand Reserved</p>
                                        <p className="text-xs text-gray-400">Tomorrow • 5:00 AM</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#e9c46a] w-[70%]" />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-['Outfit'] text-3xl md:text-5xl font-bold mb-4">Master Your <span className="text-[#3a6326]">Elements</span></h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Advanced tools designed to give you the upper hand this season. From scouting to harvest, we've got you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-[#141812]/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:border-[#3a6326]/50 hover:bg-[#141812] transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#3a6326]/10 flex items-center justify-center mb-4 group-hover:bg-[#3a6326]/20 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-['Outfit']">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial/Social Proof */}
            <section className="py-20 bg-gradient-to-b from-transparent to-[#141812]/50 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="flex gap-1 text-[#e9c46a]">
                            {[1, 2, 3, 4, 5].map(i => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold font-['Outfit'] mb-6 italic">
                        "DeerCamp finally got our club on the same page. Stand reservations alone solved years of confusion and arguments."
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#3a6326]">
                            <img src={avatar1} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-white">Mike R.</p>
                            <p className="text-sm text-[#3a6326]">Club President, 15 Members</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#3a6326]/5" />
                <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
                    <h2 className="font-['Outfit'] text-4xl md:text-5xl font-bold mb-6">Ready to Upgrade Your Club?</h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Bring order to bookings, members, and harvest tracking — built for real hunting clubs.
                    </p>
                    <button
                        onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                        className="bg-white text-[#0a0c08] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        Create Your Club
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                        <Target className="w-6 h-6" />
                        <span className="font-bold tracking-tight">DEERCAMP</span>
                    </div>
                    <p>© {new Date().getFullYear()} DeerCamp. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
