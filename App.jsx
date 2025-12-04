import React, { useState, useEffect, useRef } from 'react';
import { Heart, Stars, Music, Camera, ArrowLeft, Gift, Wind, Mail, Clock, MapPin, Home, Zap, Train } from 'lucide-react';

/**
 * UTILITY COMPONENTS & ICONS
 * Custom SVGs to match the "Cartoon/Chibi" aesthetic from the screenshots.
 */

// --- Utility Components Definitions (Relocated to top for reliability) ---

// FALLING MAIL component
const FallingMail = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 animate-fall-mail">
    {/* Mail Icon (Envelope) - Adjusted color scheme to match pink/red theme better */}
    <rect x="50" y="100" width="100" height="70" rx="10" fill="#FFF" stroke="#9D174D" strokeWidth="4" />
    <polygon points="50,100 100,135 150,100" fill="#9D174D" />
    <line x1="50" y1="100" x2="150" y2="170" stroke="#9D174D" strokeWidth="2" />
    <line x1="150" y1="100" x2="50" y2="170" stroke="#9D174D" strokeWidth="2" />
    
    {/* Small heart accent on the mail */}
    <Heart x="90" y="110" width="20" height="20" className="text-pink-500 fill-pink-500" />
  </svg>
);

// Small Heart Emitter for the Envelope Open scene
const HeartEmitter = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <Heart
          key={i}
          className="absolute w-4 h-4 text-red-500 fill-red-500 animate-heart-float"
          style={{
            // Position hearts near the center/envelope flap
            left: `${Math.random() * 10 + 45}%`, 
            bottom: `${Math.random() * 10 + 30}%`, // Start near the envelope
            animationDuration: `${Math.random() * 2 + 1.5}s`,
            animationDelay: `${Math.random() * 1.5}s`
          }}
        />
      ))}
    </div>
  );
};

// Penguin SVG for the new Constant Scene (Interactive)
const CutePenguin = ({ onClick, isHugging }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`w-40 h-40 transition-transform duration-300 cursor-pointer ${isHugging ? 'scale-110' : 'hover:scale-105'}`} 
    onClick={onClick}
  >
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
    
    {/* Heart on chest (Interactive) */}
    <Heart 
        x="40" y="60" width="20" height="20" 
        className={`text-red-500 fill-red-500 origin-center transition-transform duration-300 ${isHugging ? 'scale-150 animate-heart-pulse' : 'scale-100 animate-pulse-slow'}`} 
    />
  </svg>
);

// Love Tree SVG for the Path Scene
const LoveTree = ({ isLeft }) => (
  <svg viewBox="0 0 100 100" className={`absolute w-12 h-12 top-1/2 transform -translate-y-1/2 hidden md:block ${isLeft ? 'right-full translate-x-4' : 'left-full -translate-x-4'}`}>
    {/* Trunk */}
    <rect x="45" y="60" width="10" height="40" fill="#8B4513" />
    {/* Foliage (Heart Shape) */}
    <path d="M 10 50 Q 50 0 90 50 Q 60 70 50 60 Q 40 70 10 50 Z" fill="#4CAF50" />
    {/* Hearts (Love Symbols) */}
    <Heart x="40" y="25" width="10" height="10" fill="#F472B6" className="text-white" />
    <Heart x="65" y="35" width="8" height="8" fill="#F472B6" className="text-white" />
    <Heart x="20" y="40" width="8" height="8" fill="#F472B6" className="text-white" />
  </svg>
);

// PineTree SVG (Used in early scene backgrounds)
const PineTree = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M 50 10 L 10 90 H 90 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
    <rect x="45" y="90" width="10" height="10" fill="#475569" />
  </svg>
);

// CuteBoy definition remains but is not used in EnvelopeAnimationScene
const CuteBoy = () => (
  <svg viewBox="0 0 100 100" className="w-32 h-32 absolute bottom-0 left-4 animate-bounce-slow">
    <circle cx="50" cy="50" r="40" fill="#fecaca" /> 
    <circle cx="35" cy="45" r="3" fill="#000" /> 
    <circle cx="65" cy="45" r="3" fill="#000" /> 
    <path d="M 35 60 C 40 70, 60 70, 65 60" fill="#E53935" />
    <path d="M 30 60 Q 50 78 70 60" stroke="#000" strokeWidth="2" fill="none" />
    <circle cx="30" cy="55" r="8" fill="#fda4af" opacity="0.8" /> 
    <circle cx="70" cy="55" r="8" fill="#fda4af" opacity="0.8" />
    <path d="M 10 50 Q 50 10 90 50 L 80 50 L 20 50 Z" fill="#7f1d1d" /> 
    <rect x="25" y="80" width="50" height="20" fill="#991b1b" />
    <path d="M 30 80 L 70 80 Q 75 90 70 100 L 30 100 Q 25 90 30 80 Z" fill="#991b1b" />
  </svg>
);

const CatPeeking = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 absolute bottom-0 right-12 translate-x-1/2">
    <path d="M 20 100 L 20 50 Q 50 30 80 50 L 80 100 Z" fill="#fff" stroke="#000" strokeWidth="2"/>
    <polygon points="20,50 30,20 50,50" fill="#fff" stroke="#000" strokeWidth="2"/>
    <polygon points="80,50 70,20 50,50" fill="#ea580c" stroke="#000" strokeWidth="2"/>
    <circle cx="40" cy="60" r="3" fill="#000" />
    <circle cx="60" cy="60" r="3" fill="#000" />
    <path d="M 45 70 Q 50 75 55 70" stroke="#000" fill="none" />
  </svg>
);

// --- UPDATED Confetti Component ---
const LoveConfetti = ({ type = 'hearts' }) => {
  const particles = [];
  const count = type === 'hearts' ? 30 : 50;

  for (let i = 0; i < count; i++) {
    const isHeart = Math.random() < 0.4;
    const color = ['#F87171', '#FDA4AF', '#FBCFE8', '#F59E0B'][Math.floor(Math.random() * 4)];
    
    if (type === 'hearts' && isHeart) {
      particles.push(
        <Heart
          key={`h-${i}`}
          className="absolute text-red-500 fill-red-500 animate-love-fall"
          style={{
            width: `${Math.random() * 10 + 15}px`,
            height: `${Math.random() * 10 + 15}px`,
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 10}%`,
            animationDuration: `${Math.random() * 5 + 8}s`,
            animationDelay: `${Math.random() * 8}s`,
            opacity: 0.9,
          }}
        />
      );
    } else if (type === 'streamers') {
      const isStreamer = Math.random() < 0.4;
      
      particles.push(
        <div
          key={`s-${i}`}
          className={`absolute animate-burst ${isStreamer ? 'w-1 h-8 rounded-sm' : 'w-2 h-2 rounded-full'}`}
          style={{
            backgroundColor: color,
            left: '50%',
            top: '50%',
            animationDuration: `${Math.random() * 1 + 1.5}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
            animationTimingFunction: 'ease-out',
          }}
        />
      );
    } else if (type === 'hearts') {
      particles.push(
         <div
           key={`c-${i}`}
           className="absolute w-2 h-2 rounded-full animate-fall"
           style={{
             backgroundColor: color,
             left: `${Math.random() * 100}%`,
             top: `-${Math.random() * 10}%`,
             animationDuration: `${Math.random() * 3 + 4}s`,
             animationDelay: `${Math.random() * 4}s`,
           }}
         />
      );
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles}
    </div>
  );
};


// --- New Timeline Component ---

const TimelineMarker = ({ icon: Icon, title, message }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative w-full py-4 px-2 hover:bg-white/10 rounded-lg transition" 
             onMouseEnter={() => setShow(true)}
             onMouseLeave={() => setShow(false)}>
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

// Train Car Component (UPDATED TO USE COLOR PROP)
const TrainCar = ({ date, special, index, color }) => (
    <div 
        style={{ backgroundColor: color }}
        className={`relative w-28 h-20 rounded-lg shadow-lg border-b-4 ${special ? 'border-red-500' : 'border-gray-400'} flex flex-col items-center justify-center p-1 shrink-0`}
    >
        {/* Connection Bar is handled by the parent flex gap */}
        
        {/* Date Display */}
        <p className={`text-sm font-bold ${special ? 'text-white' : 'text-gray-800'} transition-all duration-500`}>
            {date}
        </p>
        {special && (
             <Heart className='w-4 h-4 fill-white text-white animate-pulse' />
        )}
        {/* Wheels */}
        <div className="absolute bottom-0 flex justify-around w-full px-2 -translate-y-2"> {/* Adjusted vertical positioning */}
            <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 animate-wheel"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full border-2 border-gray-600 animate-wheel delay-300"></div>
        </div>
    </div>
);

// Locomotive Component
const Locomotive = ({ isMoving, onStart }) => (
    <div 
        className={`relative w-36 h-28 bg-red-600 rounded-lg shadow-xl border-b-4 border-red-800 shrink-0 ${!isMoving ? 'cursor-pointer hover:bg-red-700' : ''}`}
        onClick={!isMoving ? onStart : undefined}
    >
        {/* Cabin */}
        <div className="absolute right-0 top-0 w-1/2 h-1/2 bg-red-700 rounded-tr-lg">
            {/* Boy in the cabin */}
            <div className="absolute w-full h-full bg-blue-300/50 rounded-tr-lg border-2 border-red-900 overflow-hidden flex justify-center items-end">
                <div className="w-8 h-8 bg-pink-300 rounded-full border border-gray-900 mb-1">
                    {/* Face */}
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg">😊</span>
                    </div>
                </div>
                {!isMoving && (
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-bold text-xs">
                        Click to Start!
                     </div>
                )}
            </div>
        </div>
        {/* Boiler/Hood */}
        <div className="absolute left-0 top-1/4 w-2/3 h-1/2 bg-red-800 rounded-l-md"></div>
        {/* Headlight */}
        <div className="absolute left-1 top-1/2 w-4 h-3 bg-yellow-300 rounded-r-sm"></div>
        {/* Smoke Stack */}
        <div className="absolute left-1/4 -top-2 w-5 h-6 bg-gray-700 rounded-t-lg"></div>
        
        {/* Animated Smoke */}
        {isMoving && <div className="absolute left-1/4 -top-8 w-6 h-6 bg-white/60 rounded-full animate-smoke"></div>}

        {/* Wheels */}
        <div className="absolute bottom-0 flex justify-around w-full px-2 -translate-y-2">
            <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-600 animate-wheel"></div>
            <div className="w-5 h-5 bg-gray-800 rounded-full border-2 border-gray-600 animate-wheel delay-100"></div>
        </div>
    </div>
);


// --- New Path Component Data (UPDATED COLORS) ---
const MilestoneData = [
  { date: "Aug 29", special: true, color: "#FFD700" }, // Gold
  { date: "Aug 31", special: false, color: "#000000" }, // Black
  { date: "Sept 5", special: false, color: "#A0A0A0" }, // Grey
  { date: "Sept 6", special: false, color: "#404040" }, // Dark Grey
  { date: "Sept 7", special: false, color: "#008000" }, // Green
  { date: "Sept 8", special: true, color: "#20B2AA" }, // Sea Green
  { date: "Sept 15", special: false, color: "#A0A0A0" }, // Grey
  { date: "Sept 16", special: false, color: "#A52A2A" }, // Brown
  { date: "Sept 26", special: false, color: "#EE82EE" }, // Violet
  { date: "Sept 27", special: false, color: "#FFFF00" }, // Yellow
  { date: "Sept 28", special: true, color: "#008000" }, // Green
  { date: "Oct 6", special: true, color: "#800080" }, // Purple
  { date: "Oct 18", special: false, color: "#0000FF" }, // Blue
  { date: "Nov 1", special: false, color: "#FF0000" }, // Red
  { date: "Nov 2", special: false, color: "#00008B" }, // Dark Blue
  { date: "Nov 3", special: false, color: "#FFD700" }, // Dark Yellow (Using Gold for clarity)
  { date: "Nov 8", special: false, color: "#800000" }, // Maroon red
  { date: "Nov 9", special: false, color: "#FF0000" }, // Red
  { date: "Nov 15", special: true, color: "#008000" }, // Green
  { date: "Nov 16", special: false, color: "#20B2AA" }, // Sea Green
  { date: "Nov 21", special: false, color: "#A0A0A0" }, // Grey
  { date: "Nov 22", special: false, color: "#A52A2A" }, // Brown
  { date: "Nov 23", special: false, color: "#FF0000" }, // Red
  { date: "Dec 1", special: false, color: "#A0A0A0" }, // Grey
];


/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [step, setStep] = useState('parachute');
  const [openedGifts, setOpenedGifts] = useState({ bouquet: false, memories: false, promise: false, timeline: false, path: false }); // 5 gifts
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true); 

  // Local state for the Penguin interaction
  const [isPandaHugging, setIsPandaHugging] = useState(false);

  // --- TRAIN STATE ---
  const [isTrainMoving, setIsTrainMoving] = useState(false); 
  
  const startTrainJourney = () => {
      setIsTrainMoving(true);
  };
  // --------------------

  // Constants
  const bouquetReasons = [
    "For surviving my daily voice notes.",
    "For always hyping me up like I'm Beyoncé.",
    "For listening to my overthinking TED Talks.",
    "For being the calm in my chaos.",
    "For existing exactly."
  ];

  // Check if all gifts are opened to unlock "End" (Now requires 5 gifts)
  const allOpened = openedGifts.bouquet && openedGifts.memories && openedGifts.promise && openedGifts.timeline && openedGifts.path;

  const handleNextStep = (next) => {
    setStep(next);
  };

  const markGiftOpened = (gift) => {
    setOpenedGifts(prev => ({ ...prev, [gift]: true }));
  };
  
  // --- SCENES ---

  // 1. Mail Fall Scene
  const MailFallScene = () => (
    <div 
      className="h-screen w-full bg-gradient-to-br from-pink-300 to-rose-400 flex flex-col items-center justify-center relative overflow-hidden text-white cursor-pointer animate-scene-entry"
      onClick={() => { handleNextStep('envelope_animation'); setShowConfetti(false); }}
    >
      <LoveConfetti type="hearts" />
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
        onClick={() => handleNextStep('letter')}
      >
        <div className="w-80 h-52 bg-red-100 shadow-2xl relative z-10 flex items-center justify-center rounded-lg border-2 border-red-200">
           <Heart className="w-16 h-16 text-red-600 fill-red-600 animate-pulse" />
        </div>
        <div className="absolute top-0 left-0 w-full h-0 border-l-[160px] border-l-transparent border-t-[100px] border-t-red-200 border-r-[160px] border-r-transparent origin-top transition-all duration-700 z-20 group-hover:rotate-x-180"></div>
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

  // 3. Letter Scene (UPDATED CONTENT)
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
          <p className="text-xs text-center text-gray-500 font-mono">LOS ANGELES<br/>JUL 12<br/>4 PM</p>
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
               <p>[Kanna] <Heart className="inline w-4 h-4 fill-red-500"/></p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => handleNextStep('door')}
          className="mt-8 mx-auto block bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition shadow-lg font-bold animate-pulse"
        >
          Surprise
        </button>
      </div>
    </div>
  );

  // 4. Gift Room Door
  const DoorScene = () => (
    <div className="h-screen w-full bg-gradient-to-br from-red-900 to-purple-900 flex flex-col items-center justify-center text-white animate-scene-entry">
      <h1 className="4xl font-bold mb-8 text-shadow font-handwriting">The Gift Room</h1>
      <div 
        className="relative cursor-pointer group"
        onClick={() => handleNextStep('gifts')}
      >
        <div className="w-64 h-96 bg-rose-200 border-8 border-rose-300 relative overflow-hidden rounded-t-lg shadow-2xl">
           <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
           <div className="w-4 h-4 bg-yellow-500 rounded-full absolute top-1/2 left-4 shadow-sm"></div>
           <div className="w-full h-full border-4 border-dashed border-rose-400 p-4">
              <div className="w-full h-px bg-rose-300 absolute top-1/4"></div>
              <div className="w-full h-px bg-rose-300 absolute bottom-1/4"></div>
              <div className="h-full w-px bg-rose-300 absolute left-1/2"></div>
           </div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-red-600 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
             Enter Room
           </div>
           <CatPeeking />
        </div>
      </div>
    </div>
  );

  // 5. Gifts Selection (5 Gifts)
  const GiftSelection = () => (
    <div className="h-screen w-full bg-rose-100 flex flex-col items-center justify-center p-4 animate-scene-entry">
      <h2 className="text-3xl text-rose-800 font-bold mb-12 font-handwriting">Pick a gift!</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-8 items-center justify-center">
        {/* Gift 1: Bouquet */}
        <button 
          onClick={() => { handleNextStep('bouquet'); markGiftOpened('bouquet'); }}
          className={`transform transition-all duration-300 hover:-translate-y-4 ${openedGifts.bouquet ? 'opacity-50' : 'animate-bounce-custom'}`}
        >
          <GiftBox color="bg-pink-600" ribbon="bg-pink-400" />
        </button>

        {/* Gift 2: Memories */}
        <button 
          onClick={() => { handleNextStep('memories'); markGiftOpened('memories'); }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-100 ${openedGifts.memories ? 'opacity-50' : 'animate-bounce-custom'}`}
        >
           <GiftBox color="bg-red-600" ribbon="bg-red-400" />
        </button>

        {/* Gift 3: Promise/Declaration */}
        <button 
          onClick={() => { handleNextStep('promise'); markGiftOpened('promise'); setCandlesBlown(false); }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-200 ${openedGifts.promise ? 'opacity-50' : 'animate-bounce-custom'}`}
        >
           <GiftBox color="bg-rose-700" ribbon="bg-rose-500" />
        </button>
        
        {/* Gift 4: Our Future Timeline */}
        <button 
          onClick={() => { handleNextStep('timeline'); markGiftOpened('timeline'); }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-300 ${openedGifts.timeline ? 'opacity-50' : 'animate-bounce-custom'}`}
        >
           <GiftBox color="bg-purple-600" ribbon="bg-purple-400" />
        </button>

         {/* Gift 5: Our Relationship Path */}
        <button 
          onClick={() => { handleNextStep('path'); markGiftOpened('path'); }}
          className={`transform transition-all duration-300 hover:-translate-y-4 delay-400 ${openedGifts.path ? 'opacity-50' : 'animate-bounce-custom'}`}
        >
           <GiftBox color="bg-yellow-600" ribbon="bg-yellow-400" />
        </button>
      </div>

      {allOpened && (
        <button 
          onClick={() => { handleNextStep('end'); setShowConfetti(true); }}
          className="mt-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-xl animate-bounce flex items-center gap-2"
        >
          View Love Declaration <Heart className='w-5 h-5 fill-white'/>
        </button>
      )}
    </div>
  );

  const GiftBox = ({ color, ribbon }) => (
    <div className={`w-32 h-32 ${color} relative rounded-lg shadow-xl flex items-center justify-center`}>
       <div className={`absolute w-8 h-full ${ribbon} left-1/2 transform -translate-x-1/2`}></div>
       <div className={`absolute h-8 w-full ${ribbon} top-1/2 transform -translate-y-1/2`}></div>
       <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl">🎀</div>
    </div>
  );

  // 6. Bouquet Scene
  const BouquetScene = () => (
    <div className="h-screen w-full bg-gradient-to-br from-pink-900 to-red-900 text-white p-8 flex flex-col items-center justify-center relative animate-scene-entry">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold text-pink-200">Tadaaa....<br/>your virtual bouquet!</h2>
          <p className="text-pink-100">Each flower here has a little reason why you're one of my favorite humans:</p>
          <ul className="space-y-3 text-sm md:text-base opacity-90">
            {bouquetReasons.map((reason, index) => (
              <li key={index}>• {reason}</li>
            ))}
          </ul>
          <button onClick={() => handleNextStep('gifts')} className="mt-8 bg-white text-pink-900 px-6 py-2 rounded-full font-bold hover:bg-pink-100 transition">
             Go back to Gift Room
          </button>
        </div>
        <div className="flex-1 flex justify-center">
           <span className="text-[150px] animate-pulse">💐</span>
        </div>
      </div>
    </div>
  );

  // 7. Memories Scene (UPDATED CONTENT)
  const MemoriesScene = () => (
    <div className="h-screen w-full bg-gradient-to-b from-red-800 to-pink-900 p-4 flex flex-col items-center justify-center relative overflow-hidden animate-scene-entry">
      <h2 className="4xl text-pink-200 font-handwriting mb-8 rotate-[-2deg]">Our Memories</h2>
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
           <p className="italic text-lg">"As we are in a long-distance relationship now, our photographs are the memories which I look for every time I miss you. I still hear our conversations when I see our pictures! The day we met first is nothing short of a festival... You didn't even know it, but you made that day lighter. You're the reason for my smile."</p>
           <button onClick={() => handleNextStep('gifts')} className="mt-8 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition">
             Go back to Gift Room
           </button>
        </div>
      </div>
      <div className="absolute bottom-10 left-20 animate-spin-slow text-yellow-300">
        <Stars size={40} />
      </div>
    </div>
  );

  // 8. Promise Scene (Third Gift)
  const PromiseScene = () => (
    <div className="h-screen w-full bg-gradient-to-tr from-pink-900 to-rose-900 flex flex-col items-center justify-center text-white relative animate-scene-entry">
      <div className="text-center mb-12 max-w-lg px-4">
         <h2 className="4xl font-bold mb-4 text-pink-200 font-handwriting">My Promise to You</h2>
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
      <button onClick={() => handleNextStep('gifts')} className="absolute bottom-8 left-8 text-white/50 hover:text-white flex items-center gap-2">
        <ArrowLeft size={20}/> Back
      </button>
    </div>
  );

  // 9. NEW Timeline Scene (Fourth Gift)
  const TimelineScene = () => {
    const futureMoments = [
        { icon: MapPin, title: "Our Next Adventure", message: "Discovering a new corner of the world, just us two." },
        { icon: Home, title: "Building Our Sanctuary", message: "The quiet mornings and cozy evenings in our future home." },
        { icon: Heart, title: "Always Choosing You", message: "Celebrating every milestone, big or small, for all time." },
        { icon: Clock, title: "A Lifetime of Comfort", message: "The simple joy of growing old together." },
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
                        {/* Timeline Connector */}
                        <div className="absolute left-4 w-px h-full bg-pink-500/50 -translate-y-1/2"></div>
                        
                        {/* Timeline Marker */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                            <moment.icon className="w-4 h-4 text-white" />
                        </div>

                        {/* Content */}
                        <div className="ml-8 p-3 bg-white/10 rounded-lg w-full text-left">
                            <p className="font-bold text-pink-100">{moment.title}</p>
                            <p className="text-xs text-pink-200">{moment.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={() => handleNextStep('gifts')} className="mt-12 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition">
                Go back to Gift Room
            </button>
        </div>
    );
  };
  
  // 10. NEW Train Journey Scene (Fifth Gift - Milestones)
  const TrainJourneyScene = () => {
    // Calculate total width needed for all cars + locomotive + spacing
    const CAR_WIDTH = 100;
    const LOCO_WIDTH = 140;
    const SPACING = 20;
    const TOTAL_CARS = MilestoneData.length + 1; // +1 for the end car
    const TRAIN_CONTENT_WIDTH = LOCO_WIDTH + (MilestoneData.length * (CAR_WIDTH + SPACING)) + (40 + 20); // Loco + Milestones + End Car

    // Text to be revealed
    const journeyText = "Kanna! Our journey has many sweet moments, and yes, some bitter ones, but that’s how life goes. With you, this journey feels incredibly special, and I want to create so many more moments together. I can't wait to start our life together.";

    return (
        <div className="h-screen w-full bg-gradient-to-br from-indigo-700 to-gray-900 flex flex-col items-center p-4 relative animate-scene-entry">
            <h2 className="text-4xl font-handwriting font-bold text-gray-300 mt-8 mb-12">Our Relationship Journey</h2>
            
            {/* The fixed, curved track */}
            <div className="absolute bottom-[20%] w-full h-8 flex justify-center items-center">
                <svg className="w-full h-full" viewBox="0 0 1000 50">
                    {/* Background Track (Curved/Bumpy) */}
                    <path d="M 0 25 C 250 10, 750 40, 1000 25" stroke="#4B5563" strokeWidth="12" fill="none" />
                    {/* Rails (Inner lines) */}
                    <path d="M 0 20 C 250 5, 750 35, 1000 20" stroke="#374151" strokeWidth="2" fill="none" />
                    <path d="M 0 30 C 250 15, 750 45, 1000 30" stroke="#374151" strokeWidth="2" fill="none" />
                </svg>
            </div>
            
            {/* TEXT TO BE REVEALED (Center screen, Z-index 10) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-3/4 max-w-md">
                {/* Text Visibility controlled by the train's wipe animation */}
                <h3 className="text-xl font-bold text-pink-300 whitespace-nowrap overflow-hidden transition-all duration-300">
                    {journeyText}
                </h3>
            </div>
            
            {/* Train Container (Moves Left and covers text) */}
            <div className="relative w-full h-40 overflow-hidden">
                <div 
                    className={`absolute bottom-0 flex`} 
                    style={{ 
                        width: `${TRAIN_CONTENT_WIDTH}px`, 
                        // FIX 1: Adjust vertical position to align wheels with the track 
                        // Track is at ~20% from bottom of screen, Train container is h-40. Adjusted to 50px from bottom of h-40 div.
                        bottom: '50px', 
                        /* Apply a fixed tilt to simulate moving along the curve */
                        transform: isTrainMoving ? 'rotateZ(-2deg)' : 'rotateZ(0deg)', // Stop rotation when paused
                        transformOrigin: 'bottom center',
                        
                        // FIX 3: Start position (Right of screen) and animation control
                        left: isTrainMoving ? 'auto' : '100%', 
                        animation: isTrainMoving ? 'train-journey 35s linear infinite' : 'none', // FIX 2: Speed set to 35s
                    }}
                >
                    
                    {/* Locomotive (First in line) */}
                    <Locomotive isMoving={isTrainMoving} onStart={startTrainJourney} />

                    {/* Milestone Cars */}
                    {MilestoneData.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-5 shrink-0">
                            {/* Connector */}
                            <div className="w-5 h-1 bg-gray-600 top-1/2"></div>
                            <TrainCar 
                                index={index} 
                                date={milestone.date} 
                                special={milestone.special} 
                                color={milestone.color} 
                            />
                        </div>
                    ))}
                    
                    {/* Final Message Car */}
                    <div className="flex items-center gap-5 shrink-0">
                        <div className="w-5 h-1 bg-gray-600 top-1/2"></div>
                        <div className="w-40 h-20 bg-yellow-400 rounded-lg shadow-lg flex items-center justify-center p-2 border-4 border-yellow-500">
                           <p className="font-black text-lg text-gray-800 flex items-center gap-1">
                                Lot more to come! <Heart className='w-5 h-5 fill-red-600'/>
                           </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Button Overlay */}
            {!isTrainMoving && (
                <button 
                    onClick={startTrainJourney}
                    className="mt-12 bg-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg z-50 animate-pulse"
                >
                    Start Our Journey
                </button>
            )}

            <button onClick={() => handleNextStep('gifts')} className="mt-auto mb-8 bg-white/20 backdrop-blur-sm border border-white/40 text-white px-6 py-2 rounded-full hover:bg-white/30 transition">
                Go back to Gift Room
            </button>
        </div>
    );
  };


  // 11. End Scene (I Love You Page - Final gift navigation point)
  const EndScene = () => (
    <div className="h-screen w-full bg-rose-100 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden animate-scene-entry">
      {showConfetti && <LoveConfetti type="streamers" />}
      <div className="max-w-2xl bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl z-10 border-4 border-pink-200">
         <div className="flex justify-center mb-6">
            <Heart className="text-red-500 fill-red-500 w-12 h-12 animate-heartbeat" />
         </div>
         <p className="text-gray-700 mb-4 text-lg">My dear,</p>
         <p className="text-gray-700 mb-8 italic">This little website is just a digital whisper of the immense love I hold for you. You are the joy, the peace, and the most incredible part of my entire universe.</p>
         <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8 font-outline-2">
           I Love You.
         </h1>
         <button 
           onClick={() => handleNextStep('constant')}
           className="mt-8 bg-rose-600 text-white px-8 py-2 rounded-full shadow-lg hover:bg-rose-700 transition"
         >
           View Final Note
         </button>
      </div>
    </div>
  );

  // 12. Constant Scene (Final Page)
  const ConstantScene = () => {
    // Handler for Penguin interaction
    const handlePenguinClick = () => {
        setIsPandaHugging(true);
        setTimeout(() => setIsPandaHugging(false), 800);
    };

    return (
      <div className="h-screen w-full bg-gradient-to-br from-pink-900 to-purple-900 flex flex-col items-center justify-center text-white p-4 animate-scene-entry">
        <h2 className="text-4xl font-handwriting font-bold text-pink-200 mb-8">You are my constant...</h2>
        
        <CutePenguin onClick={handlePenguinClick} isHugging={isPandaHugging} />

        <p className="text-lg italic mt-8 text-pink-100">Click the penguin for a hug!</p>
        <p className="text-lg italic mt-2 text-pink-100">Forever and always, my love.</p>
      </div>
    );
  };
  
  // Router
  return (
    <div className="font-sans antialiased text-gray-900 select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Indie+Flower&display=swap');
        
        .font-handwriting { font-family: 'Indie Flower', cursive; }
        .font-sans { font-family: 'Fredoka', sans-serif; }
        
        /* NEW TRAIN ANIMATIONS */
        @keyframes train-journey {
            /* Starts off screen right, moves to off screen left */
            0% { transform: translateX(100%); } 
            100% { transform: translateX(-100%); } 
        }
        .animate-train-journey {
            animation: train-journey 35s linear infinite; /* Adjusted speed to 35s */
            animation-iteration-count: infinite; 
            animation-fill-mode: forwards;
        }
        
        @keyframes wheel {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-wheel {
            animation: wheel 0.5s linear infinite; 
            transform-origin: center;
        }

        @keyframes smoke {
            0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
            50% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(30px, -30px) scale(1.5); }
        }
        .animate-smoke {
            animation: smoke 2s ease-out infinite; 
            animation-delay: 0.5s;
        }
        /* END TRAIN ANIMATIONS */
        
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

        /* Existing Confetti/Utility Animations */
        @keyframes love-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0.5; }
        }

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
      {step === 'path' && <TrainJourneyScene />}
      {step === 'end' && <EndScene />}
      {step === 'constant' && <ConstantScene />}
    </div>
  );
}