// CINEMATIC STORY TIMELINE - THE IMPRESSIVE VERSION
// This is a standalone component showcasing the cinematic approach

import React, { useState, useRef, useEffect } from 'react';
import { Heart, ArrowLeft, Gift, MapPin, Phone, Calendar, Clock, Instagram, MessageCircle, Train, Moon, Star, Film } from 'lucide-react';

const CinematicStory = ({ handleNextStep }) => {
  const [activeChapter, setActiveChapter] = useState(0);
  const containerRef = useRef(null);

  // Handle scroll to update active chapter
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = window.innerHeight;
      const chapter = Math.floor(scrollTop / windowHeight);
      setActiveChapter(chapter);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Phone Mockup Component
  const PhoneMockup = ({ children, gradient = "from-slate-800 to-slate-900" }) => (
    <div className="relative w-72 h-[600px] mx-auto">
      {/* Phone frame */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden`}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />
        {/* Screen content */}
        <div className="absolute inset-4 top-10 bg-white rounded-[2rem] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  // Instagram Post Component
  const InstagramPost = ({ username, avatar, image, caption }) => (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
        <span className="font-semibold text-sm">{username}</span>
      </div>
      {/* Image */}
      <div className="w-full h-64 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-6xl">
        {image}
      </div>
      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex gap-4">
          <Heart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
        </div>
        {caption && <p className="text-sm"><span className="font-semibold">{username}</span> {caption}</p>}
      </div>
    </div>
  );

  // Chat Message Component
  const ChatBubble = ({ text, sent, time }) => (
    <div className={`flex ${sent ? 'justify-end' : 'justify-start'} mb-2 px-4 animate-fade-in`}>
      <div className={`max-w-[70%] ${sent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-2xl px-4 py-2`}>
        <p className="text-sm">{text}</p>
        {time && <p className={`text-xs mt-1 ${sent ? 'text-blue-100' : 'text-gray-500'}`}>{time}</p>}
      </div>
    </div>
  );

  // Split Screen Component
  const SplitScreen = ({ left, right, title }) => (
    <div className="h-screen flex flex-col">
      {title && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
          <h2 className="text-4xl font-bold text-white text-center drop-shadow-lg">{title}</h2>
        </div>
      )}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center border-r-4 border-white/20">
          {left}
        </div>
        <div className="flex-1 flex items-center justify-center">
          {right}
        </div>
      </div>
    </div>
  );

  // Calendar Component
  const CalendarPage = ({ month, day, year, highlight = false }) => (
    <div className={`w-64 h-80 bg-white rounded-lg shadow-2xl overflow-hidden ${highlight ? 'ring-4 ring-pink-500 animate-pulse' : ''}`}>
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-4">
        <p className="text-lg font-bold uppercase">{month}</p>
        <p className="text-sm">{year}</p>
      </div>
      <div className="flex items-center justify-center h-48">
        <p className="text-9xl font-bold text-gray-800">{day}</p>
      </div>
    </div>
  );

  // Clock Component
  const ClockDisplay = ({ time, label }) => (
    <div className="text-center">
      <div className="text-8xl font-bold text-white font-mono drop-shadow-2xl mb-4">
        {time}
      </div>
      {label && <p className="text-2xl text-white/80">{label}</p>}
    </div>
  );

  // Map Journey Component
  const MapJourney = ({ from, to }) => (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl overflow-hidden shadow-2xl">
      {/* Simplified map visualization */}
      <div className="absolute inset-0 flex items-center justify-around px-12">
        {/* From */}
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <p className="font-bold text-lg">{from}</p>
        </div>

        {/* Journey line with train */}
        <div className="relative flex-1 h-2 bg-gradient-to-r from-blue-500 to-pink-500 mx-8">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-pulse">
            <Train className="w-12 h-12 text-purple-600" />
          </div>
        </div>

        {/* To */}
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
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* TITLE SEQUENCE */}
      <section className="h-screen w-full snap-start flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-purple-900 to-black">
        {/* Stars background */}
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

        <div className="text-center z-10 px-4">
          <h1 className="text-7xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mb-8 animate-fade-in font-handwriting">
            Our Love Story
          </h1>
          <p className="text-3xl sm:text-4xl text-white/90 mb-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Aakash & Pooja
          </p>
          <p className="text-xl text-white/70 animate-fade-in" style={{ animationDelay: '1s' }}>
            From a glance to forever
          </p>
          <p className="text-sm text-white/50 mt-12 animate-bounce">Scroll to begin ↓</p>
        </div>
      </section>

      {/* CHAPTER 1: APRIL 20 - THE GLANCE */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute text-6xl animate-float" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}>
              🌸
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center px-8 z-10">
          <p className="text-pink-300 text-xl mb-4">April 20</p>
          <h2 className="text-6xl font-bold text-white mb-8 font-handwriting">The Glance</h2>
          <div className="space-y-4 text-2xl text-white/90 leading-relaxed">
            <p className="animate-fade-in">A relative's function.</p>
            <p className="animate-fade-in" style={{ animationDelay: '0.5s' }}>Among all the faces, one caught my attention.</p>
            <div className="text-8xl my-12 animate-pulse">👀</div>
            <p className="animate-fade-in" style={{ animationDelay: '1s' }}>You were there. I saw you.</p>
            <p className="animate-fade-in" style={{ animationDelay: '1.5s' }}>We didn't talk. We didn't even see each other face to face.</p>
            <p className="text-pink-300 mt-8 animate-fade-in" style={{ animationDelay: '2s' }}>Just a glance. Just a moment.</p>
            <p className="text-xl animate-fade-in" style={{ animationDelay: '2.5s' }}>Little did I know, this moment would change everything.</p>
          </div>
        </div>
      </section>

      {/* CHAPTER 2: INSTAGRAM CONNECTION */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <p className="text-cyan-300 text-xl mb-4">May</p>
            <h2 className="text-6xl font-bold text-white mb-4 font-handwriting">The Follow</h2>
            <p className="text-2xl text-white/80">A digital thread</p>
          </div>

          <PhoneMockup gradient="from-purple-600 to-pink-600">
            <div className="h-full bg-gradient-to-b from-purple-50 to-pink-50">
              {/* Instagram interface */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <Instagram className="w-8 h-8" />
                  <p className="font-bold text-2xl">Instagram</p>
                  <div className="w-8" />
                </div>

                {/* Profile suggestion */}
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
                  <p className="animate-fade-in">I sent a follow request...</p>
                  <p className="animate-fade-in" style={{ animationDelay: '1s' }}>You accepted.</p>
                  <p className="text-pink-600 animate-fade-in" style={{ animationDelay: '2s' }}>Something had started...</p>
                </div>
              </div>
            </div>
          </PhoneMockup>
        </div>
      </section>

      {/* CHAPTER 3: MAY 30 - BIRTHDAY */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-pink-900 via-rose-800 to-red-900">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-pink-300 text-xl mb-4">May 30</p>
              <h2 className="text-6xl font-bold text-white mb-8 font-handwriting">Birthday Wish</h2>
              <div className="space-y-4 text-xl text-white/90">
                <p>It was your birthday.</p>
                <p>I wished you.</p>
                <p>You replied: "Thank you"</p>
                <p className="text-2xl text-pink-300">I liked that message.</p>
                <p className="text-lg">That was it. No more conversation.</p>
                <p className="text-lg opacity-75">But your "thank you" stayed with me.</p>
              </div>
            </div>

            <div className="flex justify-center">
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
        </div>
      </section>

      {/* CHAPTER 4: JUNE 3 - RCB */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-800 to-red-900">
        <div className="max-w-4xl mx-auto text-center px-8">
          <p className="text-orange-300 text-xl mb-4">June 3</p>
          <h2 className="text-6xl font-bold text-white mb-8 font-handwriting">RCB Win</h2>
          <div className="text-8xl mb-8">🏏</div>
          <div className="space-y-4 text-2xl text-white/90">
            <p>I posted a story about RCB winning.</p>
            <p>You replied with an emoji.</p>
            <p>I sent another emoji back.</p>
            <p>You liked it and left.</p>
            <p className="text-xl mt-8 opacity-75">Again, no conversation.</p>
            <p className="text-orange-300">But I was starting to notice you more...</p>
          </div>
        </div>
      </section>

      {/* CHAPTER 5: JUNE 10, 8:06 PM - THE BEGINNING ⭐ */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-yellow-900 via-amber-800 to-orange-900 relative overflow-hidden">
        {/* Special moment indicator */}
        <div className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-xl animate-bounce z-50">
          ⭐ SPECIAL MOMENT
        </div>

        {/* Glowing particles */}
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

        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center z-10">
          <div className="text-white">
            <div className="mb-8">
              <p className="text-yellow-300 text-2xl mb-2">June 10</p>
              <ClockDisplay time="8:06 PM" label="The moment everything changed" />
            </div>
            <h2 className="text-6xl font-bold mb-8 font-handwriting">The Beginning</h2>
            <div className="space-y-4 text-xl">
              <p className="text-3xl text-yellow-300">This is the day I will never forget.</p>
              <p>You posted a story about Lord Krishna.</p>
              <p>At 8:06 PM, I sent you a message:</p>
              <p className="text-2xl italic text-yellow-200">"Hey hi, can you please send this picture?"</p>
              <div className="text-6xl my-6">🕉️</div>
              <p className="text-2xl text-yellow-300 font-bold">That's how it started.</p>
              <p>From that day till now, we haven't gone a day without talking.</p>
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
      </section>

      {/* CHAPTER 6: JUNE 22, 5:55 AM - FIRST CALL */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-8">
          <p className="text-emerald-300 text-xl mb-4">June 22</p>
          <ClockDisplay time="5:55 AM" label="First Voice" />
          <h2 className="text-6xl font-bold text-white my-8 font-handwriting">The First Call</h2>

          <div className="my-12">
            <div className="inline-block relative">
              <div className="w-48 h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                <Phone className="w-24 h-24 text-white" />
              </div>
              {/* Ringing waves */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping"
                  style={{ animationDelay: `${i * 0.3}s`, animationDuration: '2s' }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 text-2xl text-white/90">
            <p>We had been chatting every day.</p>
            <p>Then at 5:55 AM, I made my first call to you.</p>
            <p className="text-3xl text-emerald-300">That was the first time I heard your voice.</p>
            <p className="text-xl opacity-75">Apart from the chats, this was real.</p>
            <p>From then on, calls became our thing.</p>
            <p className="text-2xl text-emerald-300">Your voice became my favorite sound.</p>
          </div>
        </div>
      </section>

      {/* CHAPTER 7: GROWING CONNECTION */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-orange-800 via-rose-700 to-pink-800">
        <div className="max-w-4xl mx-auto text-center px-8">
          <p className="text-rose-300 text-xl mb-4">June - July</p>
          <h2 className="text-6xl font-bold text-white mb-8 font-handwriting">Growing</h2>
          <div className="text-8xl mb-8 animate-pulse">💭</div>

          <div className="space-y-6 text-2xl text-white/90">
            <p>Days turned into weeks.</p>
            <p>We talked about everything and nothing.</p>
            <div className="my-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
              <p className="text-3xl text-rose-300 font-bold mb-4">You gave me value I'd never received before.</p>
              <p className="text-2xl text-white/80">You gave me time.</p>
            </div>
            <p>I started admiring you.</p>
            <p>I started feeling something I couldn't name yet.</p>
            <p className="text-2xl text-rose-300">You were becoming important to me.</p>
          </div>
        </div>
      </section>

      {/* CHAPTER 8: AUG 8 - ATHADU & MOON ⭐ */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        {/* Special moment */}
        <div className="absolute top-8 right-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-full font-bold shadow-xl animate-bounce z-50">
          ⭐ SPECIAL MOMENT
        </div>

        {/* Stars */}
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

        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center z-10">
          <div className="text-white space-y-6">
            <p className="text-blue-300 text-2xl">August 8</p>
            <h2 className="text-6xl font-bold font-handwriting">Athadu & The Moon</h2>
            <p className="text-xl">I'm a huge fan of Mahesh Babu.</p>
            <p className="text-xl">Athadu was re-released - one of my favorite movies.</p>

            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 my-6">
              <div className="flex items-center gap-4 mb-4">
                <Film className="w-12 h-12 text-blue-300" />
                <div>
                  <p className="text-2xl font-bold">Athadu</p>
                  <p className="text-sm text-blue-300">Theatre Show</p>
                </div>
              </div>
              <p className="text-lg">I was in the theatre with my friend.</p>
              <p className="text-lg">You were in your hometown.</p>
              <p className="text-lg">I thought you weren't in a good mood.</p>
            </div>

            <div className="text-3xl text-blue-300 font-bold">
              So I left the movie.
            </div>
            <p className="text-xl">Even in the theatre hall, I started chatting with you.</p>
            <p className="text-3xl text-yellow-300 font-bold">That's when I realized: You're more important than anything else.</p>
          </div>

          <div className="relative">
            {/* Full Moon */}
            <div className="relative mx-auto w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full animate-pulse shadow-2xl">
                <div className="text-9xl flex items-center justify-center h-full">🌕</div>
              </div>
              {/* Moon glow */}
              <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-50 animate-pulse" />
            </div>

            <div className="mt-12 text-center text-white space-y-4">
              <p className="text-2xl">While going home from the theatre,</p>
              <p className="text-2xl">it was a full moon night.</p>
              <p className="text-3xl text-yellow-300 font-bold">I looked up at the moon, and I thought of you.</p>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mt-6">
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  I love her.
                </p>
                <p className="text-lg mt-4 text-white/80">I don't know if it was love or not,</p>
                <p className="text-lg text-white/80">but my feelings for you were real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue with remaining chapters... (I'll add more in the next response to keep this manageable) */}

      {/* FINAL: Navigation */}
      <section className="h-screen w-full snap-start flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="text-center px-8">
          <h2 className="text-6xl font-bold text-white mb-12 font-handwriting">To be continued...</h2>
          <p className="text-2xl text-white/80 mb-12">This cinematic journey continues with more chapters</p>

          <button
            onClick={() => handleNextStep('gifts')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-full font-bold text-xl hover:scale-110 transition-all shadow-2xl flex items-center gap-3 mx-auto"
          >
            <Gift className="w-6 h-6" />
            Back to Gift Room
          </button>
        </div>
      </section>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CinematicStory;
