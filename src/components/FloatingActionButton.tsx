import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MessageSquare, Target, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  onNewPost?: () => void;
}

const defaultActions: FABAction[] = [
  {
    id: 'new-post',
    label: 'New Post',
    icon: <MessageSquare size={20} />,
  },
  {
    id: 'record-harvest',
    label: 'Record Harvest',
    icon: <Target size={20} />,
    href: '/harvest',
  },
  {
    id: 'book-stand',
    label: 'Book a Stand',
    icon: <Calendar size={20} />,
    href: '/bookings/new',
  },
  {
    id: 'check-in',
    label: 'Check In/Out',
    icon: <MapPin size={20} />,
    href: '/check-in',
  },
];

const FloatingActionButton = ({ actions = defaultActions, onNewPost }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleActionClick = useCallback((action: FABAction) => {
    setIsOpen(false);
    
    if (action.id === 'new-post' && onNewPost) {
      onNewPost();
    } else if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  }, [navigate, onNewPost]);

  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* FAB Container - relative on mobile (parent handles position), fixed on desktop */}
      <div className="relative sm:fixed sm:z-50 sm:bottom-6 sm:right-6">
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 flex flex-col items-center sm:items-end gap-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 10, 
                    scale: 0.8,
                    transition: { 
                      delay: (actions.length - index - 1) * 0.03,
                      duration: 0.15
                    }
                  }}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-3 group"
                  aria-label={action.label}
                >
                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 + 0.1 } }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white whitespace-nowrap shadow-lg"
                  >
                    {action.label}
                  </motion.span>

                  {/* Icon button */}
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors">
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0a0c08]"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md" />
          
          {/* Icon with rotation */}
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative z-10"
          >
            {isOpen ? <X size={24} /> : <Plus size={24} />}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingActionButton;
