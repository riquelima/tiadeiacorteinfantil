import React from 'react';

export const CloudIcon = ({ className = "text-4xl" }: { className?: string }) => (
  <span className={className}>☁️</span>
);

export const StarIcon = ({ className = "text-3xl" }: { className?: string }) => (
  <span className={className}>⭐</span>
);

export const BalloonIcon = ({ className = "text-2xl" }: { className?: string }) => (
  <span className={className}>🎈</span>
);

export const SparkleIcon = ({ className = "text-2xl" }: { className?: string }) => (
  <span className={className}>✨</span>
);

export const ScissorsIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>✂️</span>
);

export const CakeIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>🎂</span>
);

export const HomeIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>🏠</span>
);

export const PhoneIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>📱</span>
);

export const CalendarIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>📅</span>
);

export const MoneyIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>💰</span>
);

export const HeartIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>💜</span>
);

export const PartyIcon = ({ className = "text-xl" }: { className?: string }) => (
  <span className={className}>🎉</span>
);

export const FloatingDecorations = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <CloudIcon className="absolute top-10 left-10 text-4xl animate-float" />
    <StarIcon className="absolute top-20 right-20 text-3xl animate-bounce-gentle" />
    <BalloonIcon className="absolute top-40 left-1/4 text-2xl animate-float" style={{ animationDelay: '1s' }} />
    <CloudIcon className="absolute bottom-20 right-10 text-3xl animate-bounce-gentle" style={{ animationDelay: '2s' }} />
    <SparkleIcon className="absolute bottom-40 left-20 text-2xl animate-float" style={{ animationDelay: '0.5s' }} />
  </div>
);
