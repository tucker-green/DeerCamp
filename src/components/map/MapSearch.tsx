import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { MAPBOX_CONFIG } from '../../config/mapboxConfig';

interface MapSearchProps {
    onLocationSelect: (lng: number, lat: number) => void;
    className?: string;
}

interface Suggestion {
    id: string;
    place_name: string;
    center: [number, number];
}

const MapSearch = ({ onLocationSelect, className = '' }: MapSearchProps) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const parseCoordinates = (input: string): [number, number] | null => {
        // Regular expression for latitude and longitude
        // Matches: 35.123, -90.123 or 35.123 -90.123
        const coordRegex = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)|(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/;
        const match = input.match(coordRegex);

        if (match) {
            const lat = parseFloat(match[1] || match[3]);
            const lng = parseFloat(match[2] || match[4]);

            // Basic validation for lat/lng ranges
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return [lng, lat];
            }
        }
        return null;
    };

    const handleSearch = async (value: string) => {
        setQuery(value);

        if (value.length < 3) {
            setSuggestions([]);
            return;
        }

        // Check if it's coordinates first
        if (parseCoordinates(value)) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_CONFIG.accessToken}&limit=5`
            );
            const data = await response.json();

            if (data.features) {
                const formattedSuggestions = data.features.map((f: any) => ({
                    id: f.id,
                    place_name: f.place_name,
                    center: f.center,
                }));
                setSuggestions(formattedSuggestions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectSuggestion = (suggestion: Suggestion) => {
        setQuery(suggestion.place_name);
        setShowSuggestions(false);
        onLocationSelect(suggestion.center[0], suggestion.center[1]);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        const coords = parseCoordinates(query);
        if (coords) {
            onLocationSelect(coords[0], coords[1]);
            setShowSuggestions(false);
        } else if (suggestions.length > 0 && selectedIndex >= 0) {
            selectSuggestion(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
            selectSuggestion(suggestions[0]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative z-10 w-full sm:w-96 ${className}`}>
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    )}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                    placeholder="Coordinates or address..."
                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-xl"
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            setShowSuggestions(false);
                        }}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="mt-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.id}
                            onClick={() => selectSuggestion(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-200 line-clamp-2">{suggestion.place_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MapSearch;
