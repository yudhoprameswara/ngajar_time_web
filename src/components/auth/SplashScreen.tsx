import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-primary to-primary-dark overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Decorative Graphics: Cincin Konsentris Top Right */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10 bg-white/[0.03] pointer-events-none" />
      <div className="absolute -top-6 -right-6 w-44 h-44 rounded-full border border-white/15 bg-white/[0.04] pointer-events-none" />
      
      {/* Ambient Orange Glow */}
      <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-accent/25 blur-2xl pointer-events-none" />

      {/* Decorative Graphics: Cincin Konsentris Bottom Left */}
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/5 bg-white/[0.02] pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full border border-white/10 bg-white/[0.03] pointer-events-none" />

      {/* Floating Accent lines */}
      <div className="absolute top-36 left-6 w-8 h-1 bg-white/20 rounded-full" />
      <div className="absolute top-40 left-6 w-4 h-1 bg-accent/40 rounded-full" />
      <div className="absolute bottom-36 right-8 w-10 h-1 bg-white/20 rounded-full" />

      {/* Center Brand Lockup */}
      <div className={`flex flex-col items-center justify-center text-center z-10 transition-all duration-1000 transform ${
        animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}>
        {/* Emblem Container */}
        <div className="w-28 h-28 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/25 shadow-2xl flex items-center justify-center mb-6">
          <img
            src="/assets/logo_emblem_white.png"
            alt="Ngajar Time Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Ngajar <span className="text-accent">Time</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm text-white/80 font-normal tracking-wide px-4">
          Kelola Les Privat & Invoice Lebih Mudah
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center text-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
        <span className="text-xs text-white/50 tracking-wider">Versi 1.0.0 (Web)</span>
      </div>
    </div>
  );
};
