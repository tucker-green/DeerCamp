import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Heart,
  Award,
  Camera,
  Map,
  Calendar,
  Share2,
  Star,
  Trophy,
  Target,
  Flame,
} from 'lucide-react';

const CommunityPage = () => {
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

  const communityFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Club Feed',
      description:
        'Share updates, photos, and stories with your club members. Celebrate harvests, coordinate hunts, and stay connected.',
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Photo Sharing',
      description:
        'Post trail cam photos, harvest pics, and property updates. Build a visual history of your club\'s seasons.',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Trophy Book',
      description:
        'Document and showcase your club\'s best harvests. Track scores, measurements, and create a legacy.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Event Planning',
      description:
        'Coordinate club meetings, work days, and special hunts. Keep everyone on the same page.',
    },
  ];

  const communityValues = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Respect',
      description: 'For wildlife, property, and fellow hunters',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Fair Chase',
      description: 'Ethical hunting practices always',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Camaraderie',
      description: 'Building lasting friendships',
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: 'Tradition',
      description: 'Passing down our heritage',
    },
  ];

  const testimonials = [
    {
      quote:
        'DeerCamp brought our club together like never before. The stand booking alone ended years of confusion.',
      author: 'Mike R.',
      role: 'Club President',
      members: '15 members',
    },
    {
      quote:
        'Being able to see who harvested what and where has helped us make better management decisions.',
      author: 'Sarah T.',
      role: 'Wildlife Biologist',
      members: '23 members',
    },
    {
      quote:
        'My kids love scrolling through the feed and seeing what\'s happening at camp. It keeps them connected even when we can\'t be there.',
      author: 'John D.',
      role: 'Club Member',
      members: '8 members',
    },
  ];

  const stats = [
    { value: '1,000+', label: 'Active Clubs' },
    { value: '15,000+', label: 'Club Members' },
    { value: '50,000+', label: 'Harvests Logged' },
    { value: '500K+', label: 'Photos Shared' },
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
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Our Community</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Join thousands of hunting clubs using DeerCamp to stay connected, coordinate hunts, and
          build lasting traditions.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-panel rounded-xl p-6 text-center"
          >
            <div className="text-3xl font-bold text-green-400 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Community Features */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">Stay Connected</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {communityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-panel rounded-2xl p-6 hover:border-white/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Community Values */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {communityValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                {value.icon}
              </div>
              <h4 className="font-semibold mb-1">{value.title}</h4>
              <p className="text-sm text-gray-400">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">What Clubs Are Saying</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glass-panel-strong rounded-2xl p-6"
            >
              <div className="flex gap-1 text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-300 mb-4 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-xs text-gray-400">
                    {testimonial.role} • {testimonial.members}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel-strong rounded-2xl p-8 text-center"
      >
        <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold font-heading mb-2">Join the Community</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Create your club today and join thousands of hunters already using DeerCamp to manage
          their camps.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/clubs/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
          >
            <Users className="w-5 h-5" />
            Create Your Club
          </a>
          <a
            href="/clubs/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Join Existing Club
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
