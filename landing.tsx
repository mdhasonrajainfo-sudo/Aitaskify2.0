import React, { useState, useEffect } from 'react';
import { Sparkles, Hexagon, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#FFF8F6] flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 via-white to-pink-50 opacity-80"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-700 px-6 text-center">
           {/* Logo Icon */}
           <div className="w-28 h-28 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/30 mb-6 rotate-3">
                <Hexagon className="text-white w-14 h-14" strokeWidth={2.5} />
           </div>
           
           {/* App Name Animation */}
           <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
             Aitaskify
           </h1>
           <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">Next Level Earning</p>
        </div>

        {/* Loading Dots */}
        <div className="absolute bottom-20 flex gap-2">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F6] flex flex-col justify-between font-sans relative overflow-hidden animate-in fade-in duration-700">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-orange-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 pt-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 transform hover:rotate-6 transition duration-500">
                <Hexagon className="text-white w-10 h-10" strokeWidth={3} />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-800 leading-tight mb-3">
              Earn Money <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600">Every Single Day</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Complete simple tasks, sell Gmail accounts, and withdraw instantly to bKash & Nagad.
            </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex flex-col items-center text-center">
                <Zap className="text-orange-500 mb-2 w-6 h-6"/>
                <h3 className="font-bold text-gray-800 text-xs">Fast Payout</h3>
                <p className="text-[10px] text-gray-400">Within 24 hours</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex flex-col items-center text-center">
                <CheckCircle className="text-pink-500 mb-2 w-6 h-6"/>
                <h3 className="font-bold text-gray-800 text-xs">Easy Tasks</h3>
                <p className="text-[10px] text-gray-400">No skills needed</p>
            </div>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button 
            onClick={() => onNavigate('login')}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-[0.98]"
          >
            Get Started <ArrowRight size={18} />
          </button>

          <button 
            onClick={() => onNavigate('login')}
            className="w-full bg-white border border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all active:scale-[0.98]"
          >
             I have an account
          </button>
        </div>
        
        <p className="mt-8 text-[10px] text-gray-400 font-medium">© 2026 Aitaskify. All rights reserved.</p>

      </div>
    </div>
  );
};