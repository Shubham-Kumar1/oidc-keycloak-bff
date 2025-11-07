'use client';

import { useEffect, useState } from 'react';

interface TokenCountdownProps {
  expiresAt?: number;
  onRefresh?: () => void;
}

export default function TokenCountdown({ expiresAt, onRefresh }: TokenCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiresAt - now;
      
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
      } else {
        setIsExpired(false);
        setTimeLeft(remaining);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const shouldWarn = timeLeft < 300; // Warn if less than 5 minutes

  return (
    <div className={`flex items-center gap-2 ${shouldWarn ? 'text-yellow-400' : 'text-slate-300'}`}>
      <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : shouldWarn ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
      <span className="text-sm">
        {isExpired ? 'Expired' : `${minutes}m ${seconds}s`}
      </span>
      {shouldWarn && !isExpired && onRefresh && (
        <button
          onClick={onRefresh}
          className="text-xs text-brand-400 hover:underline ml-2"
        >
          Refresh
        </button>
      )}
    </div>
  );
}

