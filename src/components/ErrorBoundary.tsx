import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0c08] flex items-center justify-center p-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Something Went Wrong</h2>
                                <p className="text-gray-400 text-sm">Unexpected error occurred</p>
                            </div>
                        </div>

                        {this.state.error && (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                                <p className="text-red-400 text-sm font-mono break-words">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                            >
                                Go Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all shadow-lg shadow-green-500/20"
                            >
                                Reload Page
                            </button>
                        </div>

                        <p className="text-gray-500 text-xs mt-6 text-center">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
