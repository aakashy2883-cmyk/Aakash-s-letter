import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
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
  { date: 'Aug 29 2025', special: true, color: '#FFD700' },
  { date: 'Aug 31 2025', special: false, color: '#000000' },
  { date: 'Sept 5 2025', special: false, color: '#A0A0A0' },
  { date: 'Sept 6 2025', special: false, color: '#404040' },
  { date: 'Sept 7 2025', special: false, color: '#008000' },
  { date: 'Sept 8 2025', special: true, color: '#20B2AA' },
  { date: 'Sept 15 2025', special: false, color: '#A0A0A0' },
  { date: 'Sept 16 2025', special: false, color: '#A52A2A' },
  { date: 'Sept 26 2025', special: false, color: '#800080' },
  { date: 'Sept 27 2025', special: false, color: '#FFFF00' },
  { date: 'Sept 28 2025', special: true, color: '#008000' },
  { date: 'Oct 6 2025', special: true, color: '#800080' },
  { date: 'Oct 18 2025', special: false, color: '#0000FF' },
  { date: 'Nov 1 2025', special: false, color: '#FF0000' },
  { date: 'Nov 2 2025', special: false, color: '#00008B' },
  { date: 'Nov 3 2025', special: false, color: '#FFD700' },
  { date: 'Nov 8 2025', special: false, color: '#800000' },
  { date: 'Nov 9 2025', special: false, color: '#FF0000' },
  { date: 'Nov 15 2025', special: true, color: '#008000' },
  { date: 'Nov 16 2025', special: false, color: '#20B2AA' },
  { date: 'Nov 21 2025', special: false, color: '#A0A0A0' },
  { date: 'Nov 22 2025', special: false, color: '#A52A2A' },
  { date: 'Nov 23 2025', special: false, color: '#FF0000' },
  { date: 'Dec 1 2025', special: false, color: '#A0A0A0' },
  { date: 'Dec 26 2025', special: false, color: '#00008B' },
  { date: 'Dec 27 2025', special: true, color: '#14B8A6' },
  { date: 'Dec 28 2025', special: false, color: '#000000' },
  { date: 'Jan 07 2026', special: false, color: '#FAF6F6' },
  { date: 'Jan 08 2026', special: false, color: '#E736BB' },
  { date: 'Jan 21 2026', special: false, color: '#f7fb06ff' },
  { date: 'Jan 24 2026', special: false, color: '#96f4f0ff' },
  { date: 'Jan 25 2026', special: false, color: '#ef3f18fb' },
  { date: 'Jan 30 2026', special: false, color: '#f80787fb' }

];

/* --- Authentication Screen Component --- */
const AuthenticationScreen = ({ onSuccess }) => {
  const [authStage, setAuthStage] = useState(1); // 1 = catch hearts, 2 = connect stars
  const [caughtLetters, setCaughtLetters] = useState([]);
  const [fallingHearts, setFallingHearts] = useState([]);
  const [gameActive, setGameActive] = useState(true);
  const [basketPosition, setBasketPosition] = useState(50);
  const [connectedStars, setConnectedStars] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stage1Complete, setStage1Complete] = useState(false);
  const gameAreaRef = useRef(null);

  const TARGET_WORD = 'KANNA';
  const DECOY_LETTERS = ['X', 'Z', 'M', 'L', 'P', 'R', 'S', 'T', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'O', 'Q', 'U', 'V', 'W', 'Y'];

  // Special dates (the correct ones to click in order) - these are your special: true dates
  const SPECIAL_DATES = [
    { id: 1, date: 'Aug 29', x: 15, y: 20, isSpecial: true },
    { id: 2, date: 'Sept 8', x: 78, y: 25, isSpecial: true },
    { id: 3, date: 'Sept 28', x: 42, y: 42, isSpecial: true },
    { id: 4, date: 'Oct 6', x: 88, y: 60, isSpecial: true },
    { id: 5, date: 'Nov 15', x: 22, y: 75, isSpecial: true },
    { id: 6, date: 'Dec 27', x: 65, y: 88, isSpecial: true }
  ];

  // Decoy dates (wrong choices) - these blend in with special dates
  const DECOY_DATES = [
    { id: 101, date: 'Aug 31', x: 50, y: 15, isSpecial: false },
    { id: 102, date: 'Sept 5', x: 30, y: 30, isSpecial: false },
    { id: 103, date: 'Sept 16', x: 62, y: 35, isSpecial: false },
    { id: 104, date: 'Oct 18', x: 10, y: 50, isSpecial: false },
    { id: 105, date: 'Nov 2', x: 55, y: 55, isSpecial: false },
    { id: 106, date: 'Nov 22', x: 75, y: 72, isSpecial: false },
    { id: 107, date: 'Dec 1', x: 38, y: 80, isSpecial: false },
    { id: 108, date: 'Dec 26', x: 85, y: 82, isSpecial: false }
  ];

  // All stars combined (special + decoys)
  const ALL_STARS = [...SPECIAL_DATES, ...DECOY_DATES];

  // Stage 1: Falling Hearts Game
  useEffect(() => {
    if (authStage !== 1 || !gameActive) return;

    const spawnHeart = () => {
      const nextNeededLetter = TARGET_WORD[caughtLetters.length];
      const isTargetLetter = Math.random() < 0.55; // 55% chance of target letter - more frequent!

      let letter;
      if (isTargetLetter && nextNeededLetter) {
        letter = nextNeededLetter;
      } else {
        letter = DECOY_LETTERS[Math.floor(Math.random() * DECOY_LETTERS.length)];
      }

      const newHeart = {
        id: Date.now() + Math.random(),
        letter,
        x: Math.random() * 80 + 10, // 10-90%
        y: -10,
        isTarget: letter === nextNeededLetter
      };

      setFallingHearts(prev => [...prev, newHeart]);
    };

    const spawnInterval = setInterval(spawnHeart, 1400); // Balanced spawn rate
    return () => clearInterval(spawnInterval);
  }, [authStage, gameActive, caughtLetters.length]);

  // Move hearts down
  useEffect(() => {
    if (authStage !== 1 || !gameActive) return;

    const moveInterval = setInterval(() => {
      setFallingHearts(prev => {
        const updated = prev.map(heart => ({
          ...heart,
          y: heart.y + 1.2 // Slower falling speed
        })).filter(heart => heart.y < 100);
        return updated;
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [authStage, gameActive]);

  // Check for catches
  useEffect(() => {
    if (authStage !== 1) return;

    const catchZone = { minY: 75, maxY: 98 };
    const basketWidth = 20; // Wider catch zone
    const basketLeft = basketPosition - basketWidth / 2;
    const basketRight = basketPosition + basketWidth / 2;

    setFallingHearts(prev => {
      let caught = null;
      const remaining = prev.filter(heart => {
        if (heart.y >= catchZone.minY && heart.y <= catchZone.maxY) {
          if (heart.x >= basketLeft && heart.x <= basketRight) {
            caught = heart;
            return false;
          }
        }
        return true;
      });

      if (caught) {
        const nextNeeded = TARGET_WORD[caughtLetters.length];
        if (caught.letter === nextNeeded) {
          const newCaught = [...caughtLetters, caught.letter];
          setCaughtLetters(newCaught);

          if (newCaught.join('') === TARGET_WORD) {
            setGameActive(false);
            setTimeout(() => {
              setStage1Complete(true);
              setTimeout(() => setAuthStage(2), 1500);
            }, 500);
          }
        } else {
          // Wrong letter caught - reset with animation
          setCaughtLetters([]);
        }
      }

      return remaining;
    });
  }, [fallingHearts, basketPosition, caughtLetters, authStage]);

  // Handle mouse/touch movement for basket
  const handleMouseMove = (e) => {
    if (!gameAreaRef.current || authStage !== 1) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setBasketPosition(Math.max(10, Math.min(90, x)));
  };

  const handleTouchMove = (e) => {
    if (!gameAreaRef.current || authStage !== 1) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    setBasketPosition(Math.max(10, Math.min(90, x)));
  };

  // Stage 2: Connect stars
  const handleStarClick = (star) => {
    if (authStage !== 2) return;

    // If it's a decoy (non-special) star, reset!
    if (!star.isSpecial) {
      setConnectedStars([]);
      return;
    }

    const expectedIndex = connectedStars.length;
    const expectedStar = SPECIAL_DATES[expectedIndex];

    if (star.id === expectedStar?.id) {
      const newConnected = [...connectedStars, star];
      setConnectedStars(newConnected);

      if (newConnected.length === SPECIAL_DATES.length) {
        setShowSuccess(true);
        setTimeout(() => {
          sessionStorage.setItem('loveLetterAuth', 'true');
          onSuccess();
        }, 2000);
      }
    } else {
      // Wrong special star order - reset
      setConnectedStars([]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Twinkling stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Stage indicator */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 ${authStage >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'} ${stage1Complete ? 'ring-4 ring-green-400' : ''}`}>
          {stage1Complete ? '✓' : '1'}
        </div>
        <div className={`w-16 h-1 transition-all duration-500 ${stage1Complete ? 'bg-pink-500' : 'bg-gray-700'}`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 ${authStage >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
          2
        </div>
      </div>

      {/* Stage 1: Catch Hearts */}
      {authStage === 1 && (
        <div
          ref={gameAreaRef}
          className="relative w-full max-w-lg h-[70vh] mx-auto cursor-none touch-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-300 mb-2 font-handwriting">
              Catch Our Love
            </h2>
            <p className="text-pink-200 text-sm sm:text-base mb-4">
              Catch the hearts to spell the magic word...
            </p>
            <div className="flex justify-center gap-2">
              {TARGET_WORD.split('').map((letter, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300 ${
                    caughtLetters[i]
                      ? 'bg-pink-500 text-white scale-110'
                      : 'bg-gray-800/50 text-gray-500 border-2 border-dashed border-pink-500/50'
                  }`}
                >
                  {caughtLetters[i] || '?'}
                </div>
              ))}
            </div>
          </div>

          {/* Falling hearts */}
          {fallingHearts.map(heart => (
            <div
              key={heart.id}
              className={`absolute transition-transform ${heart.isTarget ? 'text-pink-400' : 'text-gray-500'}`}
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <span className="text-6xl sm:text-7xl">💕</span>
                <span className={`absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-bold ${heart.isTarget ? 'text-white' : 'text-gray-300'}`}>
                  {heart.letter}
                </span>
              </div>
            </div>
          ))}

          {/* Basket */}
          <div
            className="absolute bottom-4 transition-all duration-75"
            style={{ left: `${basketPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="text-6xl sm:text-7xl">🧺</div>
          </div>

          {/* Stage 1 Complete Animation */}
          {stage1Complete && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <div className="text-center animate-bounce">
                <span className="text-6xl">💕</span>
                <p className="text-2xl text-pink-300 font-bold mt-4">KANNA!</p>
                <p className="text-pink-200">Stage 1 Complete!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 2: Connect Constellation */}
      {authStage === 2 && (
        <div className="relative w-full max-w-2xl h-[70vh] mx-auto px-4">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-300 mb-2 font-handwriting">
              Connect Our Moments
            </h2>
            <p className="text-pink-200 text-sm sm:text-base">
              Connect our special dates in order...
            </p>
            <p className="text-pink-300 text-xs mt-2">
              {connectedStars.length} / {SPECIAL_DATES.length} connected
            </p>
          </div>

          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {connectedStars.map((star, index) => {
              if (index === 0) return null;
              const prevStar = connectedStars[index - 1];
              return (
                <line
                  key={`line-${index}`}
                  x1={`${prevStar.x}%`}
                  y1={`${prevStar.y}%`}
                  x2={`${star.x}%`}
                  y2={`${star.y}%`}
                  stroke="url(#goldGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              );
            })}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF69B4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Stars - ALL stars show dates, but only YOU know which are special! */}
          {ALL_STARS.map((star) => {
            const isConnected = connectedStars.some(s => s.id === star.id);

            return (
              <button
                key={star.id}
                onClick={() => handleStarClick(star)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 group ${
                  isConnected
                    ? 'scale-125'
                    : 'hover:scale-110'
                }`}
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
              >
                <div className="relative flex flex-col items-center">
                  <span className={`text-2xl sm:text-3xl transition-all duration-300 ${
                    isConnected
                      ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]'
                      : 'text-white/80 group-hover:text-white'
                  }`}>
                    {isConnected ? '⭐' : '✨'}
                  </span>
                  {/* Show date on ALL stars */}
                  <span className={`text-[10px] sm:text-xs whitespace-nowrap mt-1 transition-all duration-300 ${
                    isConnected
                      ? 'text-yellow-300 font-bold'
                      : 'text-pink-200/60 group-hover:text-pink-200'
                  }`}>
                    {star.date}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
            <p className="text-pink-300/70 text-sm italic">
              {connectedStars.length === 0 && "Click our special dates in order... only we know which ones matter 💕"}
              {connectedStars.length === 1 && "You remember when things got real..."}
              {connectedStars.length === 2 && "Keep following our story..."}
              {connectedStars.length === 3 && "You know us so well..."}
              {connectedStars.length === 4 && "Almost there, my love..."}
              {connectedStars.length === 5 && "One more special moment..."}
            </p>
            <p className="text-pink-400/50 text-xs mt-2">
              {connectedStars.length} / 6 special dates connected
            </p>
          </div>

          {/* Success Animation */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
              <div className="text-center">
                <div className="text-8xl animate-bounce mb-4">💕</div>
                <h3 className="text-4xl font-bold text-pink-300 font-handwriting mb-2">
                  Welcome Home, Lovers!
                </h3>
                <p className="text-pink-200">Your love story awaits...</p>
                <div className="mt-6 flex justify-center gap-2">
                  {[...Array(7)].map((_, i) => (
                    <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      💕
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer hint */}
      <div className="absolute bottom-4 text-center text-pink-300/50 text-xs">
        This love story is protected by our hearts 💕
      </div>
    </div>
  );
};

/* --- Main App --- */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('loveLetterAuth') === 'true';
  });
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
    gazebo: false,
    tendays: false,
    firstletter: false,
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

  // 4.5. Gazebo Scene - Where It All Began (Following Birthday Cake Pattern)
  const GazeboModel = () => {
    const { scene } = useGLTF('/Aakash-s-letter/Wooden_Gazebo_Structu_1209052742_texture.glb');
    return <primitive object={scene} scale={7} position={[0, -2, 0]} rotation={[0, 0, 0]} />;
  };

  // Park Background Component
  const ParkBackground = () => {
    const { scene } = useThree();
    const texture = useTexture('/Aakash-s-letter/gandhi-park.jpeg');

    useEffect(() => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      return () => {
        scene.background = null;
      };
    }, [scene, texture]);

    return null;
  };

  const GazeboScene = () => {
    const [textOpacity, setTextOpacity] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setTextOpacity(1);
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="h-screen w-full relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-400 mx-auto mb-4"></div>
              <p className="text-amber-300 text-xl font-handwriting">Loading the gazebo...</p>
            </div>
          </div>
        )}
        {/* Text Overlay Layer (Like birthday cake typing overlay) */}
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-8 pointer-events-none transition-opacity duration-1000"
          style={{ opacity: textOpacity }}
        >
          <div className="text-center max-w-4xl space-y-6">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-amber-300 mb-8 font-handwriting animate-pulse-slow"
              style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.9), 0 4px 20px rgba(0, 0, 0, 0.8)' }}
            >
              Our Forever Started Here
            </h1>

            <div className="bg-black/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border-2 border-amber-400/60 shadow-2xl">
              <p
                className="text-2xl sm:text-3xl md:text-4xl text-amber-100 mb-6 italic font-serif leading-relaxed"
                style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}
              >
                "In this beautiful corner of Gandhi Park..."
              </p>

              <div
                className="space-y-5 text-lg sm:text-xl md:text-2xl text-white leading-relaxed"
                style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)' }}
              >
                <p>
                  Under this gentle wooden shelter, two souls found each other.
                  <br />
                  Your smile made the whole world disappear.
                  <br />
                  In your eyes, I saw my tomorrow, my always, my home.
                </p>

                <p>
                  Every word we shared here became a promise.
                  <br />
                  Every moment of silence spoke volumes of understanding.
                  <br />
                  Every laugh echoed the beginning of our beautiful journey.
                </p>

                <p className="text-amber-200 font-bold text-2xl sm:text-3xl mt-6">
                  This isn't just a place we sat and talked—
                  <br />
                  This is where I realized I wanted forever with you.
                  <br />
                  <span className="text-rose-300">This is where my heart chose you, for always.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div
          className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-auto transition-opacity duration-1000"
          style={{ opacity: textOpacity }}
        >
          <button
            onClick={() => handleNextStep('gifts')}
            className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-12 py-4 rounded-full font-bold text-xl hover:from-amber-700 hover:to-rose-700 transition shadow-2xl transform hover:scale-110"
            aria-label="Back to gift room"
          >
            Back to Gift Room 💕
          </button>
        </div>

        {/* 3D Canvas - Full Screen (Like Birthday Cake) */}
        <Canvas
          gl={{ alpha: true }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent'
          }}
          camera={{ position: [0, 2, 10], fov: 70 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#000000', 0);
          }}
        >
          <Suspense fallback={null}>
            <ParkBackground />
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
            <directionalLight position={[-10, 5, -5]} intensity={2.5} color="#ffffff" />
            <pointLight position={[0, 10, 5]} intensity={2} color="#ffffff" />
            <GazeboModel />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={3}
              maxDistance={12}
              autoRotate
              autoRotateSpeed={0.5}
              enableDamping
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  };

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
    <p className="text-rose-600 mb-8 italic">15 special gifts, each with love 💕</p>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 items-center justify-center max-w-6xl">
      {/* ⭐ Gift 1: OUR STORY - THE CINEMATIC JOURNEY ⭐ */}
      <button
        onClick={() => {
          handleNextStep('our_story');
          markGiftOpened('story');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 ${openedGifts.story ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-gradient-to-br from-violet-600 to-fuchsia-600" ribbon="bg-violet-400" />
      </button>

      {/* ⭐ Gift 2: THE GAZEBO - WHERE IT ALL BEGAN ⭐ */}
      <button
        onClick={() => {
          handleNextStep('gazebo');
          markGiftOpened('gazebo');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-100 ${openedGifts.gazebo ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-gradient-to-br from-amber-600 to-yellow-600" ribbon="bg-amber-400" />
      </button>

      {/* Gift 3: Aug 18 (The Yes) */}
      <button
        onClick={() => {
          handleNextStep('aug18');
          markGiftOpened('aug18');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-200 ${openedGifts.aug18 ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-teal-600" ribbon="bg-teal-400" />
      </button>

      {/* Gift 4: Aug 29 (Surprise Visit) */}
      <button
        onClick={() => {
          handleNextStep('aug29_surprise');
          markGiftOpened('aug29');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-300 ${openedGifts.aug29 ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-orange-600" ribbon="bg-orange-400" />
      </button>

      {/* Gift 5: Distance */}
        <button
          onClick={() => {
            handleNextStep('distance');
            markGiftOpened('distance');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-400 ${openedGifts.distance ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-indigo-600" ribbon="bg-indigo-400" />
      </button>

      {/* Gift 6: Bouquet */}
      <button
        onClick={() => {
          handleNextStep('bouquet');
          markGiftOpened('bouquet');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-500 ${openedGifts.bouquet ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-pink-600" ribbon="bg-pink-400" />
      </button>

      {/* Gift 7: Memories */}
      <button
        onClick={() => {
          handleNextStep('memories');
          markGiftOpened('memories');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-600 ${openedGifts.memories ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-red-600" ribbon="bg-red-400" />
      </button>

      {/* Gift 8: Promise */}
      <button
        onClick={() => {
          handleNextStep('promise');
          markGiftOpened('promise');
          setCandlesBlown(false);
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-700 ${openedGifts.promise ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-rose-700" ribbon="bg-rose-500" />
      </button>

      {/* Gift 9: Timeline */}
      <button
        onClick={() => {
          handleNextStep('timeline');
          markGiftOpened('timeline');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-800 ${openedGifts.timeline ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-purple-600" ribbon="bg-purple-400" />
      </button>

      {/* Gift 10: Path */}
      <button
        onClick={() => {
          handleNextStep('path');
          markGiftOpened('path');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-900 ${openedGifts.path ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-yellow-600" ribbon="bg-yellow-400" />
      </button>

      {/* Gift 11: Courage */}
      <button
        onClick={() => {
          handleNextStep('courage');
          markGiftOpened('courage');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1000ms] ${openedGifts.courage ? 'opacity-50' : 'animate-bounce-custom'}`}
      >
        <GiftBox color="bg-green-600" ribbon="bg-green-400" />
      </button>

      {/* Gift 12: Four Hearts, One Family */}
      <button
        onClick={() => {
          handleNextStep('four_hearts_family');
          markGiftOpened('family');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1100ms] ${
          openedGifts.family ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-amber-600" ribbon="bg-amber-300" />
      </button>

      {/* Gift 13: Letters */}
      <button
        onClick={() => {
          handleNextStep('letters_of_strength');
          markGiftOpened('letters');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1200ms] ${
          openedGifts.letters ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-blue-600" ribbon="bg-blue-400" />
      </button>

      {/* Gift 14: Ten Days of Silence (Dec 11-21) */}
      <button
        onClick={() => {
          handleNextStep('ten_days_silence');
          markGiftOpened('tendays');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1300ms] ${
          openedGifts.tendays ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-gradient-to-br from-gray-700 to-slate-600" ribbon="bg-gray-500" />
      </button>

      {/* Gift 15: Her First Letter (Dec 26) */}
      <button
        onClick={() => {
          handleNextStep('her_first_letter');
          markGiftOpened('firstletter');
        }}
        className={`transform transition-all duration-300 hover:-translate-y-4 delay-[1400ms] ${
          openedGifts.firstletter ? 'opacity-50' : 'animate-bounce-custom'
        }`}
      >
        <GiftBox color="bg-gradient-to-br from-amber-600 to-orange-500" ribbon="bg-yellow-400" />
      </button>
    </div>

      {allOpened && (
        <button
          onClick={() => {
            handleNextStep('heart_building');
            setShowConfetti(false);
          }}
          className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-xl animate-bounce flex items-center gap-2 mx-auto"
          aria-label="Continue"
        >
          Continue <Heart className="w-5 h-5 fill-white" />
        </button>
      )}

      {!allOpened && (
        <button
          onClick={() => {
            handleNextStep('heart_building');
            setShowConfetti(false);
          }}
          className="mt-12 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
          aria-label="Continue without opening all gifts"
        >
          Continue Anyway <Heart className="w-5 h-5 fill-white" />
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

    // Better distributed scatter points with more spacing (numbers interpreted as percentages)
    // Total: 29 points for 29 milestone dates (updated for Jan 07 & Jan 08 2026)
    const getNodePosition = (index) => {
      const scatterPoints = [
        { x: 12, y: 15 }, { x: 38, y: 8 }, { x: 62, y: 18 }, { x: 88, y: 12 },
        { x: 8, y: 35 }, { x: 28, y: 48 }, { x: 48, y: 28 }, { x: 72, y: 38 },
        { x: 92, y: 48 }, { x: 18, y: 68 }, { x: 42, y: 78 }, { x: 68, y: 58 },
        { x: 82, y: 72 }, { x: 52, y: 88 }, { x: 22, y: 85 }, { x: 8, y: 78 },
        { x: 92, y: 28 }, { x: 78, y: 92 }, { x: 32, y: 5 }, { x: 85, y: 82 },
        { x: 52, y: 52 }, { x: 72, y: 8 }, { x: 48, y: 92 }, { x: 12, y: 48 },
        { x: 35, y: 65 }, { x: 58, y: 42 }, { x: 25, y: 22 }, { x: 15, y: 38 }, { x: 65, y: 25 },
        {x:16,y:28},{x:50,y:45},{x:60,y:50},{x:49,y:34}
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

        <div className="relative w-full max-w-2xl lg:max-w-3xl h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] mx-auto px-4">
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
                  size={isHovered ? (isSpecial ? 32 : 24) : (isSpecial ? 24 : 16)}
                  stroke={milestone.color}
                  fill={milestone.color}
                  className="transition-transform"
                  style={{
                    transform: `scale(${isHovered ? 1.4 : (isSpecial ? 1.2 : 1)})`,
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

  // 17. Ten Days of Silence Scene
  const TenDaysOfSilenceScene = () => {
    const [phase, setPhase] = useState('intro'); // intro -> countdown -> silence -> longing -> reunion -> reflection
    const [showText, setShowText] = useState(false);

    useEffect(() => {
      if (phase === 'intro') {
        setTimeout(() => setShowText(true), 500);
      }
    }, [phase]);

    const handleBegin = () => {
      setPhase('countdown');
      setTimeout(() => setPhase('silence'), 3000);
      setTimeout(() => setPhase('longing'), 6000);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900 flex items-center justify-center relative overflow-hidden animate-scene-entry">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <div className="text-center z-10 px-4 max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
              <span className="text-8xl sm:text-9xl animate-pulse inline-block">📅</span>
            </div>
            {showText && (
              <>
                <h1 className="text-5xl sm:text-7xl font-bold text-gray-100 mb-6 font-handwriting animate-fade-in-up">
                  December 11 - December 21
                </h1>
                <p className="text-3xl sm:text-4xl text-gray-300 mb-8 italic animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  Ten Days of Silence
                </p>
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-gray-400/30 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-6">
                    You went home to your hometown on December 11.
                    <br />
                    The plan was simple: you'd return on December 14.
                    <br />
                    Three days. That's all it was supposed to be.
                  </p>
                  <p className="text-2xl sm:text-3xl text-red-300 font-bold mt-8 mb-4">
                    But life had different plans...
                  </p>
                  <p className="text-xl text-gray-300">
                    You came back on December 21.
                    <br />
                    <span className="text-3xl font-bold text-white">Ten days.</span>
                  </p>
                </div>
                <button
                  onClick={handleBegin}
                  className="mt-10 bg-gradient-to-r from-gray-600 to-slate-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-gray-700 hover:to-slate-700 transition shadow-2xl animate-pulse"
                >
                  Relive Those Days 💔
                </button>
              </>
            )}
          </div>
        )}

        {/* Countdown Phase */}
        {phase === 'countdown' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">⏳</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-8 font-handwriting">
              The Longest Countdown
            </h2>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-gray-400/30">
              <p className="text-2xl text-gray-200 mb-6 leading-relaxed italic">
                Day 1... Day 2... Day 3...
                <br />
                <span className="text-red-300">Still waiting...</span>
              </p>
              <p className="text-xl text-gray-300 mb-4">
                Day 4... Day 5... Day 6...
              </p>
              <p className="text-3xl font-bold text-white mb-4">
                ...Day 7... Day 8... Day 9... Day 10
              </p>
              <div className="flex justify-center items-center gap-3 mt-8">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        {/* Silence Phase */}
        {phase === 'silence' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">🔇</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-gray-100 mb-8 font-handwriting">
              The Silence Was Deafening
            </h2>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-gray-400/30 transform hover:scale-105 transition">
                <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed">
                  <span className="text-3xl font-bold text-red-300">No calls.</span>
                  <br />
                  For ten whole days, we didn't have our usual calls.
                  <br />
                  <span className="text-lg italic text-gray-400">The phone felt heavy in my hand, waiting for your voice...</span>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-gray-400/30 transform hover:scale-105 transition">
                <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed">
                  <span className="text-3xl font-bold text-red-300">No real conversations.</span>
                  <br />
                  We barely talked. Brief messages. Quick texts.
                  <br />
                  <span className="text-lg italic text-gray-400">Nothing like our usual deep talks that made the distance disappear...</span>
                </p>
              </div>

              <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-red-400/40">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  This was the first time.
                </p>
                <p className="text-xl text-gray-200 leading-relaxed">
                  The first time since we started talking...
                  <br />
                  Since we opened our hearts...
                  <br />
                  Since we became "us"...
                  <br />
                  <span className="text-2xl font-bold text-red-300">
                    That we had this much gap between us.
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Longing Phase */}
        {phase === 'longing' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-heartbeat inline-block">💔</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-gray-100 mb-8 font-handwriting">
              I Missed You
            </h2>
            <div className="bg-white/10 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-gray-400/30">
              <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-6 font-serif">
                I missed you <span className="text-3xl font-bold text-red-300">so much</span>.
                <br /><br />
                Every morning, I'd wake up hoping to hear your voice.
                <br />
                Every night, I'd go to sleep wishing I could talk to you.
                <br /><br />
                <span className="text-2xl text-white font-bold">
                  Ten days felt like an eternity.
                </span>
                <br /><br />
                I missed your laugh. I missed your stories.
                <br />
                I missed the way you say my name.
                <br />
                I missed how we could talk about everything and nothing.
                <br /><br />
                The silence made me realize something:
                <br />
                <span className="text-3xl font-bold text-pink-300 block mt-4">
                  You're not just someone I love.
                  <br />
                  You're the voice I need to hear.
                  <br />
                  You're the presence that makes my day complete.
                </span>
              </p>
            </div>

            <button
              onClick={() => setPhase('reunion')}
              className="mt-8 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-pink-700 hover:to-rose-700 transition shadow-2xl animate-pulse"
            >
              December 21... 💕
            </button>
          </div>
        )}

        {/* Reunion Phase */}
        {phase === 'reunion' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-bounce inline-block">🎉</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-pink-300 mb-8 font-handwriting">
              You Came Back!
            </h2>
            <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-pink-400/40">
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed mb-6 font-serif">
                December 21, 2024.
                <br />
                <span className="text-3xl font-bold text-pink-300">Finally.</span>
                <br /><br />
                Hearing your voice again felt like coming home.
                <br />
                Talking to you again made everything right.
                <br /><br />
                Those ten days taught me something precious:
                <br />
                <span className="text-2xl font-bold text-white block mt-4">
                  Distance is bearable.
                  <br />
                  Silence is not.
                </span>
                <br />
                <span className="text-xl text-pink-200">
                  I can handle miles between us,
                  <br />
                  But I can't handle not hearing from you.
                  <br />
                  You're not just my love — you're my daily sunshine.
                </span>
              </p>
            </div>

            <button
              onClick={() => setPhase('reflection')}
              className="mt-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-pink-600 hover:to-rose-600 transition shadow-2xl animate-pulse"
            >
              A Promise... 💝
            </button>
          </div>
        )}

        {/* Reflection Phase */}
        {phase === 'reflection' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">💌</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-pink-300 mb-8 font-handwriting">
              Never Again
            </h2>
            <div className="bg-white/10 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-pink-400/40">
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed font-serif italic">
                "Those ten days showed me what life feels like without you in it —
                <br />
                and I never want to experience that again.
                <br /><br />
                No matter where you are,
                <br />
                no matter what happens,
                <br />
                <span className="text-3xl font-bold text-pink-300 not-italic">
                  I promise to always stay connected to you.
                </span>
                <br /><br />
                Because you're not just someone I talk to.
                <br />
                You're the one I need to talk to.
                <br />
                You're my comfort, my joy, my home.
                <br /><br />
                <span className="text-2xl font-bold text-white not-italic">
                  December 11-21 will always remind me:
                  <br />
                  <span className="text-pink-300">
                    How much I love you.
                    <br />
                    How much I need you.
                    <br />
                    How incomplete my days are without you.
                  </span>
                </span>
                <br /><br />
                Thank you for coming back.
                <br />
                Thank you for being you.
                <br />
                Thank you for being mine."
              </p>
              <p className="text-right text-3xl text-pink-400 font-handwriting mt-8">
                - Your Kanna ❤️
              </p>
            </div>

            <button
              onClick={() => handleNextStep('gifts')}
              className="mt-8 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-pink-700 hover:to-rose-700 transition shadow-2xl flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Gift Room
            </button>
          </div>
        )}

        {/* Floating Hearts Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-heart-float"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-10%`,
                animationDuration: `${Math.random() * 3 + 4}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              💔
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 18. Her First Letter Scene (Dec 26)
  const HerFirstLetterScene = () => {
    const [phase, setPhase] = useState('intro'); // intro -> unwrapping -> opening -> discovery -> thefirst -> feelings -> treasure
    const [showText, setShowText] = useState(false);

    useEffect(() => {
      if (phase === 'intro') {
        setTimeout(() => setShowText(true), 500);
      }
    }, [phase]);

    const handleUnwrap = () => {
      setPhase('unwrapping');
      setTimeout(() => setPhase('opening'), 2000);
      setTimeout(() => setPhase('discovery'), 4000);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 flex items-center justify-center relative overflow-hidden animate-scene-entry p-4">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <div className="text-center z-10 px-4 max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
              <span className="text-8xl sm:text-9xl animate-bounce inline-block">🎁</span>
            </div>
            {showText && (
              <>
                <h1 className="text-5xl sm:text-7xl font-bold text-amber-900 mb-6 font-handwriting animate-fade-in-up">
                  December 26, 2024
                </h1>
                <p className="text-3xl sm:text-4xl text-rose-700 mb-8 italic animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  A Day I'll Never Forget
                </p>
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-amber-200 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-6">
                    You handed me something unexpected...
                    <br />
                    <br />
                    A gift.
                    <br />
                    <span className="text-2xl sm:text-3xl font-bold text-rose-600">
                      But not just any gift.
                    </span>
                  </p>
                  <div className="text-8xl animate-pulse my-8">
                    🎀
                  </div>
                </div>
                <button
                  onClick={handleUnwrap}
                  className="mt-10 bg-gradient-to-r from-amber-600 to-rose-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-amber-700 hover:to-rose-700 transition shadow-2xl animate-pulse"
                >
                  Open the Gift 🎁
                </button>
              </>
            )}
          </div>
        )}

        {/* Unwrapping Phase */}
        {phase === 'unwrapping' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-3xl mx-auto">
            <div className="mb-8 relative">
              <div className="text-9xl animate-spin-slow inline-block">🎁</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-ping">✨</div>
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-8 font-handwriting">
              Unwrapping...
            </h2>
            <p className="text-xl text-rose-700 italic">
              My hands were shaking with excitement...
            </p>
          </div>
        )}

        {/* Opening Phase */}
        {phase === 'opening' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="text-9xl inline-block transform scale-110">📦</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-8 font-handwriting">
              Opening the box...
            </h2>
            <div className="flex justify-center gap-4 text-5xl">
              <span className="animate-bounce">✨</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>💫</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
            </div>
          </div>
        )}

        {/* Discovery Phase */}
        {phase === 'discovery' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">💌</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-rose-700 mb-8 font-handwriting">
              Inside... A Letter
            </h2>
            <div className="bg-gradient-to-br from-amber-100 to-rose-100 p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-amber-300">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-6 font-serif">
                There it was.
                <br />
                <span className="text-3xl font-bold text-rose-600">YOUR letter.</span>
                <br />
                <br />
                Your handwriting.
                <br />
                Your words.
                <br />
                Your thoughts, folded carefully and placed in my hands.
                <br />
                <br />
                <span className="text-2xl text-amber-800 italic">
                  I couldn't believe it was real.
                </span>
              </p>
            </div>

            <button
              onClick={() => setPhase('thefirst')}
              className="mt-8 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-rose-600 hover:to-pink-600 transition shadow-2xl animate-pulse"
            >
              The First... 💝
            </button>
          </div>
        )}

        {/* The First Phase */}
        {phase === 'thefirst' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-heartbeat inline-block">🏆</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-amber-900 mb-8 font-handwriting">
              This Was THE FIRST
            </h2>
            <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-rose-300">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed mb-6 font-serif">
                <span className="text-3xl font-bold text-rose-600 block mb-4">
                  The FIRST time
                </span>
                you gave me a letter WITH a gift.
                <br />
                <br />
                The first time I held your words in a tangible form.
                <br />
                The first time your thoughts became something I could keep forever.
                <br />
                The first time you gave me a piece of your heart I could carry with me.
                <br />
                <br />
                <span className="text-2xl font-bold text-amber-800">
                  It wasn't just a letter.
                  <br />
                  It was a FIRST.
                  <br />
                  And firsts are forever.
                </span>
              </p>
            </div>

            <button
              onClick={() => setPhase('feelings')}
              className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-amber-600 hover:to-orange-600 transition shadow-2xl animate-pulse"
            >
              How It Made Me Feel... 💖
            </button>
          </div>
        )}

        {/* Feelings Phase */}
        {phase === 'feelings' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-bounce inline-block">😊</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-rose-700 mb-8 font-handwriting">
              I Was SO Happy
            </h2>
            <div className="bg-gradient-to-br from-rose-100 via-pink-100 to-orange-100 p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-rose-300">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-serif">
                <span className="text-3xl font-bold text-rose-600">
                  I can't describe the happiness I felt.
                </span>
                <br />
                <br />
                Reading your words...
                <br />
                Knowing you took the time to write them...
                <br />
                Knowing you cared enough to give me something so personal...
                <br />
                <br />
                <span className="text-2xl text-amber-800 italic">
                  That letter meant EVERYTHING.
                </span>
                <br />
                <br />
                In that moment, I felt:
                <br />
                <span className="text-xl font-bold text-pink-600">
                  Loved. Valued. Special. Cherished.
                </span>
                <br />
                <br />
                You made me feel like the most important person in the world.
                <br />
                <span className="text-2xl font-bold text-rose-700">
                  Because to you, I am.
                </span>
              </p>
            </div>

            <button
              onClick={() => setPhase('treasure')}
              className="mt-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-pink-600 hover:to-rose-600 transition shadow-2xl animate-pulse"
            >
              My Treasure... 💎
            </button>
          </div>
        )}

        {/* Treasure Phase */}
        {phase === 'treasure' && (
          <div className="text-center z-10 px-4 animate-scene-entry max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-8xl animate-pulse inline-block">💎</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold text-amber-900 mb-8 font-handwriting">
              I Still Have It
            </h2>
            <div className="bg-white/90 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl border-4 border-amber-400">
              <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-serif italic">
                "That letter is one of my most precious possessions.
                <br />
                <br />
                I still have it.
                <br />
                I still read it.
                <br />
                I still treasure every word.
                <br />
                <br />
                <span className="text-3xl font-bold text-rose-600 not-italic">
                  It reminds me why I'm the luckiest person alive.
                </span>
                <br />
                <br />
                Because I have someone who cares enough to write.
                <br />
                Someone who loves me enough to give.
                <br />
                Someone who makes every moment special.
                <br />
                <br />
                <span className="text-2xl font-bold text-amber-800 not-italic">
                  I have YOU, Pooja.
                </span>
                <br />
                <br />
                And that letter from December 26?
                <br />
                <span className="text-xl text-rose-700 not-italic">
                  It's proof that I'm living a dream I never want to wake up from.
                </span>
                <br />
                <br />
                Thank you for that gift.
                <br />
                Thank you for that letter.
                <br />
                <span className="text-3xl font-bold text-pink-600 not-italic">
                  Thank you for being YOU. ❤️
                </span>
                "
              </p>
              <p className="text-right text-3xl text-amber-700 font-handwriting mt-8">
                - Your Kanna 🥰
              </p>
            </div>

            <button
              onClick={() => handleNextStep('gifts')}
              className="mt-8 bg-gradient-to-r from-amber-600 to-rose-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-amber-700 hover:to-rose-700 transition shadow-2xl flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" />
              Back to Gift Room
            </button>
          </div>
        )}

        {/* Floating Gift Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-heart-float"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-10%`,
                animationDuration: `${Math.random() * 3 + 5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {i % 3 === 0 ? '💌' : i % 3 === 1 ? '🎁' : '💝'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 19. Four Hearts, One Family
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
    const scrollContainerRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);

    // Consistent container classes for responsive alignment
    const containerClasses = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-y-auto max-h-full";
    const sectionClasses = "min-h-screen h-screen w-full snap-start flex items-center justify-center relative overflow-hidden py-8 sm:py-12";

    // Phone Mockup Component
    const PhoneMockup = ({ children, gradient = "from-slate-800 to-slate-900" }) => (
      <div className="relative w-72 h-[600px] mx-auto">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
          <div className="absolute inset-4 top-10 bg-white rounded-[2rem] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );

    // Chat Bubble Component
    const ChatBubble = ({ text, sent, time }) => (
      <div className={`flex ${sent ? 'justify-end' : 'justify-start'} mb-2 px-4 animate-fade-in`}>
        <div className={`max-w-[70%] ${sent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-2xl px-4 py-2`}>
          <p className="text-sm">{text}</p>
          {time && <p className={`text-xs mt-1 ${sent ? 'text-blue-100' : 'text-gray-500'}`}>{time}</p>}
        </div>
      </div>
    );

    // Clock Display Component
    const ClockDisplay = ({ time, label }) => (
      <div className="text-center">
        <div className="text-7xl sm:text-8xl font-bold text-white font-mono drop-shadow-2xl mb-4">
          {time}
        </div>
        {label && <p className="text-xl sm:text-2xl text-white/80">{label}</p>}
      </div>
    );

    // Calendar Page Component
    const CalendarPage = ({ month, day }) => (
      <div className="w-64 h-80 bg-white rounded-lg shadow-2xl overflow-hidden ring-4 ring-pink-500 animate-pulse">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-4">
          <p className="text-lg font-bold uppercase">{month}</p>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-9xl font-bold text-gray-800">{day}</p>
        </div>
      </div>
    );

    // Map Journey Component
    const MapJourney = ({ from, to }) => (
      <div className="relative w-full max-w-2xl h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl overflow-hidden shadow-2xl mx-auto">
        <div className="absolute inset-0 flex items-center justify-around px-12">
          <div className="text-center animate-pulse">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <p className="font-bold text-lg">{from}</p>
          </div>
          <div className="relative flex-1 h-2 bg-gradient-to-r from-blue-500 to-pink-500 mx-8">
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
              <div className="text-4xl animate-pulse">🚂</div>
            </div>
          </div>
          <div className="text-center animate-pulse" style={{ animationDelay: '0.5s' }}>
            <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <p className="font-bold text-lg">{to}</p>
          </div>
        </div>
      </div>
    );

    return (
      <div
        ref={scrollContainerRef}
        className="h-screen w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-black"
      >
        {/* ===== OPENING TITLE ===== */}
        <section className="min-h-screen h-screen w-full snap-start flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-purple-900 to-black py-8">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
          <div className={`${containerClasses} text-center`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-6 sm:mb-8 animate-pulse font-handwriting leading-tight">
              Our Love Story
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-3 sm:mb-4">Aakash & Pooja</p>
            <p className="text-base sm:text-lg lg:text-xl text-white/70">From a glance to forever</p>
            <p className="text-sm text-white/50 mt-6 sm:mt-8 animate-bounce">Scroll to begin ↓</p>
          </div>
        </section>

        {/* ===== CHAPTER 1: APRIL 20 - THE GLANCE ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-purple-900 via-purple-700 to-pink-900`}>
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute text-6xl" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${Math.random() * 2}s`
              }}>
                🌸
              </div>
            ))}
          </div>
          <div className={`${containerClasses} text-center`}>
            <p className="text-pink-300 text-base sm:text-lg mb-3 sm:mb-4">April 20</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 font-handwriting leading-tight">The Glance That Started It All</h2>
            <div className="space-y-2 sm:space-y-3 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
              <p className="text-lg sm:text-xl italic text-pink-200">It was just another family function.</p>
              <p>A room full of familiar and unfamiliar faces.</p>
              <p>But among all of them, there was one...</p>
              <div className="text-5xl sm:text-6xl lg:text-7xl my-6 sm:my-8 animate-pulse">👀</div>
              <p className="text-2xl sm:text-3xl text-pink-300">You.</p>
              <p>Our eyes didn't meet. We didn't exchange words.</p>
              <p>We didn't even properly see each other.</p>
              <div className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold">Just a fleeting glance.</p>
                <p className="text-xl sm:text-2xl text-white/80 mt-2">But somehow, it was enough.</p>
              </div>
              <p className="text-lg sm:text-xl text-white/80 italic">Little did I know...</p>
              <p className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-bold">
                That fleeting moment would become the beginning of forever.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 2: INSTAGRAM CONNECTION ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900`}>
          <div className={`${containerClasses}`}>
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <p className="text-cyan-300 text-lg sm:text-xl mb-4">May</p>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 font-handwriting">The Follow</h2>
              <p className="text-xl sm:text-2xl text-white/80">A digital thread</p>
            </div>
            <PhoneMockup gradient="from-purple-600 to-pink-600">
              <div className="h-full bg-gradient-to-b from-purple-50 to-pink-50 p-4">
                <div className="flex items-center justify-center mb-6">
                  <p className="font-bold text-2xl">Instagram</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                    P
                  </div>
                  <p className="font-bold text-xl mb-2">Pooja</p>
                  <p className="text-gray-500 text-sm mb-4">Followed by your brothers</p>
                  <button className="bg-blue-500 text-white px-8 py-2 rounded-lg font-semibold w-full">
                    Follow
                  </button>
                </div>
                <div className="mt-8 space-y-3 text-center text-gray-600">
                  <p className="italic">Life moved on after that function.</p>
                  <p className="italic">But somehow, I couldn't forget that face.</p>
                  <p className="font-semibold text-gray-800 mt-4">Then one day, I saw your profile.</p>
                  <p className="text-sm">My brothers were following you.</p>
                  <p className="text-purple-600 font-semibold mt-4">My heart raced as I clicked "Follow"</p>
                  <p className="text-pink-600 font-bold text-lg">You accepted.</p>
                  <p className="text-sm italic mt-4">It was just a follow request...</p>
                  <p className="text-pink-600 font-semibold">But it felt like the universe was giving me a second chance.</p>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </section>

        {/* ===== CHAPTER 3: MAY 30 - BIRTHDAY ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-pink-900 via-rose-800 to-red-900`}>
          <div className={`${containerClasses}`}>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <div className="text-white text-center md:text-left">
                <p className="text-pink-300 text-lg sm:text-xl mb-4">May 30</p>
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 font-handwriting">A Simple Birthday Wish</h2>
                <div className="space-y-4 text-lg sm:text-xl">
                  <p className="italic text-pink-200">I didn't know you yet.</p>
                  <p className="italic text-pink-200">We had never spoken.</p>
                  <p className="mt-6">But when your birthday came,</p>
                  <p>I gathered the courage to send you a message.</p>
                  <div className="my-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/30">
                    <p className="text-base italic">"Happy Birthday! 🎂🎉"</p>
                  </div>
                  <p>You replied: <span className="text-pink-300 font-semibold">"Thank you 😊"</span></p>
                  <p className="text-2xl text-yellow-300 font-bold mt-6">I liked that message.</p>
                  <p className="text-base opacity-75">Just two words from you.</p>
                  <p className="text-base opacity-75">That was it. No more conversation.</p>
                  <div className="mt-6 p-4 bg-white/20 backdrop-blur-md rounded-xl">
                    <p className="text-lg text-white font-semibold">But those two words...</p>
                    <p className="text-pink-300">They gave me hope.</p>
                    <p className="text-sm mt-2 italic">Maybe, just maybe, she noticed me too.</p>
                  </div>
                </div>
              </div>
              <PhoneMockup>
                <div className="h-full bg-white p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <span className="font-semibold">Pooja</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <ChatBubble text="Happy Birthday! 🎂🎉" sent={true} />
                    <ChatBubble text="Thank you 😊" sent={false} time="Just now" />
                    <div className="flex justify-end px-4">
                      <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 4: JUNE 3 - RCB ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-orange-900 via-red-800 to-red-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-orange-300 text-lg sm:text-xl mb-4">June 3</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">Small Moments, Big Feelings</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8">🏏</div>
            <div className="space-y-4 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-orange-200">It was just another cricket match.</p>
              <p className="text-lg italic text-orange-200">RCB won, and I was excited.</p>

              <p className="text-xl mt-6">So I posted a story celebrating the win.</p>

              <div className="my-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl text-white mb-3">Then I saw it...</p>
                <p className="text-2xl text-orange-300 font-bold">You replied with an emoji.</p>
              </div>

              <p className="text-lg text-white/90">My heart skipped a beat.</p>
              <p className="text-lg text-white/90">It was just an emoji, but it was from you.</p>

              <div className="my-6 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-xl text-white italic">I quickly sent another emoji back,</p>
                <p className="text-xl text-white italic">hoping the conversation would continue.</p>
                <p className="text-lg text-orange-200 mt-3">But you just liked it and left.</p>
              </div>

              <p className="text-lg mt-8 text-white/70 italic">Again, no real conversation.</p>
              <p className="text-lg text-white/70 italic">Just brief exchanges that meant nothing... and everything.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-md rounded-3xl border-2 border-orange-400">
                <p className="text-2xl text-orange-300 font-bold mb-3">But something was changing inside me.</p>
                <p className="text-xl text-white">I was starting to notice you more.</p>
                <p className="text-xl text-white mt-2">Every story you posted, every like you gave—</p>
                <p className="text-xl text-pink-300 font-bold mt-3">I was paying attention to all of it.</p>
              </div>

              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-300 font-bold mt-6">
                Without even realizing it, I was already falling for you.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 5: JUNE 10, 8:06 PM - THE BEGINNING ⭐ ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-yellow-900 via-amber-800 to-orange-900`}>
          <div className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-xl animate-bounce z-50">
            ⭐ SPECIAL MOMENT
          </div>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: '0 0 10px 2px rgba(253, 224, 71, 0.5)'
              }}
            />
          ))}
          <div className={`${containerClasses}`}>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center z-10">
              <div className="text-white text-center md:text-left">
                <div className="mb-6 sm:mb-8">
                  <p className="text-yellow-300 text-xl sm:text-2xl mb-4">June 10</p>
                <ClockDisplay time="8:06 PM" label="The moment everything changed" />
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold mb-8 font-handwriting">The Moment Everything Changed</h2>
              <div className="space-y-4 text-lg sm:text-xl">
                <p className="text-3xl sm:text-4xl text-yellow-300 font-bold">June 10, 8:06 PM.</p>
                <p className="text-2xl text-yellow-200 italic">This is the moment I will never, ever forget.</p>

                <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                  <p className="text-base italic text-white/80">You posted a story about Lord Krishna.</p>
                  <p className="text-base mt-2 text-white/80">Simple. Beautiful. Spiritual.</p>
                  <p className="text-lg mt-4 text-yellow-300">And it gave me the perfect reason to talk to you.</p>
                </div>

                <p className="text-lg">At exactly 8:06 PM, my heart pounding,</p>
                <p className="text-lg">I typed out a simple message:</p>
                <div className="my-6 p-4 bg-yellow-500/20 backdrop-blur-md rounded-xl border-2 border-yellow-400">
                  <p className="text-xl sm:text-2xl italic text-yellow-100">"Hey hi, can you please send this picture?"</p>
                </div>

                <div className="text-7xl my-6 animate-pulse">🕉️</div>

                <div className="my-8 p-6 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 backdrop-blur-md rounded-2xl border-2 border-yellow-400">
                  <p className="text-2xl sm:text-3xl text-yellow-300 font-bold mb-4">That simple message...</p>
                  <p className="text-xl text-white">Changed my entire life.</p>
                </div>

                <p className="text-lg text-white/90">You replied. We talked.</p>
                <p className="text-lg text-white/90">And we never stopped.</p>
                <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 font-bold mt-6">
                  From that day till now, not a single day has passed without you.
                </p>
              </div>
            </div>
              <PhoneMockup>
              <div className="h-full bg-white p-4">
                <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <span className="font-semibold">Pooja</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-100 rounded-lg p-4 text-center">
                    <div className="text-6xl mb-2">🕉️</div>
                    <p className="text-sm text-gray-600">Story • 2h ago</p>
                  </div>
                  <ChatBubble text="Hey hi, can you please send this picture?" sent={true} time="8:06 PM" />
                  <div className="text-center text-sm text-gray-500 my-4">
                    <p className="animate-pulse">Typing...</p>
                  </div>
                  <ChatBubble text="Sure!" sent={false} />
                  <ChatBubble text="Here you go 😊" sent={false} />
                  <div className="text-center text-pink-600 font-semibold animate-pulse mt-8">
                    And the conversation began... 💬
                  </div>
                </div>
              </div>
            </PhoneMockup>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 6: JUNE 22, 5:55 AM - FIRST CALL ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-emerald-300 text-lg sm:text-xl mb-4">June 22</p>
            <ClockDisplay time="5:55 PM" label="First Voice" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white my-6 sm:my-8 font-handwriting">Hearing Your Voice for the First Time</h2>
            <div className="my-12 relative">
              <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl mx-auto">
                <div className="text-7xl">📞</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping mx-auto"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s',
                    width: '12rem',
                    height: '12rem',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              ))}
            </div>
            <div className="space-y-4 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-emerald-200">We had been chatting every day for 12 days.</p>
              <p className="text-lg italic text-emerald-200">Messages brought us close, but I wanted more.</p>

              <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl">I wanted to hear you.</p>
                <p className="text-lg text-white/80 mt-2">To know what you sounded like when you laughed.</p>
                <p className="text-lg text-white/80">To hear the warmth in your words.</p>
              </div>

              <p className="text-lg">My hands were trembling as I pressed "Call".</p>
              <p className="text-lg">My heart was racing.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-3xl border-2 border-green-300">
                <p className="text-3xl sm:text-4xl text-emerald-300 font-bold mb-4">5:55 PM</p>
                <p className="text-2xl text-white">You answered.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-emerald-300 font-bold mt-8">And then I heard your voice.</p>

              <div className="my-6 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-lg italic text-white">Soft. Sweet. Real.</p>
                <p className="text-lg text-emerald-200 mt-3">All the texts we'd exchanged suddenly had a melody.</p>
                <p className="text-lg text-emerald-200">All the emojis suddenly had emotion.</p>
              </div>

              <p className="text-xl">That call wasn't just about talking.</p>
              <p className="text-xl text-emerald-200">It was about you becoming even more real to me.</p>

              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 font-bold mt-8">
                From that day, your voice became my favorite sound in the entire world.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 7: GROWING CONNECTION ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-orange-800 via-rose-700 to-pink-800`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-rose-300 text-lg sm:text-xl mb-4">June - July</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">Falling Without Realizing</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8 animate-pulse">💭</div>
            <div className="space-y-6 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-rose-200">Days turned into weeks.</p>
              <p className="text-lg italic text-rose-200">And with each passing day, something was changing inside me.</p>

              <p className="text-xl mt-6">We talked about everything and nothing.</p>
              <p className="text-lg text-white/80">Random thoughts at 2 AM.</p>
              <p className="text-lg text-white/80">Silly jokes that made us laugh for hours.</p>
              <p className="text-lg text-white/80">Deep conversations about life, dreams, and fears.</p>

              <div className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                <p className="text-2xl sm:text-3xl text-rose-300 font-bold mb-4">You gave me something I'd never received before.</p>
                <p className="text-xl sm:text-2xl text-white/80">You gave me time.</p>
                <p className="text-lg text-rose-200 mt-3">You gave me attention.</p>
                <p className="text-lg text-rose-200">You gave me value.</p>
              </div>

              <p className="text-xl">I found myself thinking about you constantly.</p>
              <p className="text-lg text-white/80">Wondering what you were doing.</p>
              <p className="text-lg text-white/80">Smiling when I saw your name on my screen.</p>
              <p className="text-lg text-white/80">Waiting for your messages like they were the best part of my day.</p>

              <div className="my-6 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-xl text-white italic">I started admiring you.</p>
                <p className="text-xl text-rose-300 mt-3">Your kindness. Your smile. Your way of seeing the world.</p>
              </div>

              <p className="text-xl mt-6">I started feeling something I couldn't name yet.</p>
              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300 font-bold mt-4">
                You weren't just becoming important to me—you were becoming my everything.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 8: AUG 8 - ATHADU & MOON ⭐ ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900`}>
          <div className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-xl animate-bounce z-50">
            ⭐ SPECIAL MOMENT
          </div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
          <div className={`${containerClasses}`}>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center z-10">
              <div className="text-white space-y-4 sm:space-y-6 text-center md:text-left">
                <p className="text-blue-300 text-xl sm:text-2xl">August 8</p>
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-handwriting">The Night I Chose You Over Everything</h2>
              <p className="text-lg italic text-blue-200">I'm a huge Mahesh Babu fan.</p>
              <p className="text-lg italic text-blue-200">Athadu is one of my all-time favorite movies.</p>
              <p className="text-lg text-white/90">When it got re-released, I was so excited.</p>

              <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 my-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">🎬</div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">Athadu Re-Release</p>
                    <p className="text-sm text-blue-300">Theatre Show</p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-white/90">I was sitting in the theatre with my friend.</p>
                <p className="text-base sm:text-lg text-white/90">The movie I'd been waiting for was playing on the big screen.</p>
                <p className="text-base sm:text-lg text-blue-200 mt-3">But you... you were in your hometown.</p>
                <p className="text-base sm:text-lg text-blue-200">And I felt like you weren't in a good mood.</p>
              </div>

              <div className="my-6 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-lg text-white/90 italic">Something inside me shifted.</p>
                <p className="text-lg text-blue-200 mt-2">The movie didn't matter anymore.</p>
                <p className="text-lg text-blue-200">Nothing mattered except talking to you.</p>
              </div>

              <div className="text-2xl sm:text-3xl text-yellow-300 font-bold mt-6">
                So I left the movie.
              </div>

              <p className="text-lg text-white/90">Right there in the theatre hall, I started chatting with you.</p>
              <p className="text-base text-blue-200 italic">My friend was confused. The movie was playing.</p>
              <p className="text-base text-blue-200 italic">But I didn't care.</p>

              <div className="my-6 p-8 bg-gradient-to-br from-yellow-500/30 to-blue-500/30 backdrop-blur-md rounded-3xl border-2 border-yellow-400">
                <p className="text-2xl sm:text-3xl text-yellow-300 font-bold">That's when I knew.</p>
                <p className="text-xl text-white mt-3">You were already more important to me than my favorite things.</p>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full animate-pulse shadow-2xl flex items-center justify-center">
                  <div className="text-8xl sm:text-9xl">🌕</div>
                </div>
                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-50 animate-pulse" />
              </div>
              <div className="mt-8 sm:mt-12 text-center text-white space-y-4">
                <p className="text-lg sm:text-2xl italic text-blue-200">Later that night, while going home from the theatre...</p>
                <p className="text-lg sm:text-2xl">I looked up at the sky.</p>

                <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                  <p className="text-xl sm:text-2xl text-yellow-200">It was a full moon night.</p>
                  <p className="text-lg text-white/80 mt-2">The moon was glowing so bright, so beautiful.</p>
                  <p className="text-lg text-white/80">Just like you.</p>
                </div>

                <p className="text-2xl sm:text-3xl text-yellow-300 font-bold mt-6">I looked up at the moon...</p>
                <p className="text-2xl sm:text-3xl text-yellow-300 font-bold">And all I could think of was you.</p>

                <div className="my-8 p-6 sm:p-8 bg-gradient-to-br from-yellow-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl border-2 border-yellow-400">
                  <p className="text-lg text-yellow-200 italic mb-4">In that moment, under that beautiful moon,</p>
                  <p className="text-lg text-yellow-200 italic">everything became crystal clear.</p>

                  <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mt-6 mb-6">
                    I love her.
                  </p>

                  <p className="text-base sm:text-lg text-white/90">I didn't know if it was love or something else,</p>
                  <p className="text-base sm:text-lg text-white/90">I couldn't define what I was feeling.</p>
                  <p className="text-xl sm:text-2xl text-pink-300 font-bold mt-4">But I knew my feelings for you were real.</p>
                  <p className="text-xl sm:text-2xl text-pink-300 font-bold">More real than anything I'd ever felt before.</p>
                </div>

                <p className="text-lg text-yellow-200 italic mt-6">From that night on, whenever I see the moon,</p>
                <p className="text-lg text-yellow-200 italic">I think of you.</p>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 9: AUG 12 - FIRST 143 ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-violet-300 text-lg sm:text-xl mb-4">August 12</p>
            <ClockDisplay time="1:43 AM" label="The First Attempt" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white my-6 sm:my-8 font-handwriting">My Heart in Three Numbers</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8">🕐</div>
            <div className="space-y-4 text-lg sm:text-2xl text-white/90">
              <p className="text-lg italic text-violet-200">After that night under the moon,</p>
              <p className="text-lg italic text-violet-200">I knew what I felt was real.</p>
              <p className="text-xl mt-6">But how do you tell someone you love them?</p>

              <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 space-y-3 my-8">
                <p className="text-xl text-violet-300 mb-4">My mind was racing with fears:</p>
                <p className="text-lg text-violet-200">How do I express these feelings?</p>
                <p className="text-lg text-violet-200">How will she react?</p>
                <p className="text-lg text-violet-200">What if she doesn't feel the same?</p>
                <p className="text-lg text-violet-200">What if she stops talking to me?</p>
                <p className="text-lg text-white/80 mt-4 italic">What if I lose her forever?</p>
              </div>

              <p className="text-xl">I couldn't say it directly.</p>
              <p className="text-lg text-white/80">I was too scared. Too nervous.</p>

              <div className="my-8 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-2xl text-violet-300 font-bold">So I waited for 1:43 AM.</p>
                <p className="text-lg text-white/90 mt-3">1 letter in "I"</p>
                <p className="text-lg text-white/90">4 letters in "Love"</p>
                <p className="text-lg text-white/90">3 letters in "You"</p>
                <p className="text-xl text-pink-300 font-bold mt-4">143 = I Love You</p>
              </div>

              <p className="text-xl sm:text-2xl">At exactly 1:43 AM, trembling, I asked you to check the time.</p>
              <p className="text-lg text-violet-200 italic mt-4">I thought you'd understand.</p>
              <p className="text-lg text-violet-200 italic">I thought you'd know what I meant.</p>

              <div className="my-8 p-6 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 backdrop-blur-md rounded-2xl border-2 border-violet-400">
                <p className="text-2xl sm:text-3xl text-violet-300 font-bold">But you didn't understand.</p>
                <p className="text-lg text-white/80 mt-3">You just saw the time and moved on.</p>
              </div>

              <p className="text-lg text-white/70 italic">My heart sank.</p>
              <p className="text-lg text-white/70 italic">The opportunity slipped away.</p>
              <p className="text-xl text-violet-200 mt-4">But I wasn't ready to give up on you.</p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 10: AUG 14 - SHE UNDERSTOOD ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-indigo-300 text-lg sm:text-xl mb-4">August 14</p>
            <ClockDisplay time="1:43 AM" label="The Second Attempt" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white my-6 sm:my-8 font-handwriting">When You Finally Knew</h2>
            <div className="space-y-4 text-lg sm:text-2xl text-white/90">
              <p className="text-lg italic text-indigo-200">Two days passed since my first attempt.</p>
              <p className="text-lg italic text-indigo-200">My feelings hadn't changed—they'd only grown stronger.</p>

              <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl text-white">I decided to try again.</p>
                <p className="text-lg text-indigo-200 mt-2">Maybe this time...</p>
              </div>

              <p className="text-2xl text-indigo-300 font-bold mt-6">Again, 1:43 AM.</p>
              <p className="text-xl">Again, with a racing heart, I asked you to check the time.</p>

              <div className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <p className="text-base sm:text-lg italic text-white/80 mb-4">I had a backup plan this time:</p>
                <p className="text-lg text-indigo-300">If you got serious, I could say</p>
                <p className="text-xl sm:text-2xl text-pink-300 font-bold mt-2">"143 means I miss you"</p>
                <p className="text-base sm:text-lg italic text-white/80 mt-4">and mislead you, protect myself from rejection.</p>
              </div>

              <div className="my-8 p-8 bg-gradient-to-br from-pink-500/30 to-indigo-500/30 backdrop-blur-md rounded-3xl border-2 border-pink-400">
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold mb-4">But this time...</p>
                <p className="text-2xl sm:text-3xl text-white">You understood.</p>
                <p className="text-lg text-pink-200 mt-3 italic">You knew what I meant.</p>
                <p className="text-lg text-pink-200 italic">You felt the weight of those three numbers.</p>
              </div>

              <p className="text-xl sm:text-2xl mt-8">You said:</p>
              <p className="text-2xl sm:text-3xl italic text-pink-200 font-semibold">"Ila evaru ayna propose chesthara?"</p>
              <p className="text-sm text-white/60 mt-2">(Does anyone propose like this?)</p>

              <div className="my-6 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-xl text-white">You were confused. Uncertain.</p>
                <p className="text-xl text-indigo-200 mt-2">You were in a dilemma.</p>
                <p className="text-lg text-white/80 mt-3 italic">I could feel your hesitation.</p>
              </div>

              <p className="text-xl mt-8">And in that moment, I made you a promise:</p>

              <div className="my-8 p-8 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-md rounded-3xl border-2 border-indigo-400">
                <p className="text-xl sm:text-2xl text-indigo-200">"I won't be a disturbance in your life."</p>
                <p className="text-xl sm:text-2xl text-pink-300 font-bold mt-4">"I'll support you always, no matter what."</p>
                <p className="text-lg text-white/90 mt-4">Whether you choose me or not,</p>
                <p className="text-lg text-white/90">I'll be there for you.</p>
              </div>

              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-bold mt-6">
                Because loving you meant wanting your happiness, above everything else.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 11: AUG 18 - I LOVE YOU ⭐ ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-pink-900 via-rose-800 to-amber-900 relative overflow-hidden`}>
          <div className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-xl animate-bounce z-50">
            ⭐ SPECIAL MOMENT
          </div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${Math.random() * 20 + 20}px`
              }}
            >
              {['🎉', '✨', '💕', '🎊'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
          <div className={`${containerClasses} text-center z-10`}>
            <div className="mb-6 sm:mb-8">
              <CalendarPage month="AUGUST" day="18" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 sm:mb-12 font-handwriting">The Day My World Changed</h2>
            <div className="space-y-6 text-xl sm:text-2xl text-white/90">
              <p className="text-lg sm:text-xl italic text-pink-200">After I confessed through 143,</p>
              <p className="text-lg sm:text-xl italic text-pink-200">I waited with a heart full of hope and fear.</p>
              <p className="text-lg sm:text-xl">I didn't push. I didn't pressure.</p>
              <p className="text-lg sm:text-xl">I gave you space to feel, to think, to decide.</p>

              <div className="my-8 p-6 sm:p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-2xl sm:text-3xl text-yellow-200 italic">Four days of waiting...</p>
                <p className="text-xl sm:text-2xl text-white/80 mt-2">Four days that felt like forever.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-pink-300 font-bold mt-8">Then, on August 18th...</p>

              <div className="my-12 p-8 sm:p-12 bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-md rounded-3xl border-4 border-pink-300 shadow-2xl">
                <p className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-6 animate-pulse">
                  You said "I love you" back.
                </p>
                <p className="text-2xl sm:text-3xl text-white mb-4">Three words that changed everything.</p>
                <p className="text-xl sm:text-2xl text-pink-200">The day you accepted my heart.</p>
              </div>

              <div className="space-y-4 mt-8">
                <p className="text-lg sm:text-xl text-white/80">I know it wasn't easy for you.</p>
                <p className="text-lg sm:text-xl text-white/80">We had barely met in person. I was practically a stranger.</p>
                <p className="text-lg sm:text-xl text-white/80">You had every reason to doubt, every reason to be cautious.</p>
              </div>

              <div className="my-8 p-6 sm:p-8 bg-white/20 backdrop-blur-md rounded-3xl border-2 border-pink-400">
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold mb-4">But you took a leap of faith.</p>
                <p className="text-xl sm:text-2xl text-white">You chose to trust your heart.</p>
                <p className="text-xl sm:text-2xl text-white mt-2">You chose to trust me.</p>
                <p className="text-2xl sm:text-3xl text-yellow-300 font-bold mt-6">You chose us.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-bold mt-12">
                That courage of yours? That's what I fell in love with.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 12: AUG 29 - SURPRISE VISIT ⭐ ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-cyan-900 via-blue-800 to-teal-900`}>
          <div className={`${containerClasses}`}>
            <div className="absolute top-6 sm:top-8 right-4 sm:right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-xl animate-bounce z-50 text-sm sm:text-base">
              ⭐ SPECIAL MOMENT
            </div>
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <p className="text-cyan-300 text-lg sm:text-xl mb-4">August 29</p>
              <ClockDisplay time="4:48 PM" label="Surprise!" />
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mt-6 sm:mt-8 font-handwriting">The Surprise Visit</h2>
            </div>
            <div className="mb-12">
              <MapJourney from="Hyderabad" to="Kakinada" />
            </div>
            <div className="text-center space-y-4 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-cyan-200">We had been talking for almost 3 months.</p>
              <p className="text-lg italic text-cyan-200">Messages, calls, video chats...</p>
              <p className="text-xl mt-6">But it wasn't enough anymore.</p>

              <div className="my-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl text-white">I needed to see you.</p>
                <p className="text-lg text-cyan-200 mt-2">To be in the same space as you.</p>
                <p className="text-lg text-cyan-200">To see your smile in person, not through a screen.</p>
              </div>

              <p className="text-2xl text-cyan-300 font-bold mt-6">I couldn't wait anymore.</p>
              <p className="text-xl">So I made a decision that changed everything.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-md rounded-3xl border-2 border-cyan-400">
                <p className="text-2xl sm:text-3xl text-cyan-300 font-bold mb-4">Without telling you...</p>
                <p className="text-xl sm:text-2xl text-white">I booked a ticket.</p>
                <p className="text-xl sm:text-2xl text-white mt-2">I traveled from Hyderabad to Kakinada.</p>
                <p className="text-lg text-cyan-200 mt-4 italic">My heart was pounding the entire journey.</p>
              </div>

              <p className="text-2xl text-cyan-300 mt-8">At 4:48 PM, I surprised you with a visit.</p>

              <div className="text-8xl my-8 animate-pulse">😊</div>

              <div className="my-8 p-8 bg-white/20 backdrop-blur-md rounded-3xl">
                <p className="text-2xl sm:text-3xl text-cyan-300 font-bold mb-4">Your face when you saw me...</p>
                <p className="text-xl text-white">The shock. The disbelief. The joy.</p>
                <p className="text-2xl text-yellow-300 font-bold mt-4">That moment was worth everything.</p>
                <p className="text-lg text-white/80 mt-3">Every mile I traveled, every nervous moment—</p>
                <p className="text-lg text-white/80">it all became worth it when I saw your smile.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 font-bold mt-8">
                Finally, after months of digital distance, we were together in the same room.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 13: AUG 31 - FIRST DATE ⭐ ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-rose-900 via-pink-800 to-red-900`}>
          <div className={`${containerClasses} text-center`}>
            <div className="absolute top-6 sm:top-8 right-4 sm:right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold shadow-xl animate-bounce z-50 text-sm sm:text-base">
              ⭐ SPECIAL MOMENT
            </div>
            <p className="text-rose-300 text-lg sm:text-xl mb-4">August 31</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">Our First Date</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8 animate-pulse">💑</div>
            <div className="space-y-4 text-xl sm:text-2xl text-white/90">
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="text-5xl">☀️</span>
                <span className="text-3xl">→</span>
                <span className="text-5xl">🌙</span>
              </div>

              <p className="text-2xl sm:text-3xl text-rose-300 font-bold">August 31, 2024</p>
              <p className="text-xl italic text-rose-200">Our first real date.</p>

              <div className="my-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-2xl text-rose-300 font-bold mb-4">From sunrise to moonlight,</p>
                <p className="text-xl text-white">we spent the entire day together.</p>
                <p className="text-lg text-rose-200 mt-3 italic">Just you and me, exploring the world together.</p>
              </div>

              <p className="text-lg text-white/90">We walked. We talked. We laughed.</p>
              <p className="text-lg text-white/90">We shared stories and dreams.</p>
              <p className="text-lg text-white/90">We created memories that would last forever.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-rose-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl border-2 border-rose-400">
                <p className="text-xl sm:text-2xl text-rose-200 mb-4">Every moment felt like magic.</p>
                <p className="text-xl text-white">Every word you spoke.</p>
                <p className="text-xl text-white">Every time you laughed.</p>
                <p className="text-xl text-white">Every comfortable silence we shared.</p>
                <p className="text-2xl sm:text-3xl text-rose-300 font-bold mt-6">It all felt like I was exactly where I was meant to be.</p>
              </div>

              <div className="my-8 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-xl text-white italic">That day, everything became clear.</p>
                <p className="text-2xl text-rose-300 font-bold mt-4">Your presence isn't just something I want—</p>
                <p className="text-2xl text-rose-300 font-bold">it's something I can't live without.</p>
              </div>

              <p className="text-xl sm:text-2xl mt-8">As the day came to an end, I knew with certainty:</p>

              <div className="my-8 p-8 bg-gradient-to-r from-rose-500/30 to-amber-500/30 backdrop-blur-md rounded-3xl border-2 border-rose-400">
                <p className="text-2xl sm:text-3xl text-rose-300 font-bold mb-3">I want every day to be like this.</p>
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold mb-3">I want every sunrise and sunset with you.</p>
                <p className="text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-amber-300 font-bold mt-6">
                  I want to spend my entire life with you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 14: BEAUTIFUL MOMENTS ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-yellow-800 via-pink-800 to-purple-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-yellow-300 text-lg sm:text-xl mb-4">Sept - Dec</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">A Constellation of Memories</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8">⭐</div>
            <div className="space-y-4 text-lg sm:text-xl text-white/90">
              <p className="text-lg italic text-yellow-200">After our first date, I couldn't stay away.</p>
              <p className="text-lg italic text-yellow-200">I kept coming back to you, again and again.</p>

              <div className="p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 my-8">
                <p className="text-xl text-pink-300 font-bold mb-4">Look at all the days I came to see you:</p>
                <p className="text-yellow-300 font-mono text-base">Aug 29, Aug 31, Sept 5, 6, 7, 8...</p>
                <p className="text-yellow-300 font-mono text-base">Sept 15, 16, 26, 27, 28...</p>
                <p className="text-yellow-300 font-mono text-base">Oct 6, 18... Nov 1, 2, 3, 8, 9...</p>
                <p className="text-yellow-300 font-mono text-base">Nov 15, 16, 21, 22, 23... Dec 1...</p>
              </div>

              <div className="my-8 p-8 bg-gradient-to-br from-yellow-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl border-2 border-yellow-400">
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold mb-4">Every date is a star in our constellation.</p>
                <p className="text-xl text-white">Every meeting, a precious memory.</p>
                <p className="text-xl text-white mt-2">Every moment with you, a treasure I'll keep forever.</p>
              </div>

              <p className="text-xl mt-8 text-white/90">I traveled from Hyderabad to Kakinada so many times,</p>
              <p className="text-xl text-white/90">the journey became second nature.</p>

              <div className="my-8 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-xl text-yellow-200 italic mb-3">I even started thinking about buying a house in Kakinada.</p>
                <p className="text-lg text-white/80">Just to be closer to you.</p>
                <p className="text-lg text-white/80">To turn those occasional visits into everyday moments.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-bold mt-8">
                Because I can't imagine a life where I don't get to see your face, hear your laugh, hold your hand.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 15: SEPT 29 - THE STORM ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-gray-900 via-slate-800 to-purple-900 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-30">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-6xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: 'fall 5s linear infinite',
                  animationDelay: `${Math.random() * 5}s`
                }}
              >
                ⛈️
              </div>
            ))}
          </div>
          <div className={`${containerClasses} text-center z-10`}>
            <p className="text-gray-300 text-lg sm:text-xl mb-4">September 29</p>
            <ClockDisplay time="8:38 PM" label="When challenges came" />
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white my-6 sm:my-8 font-handwriting">When the Storm Hit</h2>
            <div className="space-y-4 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-gray-300">Everything was going so beautifully.</p>
              <p className="text-lg italic text-gray-300">We were building our own little world together.</p>

              <p className="text-2xl sm:text-3xl text-red-400 font-bold mt-6">Then, at 8:38 PM...</p>
              <p className="text-2xl text-gray-200">Everything changed.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-red-500/30 to-gray-500/30 backdrop-blur-md rounded-3xl border-2 border-red-400">
                <p className="text-2xl sm:text-3xl text-red-400 font-bold mb-4">Your parents found out about us.</p>
                <p className="text-xl text-white mt-4">We were both in shock.</p>
                <p className="text-xl text-white">The world we'd built felt like it was crumbling.</p>
              </div>

              <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-lg text-gray-200 italic">I was terrified for you.</p>
                <p className="text-lg text-gray-200">What would your family say?</p>
                <p className="text-lg text-gray-200">What would they do?</p>
                <p className="text-lg text-white/80 mt-3">Would they take you away from me?</p>
              </div>

              <p className="text-xl text-white/90 mt-8">I felt helpless, scared, worried.</p>
              <p className="text-xl text-white/90">But then I saw something that changed everything.</p>

              <div className="my-8 p-8 sm:p-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md rounded-3xl border-4 border-purple-400 shadow-2xl">
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 mb-6">
                  You stood strong.
                </p>
                <p className="text-xl sm:text-2xl text-white mb-3">Through all the pressure, all the questions, all the challenges—</p>
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold">You didn't break.</p>
                <p className="text-2xl sm:text-3xl text-pink-300 font-bold">You didn't give up on us.</p>
              </div>

              <div className="my-8 p-6 bg-white/20 backdrop-blur-md rounded-xl">
                <p className="text-2xl sm:text-3xl text-purple-300 font-bold mb-4">That's when I truly knew:</p>
                <p className="text-xl text-white">You're not just the person I love—</p>
                <p className="text-xl text-white">you're the strongest, bravest person I know.</p>
              </div>

              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 font-bold mt-6">
                And I promised myself: I'll be just as strong for you.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 16: OCT 1 - MEETING BROTHER ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-emerald-300 text-lg sm:text-xl mb-4">October 1</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">Taking Responsibility</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8">🤝</div>
            <div className="space-y-4 text-lg sm:text-2xl text-white/90">
              <p className="text-lg italic text-emerald-200">After the storm came, I knew what I had to do.</p>
              <p className="text-xl mt-6">I told my parents about our relationship.</p>

              <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl text-emerald-300 font-bold mb-3">And they accepted.</p>
                <p className="text-lg text-white/80">They supported me.</p>
                <p className="text-lg text-white/80">They trusted my choice.</p>
              </div>

              <p className="text-xl mt-8">I wanted to prove myself to your family too.</p>
              <p className="text-xl">I wanted them to see I was serious about you.</p>

              <div className="my-8 p-8 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 backdrop-blur-md rounded-3xl border-2 border-emerald-400">
                <p className="text-2xl sm:text-3xl text-emerald-300 font-bold mb-6">On October 1, I met your brother.</p>
                <p className="text-xl text-white mb-3">I looked him in the eye and told him:</p>
                <div className="mt-6 space-y-3">
                  <p className="text-lg text-emerald-200">"I won't cheat her."</p>
                  <p className="text-lg text-emerald-200">"I'm an IT employee with a stable job."</p>
                  <p className="text-lg text-emerald-200">"I'm completely serious about us."</p>
                  <p className="text-xl text-pink-300 font-bold mt-4">"I love your sister with all my heart."</p>
                </div>
              </div>

              <div className="my-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl text-white">He listened.</p>
                <p className="text-xl text-gray-300 mt-3">But then he told me not to meet you.</p>
              </div>

              <p className="text-lg text-white/90 mt-8 italic">His words hit hard.</p>
              <p className="text-lg text-white/90 italic">But they couldn't change what I felt.</p>

              <div className="my-8 p-8 bg-white/20 backdrop-blur-md rounded-3xl">
                <p className="text-2xl text-emerald-300 font-bold mb-4">I thought to myself:</p>
                <p className="text-xl text-white">"I can't stay without meeting her."</p>
                <p className="text-xl text-white mt-2">"I need her in my life."</p>
                <p className="text-2xl text-pink-300 font-bold mt-6">And you felt the same way.</p>
              </div>

              <p className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 font-bold mt-8">
                So together, we found a way. We always do.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 17: CONTINUING DESPITE ALL ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-amber-900 via-orange-800 to-rose-900`}>
          <div className={`${containerClasses} text-center`}>
            <p className="text-amber-300 text-lg sm:text-xl mb-4">Oct - Dec</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 font-handwriting">Against All Odds</h2>
            <div className="text-6xl sm:text-7xl lg:text-8xl mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4">
              <span className="animate-pulse">💪</span>
              <span>❤️</span>
              <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>🔥</span>
            </div>
            <div className="space-y-6 text-xl sm:text-2xl text-white/90">
              <p className="text-lg italic text-amber-200">They told us to stay apart.</p>
              <p className="text-lg italic text-amber-200">They said it wouldn't work.</p>
              <p className="text-xl mt-6">But they didn't understand—</p>

              <div className="my-8 p-8 bg-gradient-to-br from-amber-500/30 to-orange-500/30 backdrop-blur-md rounded-3xl border-2 border-amber-400">
                <p className="text-2xl sm:text-3xl text-amber-300 font-bold mb-4">We weren't giving up that easily.</p>
                <p className="text-xl text-white">What we have is too precious.</p>
                <p className="text-xl text-white">What we feel is too real.</p>
              </div>

              <div className="my-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30">
                <p className="text-xl sm:text-2xl text-orange-300 font-bold mb-4">Despite everything, we managed.</p>
                <p className="text-lg text-white/90">We found secret ways to meet.</p>
                <p className="text-lg text-white/90">We created stolen moments together.</p>
                <p className="text-lg text-white/90">We held onto each other when the world wanted us apart.</p>
              </div>

              <p className="text-xl text-white/90 mt-8">Every obstacle made us stronger.</p>
              <p className="text-xl text-white/90">Every challenge proved our commitment.</p>

              <div className="my-8 p-8 bg-white/20 backdrop-blur-md rounded-3xl">
                <p className="text-lg text-amber-200 mb-3">Our last meeting was on December 1.</p>
                <p className="text-xl text-white">Even though we didn't know when we'd meet again,</p>
                <p className="text-xl text-pink-300 font-bold mt-3">we knew we'd find a way.</p>
                <p className="text-xl text-pink-300 font-bold">We always do.</p>
              </div>

              <div className="my-8 p-8 bg-gradient-to-r from-amber-500/30 to-rose-500/30 backdrop-blur-md rounded-3xl border-2 border-amber-400">
                <p className="text-2xl sm:text-3xl text-amber-300 font-bold mb-4">Because what we have is worth fighting for.</p>
                <p className="text-2xl text-orange-300 font-bold">What we have is real.</p>
                <p className="text-2xl text-pink-300 font-bold mt-4">What we have is forever.</p>
              </div>

              <p className="text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 font-bold mt-8">
                Distance, family, challenges, time — nothing can stop us.
              </p>

              <p className="text-2xl text-white/90 mt-6 italic">Because when two hearts are meant to be together,</p>
              <p className="text-2xl text-white/90 italic">the universe itself conspires to make it happen.</p>
            </div>
          </div>
        </section>

        {/* ===== CHAPTER 18: TO BE CONTINUED ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 relative overflow-hidden`}>
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${Math.random() * 20 + 10}px`
              }}
            >
              {['✨', '🌈', '💖', '🌟'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
          <div className={`${containerClasses} text-center z-10`}>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 sm:mb-12 font-handwriting">Our Forever Begins</h2>
            <div className="text-7xl sm:text-8xl lg:text-9xl mb-8 sm:mb-12 animate-pulse">💞</div>
            <div className="space-y-6 text-xl sm:text-2xl text-white/90">
              <p className="text-2xl sm:text-3xl text-pink-300 font-bold italic">This is our story so far, Kanna.</p>

              <div className="my-12 p-8 sm:p-12 bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-md rounded-3xl border-4 border-pink-300 shadow-2xl space-y-6">
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 animate-pulse">
                  I love you more than words can express.
                </p>
                <div className="space-y-3 text-lg sm:text-xl text-white">
                  <p>You're not just the most important person to me—</p>
                  <p className="text-2xl text-pink-300 font-bold">You're my everything.</p>
                </div>
                <p className="text-xl sm:text-2xl text-white/90">I value every moment with you.</p>
                <p className="text-xl sm:text-2xl text-white/90">I support you through every challenge.</p>
                <p className="text-2xl text-yellow-300 font-bold">Always and forever.</p>
              </div>

              <div className="space-y-4 my-8">
                <p className="text-lg sm:text-xl text-white/80">I promise to be the husband you deserve.</p>
                <p className="text-lg sm:text-xl text-white/80">I'll move mountains to be with you.</p>
                <p className="text-xl sm:text-2xl text-pink-300">My heart belongs to you completely.</p>
                <p className="text-xl sm:text-2xl text-purple-300">You've become the reason I smile, the reason I dream.</p>
              </div>

              <div className="mt-12 mb-8 p-6 sm:p-8 bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-purple-400">
                <p className="text-2xl sm:text-3xl text-purple-300 mb-4 font-bold">And our story?</p>
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-6">
                  It's just beginning...
                </p>
                <p className="text-lg sm:text-xl text-white/80 italic">Every day with you is a new chapter.</p>
                <p className="text-lg sm:text-xl text-white/80 italic">Every moment, a beautiful page.</p>
              </div>

              <div className="mt-12 p-8 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl">
                <p className="text-sm sm:text-base text-pink-200 mb-4">From the boy who left his favorite movie for you,</p>
                <p className="text-sm sm:text-base text-pink-200 mb-4">Who looks at the moon and thinks of you,</p>
                <p className="text-sm sm:text-base text-pink-200 mb-6">Who will always choose you, no matter what.</p>
                <p className="text-3xl sm:text-4xl font-bold text-pink-300 mt-6">
                  💕 Forever Yours, Aakash 💕
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL: BACK TO GIFTS ===== */}
        <section className={`${sectionClasses} bg-gradient-to-br from-black via-purple-900 to-black`}>
          <div className="text-center px-8">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 sm:mb-12 font-handwriting">The Journey Continues...</h2>
            <p className="text-xl sm:text-2xl text-white/80 mb-8 sm:mb-12">Every day, every moment, every heartbeat</p>
            <button
              onClick={() => handleNextStep('gifts')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-bold text-lg sm:text-xl hover:scale-110 transition-all shadow-2xl flex items-center gap-3 mx-auto"
              aria-label="Back to gift room"
            >
              <Gift className="w-6 h-6" />
              Back to Gift Room
            </button>
          </div>
        </section>

        {/* Custom Animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes fall {
            0% { transform: translateY(-100px); }
            100% { transform: translateY(100vh); }
          }
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
            opacity: 0;
          }
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
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

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AuthenticationScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

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
      {step === 'gazebo' && <GazeboScene />}
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
      {step === 'ten_days_silence' && <TenDaysOfSilenceScene />}
      {step === 'her_first_letter' && <HerFirstLetterScene />}
    </div>
  );
}
