import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart,
  Stars,
  Music,
  Camera,
  ArrowLeft,
  Gift,
  Wind,
  Mail,
  Clock,
  MapPin,
  Home,
  Zap,
  Star
} from 'lucide-react';

/**
 * FULL PATCHED APP
 *
 * Key fixes included:
 * - Constellation node positioning now uses percentage strings (left/top: `${x}%`).
 * - No Lucide icon nested inside an inline <svg> (FallingMail and CutePenguin heart replaced with inline <path> shapes).
 * - Confetti is memoized and only created when enabled.
 * - Replaced dynamic Tailwind w-${size} usage with inline style width/height values.
 * - Renamed isPandaHugging -> isPenguinHugging for clarity.
 * - Accessibility: added aria-labels, role="button", tabIndex and keyboard handlers for interactive divs.
 * - Added prefers-reduced-motion CSS to respect user motion preferences.
 * - Minor performance improvements (lowered default particle counts).
 *
 * If you want the file split into smaller components, I can do that next.
 */

/* --- Utility Components & Small Inline SVGs (safe inside other SVGs) --- */

// FallingMail (no lucide Heart nested inside this svg)
const FallingMail = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 animate-fall-mail" aria-hidden>
    <rect x="50" y="100" width="100" height="70" rx="10" fill="#FFF" stroke="#9D174D" strokeWidth="4" />
    <polygon points="50,100 100,135 150,100" fill="#9D174D" />
    <line x1="50" y1="100" x2="150" y2="170" stroke="#9D174D" strokeWidth="2" />
    <line x1="150" y1="100" x2="50" y2="170" stroke="#9D174D" strokeWidth="2" />

    {/* small heart as a path (positioned visually near the center of envelope) */}
    <g transform="translate(85,107) scale(0.8)">
      <path
        d="M8 3
           C6.5 -1, 0 -0.5, 0 3
           C0 7, 8 11.5, 8 11.5
           C8 11.5, 16 7, 16 3
           C16 -0.5, 9.5 -1, 8 3 Z"
        fill="#F43F5E"
        stroke="#9D174D"
        strokeWidth="0.2"
      />
    </g>
  </svg>
);

// HeartEmitter uses lucide icons placed as DOM elements (not nested in an inline svg)
const HeartEmitter = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50" aria-hidden>
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-heart-float"
          style={{
            left: `${Math.random() * 10 + 45}%`,
            bottom: `${Math.random() * 10 + 30}%`,
            animationDuration: `${Math.random() * 2 + 1.5}s`,
            animationDelay: `${Math.random() * 1.5}s`,
            transform: `translateX(${(Math.random() - 0.5) * 20}px)`
          }}
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </div>
      ))}
    </div>
  );
};

// CutePenguin - replaced lucide Heart on chest with inline path to avoid nested SVG issues
const CutePenguin = ({ onClick, isHugging }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onClick();
    }}
    className={`w-40 h-40 transition-transform duration-300 cursor-pointer ${isHugging ? 'scale-110' : 'hover:scale-105'} select-none`}
    aria-label="Cute penguin, click for a hug"
  >
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
      {/* Body (Black) */}
      <path d="M 50 10 C 20 15, 20 85, 50 90 C 80 85, 80 15, 50 10 Z" fill="#1F2937" stroke="#000" strokeWidth="2" />

      {/* Belly (White) */}
      <ellipse cx="50" cy="55" rx="20" ry="35" fill="#FFF" />

      {/* Head/Face (Black) */}
      <circle cx="50" cy="30" r="25" fill="#1F2937" />

      {/* White mask/eyes area */}
      <path d="M 50 10 C 40 20, 30 30, 40 40 L 60 40 C 70 30, 60 20, 50 10 Z" fill="#FFF" />

      {/* Eyes */}
      <circle cx="43" cy="30" r="3" fill="#000" />
      <circle cx="57" cy="30" r="3" fill="#000" />

      {/* Beak (Orange/Yellow) */}
      <polygon points="50,40 55,45 50,50 45,45" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />

      {/* Wings (Flippers) */}
      <path d="M 25 45 L 10 55 L 25 70 Z" fill="#1F2937" stroke="#000" strokeWidth="1" />
      <path d="M 75 45 L 90 55 L 75 70 Z" fill="#1F2937" stroke="#000" strokeWidth="1" />

      {/* Heart on chest (inline path) */}
      <g transform={`translate(40,60) scale(${isHugging ? 1.5 : 1})`} style={{ transition: 'transform 0.3s ease' }}>
        <path
          d="M8 3
             C6.5 -1, 0 -0.5, 0 3
             C0 7, 8 11.5, 8 11.5
             C8 11.5, 16 7, 16 3
             C16 -0.5, 9.5 -1, 8 3 Z"
          fill="#ef4444"
          transform="translate(-8,-8) scale(0.8)"
        />
      </g>
    </svg>
  </div>
);

// LoveTree component - uses inline styles for width/height rather than dynamic Tailwind classes
const LoveTree = ({ color, date, special, x, y, isVisible, isHovered, onHover, onLeave }) => {
  const size = special ? 18 : 12;
  return (
    <div
      className="absolute z-20 cursor-pointer transition-transform duration-500"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity: isVisible ? 1 : 0,
        transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
        filter: isHovered || special ? `drop-shadow(0 0 5px ${color})` : 'none',
        transitionDelay: `${Math.random() * 0.5}s`
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onHover && onHover()}
      aria-label={`Love tree ${date}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden style={{ width: `${size}px`, height: `${size}px` }}>
        <path
          d="M12 21s-6-4.35-8-7.1C1.9 11.9 4 8 8 8c1.7 0 2.9 1.1 4 2.5 1.1-1.4 2.3-2.5 4-2.5 4 0 6.1 3.9 4 5.9-2 2.75-8 7.1-8 7.1z"
          fill={color}
        />
      </svg>

      {/* Date Label (Tooltip) */}
      <div
        className="absolute p-1 whitespace-nowrap text-xs font-bold rounded bg-gray-900/90 text-white transition-opacity duration-300"
        style={{
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: isHovered ? 1 : 0
        }}
      >
        {date}
      </div>
    </div>
  );
};

const PineTree = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden>
    <path d="M 50 10 L 10 90 H 90 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
    <rect x="45" y="90" width="10" height="10" fill="#475569" />
  </svg>
);

const CuteBoy = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 absolute bottom-0 left-4 animate-bounce-slow" aria-hidden>
    <circle cx="50" cy="50" r="40" fill="#fecaca" />
    <circle cx="35" cy="45" r="3" fill="#000" />
    <circle cx="65" cy="45" r="3" fill="#000" />
    <path d="M 35 60 C 40 70, 60 70, 65 60" fill="#E53935" />
    <path d="M 30 60 Q 50 78 70 60" stroke="#000" strokeWidth="2" fill="none" />
    <circle cx="30" cy="55" r="8" fill="#fda4af" opacity="0.8" />
    <circle cx="70" cy="55" r="8" fill="#fda4af" opacity="0.8" />
    <path d="M 10 50 Q 50 10 90 50 L 80 50 L 20 50 Z" fill="#7f1d1d" />
    <rect x="25" y="80" width="50" height="20" fill="#991b1b" />
  </svg>
);

const CatPeeking = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 absolute bottom-0 right-12 translate-x-1/2" aria-hidden>
    <path d="M 20 100 L 20 50 Q 50 30 80 50 L 80 100 Z" fill="#fff" stroke="#000" strokeWidth="2" />
    <polygon points="20,50 30,20 50,50" fill="#fff" stroke="#000" strokeWidth="2" />
    <polygon points="80,50 70,20 50,50" fill="#ea580c" stroke="#000" strokeWidth="2" />
    <circle cx="40" cy="60" r="3" fill="#000" />
    <circle cx="60" cy="60" r="3" fill="#000" />
    <path d="M 45 70 Q 50 75 55 70" stroke="#000" fill="none" />
  </svg>
);

/* --- Confetti (memoized & conditional) --- */
const LoveConfetti = ({ type = 'hearts', enabled = true }) => {
  const particles = useMemo(() => {
    if (!enabled) return [];
    const list = [];
    const count = type === 'hearts' ? 18 : 30; // limit for performance

    for (let i = 0; i < count; i++) {
      const isHeart = Math.random() < 0.45;
      const color = ['#F87171', '#FDA4AF', '#FBCFE8', '#F59E0B'][Math.floor(Math.random() * 4)];

      if (type === 'hearts' && isHeart) {
        list.push(
          <div
            key={`h-${i}`}
            className="absolute animate-love-fall"
            style={{
              width: `${Math.random() * 10 + 14}px`,
              height: `${Math.random() * 10 + 14}px`,
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              animationDuration: `${Math.random() * 5 + 6}s`,
              animationDelay: `${Math.random() * 6}s`,
              opacity: 0.95,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
            aria-hidden
          >
            <Heart className="w-full h-full" style={{ fill: color, color }} />
          </div>
        );
      } else if (type === 'streamers') {
        const isStreamer = Math.random() < 0.5;

        list.push(
          <div
            key={`s-${i}`}
            className={`absolute ${isStreamer ? 'rounded-sm' : 'rounded-full'} animate-burst`}
            style={{
              width: isStreamer ? `${Math.random() * 6 + 2}px` : `${Math.random() * 6 + 4}px`,
              height: isStreamer ? `${Math.random() * 24 + 12}px` : `${Math.random() * 6 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              backgroundColor: color,
              animationDuration: `${Math.random() * 1 + 1.2}s`,
              animationDelay: `${Math.random() * 0.8}s`
            }}
            aria-hidden
          />
        );
      } else {
        list.push(
          <div
            key={`c-${i}`}
            className="absolute rounded-full animate-fall"
            style={{
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              backgroundColor: color,
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              animationDuration: `${Math.random() * 3 + 4}s`,
              animationDelay: `${Math.random() * 4}s`,
              opacity: 0.9
            }}
            aria-hidden
          />
        );
      }
    }

    return list;
  }, [type, enabled]);

  if (!enabled) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles}
    </div>
  );
};

/* --- Timeline Marker component (small utility) --- */
const TimelineMarker = ({ icon: Icon, title, message }) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative w-full py-4 px-2 hover:bg-white/10 rounded-lg transition"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex items-center gap-4 cursor-pointer">
        <Icon className="w-8 h-8 text-pink-300 shrink-0" />
        <div className="flex flex-col text-left">
          <p className="font-bold text-xl text-white">{title}</p>
          <p className="text-pink-200 text-sm italic">{message}</p>
        </div>
      </div>

      {/* Extended Message Popup */}
      {show && (
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-800 rounded-lg shadow-xl whitespace-nowrap z-30 transition-opacity duration-300">
          {title}
        </div>
      )}
    </div>
  );
};

/* --- Milestone Data (unchanged but used in Constellation) --- */
const MilestoneData = [
  { date: 'Aug 29', special: true, color: '#FFD700' },
  { date: 'Aug 31', special: false, color: '#000000' },
  { date: 'Sept 5', special: false, color: '#A0A0A0' },
  { date: 'Sept 6', special: false, color: '#404040' },
  { date: 'Sept 7', special: false, color: '#008000' },
  { date: 'Sept 8', special: true, color: '#20B2AA' },
  { date: 'Sept 15', special: false, color: '#A0A0A0' },
  { date: 'Sept 16', special: false, color: '#A52A2A' },
  { date: 'Sept 26', special: false, color: '#EE82EE' },
  { date: 'Sept 27', special: false, color: '#FFFF00' },
  { date: 'Sept 28', special: true, color: '#008000' },
  { date: 'Oct 6', special: true, color: '#800080' },
  { date: 'Oct 18', special: false, color: '#0000FF' },
  { date: 'Nov 1', special: false, color: '#FF0000' },
  { date: 'Nov 2', special: false, color: '#00008B' },
  { date: 'Nov 3', special: false, color: '#FFD700' },
  { date: 'Nov 8', special: false, color: '#800000' },
  { date: 'Nov 9', special: false, color: '#FF0000' },
  { date: 'Nov 15', special: true, color: '#008000' },
  { date: 'Nov 16', special: false, color: '#20B2AA' },
  { date: 'Nov 21', special: false, color: '#A0A0A0' },
  { date: 'Nov 22', special: false, color: '#A52A2A' },
  { date: 'Nov 23', special: false, color: '#FF0000' },
  { date: 'Dec 1', special: false, color: '#A0A0A0' }
];

/* --- Main App --- */
export default function App() {
  const [step, setStep] = useState('parachute');
  const [openedGifts, setOpenedGifts] = useState({
    bouquet: false,
    memories: false,
    promise: false,
    timeline: false,
    path: false
  });
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Penguin hugging state (renamed from panda)
  const [isPenguinHugging, setIsPenguinHugging] = useState(false);

  // Train state (kept)
  const [isTrainMoving, setIsTrainMoving] = useState(false);
  const startTrainJourney = () => setIsTrainMoving(true);

  // Constants
  const bouquetReasons = [
    'For surviving my daily voice notes.',
    "For always hyping me up like I'm Beyoncé.",
    "For listening to my overthinking TED Talks.",
    'For being the calm in my chaos.',
    'For existing exactly.'
  ];

  const allOpened = openedGifts.bouquet && openedGifts.memories && openedGifts.promise && openedGifts.timeline && openedGifts.path;

  const handleNextStep = (next) => {
    setStep(next);
  };

  const markGiftOpened = (gift) => {
    setOpenedGifts((prev) => ({ ...prev, [gift]: true }));
  };

  /* ---------- SCENES ---------- */

  // 1. Mail Fall Scene
  const MailFallScene = () => (
    <div
      className="h-screen w-full bg-gradient-to-br from-pink-300 to-rose-400 flex flex-col items-center justify-center relative overflow-hidden text-white cursor-pointer animate-scene-entry"
      role="button"
      tabIndex={0}
      aria-label="Open mail fall scene"
      onClick={() => {
        handleNextStep('envelope_animation');
        setShowConfetti(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNextStep('envelope_animation');
          setShowConfetti(false);
        }
      }}
    >
      <LoveConfetti type="hearts" enabled={showConfetti} />
      <Stars className="absolute top-10 right-10 text-pink-700 w-8 h-8 opacity-70 animate-spin-slow" />
      <Stars className="absolute bottom-10 left-20 text-pink-700 w-6 h-6 opacity-70 animate-pulse" />
      <FallingMail />
      <h1 className="mt-12 text-5xl sm:text-7xl font-bold text-shadow font-handwriting animate-pulse-slow text-rose-800">
        You've Got Mail!
      </h1>
      <p className="mt-4 text-sm opacity-80 animate-fade-in-up text-rose-700">Click anywhere to grab it</p>
    </div>
  );

  // 2. Envelope Animation Scene
  const EnvelopeAnimationScene = () => (
    <div className="h-screen w-full bg-gradient-to-b from-red-900 to-rose-800 flex flex-col items-center justify-center relative overflow-hidden animate-scene-entry">
      <HeartEmitter />
      <div
        className="cursor-pointer hover:scale-105 transition-transform duration-500 relative group"
        role="button"
        tabIndex={0}
        aria-label="Open envelope"
        onClick={() => handleNextStep('letter')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNextStep('letter')}
      >
        <div className="w-80 h-52 bg-red-100 shadow-2xl relative z-10 flex items-center justify-center rounded-lg border-2 border-red-200">
          <Heart className="w-16 h-16 text-red-600 fill-red-600 animate-pulse" />
        </div>
        <div className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-l-transparent border-t-[100px] border-t-red-200 border-r-[160px] border-r-transparent origin-top transition-all duration-700 z-20 group-hover:rotate-x-180" />
        <p className="mt-8 text-white font-bold text-2xl animate-bounce text-center">Open me</p>
      </div>
      <div className="absolute bottom-10 right-10 flex space-x-[-20px]">
        <PineTree className="w-24 h-32 translate-y-4" />
        <PineTree className="w-20 h-28" />
      </div>
      <Stars className="absolute top-10 left-20 text-yellow-300 w-8 h-8 animate-spin-slow" />
      <Stars className="absolute bottom-40 right-40 text-yellow-300 w-6 h-6 animate-pulse" />
    </div>
  );

  // 3. Letter Scene
  const LetterScene = () => (
    <div className="h-screen w-full bg-rose-50 flex items-center justify-center p-4 animate-scene-entry">
      <div className="max-w-2xl w-full bg-white shadow-2xl p-8 transform rotate-1 border-4 border-red-400 relative">
        {/* Stamps */}
        <div className="absolute top-4 right-4 border-2 border-red-800 p-2 transform rotate-12">
          <div className="w-16 h-20 bg-red-100 flex items-center justify-center flex-col text-[10px] text-red-900 font-bold">
            <span>AIR MAIL</span>
            <Heart className="w-4 h-4 mt-1" />
          </div>
        </div>
        <div className="absolute top-4 left-4 w-24 h-24 rounded-full border-2 border-dashed border-gray-400 opacity-50 flex items-center justify-center transform -rotate-12">
          <p className="text-xs text-center text-gray-500 font-mono">LOS ANGELES<br />JUL 12<br />4 PM</p>
        </div>

        <div className="mt-12 space-y-4 font-serif text-gray-800 leading-relaxed text-lg">
          <p>Dear Pooja,</p>
          <p>Hope you are doing well; I am good here and hope the same for you.</p>
          <p>This letter is a reminder of me whenever you miss me. I hope you know I love you so much!</p>
          <p>This letter is for the most beautiful, loving, and irreplaceable human I know. You deserve all the good things, Kanna, and I will support you always.</p>
          <p>I just want to be with you all the time. I always think about you, and I just want to be perfect for you.</p>
          <p>The only thing I can say is thank you for coming into my life, and I promise you that I will never let you down.</p>

          <div className="flex justify-end mt-8">
            <div className="text-right font-handwriting text-xl text-red-600 rotate-[-5deg]">
              <p>I love you,</p>
              <p>[Kanna] <Heart className="inline w-4 h-4 fill-red-500" /></p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleNextStep('do_you_love_me')}
          className="mt-8 mx-auto block bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition shadow-lg font-bold animate-pulse"
          aria-label="Surprise"
        >
          Surprise
        </button>
      </div>
    </div>
  );

  // 4. Gift Room Door
  const DoorScene = () => (
    <div className="h-screen w-full bg-gradient-to-br from-red-900 to-purple-900 flex flex-col items-center justify-center text-white animate-scene-entry">
      <h1 className="text-4xl font-bold mb-8 text-shadow font-handwriting">The Gift Room</h1>
      <div
        className="relative cursor-pointer group"
        role="button"
        tabIndex={0}
        aria-label="Enter gift room"
        onClick={() => handleNextStep('gifts')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNextStep('gifts')}
      >
        <div className="w-64 h-96 bg-rose-200 border-8 border-rose-300 relative overflow-hidden rounded-t-lg shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="w-4 h-4 bg-yellow-500 rounded-full absolute top-1/2 left-4 shadow-sm" />
          <div className="w-full h-full border-4 border-dashed border-rose-400 p-4">
            <div className="w-full h-px bg-rose-300 absolute top-1/4" />
            <div className="w-full h-px bg-rose-300 absolute bottom-1/4" />
            <div className="h-full w-px bg-rose-300 absolute left-1/2" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
            Enter Room
          </div>
          <CatPeeking />
        </div>
      </div>
    </div>
  );

  // GiftBox - simple present
  const GiftBox = ({ color = 'bg-pink-600', ribbon = 'bg-pink-400', ariaLabel = 'Gift box' }) => (
    <div className={`w-32 h-32 ${color} relative rounded-lg shadow-xl flex items-center justify-center`} aria-hidden>
      <div className={`absolute w-8 h-full ${ribbon} left-1/2 transform -translate-x-1/2`} />
      <div className={`absolute h-8 w-full ${ribbon} top-1/2 transform -translate-y-1/2`} />
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl">🎀</div>
    </div>
  );

  // 5. Gift Selection
  const GiftSelection = () => (
    <div className="h-screen w-full bg-rose-100 flex flex-col items-center justify-center p-4 animate-scene-entry">
      <h2 className="text-3xl text-rose-800 font-bold mb-12 font-handwriting">Pick a gift!</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8 items-center justify-center">
        <button
          onClick={() => {
            handleNextStep('bouquet');
            markGiftOpened('bouquet');
          }}
          className={`transform transition-all duration-300 hover:-translate-y-4 ${openedGifts.bouquet ? 'opacity-50' : 'animate-bounce-custom'}`}
          aria-label="Open bouquet gift"
        >
          <GiftBox color="bg-pink-600" ribbon="bg-pink-400" />
        </button>

        <button
          onClick={() => {
            handleNextStep('memories');
            markGiftOpened('memories');
          }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-100 ${openedGifts.memories ? 'opacity-50' : 'animate-bounce-custom'}`}
          aria-label="Open memories gift"
        >
          <GiftBox color="bg-red-600" ribbon="bg-red-400" />
        </button>

        <button
          onClick={() => {
            handleNextStep('promise');
            markGiftOpened('promise');
            setCandlesBlown(false);
          }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-200 ${openedGifts.promise ? 'opacity-50' : 'animate-bounce-custom'}`}
          aria-label="Open promise gift"
        >
          <GiftBox color="bg-rose-700" ribbon="bg-rose-500" />
        </button>

        <button
          onClick={() => {
            handleNextStep('timeline');
            markGiftOpened('timeline');
          }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-300 ${openedGifts.timeline ? 'opacity-50' : 'animate-bounce-custom'}`}
          aria-label="Open timeline gift"
        >
          <GiftBox color="bg-purple-600" ribbon="bg-purple-400" />
        </button>

        <button
          onClick={() => {
            handleNextStep('path');
            markGiftOpened('path');
          }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-400 ${openedGifts.path ? 'opacity-50' : 'animate-bounce-custom'}`}
          aria-label="Open path gift"
        >
          <GiftBox color="bg-yellow-600" ribbon="bg-yellow-400" />
        </button>
      </div>

      {allOpened && (
        <button
          onClick={() => {
            handleNextStep('heart_building');
            setShowConfetti(false);
          }}
          className="mt-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-xl animate-bounce flex items-center gap-2"
          aria-label="Continue"
        >
          Continue <Heart className="w-5 h-5 fill-white" />
        </button>
      )}
    </div>
  );

  // 6. Bouquet Scene
  const BouquetScene = () => (
    <div className="h-screen w-full bg-gradient-to-br from-pink-900 to-red-900 text-white p-8 flex flex-col items-center justify-center relative animate-scene-entry">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold text-pink-200">Tadaaa....<br />your virtual bouquet!</h2>
          <p className="text-pink-100">Each flower here has a little reason why you're one of my favorite humans:</p>
          <ul className="space-y-3 text-sm md:text-base opacity-90">
            {bouquetReasons.map((reason, index) => (
              <li key={index}>• {reason}</li>
            ))}
          </ul>
          <button onClick={() => handleNextStep('gifts')} className="mt-8 bg-white text-pink-900 px-6 py-2 rounded-full font-bold hover:bg-pink-100 transition" aria-label="Back to gift room">
            Go back to Gift Room
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-[150px] animate-pulse" aria-hidden>
            💐
          </span>
        </div>
      </div>
    </div>
  );

  // 7. Memories Scene
  const MemoriesScene = () => (
    <div className="h-screen w-full bg-gradient-to-b from-red-800 to-pink-900 p-4 flex flex-col items-center justify-center relative overflow-hidden animate-scene-entry">
      <h2 className="text-4xl text-pink-200 font-handwriting mb-8 rotate-[-2deg]">Our Memories</h2>
      <div className="relative w-full max-w-5xl h-auto flex flex-col md:flex-row items-center justify-center gap-8 p-4">
        <div className="relative w-full md:w-1/2 h-80 flex items-center justify-center">
          <div className="absolute top-0 left-0 transform -rotate-12 hover:rotate-0 transition duration-500 z-10">
            <div className="bg-white p-4 shadow-xl w-64">
              <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                <Camera size={48} />
              </div>
              <p className="text-gray-600 font-handwriting mt-2 text-center">That cafe trip!</p>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 transform rotate-6 hover:rotate-0 transition duration-500 z-20">
            <div className="bg-white p-4 shadow-xl w-64">
              <div className="h-48 bg-gray-800 flex items-center justify-center text-gray-600">
                <span className="text-4xl">📸</span>
              </div>
              <p className="text-gray-600 font-handwriting mt-2 text-center">Us being silly</p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 text-white p-4 md:p-8 text-right mt-12 md:mt-0">
          <p className="italic text-lg">
            "As we are in a long-distance relationship now, our photographs are the memories which I look for every time I miss you. I still hear our conversations when I see our pictures! The day we met first is nothing short of a festival... You didn't even know it, but you made that day lighter. You're the reason for my smile."
          </p>
          <button onClick={() => handleNextStep('gifts')} className="mt-8 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition" aria-label="Back to gift room">
            Go back to Gift Room
          </button>
        </div>
      </div>
      <div className="absolute bottom-10 left-20 animate-spin-slow text-yellow-300">
        <Stars size={40} />
      </div>
    </div>
  );

  // 8. Promise Scene
  const PromiseScene = () => (
    <div className="h-screen w-full bg-gradient-to-tr from-pink-900 to-rose-900 flex flex-col items-center justify-center text-white relative animate-scene-entry">
      <div className="text-center mb-12 max-w-lg px-4">
        <h2 className="text-4xl font-bold mb-4 text-pink-200 font-handwriting">My Promise to You</h2>
        <p className="text-xl opacity-90 italic">The reasons why you are my constant, now and forever.</p>
      </div>
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl space-y-4 border border-pink-500/50">
        <h3 className="text-xl font-bold text-pink-300">The Pillars of Our Love:</h3>
        <ul className="text-left text-sm space-y-3 list-disc list-inside px-4">
          <li>To be your calm during the chaos.</li>
          <li>To be your biggest cheerleader in every ambition.</li>
          <li>To listen without judgment, always.</li>
          <li>To cherish our memories and create endless new ones.</li>
          <li>To love you for exactly who you are, every single day.</li>
        </ul>
      </div>
      <button onClick={() => handleNextStep('gifts')} className="absolute bottom-8 left-8 text-white/50 hover:text-white flex items-center gap-2" aria-label="Back to gifts">
        <ArrowLeft size={20} /> Back
      </button>
    </div>
  );

  // 9. Timeline Scene
  const TimelineScene = () => {
    const futureMoments = [
      { icon: MapPin, title: 'Our Next Adventure', message: 'Discovering a new corner of the world, just us two.' },
      { icon: Home, title: 'Building Our Sanctuary', message: 'The quiet mornings and cozy evenings in our future home.' },
      { icon: Heart, title: 'Always Choosing You', message: 'Celebrating every milestone, big or small, for all time.' },
      { icon: Clock, title: 'A Lifetime of Comfort', message: 'The simple joy of growing old together.' }
    ];

    const [hoverMessage, setHoverMessage] = useState(null);

    return (
      <div className="h-screen w-full bg-gradient-to-tl from-purple-800 to-indigo-900 flex flex-col items-center justify-center text-white p-4 animate-scene-entry">
        <h2 className="text-4xl font-handwriting font-bold text-indigo-300 mb-12">Our Future Timeline</h2>

        <div className="w-full max-w-xl space-y-6">
          <p className="text-center italic text-indigo-200">This is what I look forward to most with you.</p>

          {futureMoments.map((moment, index) => (
            <div
              key={index}
              className="relative flex items-center w-full"
              onMouseEnter={() => setHoverMessage(moment.message)}
              onMouseLeave={() => setHoverMessage(null)}
            >
              <div className="absolute left-4 w-px h-full bg-pink-500/50 -translate-y-1/2" />

              <div className="relative z-10 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                <moment.icon className="w-4 h-4 text-white" />
              </div>

              <div className="ml-8 p-3 bg-white/10 rounded-lg w-full text-left">
                <p className="font-bold text-pink-100">{moment.title}</p>
                <p className="text-xs text-pink-200">{moment.message}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => handleNextStep('gifts')} className="mt-12 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition" aria-label="Back to gift room">
          Go back to Gift Room
        </button>
      </div>
    );
  };

  // 10. ConstellationScene (path) - corrected node positions & accessible buttons
  const ConstellationScene = () => {
    const [hoveredDate, setHoveredDate] = useState(null);

    // static scatter points for consistent layout (numbers interpreted as percentages)
    const getNodePosition = (index) => {
      const scatterPoints = [
        { x: 10, y: 15 }, { x: 35, y: 10 }, { x: 60, y: 20 }, { x: 85, y: 15 },
        { x: 5, y: 35 }, { x: 25, y: 45 }, { x: 45, y: 30 }, { x: 70, y: 40 },
        { x: 95, y: 50 }, { x: 15, y: 65 }, { x: 40, y: 75 }, { x: 65, y: 60 },
        { x: 80, y: 75 }, { x: 50, y: 90 }, { x: 20, y: 90 }, { x: 5, y: 80 },
        { x: 95, y: 25 }, { x: 75, y: 95 }, { x: 30, y: 5 }, { x: 88, y: 80 },
        { x: 50, y: 55 }, { x: 70, y: 10 }, { x: 45, y: 95 }, { x: 10, y: 45 }
      ];
      return scatterPoints[index] || { x: 50, y: 50 };
    };

    const TwinklingMoon = () => (
      <svg viewBox="0 0 100 100" className="absolute top-10 left-10 w-24 h-24 z-0" aria-hidden>
        <path d="M 50 10 A 40 40 0 1 0 50 90 A 35 35 0 1 1 50 10" fill="#FBBF24" />
      </svg>
    );

    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#1A0033] to-[#400080] flex flex-col items-center p-4 relative overflow-hidden animate-scene-entry">
        <h2 className="text-4xl font-handwriting font-bold text-pink-300 mt-8 mb-4">Our Constellation of Love</h2>
        <p className="italic text-indigo-300 mb-8">A universe built on moments. Hover over a star to reveal the date.</p>

        <Stars className="absolute top-1/4 right-1/4 w-4 h-4 text-white animate-spin-slow" />
        <Stars className="absolute bottom-1/4 left-1/4 w-3 h-3 text-white animate-pulse" />
        <TwinklingMoon />

        <div className="relative w-full max-w-lg h-[60vh] md:h-[70vh]">
          {/* No lines drawn - purely nodes */}
          {MilestoneData.map((milestone, index) => {
            const coords = getNodePosition(index);
            if (!coords) return null;
            const { x, y } = coords;
            const isSpecial = milestone.special;
            const isHovered = hoveredDate === milestone.date;

            return (
              <button
                key={milestone.date}
                className="absolute z-20 cursor-pointer p-1 rounded-full focus:outline-none"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setHoveredDate(milestone.date)}
                onMouseLeave={() => setHoveredDate(null)}
                onFocus={() => setHoveredDate(milestone.date)}
                onBlur={() => setHoveredDate(null)}
                aria-label={`Milestone ${milestone.date}`}
              >
                <Star
                  size={isHovered ? 24 : 16}
                  stroke={milestone.color}
                  fill={milestone.color}
                  className="transition-transform"
                  style={{
                    transform: `scale(${isHovered ? 1.4 : 1})`,
                    filter: isHovered || isSpecial ? `drop-shadow(0 0 8px ${milestone.color})` : 'drop-shadow(0 0 2px rgba(255,255,255,0.5))'
                  }}
                />

                {/* Date Tooltip */}
                <div
                  className="absolute p-1 whitespace-nowrap text-xs font-bold rounded bg-gray-700/80 text-white transition-opacity duration-300 pointer-events-none"
                  style={{
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    opacity: isHovered ? 1 : 0
                  }}
                >
                  {milestone.date}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-3xl font-handwriting font-bold text-yellow-300 mt-auto mb-8 animate-pulse-slow">
          Lot more to come! <Heart className="inline w-8 h-8 fill-red-500 text-red-500" />
        </div>

        <button onClick={() => handleNextStep('gifts')} className="mb-8 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition" aria-label="Back to gift room">
          Go back to Gift Room
        </button>
      </div>
    );
  };

  // 11. End Scene
  const EndScene = () => (
    <div className="h-screen w-full bg-rose-100 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden animate-scene-entry">
      {showConfetti && <LoveConfetti type="streamers" enabled={showConfetti} />}
      <div className="max-w-2xl bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl z-10 border-4 border-pink-200">
        <div className="flex justify-center mb-6">
          <Heart className="text-red-500 fill-red-500 w-12 h-12 animate-heartbeat" />
        </div>
        <p className="text-gray-700 mb-4 text-lg">My dear,</p>
        <p className="text-gray-700 mb-8 italic">This little website is just a digital whisper of the immense love I hold for you. You are the joy, the peace, and the most incredible part of my entire universe.</p>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8 font-outline-2">
          I Love You.
        </h1>
        <button onClick={() => handleNextStep('constant')} className="mt-8 bg-rose-600 text-white px-8 py-2 rounded-full shadow-lg hover:bg-rose-700 transition" aria-label="View final note">
          View Final Note
        </button>
      </div>
    </div>
  );

  // 12. Heart Building Scene (Animated Heart)
  const HeartBuildingScene = () => {
    const [blocks, setBlocks] = useState([]);
    const [isRising, setIsRising] = useState(false);
    const [showNext, setShowNext] = useState(false);

    const blk_pitn = {
      block1: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
      block2: [[0, 1], [0, 0], [-1, 0], [0, -1]],
      block3: [[-1, 1], [0, 0], [-1, 0], [-1, -1]],
      block4: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
      block5: [[-1, 1], [0, 0], [-1, 0], [0, -1]],
      block6: [[0, -1], [0, 0], [-1, 0], [1, -1]],
      block7: [[-1, -1], [0, 0], [-1, 0], [1, 0]],
      block8: [[-1, 1], [0, 0], [-1, 0], [-1, -1]],
      block9: [[0, -1], [0, 0], [-1, 0], [1, 0]],
      block10: [[-1, 1], [0, 0], [-1, 0], [1, 0]],
      block11: [[2, 0], [0, 0], [-1, 0], [1, 0]],
      block12: [[0, 1], [0, 0], [-1, 0], [0, -1]],
      block13: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
      block14: [[1, 1], [0, 0], [-1, 0], [1, 0]],
      block15: [[1, -1], [0, 0], [-1, 0], [1, 0]],
      block16: [[-1, -1], [0, 0], [-1, 0], [1, 0]],
      block17: [[0, 1], [0, 0], [-1, 0], [0, -1]],
      block18: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
      block19: [[0, -1], [0, 0], [-1, 0], [1, 0]],
      block20: [[1, -1], [0, 0], [-1, 0], [1, 0]],
      block21: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
      block22: [[1, 1], [0, 0], [-1, 0], [1, 0]],
      block23: [[0, 2], [0, 0], [0, -1], [0, 1]]
    };

    const offset_pitn = {
      block1: [5, 3], block2: [5, 1], block3: [3, 4], block4: [3, 2],
      block5: [3, -1], block6: [2, 5], block7: [2, 1], block8: [1, -1],
      block9: [1, -3], block10: [1, 2], block11: [0, 3], block12: [0, 0],
      block13: [-1, -4], block14: [0, -2], block15: [-2, 4], block16: [-2, 2],
      block17: [-2, 0], block18: [-3, -2], block19: [-4, 0], block20: [-3, 5],
      block21: [-5, 3], block22: [-4, 1], block23: [-6, 1]
    };

    useEffect(() => {
      // Wait for border animations to complete before starting heart building
      const startDelay = setTimeout(() => {
        let index = 0;
        const timer = setInterval(() => {
          if (index >= 23) {
            clearInterval(timer);
            setTimeout(() => {
              setIsRising(true);
              setTimeout(() => setShowNext(true), 2000);
            }, 500);
            return;
          }
          index++;
          const blockKey = `block${index}`;
          setBlocks(prev => [...prev, { key: blockKey, pattern: blk_pitn[blockKey], offset: offset_pitn[blockKey] }]);
        }, 300);

        return () => clearInterval(timer);
      }, 10000); // Wait 10 seconds for borders to complete

      return () => clearTimeout(startDelay);
    }, []);

    return (
      <div className="h-screen w-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center relative overflow-hidden animate-scene-entry">
        {/* Left GIF */}
        <img
          src="biubiubiu.gif"
          alt="cute animation"
          className="absolute left-0 bottom-28 w-64 h-64 z-10 pointer-events-none"
          draggable="false"
        />

        {/* Heart Container */}
        <div
          className="absolute transition-all duration-2000 ease-linear"
          style={{
            width: '520px',
            height: '440px',
            left: '50%',
            top: isRising ? '30%' : '50%',
            marginLeft: '-260px',
            marginTop: '-220px'
          }}
        >
          {blocks.map((block, idx) => (
            <div
              key={idx}
              className="absolute"
              style={{
                left: `calc(50% + ${40 * block.offset[0]}px)`,
                top: `calc(50% - ${40 * block.offset[1]}px)`,
                marginLeft: '-20px',
                marginTop: '-20px',
                visibility: 'visible'
              }}
            >
              {block.pattern.map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-10 h-10 bg-contain bg-no-repeat"
                  style={{
                    left: `${pos[0] * -40}px`,
                    top: `${pos[1] * -40}px`,
                    backgroundImage: 'url(heart.png)',
                    display: idx === blocks.length - 1 && i === 2 && blocks.length >= 23 ? 'none' : 'block'
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Love you Pooja text - appears after heart completes */}
        {blocks.length >= 23 && (
          <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 text-center z-30 animate-fade-in-up">
            <h2 className="text-5xl sm:text-6xl font-bold text-pink-600 font-handwriting animate-pulse-slow">
              Love you Pooja 💕
            </h2>
          </div>
        )}

        {/* Border animations */}
        <div className="absolute bottom-8 w-full">
          <div className="border-t-4 border-black animate-border-expand" />
          <div className="border-t-4 border-red-500 float-right animate-border-expand-delay" />
        </div>

        {/* Next button */}
        {showNext && (
          <button
            onClick={() => handleNextStep('constant')}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-xl animate-bounce z-20"
            aria-label="Continue"
          >
            Continue 💕
          </button>
        )}
      </div>
    );
  };

  // 13. Constant Scene (Final Page)
  const ConstantScene = () => {
    const handlePenguinClick = () => {
      setIsPenguinHugging(true);
      setTimeout(() => setIsPenguinHugging(false), 800);
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-pink-900 to-purple-900 flex flex-col items-center justify-center text-white p-4 animate-scene-entry">
        <h2 className="text-4xl font-handwriting font-bold text-pink-200 mb-8">You are my constant...</h2>

        <CutePenguin onClick={handlePenguinClick} isHugging={isPenguinHugging} />

        <p className="text-lg italic mt-8 text-pink-100">Click the penguin for a hug!</p>
        <p className="text-lg italic mt-2 text-pink-100">Forever and always, my love.</p>
      </div>
    );
  };

  // 14. Do You Love Me Scene (New Interactive Feature)
  const DoYouLoveMeScene = () => {
    const [showQuestion, setShowQuestion] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [noButtonPosition, setNoButtonPosition] = useState({ left: '54%', top: '0' });
    const questionContainerRef = useRef(null);

    const handleNoHover = () => {
      if (questionContainerRef.current) {
        const containerWidth = questionContainerRef.current.offsetWidth;
        const containerHeight = questionContainerRef.current.offsetHeight;
        const newX = Math.floor(Math.random() * containerWidth);
        const newY = Math.floor(Math.random() * containerHeight);
        setNoButtonPosition({ left: `${newX}px`, top: `${newY}px` });
      }
    };

    const handleYesClick = () => {
      setShowQuestion(false);
      setShowLoader(true);
      setTimeout(() => {
        setShowLoader(false);
        setShowResult(true);
      }, 3000);
    };

    return (
      <div className="h-screen w-full bg-[#ffe6e9] flex items-center justify-center relative overflow-hidden animate-scene-entry">
        {/* Question Container */}
        {showQuestion && (
          <div
            ref={questionContainerRef}
            className="question-love-container absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <div className="tenor-gif-container h-60 mb-12 flex items-center justify-center">
              <iframe
                src="https://tenor.com/embed/25789758"
                width="300"
                height="240"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg pointer-events-none"
                title="Cute gif"
              />
            </div>

            <h2 className="text-5xl sm:text-6xl mb-4 font-handwriting text-gray-800">Do you love me?</h2>
            <p className="text-sm text-gray-500 italic mb-6 animate-bounce">
              Psst... try to click NO 😏
            </p>

            <div className="button-love-container relative w-full h-20">
              <button
                onClick={handleYesClick}
                className="love-btn yes-love-btn absolute right-[54%] border-none rounded-full px-5 py-2.5 text-lg cursor-pointer transition-all duration-300 bg-[#ff6b81] text-white hover:bg-[#ffa4b1] hover:scale-110 shadow-lg"
                aria-label="Yes"
              >
                Yes
              </button>
              <button
                onMouseEnter={handleNoHover}
                onTouchStart={handleNoHover}
                style={noButtonPosition}
                className="love-btn no-love-btn absolute border-none rounded-full px-5 py-2.5 text-lg cursor-pointer transition-all duration-300 bg-[#ff6b81] text-white hover:bg-[#ffa4b1] hover:scale-110 shadow-lg"
                aria-label="No"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Heart Loader */}
        {showLoader && (
          <div className="heart-loader-main absolute top-[17%] left-1/2 transform -translate-x-1/2 text-[62px]">
            <div className="heart-loader-heart absolute top-1/2 left-1/2 animate-heart-rotate">
              <span className="heart-loader-left absolute w-[1em] h-[1em] border border-red-600 bg-red-600 rounded-full transform translate-x-[-28px] translate-y-[-27px] animate-heartL-scale" />
              <span className="heart-loader-right absolute w-[1em] h-[1em] border border-red-600 bg-red-600 rounded-full transform translate-x-[28px] translate-y-[-27px] animate-heartR-scale" />
              <span className="heart-loader-square relative block w-[1em] h-[1em] border border-red-600 bg-red-600 transform scale-100 rotate-[-45deg] animate-square-pulse" />
            </div>
            <div className="heart-loader-shadow relative top-[97px] left-1/2 block bottom-[-0.5em] w-[1em] h-[0.24em] bg-[#d7d7d7] border border-[#d7d7d7] rounded-full animate-shadow-pulse" />
          </div>
        )}

        {/* Result Container */}
        {showResult && (
          <div className="love-result-container flex flex-col items-center justify-center h-screen w-full text-center animate-scene-entry max-w-2xl mx-auto px-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 font-handwriting mb-4">I knew it😍!</h2>
            <p className="text-xl sm:text-2xl text-pink-600 font-bold mb-4 animate-bounce">
              🎁 Gifts are waiting for you 🎁
            </p>
            <button
              onClick={() => handleNextStep('door')}
              className="mb-6 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-full font-bold hover:from-pink-700 hover:to-rose-700 transition shadow-xl animate-pulse inline-flex items-center gap-2"
              aria-label="Enter gift room"
            >
              <Gift className="w-5 h-5" />
              Enter the Gift Room
            </button>
            <video
              src="cute love gif.mp4"
              autoPlay
              loop
              className="rounded-lg max-w-full h-auto mx-auto"
              style={{ maxHeight: '250px' }}
              aria-label="Love celebration video"
            />
          </div>
        )}
      </div>
    );
  };

  /* ---------- Main Router ---------- */

  return (
    <div className="font-sans antialiased text-gray-900 select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Indie+Flower&display=swap');

        .font-handwriting { font-family: 'Indie Flower', cursive; }
        .font-sans { font-family: 'Fredoka', sans-serif; }

        /* Transition Animation */
        @keyframes scene-entry {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-scene-entry {
            animation: scene-entry 1.2s ease-out both;
        }

        @keyframes heart-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .animate-heart-pulse {
            animation: heart-pulse 0.4s ease-in-out;
        }

        @keyframes love-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0.5; }
        }
        .animate-love-fall { animation: love-fall linear forwards; }

        @keyframes burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) rotate(720deg)
                       translate(calc(var(--rand-x, 1) * 30vw), calc(var(--rand-y, 1) * 30vh));
          }
        }
        .animate-burst { animation: burst 1s ease-out forwards; }

        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        .animate-fall { animation: fall linear infinite; }

        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-flicker { animation: flicker 0.1s infinite; }

        @keyframes float-up {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        .animate-float-up { animation: float-up 2s ease-out forwards; }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
        }
        .animate-heartbeat { animation: heartbeat 1.5s infinite; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }

        @keyframes bounce-custom {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
        }
        .animate-bounce-custom { animation: bounce-custom 2s infinite; }

        .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        @keyframes fall-mail {
            0% { transform: translateY(-100vh) rotate(5deg); opacity: 0; }
            50% { transform: translateY(0px) rotate(-5deg); opacity: 1; }
            100% { transform: translateY(10px) rotate(5deg); opacity: 1; }
        }
        .animate-fall-mail {
            animation: fall-mail 4s ease-in-out forwards;
            animation-delay: 0.5s;
        }

        @keyframes heart-float {
            0% { transform: translateY(0) scale(0.5); opacity: 1; }
            100% { transform: translateY(-150px) scale(1.5); opacity: 0; }
        }
        .animate-heart-float { animation: heart-float ease-out infinite; }

        @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }

        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 1s ease-out forwards;
            animation-delay: 4.5s;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-fall-mail,
          .animate-heart-float,
          .animate-bounce-custom,
          .animate-spin-slow,
          .animate-pulse-slow,
          .animate-fade-in-up,
          .animate-love-fall,
          .animate-burst,
          .animate-love-fall {
            animation: none !important;
            transition: none !important;
          }
        }

        /* Do You Love Me Scene Animations */
        @keyframes heart-rotate {
          50% { transform: rotate(360deg); }
          100% { transform: rotate(720deg); }
        }
        .animate-heart-rotate {
          animation: heart-rotate 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        @keyframes heartL-scale {
          60% { transform: translate(-28px, -27px) scale(0.4); }
        }
        .animate-heartL-scale {
          animation: heartL-scale 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        @keyframes heartR-scale {
          40% { transform: translate(28px, -27px) scale(0.4); }
        }
        .animate-heartR-scale {
          animation: heartR-scale 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        @keyframes square-pulse {
          50% {
            border-radius: 100%;
            transform: scale(0.5) rotate(-45deg);
          }
          100% { transform: scale(1) rotate(-45deg); }
        }
        .animate-square-pulse {
          animation: square-pulse 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        @keyframes shadow-pulse {
          50% {
            transform: scale(0.5);
            border-color: rgb(228, 228, 228);
          }
        }
        .animate-shadow-pulse {
          animation: shadow-pulse 2.88s cubic-bezier(0.75, 0, 0.5, 1) infinite normal;
        }

        /* Heart Building Scene Animations */
        @keyframes border-expand {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-border-expand {
          animation: border-expand 6s linear forwards;
        }
        .animate-border-expand-delay {
          animation: border-expand 4s linear 6s forwards;
        }
      `}</style>

      {step === 'parachute' && <MailFallScene />}
      {step === 'envelope_animation' && <EnvelopeAnimationScene />}
      {step === 'letter' && <LetterScene />}
      {step === 'door' && <DoorScene />}
      {step === 'gifts' && <GiftSelection />}
      {step === 'bouquet' && <BouquetScene />}
      {step === 'memories' && <MemoriesScene />}
      {step === 'promise' && <PromiseScene />}
      {step === 'timeline' && <TimelineScene />}
      {step === 'path' && <ConstellationScene />}
      {step === 'end' && <EndScene />}
      {step === 'heart_building' && <HeartBuildingScene />}
      {step === 'constant' && <ConstantScene />}
      {step === 'do_you_love_me' && <DoYouLoveMeScene />}
    </div>
  );
}
