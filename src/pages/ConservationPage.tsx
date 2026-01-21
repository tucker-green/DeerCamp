import { motion } from 'framer-motion';
import {
  TreePine,
  Leaf,
  Droplets,
  Bird,
  Mountain,
  Heart,
  Users,
  TrendingUp,
  Globe,
  Award,
} from 'lucide-react';

const ConservationPage = () => {
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

  const conservationPillars = [
    {
      icon: <TreePine className="w-8 h-8" />,
      title: 'Habitat Preservation',
      description:
        'Hunters are among the largest contributors to habitat conservation. Through license fees and taxes on equipment, billions of dollars fund wildlife habitat every year.',
      stat: '$1.1B+',
      statLabel: 'Annual conservation funding from hunters',
    },
    {
      icon: <Bird className="w-8 h-8" />,
      title: 'Wildlife Management',
      description:
        'Regulated hunting is a critical tool for wildlife management. It helps maintain healthy population levels and prevents overgrazing and habitat destruction.',
      stat: '300+',
      statLabel: 'Species managed through hunting programs',
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: 'Wetland Protection',
      description:
        'Duck stamps and waterfowl hunting licenses have protected millions of acres of wetlands, benefiting countless species beyond just game animals.',
      stat: '6M+',
      statLabel: 'Acres of wetlands protected',
    },
    {
      icon: <Mountain className="w-8 h-8" />,
      title: 'Public Land Access',
      description:
        'Hunter advocacy has been instrumental in keeping public lands open and accessible for all Americans to enjoy for generations.',
      stat: '640M',
      statLabel: 'Acres of public land preserved',
    },
  ];

  const howToHelp = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Buy Your License',
      description:
        'Hunting license fees directly fund state wildlife agencies and conservation programs.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Join Conservation Groups',
      description:
        'Organizations like RMEF, DU, and NWTF do incredible work protecting habitat.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Practice Ethical Hunting',
      description: 'Fair chase principles and respect for wildlife ensure sustainable populations.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Mentor New Hunters',
      description:
        'Passing down hunting traditions ensures future generations of conservationists.',
    },
    {
      icon: <TreePine className="w-6 h-6" />,
      title: 'Improve Your Property',
      description: 'Plant food plots, create water sources, and manage habitat on your land.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track & Report Data',
      description:
        'Use DeerCamp to log harvests. This data helps wildlife managers make informed decisions.',
    },
  ];

  const organizations = [
    { name: 'Rocky Mountain Elk Foundation', acronym: 'RMEF' },
    { name: 'Ducks Unlimited', acronym: 'DU' },
    { name: 'National Wild Turkey Federation', acronym: 'NWTF' },
    { name: 'Pheasants Forever', acronym: 'PF' },
    { name: 'Quality Deer Management Association', acronym: 'QDMA' },
    { name: 'Whitetails Unlimited', acronym: 'WU' },
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
          <Leaf className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-heading mb-4">Wildlife Conservation</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Hunters have been at the forefront of wildlife conservation for over a century. Learn
          about the North American Model of Wildlife Conservation and how hunting supports healthy
          ecosystems.
        </p>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl p-8 mb-12 text-center"
      >
        <blockquote className="text-xl md:text-2xl font-heading italic text-gray-300 mb-4">
          "In a civilized and cultivated country, wild animals only continue to exist at all when
          preserved by sportsmen."
        </blockquote>
        <cite className="text-green-400 font-medium">— Theodore Roosevelt</cite>
      </motion.div>

      {/* Conservation Pillars */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">
          The Hunter's Role in Conservation
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {conservationPillars.map((pillar, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-panel rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center flex-shrink-0">
                  {pillar.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-heading mb-2">{pillar.title}</h3>
                  <p className="text-gray-400 mb-4">{pillar.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-400">{pillar.stat}</span>
                    <span className="text-sm text-gray-500">{pillar.statLabel}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How to Help */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold font-heading mb-8 text-center">How You Can Help</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {howToHelp.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Organizations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel-strong rounded-2xl p-8"
      >
        <h3 className="text-xl font-bold font-heading mb-6 text-center">
          Conservation Organizations to Support
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {organizations.map((org, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm"
            >
              <span className="text-green-400 font-semibold">{org.acronym}</span>
              <span className="text-gray-400 ml-2 hidden sm:inline">— {org.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          These organizations work tirelessly to protect wildlife habitat and hunting traditions.
        </p>
      </motion.div>
    </div>
  );
};

export default ConservationPage;
