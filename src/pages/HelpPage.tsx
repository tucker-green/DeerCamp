import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Book,
  MessageSquare,
  Mail,
  Calendar,
  Users,
  Map,
  Target,
  Shield,
  Search,
} from 'lucide-react';

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Stand Booking',
      description: 'Learn how to reserve stands and manage your bookings',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Club Management',
      description: 'Managing members, roles, and club settings',
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: 'Maps & Property',
      description: 'Using interactive maps and marking locations',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Harvest Logging',
      description: 'Recording and tracking your harvests',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safety Features',
      description: 'Check-in/out and safety protocols',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Club Feed',
      description: 'Posting updates and communicating',
    },
  ];

  const faqs = [
    {
      question: 'How do I create a new hunting club?',
      answer:
        'After signing in, click "Create Club" from the dashboard or club switcher. Enter your club name, add a description, and invite your first members. You\'ll be set as the club owner with full admin privileges.',
    },
    {
      question: 'How do I book a hunting stand?',
      answer:
        'Navigate to the Stand Board from the main menu. Select your desired date and time slot, choose an available stand from the map or list view, and confirm your reservation. You\'ll receive a notification confirming your booking.',
    },
    {
      question: 'Can I invite guests to hunt on specific days?',
      answer:
        'Yes! Club admins and owners can invite guests through the Members section. Guests can be given temporary access for specific dates. They\'ll receive an invitation link and can book stands during their approved visit window.',
    },
    {
      question: 'How do I log a harvest?',
      answer:
        'Go to the Harvests page and click "Log Harvest." Fill in the details including species, location, date, and optional measurements. You can upload photos and the harvest will appear in your club\'s feed and trophy book.',
    },
    {
      question: 'What happens if someone else has booked my usual stand?',
      answer:
        'The Stand Board shows real-time availability. If your preferred stand is booked, you\'ll see who reserved it. Consider reaching out through the club feed to coordinate, or choose an alternative stand for that time.',
    },
    {
      question: 'How does the check-in/check-out system work?',
      answer:
        'Before heading to your stand, use the Check-In feature to let others know you\'re on the property. When you leave, check out. This helps maintain safety awareness and prevents conflicts in the field.',
    },
    {
      question: 'Can I use DeerCamp offline?',
      answer:
        'Yes! DeerCamp works as a Progressive Web App (PWA). Install it on your phone for offline access to key features like maps and your booking schedule. Data syncs when you regain connection.',
    },
    {
      question: 'How do I change my club\'s settings?',
      answer:
        'Club owners and admins can access settings through the Club page. Here you can update the club name, manage member roles, set booking rules, and configure notification preferences.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Help Center</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Find answers to common questions and learn how to get the most out of DeerCamp.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl mx-auto mb-12"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16"
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="glass-panel rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors">
              {category.icon}
            </div>
            <h3 className="font-semibold mb-1">{category.title}</h3>
            <p className="text-sm text-gray-400">{category.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
          <Book className="w-6 h-6 text-green-400" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-400 border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16 glass-panel-strong rounded-2xl p-8 text-center"
      >
        <h3 className="text-xl font-bold font-heading mb-2">Still Need Help?</h3>
        <p className="text-gray-400 mb-6">
          Our support team is here to help you get the most out of DeerCamp.
        </p>
        <a
          href="mailto:support@deercamp.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
        >
          <Mail className="w-5 h-5" />
          Contact Support
        </a>
      </motion.div>
    </div>
  );
};

export default HelpPage;
