import { motion } from 'framer-motion';
import {
  Map,
  Users,
  TrendingUp,
  Calendar,
  Shield,
  Bell,
  Camera,
  MessageSquare,
  Target,
  Compass,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Smartphone,
  Zap,
} from 'lucide-react';

const FeaturesPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mainFeatures = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Stand Reservations',
      description:
        'Book hunting stands in advance to avoid conflicts. See real-time availability, set recurring reservations, and coordinate with club members effortlessly.',
      color: 'green',
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: 'Interactive Maps',
      description:
        'View your property with satellite imagery. Mark stands, trails, food plots, and boundaries. Share location data with your entire club.',
      color: 'amber',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Harvest Tracking',
      description:
        'Log every harvest with photos, measurements, and location data. Track club trends over seasons and build your trophy book.',
      color: 'green',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Member Management',
      description:
        'Invite members, assign roles, manage guests, and set permissions. Keep your club organized with clear member hierarchies.',
      color: 'amber',
    },
  ];

  const additionalFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safety Check-In',
      description: 'Know who is on the property at all times with check-in/check-out tracking.',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Notifications',
      description: 'Get alerts for bookings, harvests, and club activity that matters to you.',
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Photo Sharing',
      description: 'Share trail cam photos and harvest pics with your club in the feed.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Club Feed',
      description: 'Stay connected with a social feed for posts, updates, and discussions.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Scoring System',
      description: 'Score and compare harvests using standard measurement systems.',
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: 'Property Boundaries',
      description: 'Define and visualize your property lines on interactive maps.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile First',
      description: 'Full functionality on any device. Install as an app on your phone.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Offline Support',
      description: 'Access key features even without cell service in remote areas.',
    },
  ];

  const weatherFeatures = [
    { icon: <Sun className="w-5 h-5" />, label: 'Temperature' },
    { icon: <Moon className="w-5 h-5" />, label: 'Moon Phase' },
    { icon: <Wind className="w-5 h-5" />, label: 'Wind Speed' },
    { icon: <CloudRain className="w-5 h-5" />, label: 'Precipitation' },
  ];

  return (
    <div className="min-h-screen py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
          Powerful Features for{' '}
          <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Modern Hunting Clubs
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Everything you need to manage your hunting club, coordinate hunts, and build a thriving
          community of outdoor enthusiasts.
        </p>
      </motion.div>

      {/* Main Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6 mb-16"
      >
        {mainFeatures.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="glass-panel rounded-2xl p-8 hover:border-white/20 transition-all group"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                feature.color === 'green'
                  ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/20'
                  : 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20'
              } transition-colors`}
            >
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold font-heading mb-3">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">And Much More</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <h4 className="font-semibold mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weather Integration Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-panel-strong rounded-2xl p-8 text-center"
      >
        <h3 className="text-xl font-bold font-heading mb-4">Weather Integration</h3>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Make informed decisions with real-time weather data for your property location.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {weatherFeatures.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
            >
              <span className="text-amber-400">{item.icon}</span>
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesPage;
