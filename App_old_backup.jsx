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
    path: false,
    letters: false,
    aug29: false,
    courage: false,
    aug18: false,
    distance: false,
    family: false,
    story: false,
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

  const allOpened = openedGifts.bouquet && openedGifts.memories && openedGifts.promise && openedGifts.timeline && openedGifts.path && openedGifts.letters && openedGifts.aug29 && openedGifts.courage && openedGifts.aug18 && openedGifts.distance;

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
  <div className="min-h-screen w-full bg-rose-100 flex flex-col items-center justify-center p-4 py-12 animate-scene-entry">
    <h2 className="text-3xl text-rose-800 font-bold mb-8 font-handwriting">Pick a gift!</h2>
    <p className="text-rose-600 mb-8 italic">12 special gifts, each with love 💕</p>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 items-center justify-center max-w-6xl">
      {/* Gift 1: Aug 18 */}
      <button
        onClick={() => {
          handleNextStep('aug18');
          markGiftOpened('aug18');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 ${openedGifts.aug18 ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-teal-600" ribbon="bg-teal-400" />
      </button>

      {/* Gift 2: Aug 29 */}
      <button
        onClick={() => {
          handleNextStep('aug29_surprise');
          markGiftOpened('aug29');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-100 ${openedGifts.aug29 ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-orange-600" ribbon="bg-orange-400" />
      </button>

      {/* Gift 3: Letters */}
      <button
        onClick={() => {
          handleNextStep('letters_of_strength');
          markGiftOpened('letters');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-200 ${openedGifts.letters ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-blue-600" ribbon="bg-blue-400" />
      </button>

      {/* Gift 4: Distance */}
        <button
          onClick={() => {
            handleNextStep('distance');
            markGiftOpened('distance');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-300 ${openedGifts.distance ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-indigo-600" ribbon="bg-indigo-400" />
      </button>

      {/* Gift 5: Bouquet */}
      <button
        onClick={() => {
          handleNextStep('bouquet');
          markGiftOpened('bouquet');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-400 ${openedGifts.bouquet ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-pink-600" ribbon="bg-pink-400" />
      </button>

      {/* Gift 6: Memories */}
      <button
        onClick={() => {
          handleNextStep('memories');
          markGiftOpened('memories');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-500 ${openedGifts.memories ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-red-600" ribbon="bg-red-400" />
      </button>

      {/* Gift 7: Promise */}
      <button
        onClick={() => {
          handleNextStep('promise');
          markGiftOpened('promise');
          setCandlesBlown(false);
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-600 ${openedGifts.promise ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-rose-700" ribbon="bg-rose-500" />
      </button>

      {/* Gift 8: Timeline */}
      <button
        onClick={() => {
          handleNextStep('timeline');
          markGiftOpened('timeline');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-700 ${openedGifts.timeline ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-purple-600" ribbon="bg-purple-400" />
      </button>

      {/* Gift 9: Path */}
      <button
        onClick={() => {
          handleNextStep('path');
          markGiftOpened('path');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-800 ${openedGifts.path ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-yellow-600" ribbon="bg-yellow-400" />
      </button>

      {/* Gift 10: Courage */}
      <button
        onClick={() => {
          handleNextStep('courage');
          markGiftOpened('courage');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-900 ${openedGifts.courage ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-green-600" ribbon="bg-green-400" />
      </button>

      {/* ⭐ Gift 11: Four Hearts, One Family ⭐ */}
      <button
        onClick={() => {
          handleNextStep('four_hearts_family');
          markGiftOpened('family');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1000ms] ${
          openedGifts.family ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-amber-600" ribbon="bg-amber-300" />
      </button>

      {/* ⭐ Gift 12: Our Story ⭐ */}
      <button
        onClick={() => {
          handleNextStep('our_story');
          markGiftOpened('story');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1100ms] ${
          openedGifts.story ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-gradient-to-br from-violet-600 to-fuchsia-600" ribbon="bg-violet-400" />
      </button>
    </div>

      {allOpened && (
        <button
          onClick={() => {
            handleNextStep('heart_building');
            setShowConfetti(false);
          }}
          className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-xl animate-bounce flex items-center gap-2"
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
      <button onClick={() => handleNextStep('gifts')} className="mt-8 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition" aria-label="Back to gift room">
        Go back to Gift Room
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

  // 12. Letters for When You Need Strength Scene
  const LettersOfStrengthScene = () => {
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isReading, setIsReading] = useState(false);

    const letters = [
      {
        id: 1,
        title: "When Your Parents Question Us",
        color: "from-pink-500 to-rose-500",
        icon: "💌",
        message: `My Dearest Pooja,

Remember August 18? You chose me. And I choose you, every single day.

I know it's hard when your parents don't understand. I know you face questions, doubts, maybe even harsh words. But please remember this:

Your courage is not weakness - it's the strength of our love. Standing up for what your heart knows is right, even when the world tells you otherwise, that's the bravest thing anyone can do.

You're not being stubborn. You're being true. True to us, true to your heart, true to the love we share.

I'm here. Always. Through every difficult conversation, every tense moment, every tear. You stood strong for me when your world shook - now let me be your strength too.

One day, they will see what I see. One day, they will understand. Until then, hold on to us.

I love you. Always and forever.

Your constant support,
Aakash`
      },
      {
        id: 2,
        title: "When You Feel Alone",
        color: "from-purple-500 to-pink-500",
        icon: "💝",
        message: `My Beautiful Pooja,

You're not alone. Even with miles between us, even when I can't physically be there, I'm with you.

Do you remember August 29? Your face when you saw me unexpectedly? That surprise, that joy, that happiness - it's all still real. Our love is real. The distance is temporary, but what we have is forever.

When you feel alone, close your eyes and remember:
- Every message I send is a hug I wish I could give
- Every call is me holding your hand
- Every "I love you" is me being right there with you

You are never alone because you live in my heart, and I live in yours.

The loneliness you feel now is just counting down to the moment we never have to say goodbye again.

I'm coming back. I'll always come back.

Forever yours,
Aakash`
      },
      {
        id: 3,
        title: "When You Doubt",
        color: "from-blue-500 to-purple-500",
        icon: "💕",
        message: `My Love,

When doubt creeps in, when you wonder if we're doing the right thing, when everything feels uncertain - read this.

You stood strong for me when your world questioned us. You kept trust when it was easier to give up. You believed in us when everyone else doubted.

That wasn't blind faith. That was you knowing, deep in your heart, that what we have is worth fighting for.

I promise you:
- Every challenge we face is building our forever
- Every tear you cry now will become a story we tell our children
- Every moment of doubt will be answered with a lifetime of certainty

You chose wisely. You chose love. You chose bravely. And I will spend my life proving you right.

Never doubt that you are loved, valued, respected, and needed.

Always believing in us,
Aakash`
      },
      {
        id: 4,
        title: "When You're Scared",
        color: "from-rose-500 to-red-500",
        icon: "❤️",
        message: `My Brave Pooja,

I know you're scared. I know this path we're on isn't easy. I know facing your family, standing up for us, not knowing what tomorrow brings - it's all terrifying.

But let me tell you what I know:

I know you're the strongest person I've ever met. I know your courage inspires me every day. I know that someone who can stand up for love the way you do can face anything.

Yes, they don't understand yet. Yes, the road ahead has challenges. But we're not walking it alone - we're walking it together.

And here's what I promise:
- I will work every day to be worthy of your courage
- I will prove to your parents that you chose right
- I will build a future where you never have to be scared again
- I will love you through every fear until only peace remains

You are not alone in this fear. I'm scared too. But I'm more scared of a life without you than I am of any challenge we face together.

Your shield and strength,
Aakash`
      },
      {
        id: 5,
        title: "When You Miss Me",
        color: "from-pink-600 to-rose-600",
        icon: "💗",
        message: `My Precious Pooja,

I miss you too. Every moment. Every breath. Every heartbeat whispers your name.

I know the nights are the hardest. I know you reach for your phone hoping for a message, wishing I was there to hold you.

But remember this:

Every goodbye brings us closer to the day when we never have to say goodbye again. Every moment apart is another moment added to our forever.

This distance is temporary. This missing each other is temporary. But my love for you? That's eternal.

When you miss me:
- Look at our photos and remember the joy
- Read our messages and feel the love
- Close your eyes and know I'm thinking of you too

I'm counting down every day, every hour, every minute until I see your face again. Until I can make you smile again. Until I can hold you again.

Keep holding on. I'm holding on too.

Missing you always, loving you forever,
Aakash`
      }
    ];

    const handleOpenLetter = (letter) => {
      setSelectedLetter(letter);
      setIsReading(true);
    };

    const handleCloseLetter = () => {
      setIsReading(false);
      setTimeout(() => setSelectedLetter(null), 300);
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden animate-scene-entry">
        {/* Background decorative hearts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-pink-300 opacity-10 animate-pulse"
              style={{
                width: `${Math.random() * 30 + 20}px`,
                height: `${Math.random() * 30 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>

        {!isReading ? (
          /* Letter Selection View */
          <div className="max-w-6xl w-full z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-handwriting">
                Letters for When You Need Strength
              </h1>
              <p className="text-pink-200 text-lg italic">
                Open whichever letter your heart needs right now
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {letters.map((letter, index) => (
                <div
                  key={letter.id}
                  onClick={() => handleOpenLetter(letter)}
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`bg-gradient-to-br ${letter.color} p-6 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm`}>
                    <div className="text-5xl mb-4 text-center animate-bounce">{letter.icon}</div>
                    <h3 className="text-white font-bold text-lg text-center mb-2">
                      {letter.title}
                    </h3>
                    <div className="flex justify-center">
                      <Mail className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => handleNextStep('gifts')}
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-pink-50 transition shadow-xl"
              >
                Back to Gift Room 🎁
              </button>
            </div>
          </div>
        ) : (
          /* Letter Reading View */
          <div className="max-w-3xl w-full z-10 animate-scene-entry">
            <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-pink-200 relative">
              {/* Close button */}
              <button
                onClick={handleCloseLetter}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition"
                aria-label="Close letter"
              >
                <span className="text-2xl text-pink-600">×</span>
              </button>

              {/* Letter icon */}
              <div className="text-center mb-6">
                <span className="text-6xl">{selectedLetter?.icon}</span>
              </div>

              {/* Letter title */}
              <h2 className="text-3xl font-bold text-pink-600 text-center mb-8 font-handwriting">
                {selectedLetter?.title}
              </h2>

              {/* Letter content */}
              <div className="prose prose-pink max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg font-serif">
                  {selectedLetter?.message}
                </div>
              </div>

              {/* Back button */}
              <div className="text-center mt-8">
                <button
                  onClick={handleCloseLetter}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
                >
                  Back to Letters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 13. Aug 29 - The Day Everything Changed Scene
  const Aug29SurpriseScene = () => {
    const [phase, setPhase] = useState('intro'); // intro -> journey -> arrival -> memory -> end
    const [showText, setShowText] = useState(false);

    useEffect(() => {
      if (phase === 'intro') {
        setTimeout(() => setShowText(true), 500);
      }
    }, [phase]);

    const handleStartJourney = () => {
      setPhase('journey');
      setTimeout(() => setPhase('arrival'), 3000);
      setTimeout(() => setPhase('memory'), 6000);
      // Don't auto-advance from memory - let user read at their own pace
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-pink-200 via-rose-300 to-pink-400 flex items-center justify-center relative overflow-hidden animate-scene-entry">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <div className="text-center z-10 px-4 animate-fade-in-up">
            <div className="mb-8">
              <span className="text-8xl animate-bounce inline-block">📅</span>
            </div>
            {showText && (
              <>
                <h1 className="text-6xl sm:text-7xl font-bold text-rose-800 mb-6 font-handwriting animate-fade-in-up">
                  August 29, 2025
                </h1>
                <p className="text-2xl sm:text-3xl text-rose-700 mb-8 italic animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  The Day Everything Changed
                </p>
                <p className="text-xl text-rose-600 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  The day I came to see you without telling you...
                  <br />
                  The day I saw your face light up...
                  <br />
                  The day I knew this was real.
                </p>
                <button
                  onClick={handleStartJourney}
                  className="bg-rose-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-rose-700 transition shadow-2xl animate-pulse"
                >
                  Relive That Day 💕
                </button>
              </>
            )}
          </div>
        )}

        {/* Journey Phase */}
        {phase === 'journey' && (
          <div className="text-center z-10 px-4 animate-scene-entry">
            <div className="mb-8">
              <span className="text-8xl animate-bounce inline-block">🚂</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-rose-800 mb-6 font-handwriting">
              The Journey Begins...
            </h2>
            <p className="text-xl text-rose-700 italic mb-8 max-w-xl mx-auto">
              Heart racing, excited, nervous...
              <br />
              Counting every mile to see you
            </p>
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-lg text-rose-600">
              Planning the perfect surprise...
            </p>
          </div>
        )}

        {/* Arrival Phase */}
        {phase === 'arrival' && (
          <div className="text-center z-10 px-4 animate-scene-entry">
            <div className="mb-8">
              <span className="text-8xl animate-heartbeat inline-block">😲</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-rose-800 mb-6 font-handwriting">
              "Wait... is that...?"
            </h2>
            <div className="max-w-2xl mx-auto bg-white/90 p-8 rounded-3xl shadow-2xl border-4 border-rose-200">
              <p className="text-2xl text-rose-700 mb-4 font-bold">
                Your Face When You Saw Me
              </p>
              <div className="flex justify-center gap-8 text-6xl mb-6">
                <span className="animate-bounce">😲</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>😍</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🥰</span>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Shock → Excitement → Pure Happiness
              </p>
            </div>
          </div>
        )}

        {/* Memory Phase */}
        {phase === 'memory' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">💝</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-rose-800 mb-8 font-handwriting">
              That Moment...
            </h2>
            <div className="bg-white/95 p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-rose-300">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-6 font-serif italic">
                "I still remember every detail of that moment.
                <br /><br />
                The way your eyes widened when you recognized me.
                <br />
                The smile that spread across your face.
                <br />
                The happiness that made everything worth it.
                <br /><br />
                That's when I knew - I would cross any distance, face any obstacle, just to see that happiness again.
                <br /><br />
                August 29 wasn't just our first meeting.
                <br />
                It was the day our love became real.
                <br />
                It was the day dreams turned into memories.
                <br />
                It was the day I knew - you are my forever."
              </p>
              <p className="text-right text-2xl text-rose-600 font-handwriting mt-8">
                - Aakash
              </p>
            </div>

            {/* Continue button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setPhase('end')}
                className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-rose-600 hover:to-pink-600 transition shadow-2xl animate-pulse"
              >
                Continue 💕
              </button>
            </div>
          </div>
        )}

        {/* End Phase */}
        {phase === 'end' && (
          <div className="text-center z-10 px-4 animate-scene-entry">
            <div className="mb-8">
              <span className="text-8xl animate-heartbeat inline-block">❤️</span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-rose-800 mb-8 font-handwriting">
              And I'll Keep Coming Back
            </h2>
            <p className="text-2xl text-rose-700 mb-12 italic max-w-2xl mx-auto">
              Every visit, every surprise, every moment...
              <br />
              Until the day we never have to say goodbye.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setPhase('intro')}
                className="bg-white text-rose-600 px-8 py-3 rounded-full font-bold hover:bg-rose-50 transition shadow-xl"
              >
                Experience Again 🔄
              </button>
              <button
                onClick={() => handleNextStep('gifts')}
                className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-xl"
              >
                Back to Gift Room 🎁
              </button>
            </div>
          </div>
        )}

        {/* Floating hearts decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-rose-400 opacity-20 animate-float-up"
              style={{
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 40 + 20}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 15}s`
              }}
            />
          ))}
        </div>

        {/* Stars decoration */}
        <Stars className="absolute top-10 right-10 text-yellow-400 w-12 h-12 animate-spin-slow opacity-70" />
        <Stars className="absolute bottom-20 left-10 text-yellow-400 w-8 h-8 animate-pulse opacity-70" />
      </div>
    );
  };

  // 14. Thank You for Your Courage Scene
  const ThankYouCourageScene = () => {
    const [currentPage, setCurrentPage] = useState(0);

    const sacrifices = [
      {
        title: "When Your Parents Found Out",
        icon: "🏠",
        text: "Your world shook. They questioned. They doubted. But you didn't run. You stood your ground. You chose us.",
        color: "from-rose-500 to-pink-500"
      },
      {
        title: "When They Said No",
        icon: "🚫",
        text: "It would have been easier to give up. To say 'maybe they're right'. But you trusted your heart. You trusted me. You trusted us.",
        color: "from-purple-500 to-pink-500"
      },
      {
        title: "Every Secret Meeting",
        icon: "🤫",
        text: "Every time we meet, you're being brave. Choosing love over fear. Creating memories despite the risk. That's courage.",
        color: "from-blue-500 to-purple-500"
      },
      {
        title: "Standing Strong Alone",
        icon: "💪",
        text: "When I couldn't be there physically, you faced everything alone. The questions, the pressure, the uncertainty. You never wavered.",
        color: "from-pink-500 to-red-500"
      },
      {
        title: "Believing in Us",
        icon: "🌟",
        text: "When everyone said it wouldn't work, you believed. When distance tested us, you held on. When the future seemed uncertain, you kept faith.",
        color: "from-orange-500 to-pink-500"
      }
    ];

    const handleNext = () => {
      if (currentPage < sacrifices.length) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePrevious = () => {
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4 relative overflow-hidden animate-scene-entry">
        {/* Floating stars decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 1}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl w-full z-10">
          {currentPage === 0 ? (
            /* Title Page */
            <div className="text-center animate-fade-in-up">
              <div className="mb-8">
                <span className="text-8xl animate-heartbeat inline-block">🙏</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-8 font-handwriting">
                Thank You for Your Courage
              </h1>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/30 mb-8">
                <p className="text-2xl text-pink-100 leading-relaxed mb-6">
                  Pooja,
                </p>
                <p className="text-xl text-pink-100 leading-relaxed mb-4">
                  What you've done for us isn't small.
                  <br />
                  It's not easy.
                  <br />
                  It's incredibly brave.
                </p>
                <p className="text-lg text-pink-200 italic">
                  And I see every sacrifice you've made...
                </p>
              </div>
              <button
                onClick={handleNext}
                className="bg-white text-pink-600 px-10 py-4 rounded-full text-xl font-bold hover:bg-pink-50 transition shadow-2xl animate-pulse"
              >
                Continue 💕
              </button>
            </div>
          ) : currentPage <= sacrifices.length ? (
            /* Sacrifice Pages */
            <div className="animate-scene-entry">
              <div className={`bg-gradient-to-br ${sacrifices[currentPage - 1].color} p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-white/50`}>
                <div className="text-center mb-6">
                  <span className="text-7xl animate-bounce inline-block">{sacrifices[currentPage - 1].icon}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6 font-handwriting">
                  {sacrifices[currentPage - 1].title}
                </h2>
                <p className="text-xl sm:text-2xl text-white leading-relaxed text-center">
                  {sacrifices[currentPage - 1].text}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {sacrifices.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentPage - 1 ? 'bg-white w-8' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrevious}
                  className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition"
                >
                  ← Previous
                </button>
                <span className="text-white font-bold">
                  {currentPage} of {sacrifices.length}
                </span>
                <button
                  onClick={handleNext}
                  className="bg-white text-pink-600 px-6 py-3 rounded-full font-bold hover:bg-pink-50 transition"
                >
                  Next →
                </button>
              </div>

              {/* Back to Gift Room button */}
              <div className="text-center mt-6">
                <button
                  onClick={() => handleNextStep('gifts')}
                  className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition backdrop-blur-sm border border-white/40"
                >
                  Back to Gift Room 🎁
                </button>
              </div>
            </div>
          ) : (
            /* Final Thank You Page */
            <div className="text-center animate-scene-entry">
              <div className="mb-8">
                <span className="text-8xl animate-heartbeat inline-block">💝</span>
              </div>
              <div className="bg-white/95 p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-pink-300">
                <h2 className="text-4xl sm:text-5xl font-bold text-pink-600 mb-8 font-handwriting">
                  All of This... For Us
                </h2>
                <div className="text-left space-y-6 text-gray-800 text-lg leading-relaxed">
                  <p>
                    <strong>Thank you</strong> for standing up when it was easier to sit down.
                  </p>
                  <p>
                    <strong>Thank you</strong> for believing when everyone doubted.
                  </p>
                  <p>
                    <strong>Thank you</strong> for fighting when you could have surrendered.
                  </p>
                  <p>
                    <strong>Thank you</strong> for choosing love over fear, us over convenience, forever over comfort.
                  </p>
                  <p className="text-xl font-bold text-pink-600 pt-4">
                    Your courage isn't in vain. Every challenge we face now is building the forever we'll have together.
                  </p>
                  <p className="text-lg italic text-gray-600">
                    One day, they will see what I see. One day, they will understand. Until then, I promise to be worthy of every brave choice you've made.
                  </p>
                </div>
                <p className="text-right text-2xl text-pink-600 font-handwriting mt-8">
                  Forever grateful,
                  <br />
                  Aakash ❤️
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <button
                  onClick={() => setCurrentPage(0)}
                  className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition backdrop-blur-sm border border-white/40"
                >
                  Read Again 🔄
                </button>
                <button
                  onClick={() => handleNextStep('gifts')}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold hover:from-pink-600 hover:to-rose-600 transition shadow-xl"
                >
                  Back to Gift Room 🎁
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 15. Aug 18 - Yes Page
  const Aug18YesScene = () => {
    const [phase, setPhase] = useState('intro'); // intro, waiting, theYes, celebration, reflection

    const handleStartJourney = () => {
      setPhase('waiting');
      setTimeout(() => setPhase('theYes'), 8000);
      setTimeout(() => setPhase('celebration'), 11000);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 flex items-center justify-center p-4 animate-scene-entry overflow-hidden relative">
        {/* Floating hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            >
              💕
            </div>
          ))}
        </div>

        <div className="max-w-2xl w-full relative z-10">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl font-bold text-white mb-4 animate-pulse">
                  August 18
                </h1>
                <p className="text-3xl sm:text-4xl text-white/90 font-handwriting">
                  2025
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  The Day You Said Yes 💝
                </h2>
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
                  After four days of hope, prayers, and endless thoughts...
                  <br />
                  You gave me the most beautiful answer.
                </p>
                <button
                  onClick={handleStartJourney}
                  className="bg-white text-rose-500 px-8 py-3 rounded-full font-bold text-lg hover:scale-110 transition shadow-xl hover:shadow-2xl"
                >
                  Relive That Moment 💕
                </button>
              </div>
            </div>
          )}

          {/* Waiting Phase - 4 Days */}
          {phase === 'waiting' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  Four Days of Waiting ⏳
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Day 1', 'Day 2', 'Day 3', 'Day 4'].map((day, idx) => (
                    <div
                      key={day}
                      className="bg-white/30 rounded-2xl p-4 backdrop-blur-sm animate-fade-in"
                      style={{ animationDelay: `${idx * 0.5}s` }}
                    >
                      <p className="text-2xl font-bold text-white mb-2">{day}</p>
                      <p className="text-white/80 text-sm">
                        {idx === 0 && "Hope fills my heart"}
                        {idx === 1 && "Thinking of you"}
                        {idx === 2 && "Prayers and patience"}
                        {idx === 3 && "Tomorrow is the day..."}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-xl text-white/90 italic">
                  Each moment felt like forever...
                </p>
              </div>
            </div>
          )}

          {/* The Yes Phase */}
          {phase === 'theYes' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <div className="mb-8 animate-bounce">
                  <p className="text-8xl sm:text-9xl mb-4">💝</p>
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 animate-pulse">
                  "Yes"
                </h2>
                <p className="text-2xl sm:text-3xl text-white/90 leading-relaxed font-handwriting">
                  That one word changed everything
                </p>
              </div>
            </div>
          )}

          {/* Celebration Phase */}
          {phase === 'celebration' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <div className="mb-6">
                  <p className="text-7xl mb-4 animate-bounce">🎉</p>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  August 18, 2025
                </h2>
                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-6">
                  The day my dreams came true
                  <br />
                  The day you became mine
                  <br />
                  The day our forever began
                </p>
                <p className="text-lg text-white/80 italic mb-8">
                  From that day to this day, and for all the days to come... 💕
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setPhase('reflection')}
                    className="bg-white text-rose-500 px-6 py-3 rounded-full font-bold hover:scale-110 transition shadow-xl"
                  >
                    Continue 💕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reflection Phase */}
          {phase === 'reflection' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Thank You for Saying Yes 🙏
                </h2>
                <div className="text-left space-y-4 mb-8">
                  <p className="text-lg text-white/90 leading-relaxed">
                    💕 Thank you for choosing me when you could have walked away
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    💕 Thank you for believing in us when the path was uncertain
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    💕 Thank you for giving me the chance to love you
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    💕 Thank you for making August 18 the most beautiful day of my life
                  </p>
                </div>
                <p className="text-2xl text-white font-bold mb-8 font-handwriting">
                  I'll cherish this day forever 💝
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setPhase('intro')}
                    className="bg-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/40 transition backdrop-blur-sm border border-white/40"
                  >
                    Experience Again 🔄
                  </button>
                  <button
                    onClick={() => handleNextStep('gifts')}
                    className="bg-white text-rose-500 px-6 py-3 rounded-full font-bold hover:scale-110 transition shadow-xl"
                  >
                    Back to Gift Room 🎁
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 16. Distance Means So Little
  const DistanceMeansSoLittleScene = () => {
    const [phase, setPhase] = useState('intro'); // intro, distance, connection, promise, forever

    const handleStartJourney = () => {
      setPhase('distance');
      setTimeout(() => setPhase('connection'), 6000);
      setTimeout(() => setPhase('promise'), 12000);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 animate-scene-entry overflow-hidden relative">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>

        <div className="max-w-2xl w-full relative z-10">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                <p className="text-7xl mb-6 animate-pulse">🌍</p>
                <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                  Miles Apart
                </h1>
                <h2 className="text-3xl sm:text-4xl text-white/90 font-handwriting">
                  Hearts Together
                </h2>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-8">
                  Kilometers separate us, but nothing can separate our hearts.
                  <br />
                  Distance is just a number when love is infinite.
                </p>
                <button
                  onClick={handleStartJourney}
                  className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-110 transition shadow-xl hover:shadow-2xl"
                >
                  Our Story of Distance 💕
                </button>
              </div>
            </div>
          )}

          {/* Distance Phase */}
          {phase === 'distance' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  The Distance Between Us 🗺️
                </h2>

                <div className="relative mb-8">
                  {/* Visual representation of distance */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <p className="text-5xl mb-2">📍</p>
                      <p className="text-white font-bold">You</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="border-t-4 border-dashed border-white/50 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                          Distance
                        </div>
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-5xl mb-2">📍</p>
                      <p className="text-white font-bold">Me</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-lg text-white/90">
                    💔 Different cities, different time zones sometimes
                  </p>
                  <p className="text-lg text-white/90">
                    💔 Can't hold hands when we want to
                  </p>
                  <p className="text-lg text-white/90">
                    💔 Missing you every single day
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Phase */}
          {phase === 'connection' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  But We Stay Connected 💝
                </h2>

                <div className="relative mb-8">
                  {/* Visual representation of connection */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <p className="text-5xl mb-2 animate-pulse">💕</p>
                      <p className="text-white font-bold">You</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="relative h-1 bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 rounded-full animate-pulse">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-lg">
                          ❤️ Love ❤️
                        </div>
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-5xl mb-2 animate-pulse">💕</p>
                      <p className="text-white font-bold">Me</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-lg text-white/90">
                    💝 Good morning texts that brighten my day
                  </p>
                  <p className="text-lg text-white/90">
                    💝 Video calls where I see your beautiful smile
                  </p>
                  <p className="text-lg text-white/90">
                    💝 Messages throughout the day saying "I miss you"
                  </p>
                  <p className="text-lg text-white/90">
                    💝 Good night wishes before we sleep
                  </p>
                  <p className="text-lg text-white/90">
                    💝 Counting days until we meet again
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Promise Phase */}
          {phase === 'promise' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <div className="mb-6">
                  <p className="text-7xl mb-4 animate-bounce">🌟</p>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  The Promise of Tomorrow
                </h2>
                <div className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-6 space-y-4">
                  <p>This distance is temporary</p>
                  <p>Our love is permanent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-6">
                    One day...
                  </p>
                  <p>We'll wake up in the same home</p>
                  <p>I'll make you coffee every morning</p>
                  <p>Hold your hand whenever I want</p>
                  <p>Fall asleep next to you every night</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={() => setPhase('forever')}
                    className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:scale-110 transition shadow-xl"
                  >
                    Continue 💕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Forever Phase */}
          {phase === 'forever' && (
            <div className="text-center animate-fade-in">
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/40 shadow-2xl">
                <div className="mb-6">
                  <p className="text-7xl mb-4">💞</p>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Distance Means So Little
                </h2>
                <p className="text-2xl sm:text-3xl text-white/90 leading-relaxed mb-6 font-handwriting">
                  When someone means so much
                </p>

                <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                  <p className="text-lg text-white/90 italic leading-relaxed">
                    "The pain of parting is nothing compared to the joy of meeting again.
                    Every mile between us is a testament to how strong our love is.
                    Every day apart is one day closer to forever together."
                  </p>
                </div>

                <p className="text-xl text-white mb-8">
                  Until that beautiful day, I'll love you from wherever I am 💕
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setPhase('intro')}
                    className="bg-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/40 transition backdrop-blur-sm border border-white/40"
                  >
                    Read Again 🔄
                  </button>
                  <button
                    onClick={() => handleNextStep('gifts')}
                    className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:scale-110 transition shadow-xl"
                  >
                    Back to Gift Room 🎁
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 17. Four Hearts, One Family
  const FourHeartsOneFamilyScene = () => {
    const [phase, setPhase] = useState('intro'); // intro, hearts, unite, family

    const familyMembers = [
      { name: 'Aakash', color: 'from-blue-400 to-blue-600', trait: 'The Protector' },
      { name: 'Pooja', color: 'from-pink-400 to-pink-600', trait: 'The Heart' },
      { name: 'Aadhya', color: 'from-purple-400 to-purple-600', trait: 'The Joy' },
      { name: 'Parthu', color: 'from-amber-400 to-amber-600', trait: 'The Light' }
    ];

    const handleStart = () => {
      setPhase('hearts');
      setTimeout(() => setPhase('unite'), 8000);
      setTimeout(() => setPhase('family'), 11000);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 animate-scene-entry overflow-hidden relative">
        {/* Sparkles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>

        <div className="max-w-4xl w-full relative z-10">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 mb-6 animate-pulse">
                  Our Family
                </h1>
                <p className="text-3xl sm:text-4xl text-white/90 font-handwriting mb-4">
                  Four Hearts, One Love
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/30 shadow-2xl">
                <p className="text-xl sm:text-2xl text-white/90 leading-relaxed mb-8">
                  Some dreams are worth believing in.
                  <br />
                  This is mine... This is ours.
                  <br />
                  <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300 mt-4 block">
                    The Yarrapragada's
                  </span>
                </p>
                <button
                  onClick={handleStart}
                  className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-110 transition shadow-xl hover:shadow-2xl"
                >
                  Meet Our Family 💕
                </button>
              </div>
            </div>
          )}

          {/* Hearts Phase - Individual Hearts */}
          {phase === 'hearts' && (
            <div className="animate-fade-in">
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
                Each One Special 💖
              </h2>

              <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
                {familyMembers.map((member, idx) => (
                  <div
                    key={member.name}
                    className="text-center animate-fade-in"
                    style={{ animationDelay: `${idx * 0.8}s` }}
                  >
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center animate-pulse shadow-2xl`}
                      style={{ animationDuration: `${2 + idx * 0.3}s` }}
                    >
                      <span className="text-6xl sm:text-7xl">❤️</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-lg text-white/70 italic">
                      {member.trait}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unite Phase - Hearts Coming Together */}
          {phase === 'unite' && (
            <div className="text-center animate-fade-in">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-12">
                Together As One 💞
              </h2>

              <div className="relative w-80 h-80 mx-auto mb-8">
                {/* Four hearts moving to center */}
                {familyMembers.map((member, idx) => {
                  const positions = [
                    'top-0 left-1/2 -translate-x-1/2',
                    'bottom-0 left-1/2 -translate-x-1/2',
                    'left-0 top-1/2 -translate-y-1/2',
                    'right-0 top-1/2 -translate-y-1/2'
                  ];

                  return (
                    <div
                      key={member.name}
                      className={`absolute ${positions[idx]} transition-all duration-[3000ms] ease-in-out`}
                      style={{
                        animation: 'moveToCenter 3s forwards',
                        animationDelay: `${idx * 0.2}s`
                      }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center shadow-xl`}>
                        <span className="text-3xl">❤️</span>
                      </div>
                    </div>
                  );
                })}

                {/* Central united heart appears */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
                  <div className="w-48 h-48 bg-gradient-to-br from-amber-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl opacity-0"
                    style={{ animation: 'fadeInScale 2s 1s forwards' }}
                  >
                    <span className="text-8xl">💖</span>
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes moveToCenter {
                  to {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                  }
                }
                @keyframes fadeInScale {
                 0% {
                  opacity: 0;
                  transform: scale(0.5);
                }
                  50% {
                    opacity: 0.5;
                    transform: scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
  }
}
              `}</style>
            </div>
          )}

          {/* Family Phase - Final Message */}
          {phase === 'family' && (
            <div className="text-center animate-fade-in">
              <div className="mb-8">
                <div className="text-9xl mb-6 animate-heartbeat">💖</div>
                <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 mb-4">
                  The Yarrapragada's
                </h1>
                <p className="text-2xl sm:text-3xl text-white/90 font-handwriting mb-8">
                  Our Beautiful Family
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/30 shadow-2xl max-w-2xl mx-auto">
                <div className="space-y-4 text-left mb-8">
                  <p className="text-lg text-white/90 leading-relaxed">
                    💙 <span className="font-bold">Aakash</span> - Your strength, your partner, your forever
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    💗 <span className="font-bold">Pooja</span> - My love, My courage, My everything
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    💜 <span className="font-bold">Aadhya</span> - Our first blessing, our little joy
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    🧡 <span className="font-bold">Parthu</span> - Our second blessing, our little light
                  </p>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <p className="text-xl sm:text-2xl text-white font-bold mb-4 italic">
                    "Together, we are complete."
                  </p>
                  <p className="text-white/80">
                    This is the family we'll build. This is the love we'll share.
                    This is our forever. 💕
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => setPhase('intro')}
                  className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition backdrop-blur-sm border border-white/40"
                >
                  Experience Again 🔄
                </button>
                <button
                  onClick={() => handleNextStep('gifts')}
                  className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:scale-110 transition shadow-xl"
                >
                  Back to Gift Room 🎁
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ⭐ NEW: Our Story - CINEMATIC TIMELINE JOURNEY ⭐
  const OurStoryScene = () => {
    const [currentChapter, setCurrentChapter] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const scrollContainerRef = useRef(null);

    // Cinematic chapters with rich visual data
    const chapters = [
      // Opening Title
      {
        id: 0,
        type: "title",
        title: "OUR LOVE STORY",
        subtitle: "The Journey of Aakash & Pooja",
        tagline: "From a glance to forever",
        gradient: "from-black via-purple-900 to-black",
      },
      // Chapter 1: April 20 - The Glance
      {
        chapter: 1,
        title: "The Glance",
        subtitle: "Where it all began",
        date: "April 20",
        time: "",
        mood: "shy",
        gradient: "from-purple-300 via-purple-200 to-purple-100",
        illustration: "👀",
        decorations: ["🌸", "💜"],
        content: [
          "It was a relative's function.",
          "Among all the faces, one caught my attention.",
          "",
          "You were there. I saw you.",
          "But we didn't talk. We didn't even see each other face to face.",
          "",
          "Just a glance. Just a moment.",
          "Little did I know, this moment would change everything.",
        ],
        position: "left"
      },
      // Chapter 2: Instagram Connection
      {
        chapter: 2,
        title: "The Follow",
        subtitle: "A digital thread",
        date: "May",
        time: "",
        mood: "hopeful",
        gradient: "from-blue-300 via-cyan-200 to-teal-100",
        illustration: "📱",
        decorations: ["💙", "✨"],
        content: [
          "Later, life went back to normal.",
          "But fate had other plans.",
          "",
          "One day, I saw your profile on Instagram.",
          "My brothers were following you.",
          "",
          "I sent a follow request.",
          "You accepted.",
          "",
          "We still didn't talk, but something had started...",
        ],
        position: "right"
      },
      // Chapter 3: May 30 - Birthday
      {
        chapter: 3,
        title: "Birthday Wish",
        subtitle: "First words",
        date: "May 30",
        time: "",
        mood: "sweet",
        gradient: "from-pink-300 via-rose-200 to-pink-100",
        illustration: "🎂",
        decorations: ["🎈", "💗"],
        content: [
          "It was your birthday.",
          "",
          "I wished you: 'Happy Birthday!'",
          "You replied: 'Thank you'",
          "",
          "I liked that message.",
          "That was it. No more conversation.",
          "",
          "But your 'thank you' stayed with me.",
        ],
        position: "left"
      },
      // Chapter 4: June 3 - RCB
      {
        chapter: 4,
        title: "RCB Win",
        subtitle: "An emoji exchange",
        date: "June 3",
        time: "",
        mood: "playful",
        gradient: "from-orange-300 via-red-200 to-orange-100",
        illustration: "🏏",
        decorations: ["❤️", "🎉"],
        content: [
          "I posted a story about RCB winning.",
          "",
          "You replied with an emoji.",
          "I sent another emoji back.",
          "You liked it and left.",
          "",
          "Again, no conversation.",
          "",
          "But I was starting to notice you more...",
        ],
        position: "right"
      },
      // Chapter 5: June 10, 8:06 PM - The Beginning
      {
        chapter: 5,
        title: "The Beginning",
        subtitle: "The message that changed everything",
        date: "June 10",
        time: "8:06 PM",
        mood: "magical",
        gradient: "from-yellow-300 via-amber-200 to-yellow-100",
        illustration: "🕉️",
        decorations: ["✨", "💫", "🌟"],
        content: [
          "This is the day I will never forget.",
          "",
          "You posted a story about Lord Krishna.",
          "At 8:06 PM, I sent you a message:",
          "'Hey hi, can you please send this picture?'",
          "",
          "That's how it started.",
          "That's how we started building conversations.",
          "",
          "From that day till now, we haven't gone a day without talking.",
        ],
        position: "center",
        special: true
      },
      // Chapter 6: June 22, 5:55 AM - First Call
      {
        chapter: 6,
        title: "First Voice",
        subtitle: "Hearing you for the first time",
        date: "June 22",
        time: "5:55 AM",
        mood: "nervous",
        gradient: "from-green-300 via-emerald-200 to-teal-100",
        illustration: "📞",
        decorations: ["💚", "🎵"],
        content: [
          "We had been chatting every day.",
          "Sharing thoughts, lives, everything.",
          "",
          "Then at 5:55 AM, I made my first call to you.",
          "",
          "That was the first time I heard your voice.",
          "Apart from the chats, this was real.",
          "",
          "From then on, calls became our thing.",
          "Your voice became my favorite sound.",
        ],
        position: "left"
      },
      // Chapter 7: Growing Connection
      {
        chapter: 7,
        title: "Growing",
        subtitle: "Every day, a little closer",
        date: "June - July",
        time: "",
        mood: "warm",
        gradient: "from-orange-200 via-rose-200 to-pink-100",
        illustration: "💭",
        decorations: ["🌺", "💕"],
        content: [
          "Days turned into weeks.",
          "",
          "We talked about everything and nothing.",
          "You gave me value I'd never received before.",
          "You gave me time.",
          "",
          "I started admiring you.",
          "I started feeling something I couldn't name yet.",
          "",
          "You were becoming important to me.",
        ],
        position: "right"
      },
      // Chapter 8: Aug 8 - Athadu & Moon
      {
        chapter: 8,
        title: "Athadu & The Moon",
        subtitle: "The moment I knew",
        date: "August 8",
        time: "",
        mood: "realization",
        gradient: "from-indigo-400 via-blue-300 to-slate-200",
        illustration: "🌕",
        decorations: ["🎬", "💙", "✨"],
        content: [
          "I'm a huge fan of Mahesh Babu.",
          "Athadu was re-released - one of my favorite movies.",
          "",
          "I was in the theatre with my friend.",
          "You were in your hometown.",
          "I thought you weren't in a good mood.",
          "",
          "So I left the movie. Even in the theatre hall, I started chatting with you.",
          "",
          "That's when I realized: You're more important than anything else.",
        ],
        position: "left",
        special: true
      },
      // Chapter 8 continued - Moon
      {
        chapter: 8.5,
        title: "Under the Full Moon",
        subtitle: "Love realized",
        date: "August 8",
        time: "Night",
        mood: "romantic",
        gradient: "from-slate-600 via-blue-400 to-slate-200",
        illustration: "🌙",
        decorations: ["⭐", "💫", "✨"],
        content: [
          "While going home from the theatre,",
          "it was a full moon night.",
          "",
          "I looked up at the moon,",
          "and I thought of you.",
          "",
          "That's when I came to the conclusion:",
          "",
          "I love her.",
          "",
          "I don't know if it was love or not,",
          "but my feelings for you were real.",
        ],
        position: "center",
        special: true
      },
      // Chapter 9: Aug 12 - First 143
      {
        chapter: 9,
        title: "143",
        subtitle: "The first attempt",
        date: "August 12",
        time: "1:43 AM",
        mood: "anxious",
        gradient: "from-violet-400 via-purple-300 to-lavender-200",
        illustration: "🕐",
        decorations: ["💜", "❓"],
        content: [
          "I had so many thoughts:",
          "How do I express these feelings?",
          "How will she react?",
          "What if she doesn't like me?",
          "What if she stops talking to me?",
          "",
          "At 1:43 AM, I asked you to check the time.",
          "I thought you'd understand - 143 means 'I love you'.",
          "",
          "But you didn't understand.",
          "The opportunity was wasted.",
        ],
        position: "right"
      },
      // Chapter 10: Aug 14 - She Understood
      {
        chapter: 10,
        title: "She Understood",
        subtitle: "The second 143",
        date: "August 14",
        time: "1:43 AM",
        mood: "tense-hopeful",
        gradient: "from-indigo-500 via-purple-400 to-pink-300",
        illustration: "💭",
        decorations: ["💜", "💗", "✨"],
        content: [
          "Again, 1:43 AM.",
          "Again, I asked you to check the time.",
          "",
          "My plan: If you get serious, I can say",
          "'143 means I miss you' and mislead you.",
          "",
          "But you understood my feelings.",
          "",
          "You said: 'Ila evaru ayna propose chesthara?'",
          "",
          "You were in a dilemma.",
          "I told you I won't be a disturbance.",
          "I'll support you always.",
        ],
        position: "left"
      },
      // Chapter 11: Aug 18 - I Love You
      {
        chapter: 11,
        title: "I Love You",
        subtitle: "The Yes",
        date: "August 18",
        time: "",
        mood: "celebration",
        gradient: "from-pink-400 via-rose-300 to-amber-200",
        illustration: "💖",
        decorations: ["🎉", "✨", "💕", "🎊"],
        content: [
          "I didn't say 'I love you' in words.",
          "I didn't bring up the topic again.",
          "",
          "Four days later...",
          "",
          "YOU said 'I love you' in words.",
          "",
          "That was the day you accepted me.",
          "",
          "You had doubts. You had trust issues.",
          "I was a complete stranger.",
          "",
          "But you chose to trust me.",
          "You chose us.",
        ],
        position: "center",
        special: true
      },
      // Chapter 12: Aug 29 - Surprise Visit
      {
        chapter: 12,
        title: "Surprise!",
        subtitle: "4:48 PM",
        date: "August 29",
        time: "4:48 PM",
        mood: "excitement",
        gradient: "from-cyan-400 via-blue-300 to-teal-200",
        illustration: "🚂",
        decorations: ["💙", "😊", "✨"],
        content: [
          "I couldn't wait anymore.",
          "",
          "Without telling you,",
          "I traveled from Hyderabad to Kakinada.",
          "",
          "At 4:48 PM, I surprised you with a visit.",
          "",
          "Your face when you saw me...",
          "That moment was worth everything.",
          "",
          "Finally, we were together.",
        ],
        position: "right",
        special: true
      },
      // Chapter 13: Aug 31 - First Date
      {
        chapter: 13,
        title: "Our First Date",
        subtitle: "A full day together",
        date: "August 31",
        time: "Morning to Evening",
        mood: "romantic",
        gradient: "from-rose-400 via-pink-300 to-red-200",
        illustration: "💑",
        decorations: ["❤️", "🌹", "☀️", "🌙"],
        content: [
          "From morning to evening,",
          "we spent the entire day together.",
          "",
          "Every moment felt like magic.",
          "Every word, every laugh, every silence.",
          "",
          "Your presence is something I can't live without.",
          "",
          "That day, I knew:",
          "I want every day to be like this.",
          "I want to spend my life with you.",
        ],
        position: "left",
        special: true
      },
      // Chapter 14: Beautiful Moments
      {
        chapter: 14,
        title: "Beautiful Moments",
        subtitle: "Sept - Dec",
        date: "Many dates",
        time: "",
        mood: "joyful",
        gradient: "from-yellow-300 via-pink-300 to-purple-300",
        illustration: "⭐",
        decorations: ["✨", "💖", "🌟"],
        content: [
          "Aug 29, Aug 31, Sept 5, 6, 7, 8...",
          "Sept 15, 16, 26, 27, 28...",
          "Oct 6, 18... Nov 1, 2, 3, 8, 9...",
          "Nov 15, 16, 21, 22, 23... Dec 1...",
          "",
          "Every date is a constellation star.",
          "Every meeting, a memory.",
          "",
          "I even thought of buying a house in Kakinada",
          "just to be close to you.",
          "",
          "Because I can't imagine life without seeing you.",
        ],
        position: "right"
      },
      // Chapter 15: Sept 29 - The Storm
      {
        chapter: 15,
        title: "The Storm",
        subtitle: "When challenges came",
        date: "September 29",
        time: "8:38 PM",
        mood: "dark-strong",
        gradient: "from-gray-600 via-slate-500 to-purple-900",
        illustration: "⛈️",
        decorations: ["💪", "🛡️"],
        content: [
          "At 8:38 PM, everything changed.",
          "",
          "Your parents found out about us.",
          "",
          "We were both in shock.",
          "I was so tensed about you.",
          "What would your family say?",
          "",
          "But you stood strong.",
          "In all these times, you didn't break.",
          "",
          "That's when I knew:",
          "You're the strongest person I know.",
        ],
        position: "center"
      },
      // Chapter 16: Oct 1 - Determination
      {
        chapter: 16,
        title: "Meeting Your Brother",
        subtitle: "Fighting for us",
        date: "October 1",
        time: "",
        mood: "determined",
        gradient: "from-green-500 via-emerald-400 to-teal-300",
        illustration: "🤝",
        decorations: ["💚", "⚡"],
        content: [
          "I told my parents about our relationship.",
          "They accepted.",
          "",
          "On Oct 1, I met your brother.",
          "I told him I won't cheat you.",
          "I'm an IT employee. I'm serious about us.",
          "",
          "He told me not to meet you.",
          "",
          "But I thought:",
          "I can't stay without meeting her.",
          "And you felt the same.",
          "",
          "So we found a way.",
        ],
        position: "left"
      },
      // Chapter 17: Continuing Despite All
      {
        chapter: 17,
        title: "Still Choosing Us",
        subtitle: "Love wins",
        date: "Oct - Dec",
        time: "",
        mood: "courageous",
        gradient: "from-amber-400 via-orange-300 to-rose-400",
        illustration: "💪",
        decorations: ["❤️", "🔥", "✨"],
        content: [
          "Despite everything,",
          "we managed.",
          "",
          "We found ways to meet.",
          "We created moments together.",
          "",
          "Our last meet was on Dec 1.",
          "",
          "Because what we have is worth fighting for.",
          "What we have is real.",
          "",
          "Distance, family, challenges -",
          "nothing can stop us.",
        ],
        position: "right"
      },
      // Chapter 18: Future
      {
        chapter: 18,
        title: "To Be Continued...",
        subtitle: "Our forever",
        date: "Every day ahead",
        time: "",
        mood: "hopeful-dreamy",
        gradient: "from-pink-300 via-purple-300 to-blue-300",
        illustration: "💞",
        decorations: ["✨", "🌈", "💖", "🌟"],
        content: [
          "This is our story till today.",
          "",
          "I love you so much.",
          "You're the most important person to me.",
          "I value you. I support you. Always.",
          "",
          "I want to be the perfect husband for you.",
          "I'll do anything to be with you.",
          "",
          "I'm completely into you.",
          "I'm emotionally dependent on you.",
          "",
          "And our story?",
          "It's just beginning...",
          "",
          "💕 Forever Yours, Aakash 💕",
        ],
        position: "center",
        special: true
      },
    ];

    const handleNextPage = () => {
      if (currentPage < storyPages.length - 1 && !isFlipping) {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
          setIsFlipping(false);
        }, 600);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 0 && !isFlipping) {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentPage(currentPage - 1);
          setIsFlipping(false);
        }, 600);
      }
    };

    const currentPageData = storyPages[currentPage];

    // Mood-based styling
    const getMoodStyles = (mood) => {
      const styles = {
        dreamy: "shadow-2xl shadow-purple-500/50",
        shy: "shadow-2xl shadow-purple-300/50",
        hopeful: "shadow-2xl shadow-blue-300/50",
        sweet: "shadow-2xl shadow-pink-300/50",
        playful: "shadow-2xl shadow-orange-300/50",
        magical: "shadow-2xl shadow-yellow-400/50 ring-4 ring-yellow-300",
        nervous: "shadow-2xl shadow-green-300/50",
        warm: "shadow-2xl shadow-rose-300/50",
        realization: "shadow-2xl shadow-indigo-400/50",
        romantic: "shadow-2xl shadow-blue-400/50",
        anxious: "shadow-2xl shadow-violet-400/50",
        "tense-hopeful": "shadow-2xl shadow-indigo-500/50",
        celebration: "shadow-2xl shadow-pink-400/50 ring-4 ring-amber-400 animate-pulse",
        excitement: "shadow-2xl shadow-cyan-400/50",
        joyful: "shadow-2xl shadow-yellow-300/50",
        "dark-strong": "shadow-2xl shadow-gray-600/50",
        determined: "shadow-2xl shadow-green-500/50",
        courageous: "shadow-2xl shadow-orange-400/50",
        "hopeful-dreamy": "shadow-2xl shadow-purple-400/50"
      };
      return styles[mood] || "shadow-2xl";
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden animate-scene-entry">
        {/* Floating stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-200 opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 10 + 8}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Book Container */}
        <div className="relative max-w-5xl w-full">
          {/* Page Counter */}
          <div className="text-center mb-4 text-white/70 font-handwriting text-lg">
            Page {currentPage + 1} of {storyPages.length}
          </div>

          {/* The Book Page */}
          <div
            className={`relative bg-gradient-to-br ${currentPageData.gradient} rounded-2xl p-8 sm:p-12 min-h-[600px] flex flex-col justify-between transition-all duration-600 ${getMoodStyles(currentPageData.mood)} ${
              isFlipping ? 'animate-page-flip' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Decorative elements */}
            {currentPageData.decorations && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {currentPageData.decorations.map((deco, idx) => (
                  <span
                    key={idx}
                    className="absolute text-4xl opacity-30 animate-pulse"
                    style={{
                      left: idx % 2 === 0 ? '5%' : '90%',
                      top: `${10 + idx * 20}%`,
                      animationDelay: `${idx * 0.5}s`
                    }}
                  >
                    {deco}
                  </span>
                ))}
              </div>
            )}

            {/* Special badge for important moments */}
            {currentPageData.special && (
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                ⭐ Special Moment
              </div>
            )}

            {/* Page Content */}
            <div className={`relative z-10 flex flex-col ${
              currentPageData.position === 'center' ? 'items-center text-center' :
              currentPageData.position === 'right' ? 'items-end text-right' :
              'items-start text-left'
            }`}>
              {/* Illustration */}
              <div className="text-8xl sm:text-9xl mb-6 animate-bounce-slow">
                {currentPageData.illustration}
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-2 font-handwriting drop-shadow-lg">
                {currentPageData.title}
              </h1>

              {/* Subtitle */}
              {currentPageData.subtitle && (
                <h2 className="text-xl sm:text-2xl text-gray-700 italic mb-4 font-handwriting">
                  {currentPageData.subtitle}
                </h2>
              )}

              {/* Date & Time */}
              {currentPageData.date && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 text-gray-800 font-bold">
                  <span className="text-lg">📅 {currentPageData.date}</span>
                  {currentPageData.time && (
                    <span className="text-lg">🕐 {currentPageData.time}</span>
                  )}
                </div>
              )}

              {/* Story Content */}
              <div className="space-y-3 text-gray-800 text-base sm:text-lg leading-relaxed max-w-2xl">
                {currentPageData.content.map((line, idx) => (
                  <p
                    key={idx}
                    className={`${line === '' ? 'h-2' : ''} ${
                      line.includes('💕') || line.includes('❤️') ? 'font-bold text-xl text-rose-700' : ''
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Page bottom - navigation hints */}
            <div className="relative z-10 mt-8 flex justify-between items-center text-gray-700 text-sm italic">
              <span>{currentPage > 0 ? '← Previous' : ''}</span>
              <span>{currentPage < storyPages.length - 1 ? 'Next →' : '✨ The End ✨'}</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 gap-4">
            {/* Previous Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0 || isFlipping}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                currentPage === 0 || isFlipping
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110 shadow-xl'
              }`}
              aria-label="Previous page"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Back to Gifts */}
            <button
              onClick={() => handleNextStep('gifts')}
              className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-all shadow-xl flex items-center gap-2"
              aria-label="Back to gift room"
            >
              <Gift className="w-5 h-5" />
              <span className="hidden sm:inline">Gift Room</span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === storyPages.length - 1 || isFlipping}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                currentPage === storyPages.length - 1 || isFlipping
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:scale-110 shadow-xl'
              }`}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 transition-all duration-500 rounded-full"
              style={{ width: `${((currentPage + 1) / storyPages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Page flip animation styles */}
        <style>{`
          @keyframes page-flip {
            0% {
              transform: rotateY(0deg);
            }
            50% {
              transform: rotateY(90deg);
              opacity: 0.5;
            }
            100% {
              transform: rotateY(0deg);
            }
          }
          .animate-page-flip {
            animation: page-flip 0.6s ease-in-out;
          }
        `}</style>
      </div>
    );
  };

  // 18. Heart Building Scene (Animated Heart)
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
      {step === 'letters_of_strength' && <LettersOfStrengthScene />}
      {step === 'aug29_surprise' && <Aug29SurpriseScene />}
      {step === 'courage' && <ThankYouCourageScene />}
      {step === 'aug18' && <Aug18YesScene />}
      {step === 'distance' && <DistanceMeansSoLittleScene />}
      {step === 'heart_building' && <HeartBuildingScene />}
      {step === 'constant' && <ConstantScene />}
      {step === 'do_you_love_me' && <DoYouLoveMeScene />}
      {step === 'four_hearts_family' && <FourHeartsOneFamilyScene />}
      {step === 'our_story' && <OurStoryScene />}
    </div>
  );
}
