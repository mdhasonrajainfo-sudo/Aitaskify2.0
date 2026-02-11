
import React, { useState } from 'react';
import { User, Lock, Phone, Mail, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';

// --- Custom Auth Popup ---
const AuthPopup = ({ isOpen, type, title, message, onClose }: any) => {
    if (!isOpen) return null;
    
    const colors = {
        success: 'text-emerald-500',
        error: 'text-rose-500',
        warning: 'text-amber-500'
    };
    const icons = {
        success: <CheckCircle className="w-12 h-12 mb-2"/>,
        error: <XCircle className="w-12 h-12 mb-2"/>,
        warning: <AlertTriangle className="w-12 h-12 mb-2"/>
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xs p-6 text-center transform transition-all scale-100 animate-in zoom-in-95">
                <div className={`flex justify-center mb-2 ${colors[type]}`}>
                    {icons[type]}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-500 mb-6 text-sm font-medium leading-relaxed">{message}</p>
                <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-200/50 active:scale-95 transition-all">
                    Okay, Got it
                </button>
            </div>
        </div>
    );
};

// --- Social Fab (Telegram) ---
const SocialFab = () => {
  const telegramLink = 'https://t.me/your_channel_link'; 

  return (
    <a 
        href={telegramLink}
        target="_blank"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#229ED9] rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-300 hover:scale-110 transition active:scale-95"
    >
        <Send size={24} className="-ml-1 mt-1"/>
    </a>
  );
};

export const Auth = ({ mode, onLogin, onRegister, onBack, loading }: any) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: ''
  });
  
  // Popup State
  const [popup, setPopup] = useState({ show: false, type: 'success', title: '', msg: '' });

  const showAlert = (type: string, title: string, msg: string) => {
      setPopup({ show: true, type, title, msg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
       if(formData.phone.length < 11) {
           showAlert('warning', 'Invalid Input', 'Phone number must be at least 11 digits.');
           return;
       }
       const success = await onLogin(formData.phone, formData.password);
       if(success === false) {
           showAlert('error', 'Login Failed', 'Invalid Phone Number or Password.');
       }
    } else {
       if(formData.password.length < 6) {
           showAlert('warning', 'Weak Password', 'Password must be at least 6 characters.');
           return;
       }
       onRegister(formData);
    }
  };

  const INPUT_STYLE = "w-full pl-11 p-4 rounded-xl border border-gray-100 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition shadow-sm placeholder-gray-400 font-bold text-sm";
  const ICON_STYLE = "absolute left-4 top-4 text-orange-300";

  return (
    <div className="min-h-screen bg-[#FFF8F6] flex flex-col font-sans relative overflow-hidden">
      
      {/* Header */}
      <div className="p-6 pt-8 flex items-center z-20">
          <button onClick={onBack} className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-50 flex items-center justify-center text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition active:scale-95">
              <ArrowLeft size={20}/>
          </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12 z-10">
        
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join Aitaskify'}
          </h2>
          <p className="text-gray-500 font-medium text-sm">
            {mode === 'login' ? 'Enter your credentials to continue' : 'Create an account to start earning'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative group">
                <User className={ICON_STYLE} size={18}/>
                <input required type="text" className={INPUT_STYLE} placeholder="Full Name" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative group">
                <Mail className={ICON_STYLE} size={18}/>
                <input required type="email" className={INPUT_STYLE} placeholder="Email Address" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </>
          )}
          
          <div className="relative group">
            <Phone className={ICON_STYLE} size={18}/>
            <input required type="text" className={INPUT_STYLE} placeholder="Mobile Number" 
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="relative group">
            <Lock className={ICON_STYLE} size={18}/>
            <input required type="password" className={INPUT_STYLE} placeholder="Password" 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <button type="button" className="text-xs text-orange-500 font-bold hover:underline">
                Forgot Password?
              </button>
            </div>
          )}
          
          <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transform active:scale-[0.98] transition mt-6 text-sm tracking-wide uppercase flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={mode === 'login' ? onRegister : onLogin} 
                type="button"
                className="text-orange-600 font-bold hover:underline ml-1"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
      
      <SocialFab />

      <AuthPopup 
        isOpen={popup.show} 
        type={popup.type} 
        title={popup.title} 
        message={popup.msg} 
        onClose={() => setPopup({...popup, show: false})} 
      />
    </div>
  );
};
