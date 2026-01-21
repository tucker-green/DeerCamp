import { motion } from 'framer-motion';
import { Cookie, Info, Settings, Shield, BarChart3, Globe } from 'lucide-react';

const CookiesPage = () => {
  const lastUpdated = 'January 15, 2025';

  const cookieTypes = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Essential Cookies',
      required: true,
      description:
        'These cookies are necessary for the website to function properly. They enable core functionality such as user authentication, session management, and security features.',
      examples: [
        'Authentication tokens to keep you logged in',
        'Session identifiers for security',
        'CSRF tokens to prevent cross-site attacks',
      ],
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Functional Cookies',
      required: false,
      description:
        'These cookies enable personalized features and remember your preferences to enhance your experience.',
      examples: [
        'Your preferred map view settings',
        'Language and region preferences',
        'Recently viewed stands and bookings',
      ],
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics Cookies',
      required: false,
      description:
        'These cookies help us understand how visitors interact with our website by collecting anonymous information about page visits and feature usage.',
      examples: [
        'Pages visited and time spent',
        'Features used most frequently',
        'Error reports and performance metrics',
      ],
    },
  ];

  const managingCookies = [
    {
      title: 'Browser Settings',
      description:
        'Most web browsers allow you to manage cookies through their settings. You can typically find these options in your browser\'s "Privacy" or "Security" settings.',
    },
    {
      title: 'Our Cookie Preferences',
      description:
        'You can manage non-essential cookies through your DeerCamp account settings. Essential cookies cannot be disabled as they are required for the service to function.',
    },
    {
      title: 'Impact of Disabling',
      description:
        'Disabling cookies may affect certain features of DeerCamp. For example, you may need to log in more frequently or your preferences may not be saved.',
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
          <Cookie className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Cookie Policy</h1>
        <p className="text-gray-400">
          Last updated: {lastUpdated}
        </p>
      </motion.div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold mb-2">What Are Cookies?</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help
              websites remember your preferences, keep you logged in, and understand how you use
              the site. DeerCamp uses cookies to provide a better experience and improve our
              service.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cookie Types */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold font-heading">Types of Cookies We Use</h2>
        {cookieTypes.map((type, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center flex-shrink-0">
                {type.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold font-heading">{type.title}</h3>
                  {type.required ? (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">
                      Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-white/10 text-gray-400 rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{type.description}</p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Examples:</p>
                  <ul className="space-y-1">
                    {type.examples.map((example, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Third-Party Cookies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-heading">Third-Party Services</h2>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          DeerCamp uses the following third-party services that may set their own cookies:
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="font-semibold text-sm mb-1">Firebase</p>
            <p className="text-xs text-gray-400">Authentication & database</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="font-semibold text-sm mb-1">Mapbox</p>
            <p className="text-xs text-gray-400">Interactive maps</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="font-semibold text-sm mb-1">Google Analytics</p>
            <p className="text-xs text-gray-400">Usage analytics</p>
          </div>
        </div>
      </motion.div>

      {/* Managing Cookies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold font-heading mb-6">Managing Your Cookies</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {managingCookies.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel-strong rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold font-heading mb-4">Questions About Cookies?</h2>
        <p className="text-gray-400 text-sm mb-4">
          If you have questions about our use of cookies or this policy, please contact us:
        </p>
        <a
          href="mailto:privacy@deercamp.com"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          privacy@deercamp.com
        </a>
      </motion.div>
    </div>
  );
};

export default CookiesPage;
