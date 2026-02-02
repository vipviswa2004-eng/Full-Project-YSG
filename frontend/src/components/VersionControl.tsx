import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const VersionControl: React.FC = () => {
    const serverVersionRef = useRef<string | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Function to fetch the current version from the server
        const checkVersion = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/app-version`);
                if (!res.ok) return;

                const data = await res.json();
                const currentVersion = data.version;

                // Initial load
                if (serverVersionRef.current === null) {
                    serverVersionRef.current = currentVersion;
                    return;
                }

                // Subsequent checks
                if (serverVersionRef.current !== currentVersion) {
                    setUpdateAvailable(true);
                    // If a new update comes (e.g. another deploy), we might want to un-dismiss
                    // but usually once dismissed for a session, we can leave it dismissed or reset.
                    // For now, let's reset dismiss if a *new* version comes (different from previous detected)
                    // but here we just check vs initial.
                }
            } catch (error) {
                console.error("Version check failed", error);
            }
        };

        // Check immediately on mount
        checkVersion();

        // Check every 2 minutes (120 seconds) to reduce server load
        const interval = setInterval(checkVersion, 120000);

        // Also check when window regains focus (user comes back to tab)
        const onFocus = () => checkVersion();
        window.addEventListener('focus', onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    if (!updateAvailable || isDismissed) return null;

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-2">
            <button
                onClick={handleRefresh}
                className="bg-gray-900/95 text-white backdrop-blur-md pl-4 pr-5 py-3 rounded-full shadow-xl flex items-center gap-3 hover:bg-black transition-all border border-gray-700/50 group"
            >
                <div className="relative">
                    <RefreshCw className="w-4 h-4 text-theme-primary animate-spin-slow" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">New update available</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">Tap to refresh</span>
                </div>
            </button>

            <button
                onClick={() => setIsDismissed(true)}
                className="bg-white/90 text-gray-500 hover:text-gray-900 backdrop-blur-md p-2 rounded-full shadow-lg border border-gray-200 hover:bg-white transition-all h-[46px] w-[46px] flex items-center justify-center -ml-4 z-[-1]"
                aria-label="Dismiss update"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
