import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import loginBg from '../assets/generated/login-bg.png';

const LoginPage = () => {
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Set persistence to keep user logged in across browser sessions
            await setPersistence(auth, browserLocalPersistence);

            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            // Set persistence to keep user logged in across browser sessions
            await setPersistence(auth, browserLocalPersistence);

            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (err: any) {
            console.error('❌ Google Sign-In Error:', err);
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);

            // Show user-friendly error message
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in cancelled. Please try again.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup was blocked by your browser. Please allow popups for this site.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google Sign-In is not enabled. Please enable it in Firebase Console.');
            } else {
                setError(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
            {/* Cinematic Background with parallax effect */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: `url(${loginBg})`,
                    filter: 'brightness(0.35) saturate(1.2) contrast(1.1)'
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0c08] via-black/40 to-transparent" />
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-900/10 via-transparent to-transparent" />

            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 sm:gap-12 max-w-6xl">

                {/* Brand Section */}
                <div className="text-center md:text-left text-white max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <motion.h1
                            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold mb-4 sm:mb-6 tracking-tight"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Deer</span>
                            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Camp</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="text-base sm:text-xl md:text-2xl text-gray-300 font-light mb-6 sm:mb-10 leading-relaxed"
                        >
                            The modern platform for the <span className="text-white font-semibold">serious hunting club</span>
                        </motion.p>

                        <div className="hidden md:flex flex-col gap-5">
                            {[
                                "Real-time stand availability & booking",
                                "Digital harvest logging & trophy gallery",
                                "Club analytics & weather intelligence"
                            ].map((text, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                                >
                                    <FeatureItem text={text} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Auth Card */}
                <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
                    className="w-full max-w-md"
                >
                    <div className="glass-panel-strong p-6 sm:p-8 md:p-10 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden hover:border-white/30 transition-all duration-500">
                        {/* Decorative gradient blobs */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-8 relative z-10"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
                                {isLogin ? 'Welcome back' : 'Join the club'}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {isLogin ? 'Enter your credentials to access the lodge' : 'Create your hunter profile to get started'}
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-2"
                            >
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all hover:bg-black/60 hover:border-white/20"
                                    placeholder="hunter@example.com"
                                    required
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-2"
                            >
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all hover:bg-black/60 hover:border-white/20"
                                    placeholder="••••••••"
                                    required
                                />
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-red-400 text-sm bg-gradient-to-r from-red-500/15 to-red-500/5 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm"
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                type="submit"
                                className="btn btn-primary w-full justify-center py-3.5 sm:py-4 rounded-xl text-base sm:text-lg mt-4 group shadow-2xl shadow-green-900/30"
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 }}
                            className="mt-6 sm:mt-8 relative z-10"
                        >
                            <div className="relative flex items-center py-5">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink mx-5 text-gray-500 text-xs font-bold uppercase tracking-widest">Or continue with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGoogleSignIn}
                                className="w-full bg-white text-black btn font-bold flex justify-center hover:bg-gray-100 rounded-xl py-3.5 sm:py-4 text-sm sm:text-base transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-2.5 relative z-10" alt="Google" />
                                <span className="relative z-10">Google</span>
                            </motion.button>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="mt-6 sm:mt-8 text-center text-sm text-gray-400 relative z-10"
                        >
                            {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-green-400 hover:text-green-300 font-bold underline-offset-4 hover:underline transition-all"
                            >
                                {isLogin ? 'Register now' : 'Sign in'}
                            </motion.button>
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <motion.div
        whileHover={{ x: 5, scale: 1.02 }}
        className="flex items-center gap-4 group"
    >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30 text-green-400 group-hover:border-green-500/50 transition-all shadow-lg group-hover:shadow-green-500/20">
            <Check size={16} strokeWidth={3} />
        </div>
        <span className="text-gray-200 font-medium text-base group-hover:text-white transition-colors">{text}</span>
    </motion.div>
);

export default LoginPage;
