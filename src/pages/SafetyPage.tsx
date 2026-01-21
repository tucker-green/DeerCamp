import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Map,
  Phone,
  Heart,
  Eye,
  Radio,
  Compass,
  Sun,
  ThermometerSun,
} from 'lucide-react';

const SafetyPage = () => {
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

  const safetyRules = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Identify Your Target',
      description:
        'Always positively identify your target and what is beyond it before taking any shot. Never shoot at sounds, movement, or colors.',
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: 'Know Your Surroundings',
      description:
        'Be aware of other hunters in your area. Use the DeerCamp check-in system to see who else is on the property.',
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: 'Communicate',
      description:
        'Let others know your hunting plans. Use the stand booking system so everyone knows where you\'ll be hunting.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Wear Blaze Orange',
      description:
        'During gun seasons, wear the required amount of blaze orange. It saves lives and is required by law in most states.',
    },
  ];

  const checkInBenefits = [
    'Other members know you\'re on the property',
    'Emergency contacts can be notified if needed',
    'Prevents stand conflicts in the field',
    'Creates a safety record for the club',
    'Family members can see your status',
  ];

  const emergencySteps = [
    {
      step: '1',
      title: 'Stay Calm',
      description: 'Assess the situation and take a moment to think clearly.',
    },
    {
      step: '2',
      title: 'Call 911',
      description: 'For any medical emergency, call emergency services immediately.',
    },
    {
      step: '3',
      title: 'Notify Club Members',
      description: 'Use the app to alert other members who may be able to help.',
    },
    {
      step: '4',
      title: 'Provide Location',
      description: 'Share your GPS coordinates from the app with emergency responders.',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Safety Guidelines</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Safety is our top priority. These guidelines help keep every member of your hunting club
          safe in the field.
        </p>
      </motion.div>

      {/* Safety Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-12 flex items-start gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-400 mb-1">Safety First, Always</h3>
          <p className="text-gray-300">
            No harvest is worth risking your life or the lives of others. When in doubt, don't
            shoot. There will always be another opportunity.
          </p>
        </div>
      </motion.div>

      {/* Core Safety Rules */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-6">Core Safety Rules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {safetyRules.map((rule, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-panel rounded-xl p-6 hover:border-white/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4">
                {rule.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{rule.title}</h3>
              <p className="text-gray-400">{rule.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Check-In System */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-2 gap-8 mb-16"
      >
        <div className="glass-panel-strong rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-heading">Check-In System</h2>
          </div>
          <p className="text-gray-400 mb-6">
            DeerCamp's check-in feature is designed to keep everyone safe. When you check in before
            heading to your stand, the entire club knows you're on the property.
          </p>
          <ul className="space-y-3">
            {checkInBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel-strong rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Map className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-heading">Know Before You Go</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Before heading to your stand, always check the Stand Board to see who else is hunting
            and where they'll be located.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Sun className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium">Check Weather Conditions</p>
                <p className="text-sm text-gray-400">
                  Extreme weather can create dangerous situations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ThermometerSun className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium">Dress Appropriately</p>
                <p className="text-sm text-gray-400">Hypothermia and heat stroke are real risks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium">Charge Your Phone</p>
                <p className="text-sm text-gray-400">
                  Keep your device charged for emergencies
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Emergency Procedures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400" />
          Emergency Procedures
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emergencySteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-red-500/5 border border-red-500/20 rounded-xl p-5"
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
      >
        <Phone className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold font-heading mb-2">In Case of Emergency</h3>
        <p className="text-gray-400 mb-4">
          For life-threatening emergencies, always call 911 first.
        </p>
        <div className="text-4xl font-bold text-red-400">911</div>
      </motion.div>
    </div>
  );
};

export default SafetyPage;
