import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Shield,
  Scale,
  Ban,
  RefreshCw,
} from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = 'January 15, 2025';

  const sections = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '1. Acceptance of Terms',
      content: `By accessing or using DeerCamp ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all users, including club owners, administrators, members, and guests.`,
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '2. Account Registration',
      content: `To use DeerCamp, you must create an account and provide accurate information. You are responsible for maintaining the security of your account credentials and for all activities under your account. You must be at least 18 years old to create an account. If you are a minor, you may only use the Service under the supervision of a parent or guardian who agrees to these terms.`,
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '3. Acceptable Use',
      content: `You agree to use DeerCamp only for lawful purposes related to hunting club management. You must comply with all applicable federal, state, and local laws, including hunting regulations. You may not use the Service to:

• Violate any hunting laws or regulations
• Harass, abuse, or harm other users
• Post false or misleading information
• Attempt to gain unauthorized access to other accounts
• Upload malicious content or software
• Use the Service for any commercial purpose without authorization`,
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: '4. User Content',
      content: `You retain ownership of content you post to DeerCamp, including photos, harvest records, and club information. By posting content, you grant DeerCamp a non-exclusive, royalty-free license to use, display, and distribute your content within the Service.

You are solely responsible for your content and must ensure you have the right to share it. Content that violates these terms or applicable laws may be removed without notice.`,
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: '5. Club Ownership & Administration',
      content: `Club owners and administrators are responsible for managing their clubs in accordance with these terms. This includes:

• Setting and enforcing club rules
• Managing member access and permissions
• Ensuring club activities comply with applicable laws
• Resolving disputes between club members

DeerCamp is not responsible for disputes between club members or the actions of club administrators.`,
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: '6. Safety & Liability',
      content: `DeerCamp provides tools to help coordinate hunting activities, but we are not responsible for the safety of users in the field. Hunting is inherently dangerous, and users assume all risks associated with hunting activities.

The check-in/check-out feature is provided as a convenience and should not be relied upon as your sole safety measure. Always follow proper hunting safety protocols and local regulations.

DEERCAMP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL LIABILITY FOR INJURIES, ACCIDENTS, OR DAMAGES ARISING FROM HUNTING ACTIVITIES.`,
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: '7. Termination',
      content: `We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. Upon termination, your right to use the Service ceases immediately.

You may delete your account at any time through your account settings. Some information may be retained as required by law or for legitimate business purposes.`,
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: '8. Changes to Terms',
      content: `We may modify these terms at any time. We will notify users of significant changes via email or in-app notification. Your continued use of the Service after changes take effect constitutes acceptance of the modified terms.

We encourage you to review these terms periodically to stay informed of any updates.`,
    },
  ];

  const highlights = [
    'You must be 18+ to create an account',
    'Follow all applicable hunting laws',
    'You own your content but grant us license to display it',
    'Club admins are responsible for their clubs',
    'Hunting is dangerous - use safety features wisely',
    'We can terminate accounts that violate terms',
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
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Terms of Service</h1>
        <p className="text-gray-400">
          Last updated: {lastUpdated}
        </p>
      </motion.div>

      {/* Key Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 mb-8"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Key Points Summary
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {highlights.map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              {point}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                {section.icon}
              </div>
              <h2 className="text-lg font-bold font-heading">{section.title}</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Governing Law */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 glass-panel rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold font-heading mb-4">9. Governing Law</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          These terms are governed by the laws of the United States and the State of Texas, without
          regard to conflict of law principles. Any disputes arising from these terms or your use of
          DeerCamp shall be resolved in the state or federal courts located in Texas.
        </p>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 glass-panel-strong rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold font-heading mb-4">Questions?</h2>
        <p className="text-gray-400 text-sm mb-4">
          If you have questions about these Terms of Service, please contact us at:
        </p>
        <a
          href="mailto:legal@deercamp.com"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          legal@deercamp.com
        </a>
      </motion.div>
    </div>
  );
};

export default TermsPage;
