import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpcomingEvents, formatEventDate, isEventToday, isEventSoon } from '../../hooks/useEvents';
import type { Event } from '../../types';

interface UpcomingEventsCardProps {
  maxEvents?: number;
}

const EventItem = ({ event }: { event: Event }) => {
  const today = isEventToday(event.startTime);
  const soon = isEventSoon(event.startTime);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
    >
      {/* Date badge */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
        today ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'
      }`}>
        <span className={`text-[10px] uppercase font-bold ${today ? 'text-emerald-400' : 'text-gray-500'}`}>
          {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className={`text-lg font-bold ${today ? 'text-emerald-400' : 'text-white'}`}>
          {new Date(event.startTime).getDate()}
        </span>
      </div>

      {/* Event details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
          {today && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
              Today
            </span>
          )}
          {soon && !today && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400">
              Soon
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {formatEventDate(event.startTime, event.endTime, event.allDay)}
          </span>
        </div>

        {event.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin size={12} />
            {event.location}
          </span>
        )}

        {event.rsvpEnabled && (
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={12} />
              {event.goingCount} going
            </span>
            {event.maybeCount > 0 && (
              <span className="text-xs text-gray-500">
                · {event.maybeCount} maybe
              </span>
            )}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
    </motion.div>
  );
};

const UpcomingEventsCard = ({ maxEvents = 3 }: UpcomingEventsCardProps) => {
  const { events, loading } = useUpcomingEvents(maxEvents);
  const navigate = useNavigate();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong p-5 rounded-2xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel-strong p-5 rounded-2xl border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Upcoming Events</h3>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming events</p>
          <button
            onClick={() => navigate('/events/new')}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Create an Event
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, maxEvents).map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
            >
              <EventItem event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UpcomingEventsCard;
