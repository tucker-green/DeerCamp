import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date) => void;
    minDate?: Date;
    label?: string;
    required?: boolean;
}

export default function DatePicker({ selectedDate, onChange, minDate, label, required }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const handleDateClick = (day: Date) => {
        // Prevent selecting disabled dates
        if (minDate && isBefore(day, startOfDay(minDate))) {
            return;
        }

        // Create a new Date object from the year, month, and day to avoid timezone conversion
        // This effectively sets it to local 00:00:00
        const localDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        onChange(localDate);
        setIsOpen(false);
    };

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
            )}

            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-black/50 border rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all group ${isOpen
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : 'border-white/10 hover:border-white/20'
                    }`}
            >
                <div className={`flex items-center gap-3 ${!selectedDate ? 'text-gray-500' : 'text-white'}`}>
                    <CalendarIcon size={20} className={isOpen ? 'text-green-400' : 'text-gray-400'} />
                    <span className="font-medium">
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                    </span>
                </div>
            </div>

            {/* Dropdown Calendar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 pointer-events-none"
                    >
                        {/* Actual interactive container needs pointer-events-auto */}
                        <div className="bg-[#1a1d16] border border-white/10 rounded-xl shadow-2xl p-4 pointer-events-auto backdrop-blur-xl">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); prevMonth(); }}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h3 className="text-white font-bold font-heading">
                                    {format(viewDate, 'MMMM yyyy')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); nextMonth(); }}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Days Header */}
                            <div className="grid grid-cols-7 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div key={`${day}-${i}`} className="text-center text-xs font-bold text-gray-500 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, idx) => {
                                    const isDisabled = minDate && isBefore(day, startOfDay(minDate));
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isCurrentMonth = isSameMonth(day, viewDate);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <button
                                            type="button"
                                            key={day.toISOString()}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDateClick(day);
                                            }}
                                            disabled={isDisabled}
                                            className={`
                                                relative h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                                                ${!isCurrentMonth ? 'text-gray-700' : ''}
                                                ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}
                                                ${isSelected
                                                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/50'
                                                    : isCurrentMonth && !isDisabled ? 'text-gray-300' : ''}
                                                ${isTodayDate && !isSelected ? 'text-green-400 ring-1 ring-green-500/50' : ''}
                                            `}
                                        >
                                            {format(day, 'd')}
                                            {isTodayDate && !isSelected && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
