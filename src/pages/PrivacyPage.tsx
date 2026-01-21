import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Bell, Trash2, Mail, Globe } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = 'January 15, 2025';

  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Account Information',
          text: 'When you create an account, we collect your name, email address, and password. You may optionally provide a profile photo and phone number.',
        },
        {
          subtitle: 'Club & Activity Data',
          text: 'We collect information about your hunting clubs, stand bookings, harvest logs, and check-in/check-out records. This data is necessary to provide our core services.',
        },
        {
          subtitle: 'Location Data',
          text: 'With your permission, we collect location data to show your position on maps and record harvest locations. You can disable location services at any time.',
        },
        {
          subtitle: 'Device Information',
          text: 'We automatically collect device type, operating system, and browser information to optimize your experience and troubleshoot issues.',
        },
      ],
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Providing Services',
          text: 'We use your information to operate DeerCamp, including stand booking, harvest tracking, and club management features.',
        },
        {
          subtitle: 'Communication',
          text: 'We may send you notifications about bookings, club activity, and important service updates. You can manage notification preferences in your settings.',
        },
        {
          subtitle: 'Improvement',
          text: 'We analyze usage patterns to improve our services, fix bugs, and develop new features that benefit our community.',
        },
        {
          subtitle: 'Safety',
          text: 'We use check-in data to support safety features and may share location information with club members in emergency situations.',
        },
      ],
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'Within Your Club',
          text: 'Club members can see your bookings, check-in status, and posts you share to the club feed. Club admins have additional visibility into member activity.',
        },
        {
          subtitle: 'Third-Party Services',
          text: 'We use trusted third-party services for hosting (Google Cloud), authentication (Firebase), and maps (Mapbox). These services have their own privacy policies.',
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose information if required by law or to protect the safety of our users and the public.',
        },
        {
          subtitle: 'No Selling of Data',
          text: 'We do not sell your personal information to advertisers or data brokers. Your data is used solely to provide and improve DeerCamp.',
        },
      ],
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Encryption',
          text: 'All data is encrypted in transit using TLS and at rest using industry-standard encryption. Your password is hashed and never stored in plain text.',
        },
        {
          subtitle: 'Access Controls',
          text: 'We implement strict access controls to ensure only authorized personnel can access user data, and only when necessary for support or legal compliance.',
        },
        {
          subtitle: 'Regular Audits',
          text: 'We regularly review our security practices and conduct vulnerability assessments to protect your information.',
        },
      ],
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Your Rights & Choices',
      content: [
        {
          subtitle: 'Access & Portability',
          text: 'You can access and download your data at any time through your account settings. We provide your data in a portable format.',
        },
        {
          subtitle: 'Correction',
          text: 'You can update your profile information and correct any inaccuracies at any time through the app.',
        },
        {
          subtitle: 'Deletion',
          text: 'You can request deletion of your account and associated data. Some data may be retained for legal compliance or legitimate business purposes.',
        },
        {
          subtitle: 'Opt-Out',
          text: 'You can opt out of non-essential communications and disable location tracking at any time.',
        },
      ],
    },
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: 'Data Retention',
      content: [
        {
          subtitle: 'Active Accounts',
          text: 'We retain your data as long as your account is active. Harvest records and club history are kept to maintain the integrity of club records.',
        },
        {
          subtitle: 'Deleted Accounts',
          text: 'When you delete your account, we remove your personal information within 30 days. Some anonymized data may be retained for analytics.',
        },
        {
          subtitle: 'Backups',
          text: 'Backup copies of data may persist for up to 90 days after deletion as part of our disaster recovery processes.',
        },
      ],
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
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Privacy Policy</h1>
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
        <p className="text-gray-300 leading-relaxed">
          At DeerCamp, we take your privacy seriously. This policy explains how we collect, use,
          and protect your personal information when you use our hunting club management platform.
          We believe in transparency and want you to understand exactly how your data is handled.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIndex * 0.1 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                {section.icon}
              </div>
              <h2 className="text-xl font-bold font-heading">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <h3 className="font-semibold text-white mb-1">{item.subtitle}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 glass-panel-strong rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold font-heading">Contact Us</h2>
        </div>
        <p className="text-gray-400 mb-4">
          If you have questions about this privacy policy or how we handle your data, please
          contact us:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:privacy@deercamp.com"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <Mail className="w-4 h-4" />
            privacy@deercamp.com
          </a>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-2 text-gray-400">
            <Globe className="w-4 h-4" />
            DeerCamp, Inc. — United States
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;
