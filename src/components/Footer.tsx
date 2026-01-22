import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Mail, Heart, ExternalLink, TreePine, Target, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/features' },
      { label: 'Stand Booking', path: '/bookings' },
      { label: 'Club Management', path: '/club' },
      { label: 'Harvest Logs', path: '/harvests' },
    ],
    resources: [
      { label: 'Help Center', path: '/help' },
      { label: 'Safety Guidelines', path: '/safety' },
      { label: 'Wildlife Conservation', path: '/conservation' },
      { label: 'Community', path: '/community' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="relative hidden sm:block mt-auto">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-1/2 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-[#0a0c08]/80 backdrop-blur-2xl border-t border-white/5">
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {/* Main footer content */}
          <div className="py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
              {/* Brand section */}
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Link to="/" className="inline-flex items-center gap-2 group mb-4">
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Sparkles className="w-6 h-6 text-green-500" />
                  </motion.div>
                  <span className="text-2xl font-bold font-heading tracking-tight">
                    <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                      Deer
                    </span>
                    <span className="text-white">Camp</span>
                  </span>
                </Link>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                  The ultimate hunting club management platform. Coordinate stands, track harvests,
                  and build a thriving community of outdoor enthusiasts.
                </p>

                {/* Feature highlights */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: <Target size={14} />, label: 'Stand Booking' },
                    { icon: <TreePine size={14} />, label: 'Club Management' },
                    { icon: <Shield size={14} />, label: 'Safety First' },
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                    >
                      <span className="text-green-500">{feature.icon}</span>
                      {feature.label}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Product links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-white font-semibold font-heading mb-4 text-sm uppercase tracking-wider">
                  Product
                </h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink
                          size={12}
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-white font-semibold font-heading mb-4 text-sm uppercase tracking-wider">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink
                          size={12}
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-white font-semibold font-heading mb-4 text-sm uppercase tracking-wider">
                  Legal
                </h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink
                          size={12}
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Bottom bar */}
          <motion.div
            variants={itemVariants}
            className="py-6 border-t border-white/5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>&copy; {currentYear} DeerCamp.</span>
                <span className="hidden sm:inline">All rights reserved.</span>
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>Made with</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Heart size={14} className="text-red-500 fill-red-500" />
                  </motion.div>
                  <span>for hunters</span>
                </div>

                {/* Contact info */}
                <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
                  <a
                    href="mailto:support@deercamp.com"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors"
                  >
                    <Mail size={14} />
                    <span>support@deercamp.com</span>
                  </a>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>USA</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
