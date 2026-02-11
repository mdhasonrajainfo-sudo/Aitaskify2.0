
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ClipboardList, Users, User, Bell, Settings, 
  LogOut, ChevronRight, Wallet, History, 
  Lock, CheckCircle, AlertTriangle, XCircle, Copy, Share2, 
  Gift, Trophy, Zap, Camera, ChevronLeft, Clock, 
  PlayCircle, Mail, Moon, Info, Send, CheckSquare,
  Sparkles, ArrowUpRight, CreditCard, Crown, ListTodo, FileText,
  UploadCloud, ExternalLink, MessageCircle, Hash, Calendar,
  Monitor, Smartphone, Award, HelpCircle, ChevronDown, Loader2,
  LayoutDashboard, Plus
} from 'lucide-react';
import { UserData, DB_KEYS, GmailRequest, PremiumRequest } from './types';
import { supabase } from './supabaseClient';

// --- Types & Interfaces ---
interface Transaction {
  id: string;
  type: 'withdraw' | 'earning' | 'bonus' | 'expense'; 
  category: 'task' | 'sell' | 'main' | 'referral' | 'joining_bonus' | 'referral_bonus' | 'premium_purchase' | 'referral_commission'; 
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  method?: string; 
  details?: string;
  senderNumber?: string;
  trxId?: string;
  proofUrl?: string; 
  refCode?: string;
  taskId?: string;
  referralUserId?: string;
  userId: string;
}

// --- CONSTANTS ---
const COIN_RATE = 1000; // 1000 Coins = 1 Taka

// --- Utility Functions ---
const formatFullTime = (isoString: string) => {
    if(!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const defaultSettings = {
    appName: 'Aitaskify',
    minWithdraw: 100, 
    freeWithdrawLimit: 1, 
    supportLinks: [
        { name: 'Telegram Channel', url: 'https://t.me/channel' },
    ],
    bkash: '01700000000', nagad: '01800000000',
    gmailRate: 500,
    gmailRateFree: 12000,
    gmailRatePremium: 13000,
    joiningBonusAmount: 100, 
    referralBonusAmount: 50,
    premiumUpgradeBonus: 50, 
    telegramChannelLink: 'https://t.me/your_channel_link',
    workVideoLink: 'https://youtube.com',
    adminContactLink: 'https://t.me/admin_username', 
    aboutText: '<p>Welcome to our platform. We provide the best micro-tasking experience.</p>',
    ramadanOfferLink: 'https://google.com',
    ramadanOfferHtml: '<p>Ramadan Kareem! Special offers coming soon.</p>',
    gmailInstructionHtml: '<p>1. Create a fresh Gmail account.<br>2. Use the exact Name provided.<br>3. Set the password as provided.<br>4. Do not add recovery phone number.</p>',
    premiumCost: 500,
    premiumDesc: '<ul><li>Get 5% Commission on Referral Gmail Sells</li><li>Priority Withdrawals</li><li>Premium Badge</li><li>Access to Special Tasks</li></ul>',
    withdrawPresets: [
        { tk: 3000, coins: 3000000 },
        { tk: 1200, coins: 1200000 },
        { tk: 600, coins: 600000 },
        { tk: 130, coins: 130000 },
    ],
    imageUploadSiteLink: 'https://imgbb.com',
};

// --- GLOBAL STYLES & THEME (Updated for Slim & Thicker Buttons) ---
const THEME = {
    primaryGradient: 'bg-gradient-to-r from-orange-500 to-rose-500', // Slightly richer gradient
    primaryShadow: 'shadow-orange-200',
    bgMain: 'bg-[#FAFAFA]', // Cleaner white/grey background
    card: 'bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100', // Sleek card style
    textHighlight: 'text-orange-600',
    // Made button thicker (py-4), bolder font, and smoother shadow
    button: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all duration-300'
};

// --- Helper Components ---

const CustomPopup = ({ isOpen, type, message, onClose }: { isOpen: boolean, type: 'success' | 'error' | 'warning', message: string, onClose: () => void }) => {
    if (!isOpen) return null;
    const icons = {
        success: <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4 drop-shadow-md" />,
        error: <XCircle size={56} className="text-rose-500 mx-auto mb-4 drop-shadow-md" />,
        warning: <AlertTriangle size={56} className="text-amber-500 mx-auto mb-4 drop-shadow-md" />
    };
    const titles = {
        success: 'Successful',
        error: 'Failed',
        warning: 'Notice'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-xs text-center transform transition-all scale-100 animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-rose-500"></div>
                <div className="mt-2">{icons[type]}</div>
                <h3 className="text-2xl font-extrabold text-gray-800 mb-2 tracking-tight">{titles[type]}</h3>
                <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed">{message}</p>
                <button onClick={onClose} className={`w-full py-4 rounded-2xl font-extrabold text-sm text-white ${THEME.primaryGradient} shadow-lg active:scale-95`}>
                    Dismiss
                </button>
            </div>
        </div>
    );
};

const FloatingSupport = ({ link }: {link: string}) => {
    return (
        <a 
            href={link} 
            target="_blank" 
            className="fixed bottom-24 right-5 z-40 bg-[#0088cc] text-white p-4 rounded-full shadow-lg shadow-blue-400/40 hover:scale-110 transition-transform active:scale-90 flex items-center justify-center group"
        >
            <Send size={24} className="-ml-0.5 mt-0.5" />
        </a>
    );
};

const GmailHandleCopy = ({ handle }: { handle: string }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
         navigator.clipboard.writeText(handle);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2 cursor-pointer hover:bg-gray-100 transition active:scale-[0.99]" onClick={copy}>
            <span className="font-mono text-sm font-bold text-gray-700">@{handle}</span>
            <button className="text-[10px] font-bold text-white bg-gray-900 px-3 py-1.5 rounded-lg">
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
    )
};

// 1. Bottom Navigation Component
const BottomNav = ({ currentView, setView }: any) => {
  const NavItem = ({ view, icon: Icon, label }: any) => {
      const isActive = currentView === view;
      return (
        <button 
          onClick={() => setView(view)} 
          className={`flex flex-col items-center justify-center gap-1 transition-all w-16 relative py-3 ${isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className={`relative ${isActive ? '-translate-y-1' : ''} transition-transform duration-300`}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} className={isActive ? "text-orange-500/20" : ""} />
              {isActive && <Icon size={24} strokeWidth={2.5} className="absolute top-0 left-0 text-orange-600" />}
          </div>
          {isActive && <div className="w-1 h-1 bg-orange-600 rounded-full mt-1"></div>}
        </button>
      );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-4 pt-1 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] flex justify-between items-center max-w-md mx-auto">
        <NavItem view="dashboard" icon={Home} label="Home" />
        <NavItem view="tasks" icon={ClipboardList} label="Tasks" />
        <NavItem view="team" icon={Users} label="Team" />
        <NavItem view="account" icon={User} label="Profile" />
    </div>
  );
};

// 2. Dashboard View
const HomeView = ({ user, setView, settings, onUpdateUser, transactions }: any) => {
  const [activeTimeDisplay, setActiveTimeDisplay] = useState('');
  const inviteLink = `${window.location.origin}/?ref=${user.refCode}`;
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);

  useEffect(() => {
      const fetchLeaderboard = async () => {
          const { data } = await supabase
            .from('users')
            .select('*')
            .order('balanceFree', { ascending: false })
            .limit(10);
          if (data) setLeaderboard(data);
      };
      fetchLeaderboard();
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          const currentSeconds = (user.totalActiveSeconds || 0) + 1;
          const h = Math.floor(currentSeconds / 3600);
          const m = Math.floor((currentSeconds % 3600) / 60);
          const s = currentSeconds % 60;
          setActiveTimeDisplay(`${h}h ${m}m ${s}s`);
      }, 1000);
      return () => clearInterval(interval);
  }, [user]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todaysIncome = transactions
     .filter((t: any) => t.type === 'earning' && new Date(t.date) >= todayStart)
     .reduce((acc: any, curr: any) => acc + curr.amount, 0);

  return (
    <div className={`pb-32 animate-in fade-in ${THEME.bgMain} min-h-screen font-sans`}>
      
      {/* Ramadan Special Banner */}
      <div 
        onClick={() => setView('ramadan')}
        className="mx-5 mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white text-center py-3.5 px-4 cursor-pointer relative overflow-hidden shadow-lg shadow-emerald-600/20 transform transition active:scale-95 group"
      >
          <div className="flex justify-center items-center gap-2 animate-pulse group-hover:animate-none">
             <Moon size={18} className="text-yellow-300 fill-yellow-300 drop-shadow-md"/>
             <span className="text-xs font-extrabold tracking-widest uppercase">RAMADAN OFFER</span>
             <ChevronRight size={16} className="opacity-80"/>
          </div>
      </div>

      <div className="px-5 pt-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <div onClick={() => setView('account')} className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-pink-500 cursor-pointer shadow-md active:scale-95 transition">
                    <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full object-cover rounded-full border-2 border-white"/>
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 leading-none mb-1">Hi, {user.fullName.split(' ')[0]}</h1>
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${user.accountType === 'premium' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                            {user.accountType === 'premium' ? <Crown size={10} fill="currentColor"/> : <User size={10}/>}
                            {user.accountType === 'premium' ? 'PRO' : 'Basic'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 hover:text-orange-500 transition active:scale-90">
                    <Bell size={22}/>
                </button>
            </div>
        </div>
        
        {/* Main Balance Card */}
        <div className={`${THEME.primaryGradient} rounded-[2.5rem] p-8 shadow-xl shadow-orange-500/20 mb-10 relative overflow-hidden text-white`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-bl-full pointer-events-none mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-5 rounded-tr-full pointer-events-none"></div>
            
            <div className="relative z-10 text-center">
                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-90">Total Balance</p>
                
                {/* PRIMARY: Taka Display */}
                <h1 className="text-[3.5rem] font-extrabold flex items-center justify-center gap-1 mb-2 tracking-tighter drop-shadow-sm leading-none">
                    <span className="text-3xl opacity-80 mt-2 font-serif">৳</span>
                    {((user.balanceFree || 0) / 1000).toFixed(2)} 
                </h1>
                
                {/* SECONDARY: Coins Display */}
                <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-white/10">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_10px_yellow]"></div>
                    <p className="text-xs font-bold text-white tracking-wide">{(user.balanceFree || 0).toLocaleString()} Coins</p>
                </div>
                
                <div className="flex justify-center gap-8 border-t border-white/20 pt-5 mt-2">
                    <div className="text-center w-1/2">
                        <p className="text-[10px] text-orange-50 font-bold uppercase tracking-wider mb-1">Today's Earn</p>
                        <p className="font-extrabold text-xl">{todaysIncome}</p>
                    </div>
                    <div className="w-[1px] bg-white/20 h-10"></div>
                    <div className="text-center w-1/2">
                        <p className="text-[10px] text-orange-50 font-bold uppercase tracking-wider mb-1">Active Time</p>
                        <p className="font-extrabold text-xl font-mono tracking-tighter">{activeTimeDisplay || "00:00"}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Telegram Action Banner */}
        <a 
            href={settings.telegramChannelLink} 
            target="_blank" 
            className="flex items-center justify-between bg-[#2AABEE] text-white p-5 rounded-[2rem] shadow-lg shadow-blue-400/30 mb-8 hover:brightness-110 transition active:scale-[0.98] group relative overflow-hidden"
        >
            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-sm"><Send size={22} className="ml-0.5 text-white"/></div>
                <div>
                    <h3 className="font-bold text-base">Join Telegram</h3>
                    <p className="text-[11px] text-blue-100 font-medium opacity-90">Payment proofs & updates</p>
                </div>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:translate-x-1 transition">
                <ArrowUpRight size={20} className="text-white"/>
            </div>
        </a>

        {/* Invite & Earn Banner */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-gray-100 mb-10 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="bg-orange-50 p-2 rounded-xl text-orange-600"><Gift size={20}/></div>
                    <h3 className="font-bold text-gray-800 text-sm">Refer & Earn</h3>
                </div>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed font-medium">
                    Invite your friends and earn <span className="text-orange-600 font-extrabold bg-orange-50 px-1.5 rounded">{settings.premiumUpgradeBonus || 50} coins</span> instantly for every active referral.
                </p>
                <button onClick={() => navigator.clipboard.writeText(inviteLink)} className={`${THEME.primaryGradient} w-full py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-lg active:scale-[0.98]`}>
                    <Copy size={16}/> Copy Invite Link
                </button>
            </div>
            <div className="absolute bottom-[-30px] right-[-30px] text-orange-500 opacity-5">
                <Gift size={140}/>
            </div>
        </div>

        {/* Daily Rewards Grid */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Clock size={18} className="text-orange-500"/> Daily Check-in</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Reset: 12 AM</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map((d) => (
                <div key={d} className={`rounded-2xl py-4 flex flex-col items-center justify-center shadow-sm border transition-all active:scale-95 cursor-pointer group ${d <= 1 ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-gray-100 text-gray-300 hover:border-orange-200 hover:text-orange-300'}`}>
                    {d <= 1 ? <CheckCircle size={20} className="mb-2 text-white"/> : <Lock size={20} className="mb-2 group-hover:scale-110 transition"/>}
                    <span className="text-[10px] font-bold tracking-wide">Day {d}</span>
                </div>
                ))}
            </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-5 px-1">
                <Trophy size={18} className="text-orange-500"/>
                <h3 className="font-bold text-gray-800 text-sm">Top Earners</h3>
            </div>
            <div className="bg-white rounded-[2rem] shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-gray-50 p-4 space-y-3">
                {leaderboard.map((u, idx) => (
                    <div key={u.id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition cursor-default group border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-xs shadow-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border border-gray-100 text-gray-400'}`}>
                                {idx + 1}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full p-0.5 bg-gray-100 group-hover:bg-white transition">
                                    <img src={u.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full rounded-full object-cover"/>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800 leading-tight mb-0.5">{u.fullName}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Verified User</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-white transition border border-gray-100 group-hover:border-orange-100">
                            <p className="text-xs font-bold text-orange-600">{(u.balanceFree || 0).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {leaderboard.length === 0 && <div className="text-center text-gray-400 text-xs py-4">Loading Leaderboard...</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

// 3. Withdraw View (Improved Thicker Buttons & Inputs)
const WithdrawView = ({ user, setView, showPopup, onUpdateUser }: any) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('bkash');
    const [number, setNumber] = useState('');
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const fetchS = async () => {
            const { data } = await supabase.from('app_settings').select('settings').single();
            if(data) setSettings({...defaultSettings, ...data.settings});
        };
        fetchS();
    }, []);

    const presetAmounts = settings.withdrawPresets || defaultSettings.withdrawPresets;

    const handleWithdraw = async () => {
        const withdrawAmountTk = parseFloat(amount);
        const withdrawAmountCoins = withdrawAmountTk * COIN_RATE;

        if (!amount || !number) return showPopup('warning', 'Please fill all fields');
        if (number.length < 11) return showPopup('warning', 'Invalid wallet number');
        if (withdrawAmountTk < settings.minWithdraw) return showPopup('warning', `Minimum withdraw is ৳${settings.minWithdraw}`);
        if ((user.balanceFree || 0) < withdrawAmountCoins) return showPopup('error', 'Insufficient Coin Balance');

        // Optimistic UI Update
        const updatedUser = { ...user, balanceFree: (user.balanceFree || 0) - withdrawAmountCoins };
        onUpdateUser(updatedUser);

        // DB Update
        const trx: Transaction = {
            id: Date.now().toString(),
            type: 'withdraw',
            category: 'main',
            amount: withdrawAmountTk,
            status: 'pending',
            date: new Date().toISOString(),
            method: method,
            senderNumber: number,
            details: `Withdraw via ${method}`,
            userId: user.id
        };
        const { error } = await supabase.from('transactions').insert([trx]);
        
        if (error) {
            showPopup('error', 'Failed to submit request. Contact Support.');
        } else {
            // Also update user balance in DB
            await supabase.from('users').update({ balanceFree: updatedUser.balanceFree }).eq('id', user.id);
            showPopup('success', 'Withdrawal Request Submitted Successfully!');
            setAmount('');
            setNumber('');
        }
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-24 px-5 pt-6 animate-in slide-in-from-right`}>
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('account')} className="p-3.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                <h1 className="text-xl font-bold text-gray-800">Withdrawal</h1>
             </div>

             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-400/50 mb-10 text-center relative overflow-hidden">
                 <div className="relative z-10">
                     <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                     <h1 className="text-5xl font-extrabold flex items-center justify-center gap-2 mb-2">
                         <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg text-yellow-800 border-4 border-yellow-200">
                             <span className="font-serif font-bold">৳</span>
                         </div>
                         {((user.balanceFree || 0) / 1000).toFixed(2)}
                     </h1>
                     <div className="inline-block bg-white/10 px-4 py-1 rounded-full backdrop-blur-md">
                        <p className="text-[10px] font-bold text-gray-300">1000 Coins = 1 Taka</p>
                     </div>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500 opacity-10 rounded-tr-full pointer-events-none"></div>
             </div>

             <h3 className="font-bold text-gray-800 mb-5 text-sm px-1 flex items-center gap-2"><LayoutDashboard size={18} className="text-orange-500"/> Select Package</h3>
             <div className="grid grid-cols-2 gap-4 mb-10">
                 {presetAmounts.map((preset:any, idx:number) => (
                     <button 
                        key={idx}
                        onClick={() => setAmount(preset.tk.toString())}
                        className={`p-6 rounded-[1.5rem] border text-center transition-all duration-300 group ${amount === preset.tk.toString() ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200 shadow-lg scale-[1.02]' : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'}`}
                     >
                         <h4 className={`text-2xl font-extrabold mb-1.5 ${amount === preset.tk.toString() ? 'text-orange-600' : 'text-gray-800'}`}>৳{preset.tk}</h4>
                         <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-2 bg-gray-50 py-1.5 px-3 rounded-lg group-hover:bg-white transition">
                             <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                             {preset.coins} Coins
                         </div>
                     </button>
                 ))}
             </div>

             <div className="bg-white p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 space-y-7 mb-8">
                 <div>
                     <label className="block text-xs font-extrabold text-gray-400 uppercase mb-3 ml-1 tracking-wider">Payment Method</label>
                     <div className="flex gap-4">
                         {['bkash', 'nagad'].map(m => (
                             <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-5 rounded-2xl border text-sm font-bold capitalize transition-all ${method === m ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-gray-300'}`}>
                                 {m}
                             </button>
                         ))}
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-extrabold text-gray-400 uppercase mb-3 ml-1 tracking-wider">Wallet Number</label>
                     <div className="relative">
                        <input type="number" className="w-full pl-12 pr-4 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-sm placeholder-gray-300" placeholder="017xxxxxxxx" value={number} onChange={e => setNumber(e.target.value)}/>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Smartphone size={22}/></div>
                     </div>
                 </div>
                 <div>
                     <label className="block text-xs font-extrabold text-gray-400 uppercase mb-3 ml-1 tracking-wider">Amount (Custom)</label>
                     <div className="relative">
                        <input type="number" className="w-full pl-12 pr-4 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-sm placeholder-gray-300" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)}/>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">৳</div>
                     </div>
                 </div>

                 {/* THICKER & BOLDER BUTTON */}
                 <button onClick={handleWithdraw} className={`${THEME.button} w-full py-5 rounded-2xl font-extrabold text-base tracking-wide mt-2 shadow-xl`}>
                     Confirm Withdraw
                 </button>
             </div>
        </div>
    );
};

// 4. Task List View (Restored Design & Improved Buttons)
const TaskListView = ({ user, showPopup, onUpdateUser }: any) => {
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [activeTab, setActiveTab] = useState<'tasks' | 'gmail'>('tasks');
    
    const [gmailReq, setGmailReq] = useState<GmailRequest | null>(null);
    const [gmailUserEmail, setGmailUserEmail] = useState('');
    const [proofLink, setProofLink] = useState('');
    const [proofNote, setProofNote] = useState('');
    
    const [settings, setSettings] = useState(defaultSettings);
    const [allTasks, setAllTasks] = useState([]);
    const [myTrxs, setMyTrxs] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: s } = await supabase.from('app_settings').select('settings').single();
            if(s) setSettings({...defaultSettings, ...s.settings});

            const { data: t } = await supabase.from('tasks').select('*');
            if(t) setAllTasks(t as any);

            const { data: tx } = await supabase.from('transactions').select('*').eq('userId', user.id);
            if(tx) setMyTrxs(tx);

            const { data: g } = await supabase.from('gmail_requests').select('*').eq('userId', user.id).not('status', 'eq', 'approved').not('status', 'eq', 'rejected').maybeSingle();
            if(g) setGmailReq(g);
        };
        fetchData();
    }, [activeTab, user.id]);

    const availableTasks = allTasks.filter((task: any) => {
        const trx = myTrxs.find((t: Transaction) => t.category === 'task' && t.details?.includes(task.title));
        if (!trx) return true; // Not submitted yet
        if (trx.status === 'rejected') return true; // Rejected, can retry
        return false; // Pending or Approved
    });

    const gmailCoinRate = user.accountType === 'premium' ? (settings.gmailRatePremium || 13000) : (settings.gmailRateFree || 12000);
    const gmailTkRate = gmailCoinRate / 1000;

    const handleLinkSubmit = async () => {
         if (!proofLink.startsWith('http')) return showPopup('warning', 'Invalid Proof Link. Must start with http/https.');
         
         const { error } = await supabase.from('transactions').insert([{
             id: Date.now().toString(),
             userId: user.id,
             type: 'earning',
             category: 'task',
             amount: selectedTask.reward,
             status: 'pending',  // CRITICAL FIX: Pending status
             date: new Date().toISOString(),
             details: `Task: ${selectedTask.title}`,
             proofUrl: proofLink + (proofNote ? ` | Note: ${proofNote}` : ''),
             taskId: selectedTask.id
         }]);
         
         if (error) {
             showPopup('error', 'Submission Failed. Try again.');
         } else {
             showPopup('success', 'Proof Submitted! Balance will be added after Admin Approval.');
             setViewMode('list');
             setProofLink('');
             setProofNote('');
             // Refresh transactions locally to hide the task
             const newTrx: any = { category: 'task', details: selectedTask.title, status: 'pending' };
             setMyTrxs([...myTrxs, newTrx]);
         }
    };

    const handleGmailRequest = async () => {
        const newReq = { id: Date.now().toString(), userId: user.id, status: 'requested', date: new Date().toISOString() };
        const { error } = await supabase.from('gmail_requests').insert([newReq]);
        if(!error) {
            setGmailReq(newReq as any);
            showPopup('success', 'Gmail Job Requested! Wait for Admin credentials.');
        } else {
            showPopup('error', 'Request Failed');
        }
    };

    const handleGmailSubmit = async () => {
        if (!gmailUserEmail) return showPopup('warning', 'Invalid Email');
        const fullEmail = gmailUserEmail.includes('@') ? gmailUserEmail : `${gmailUserEmail}@gmail.com`;
        
        if (!gmailReq) return;
        
        const { error } = await supabase.from('gmail_requests').update({ status: 'submitted', userCreatedEmail: fullEmail }).eq('id', gmailReq.id);
        
        if(!error) {
            setGmailReq({ ...gmailReq, status: 'submitted', userCreatedEmail: fullEmail });
            
            await supabase.from('transactions').insert([{ 
                id: Date.now().toString(), 
                userId: user.id,
                type: 'earning', 
                category: 'sell', 
                amount: gmailCoinRate, 
                status: 'pending', // Pending Admin Approval
                date: new Date().toISOString(), 
                details: `Gmail Sell: ${fullEmail}` 
            }]);
            
            showPopup('success', 'Gmail Submitted! Payment upon approval.');
        } else {
            showPopup('error', 'Submission Failed');
        }
    };

    const handleRequestRecovery = async () => {
        if(!gmailReq) return;
        await supabase.from('gmail_requests').update({ status: 'recovery_requested' }).eq('id', gmailReq.id);
        setGmailReq({...gmailReq, status: 'recovery_requested'});
    };

    const CopyField = ({label, value}: {label: string, value: string}) => (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center group hover:border-indigo-200 transition">
            <div className="overflow-hidden">
                <p className="text-[10px] text-gray-400 uppercase font-extrabold mb-1 tracking-wider">{label}</p>
                <p className="font-bold text-gray-800 text-sm truncate select-all">{value}</p>
            </div>
            <button 
                onClick={() => {navigator.clipboard.writeText(value); showPopup('success', 'Copied to Clipboard!');}}
                className="p-3 bg-white rounded-xl shadow-sm text-gray-400 hover:text-indigo-600 active:scale-95 transition shrink-0 border border-gray-100"
            >
                <Copy size={18}/>
            </button>
        </div>
    );

    if (viewMode === 'detail' && selectedTask) {
         return (
             <div className={`pb-24 ${THEME.bgMain} min-h-screen px-5 pt-6 animate-in slide-in-from-right`}>
                 <div className="flex items-center gap-4 mb-8">
                     <button onClick={() => setViewMode('list')} className="p-3 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                     <h1 className="text-xl font-bold text-gray-800">Task Details</h1>
                 </div>
                 
                 <div className="bg-white rounded-[2.5rem] p-8 text-center mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-50 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                     {selectedTask.image && <img src={selectedTask.image} className="w-24 h-24 rounded-3xl mx-auto mb-6 object-cover shadow-lg group-hover:scale-105 transition duration-500"/>}
                     <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight relative z-10">{selectedTask.title}</h2>
                     <div className="flex items-center justify-center gap-2 mt-4 relative z-10 bg-orange-50 w-fit mx-auto px-6 py-2.5 rounded-full">
                        <span className="text-orange-600 font-extrabold text-3xl">+{selectedTask.reward}</span>
                        <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
                     </div>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Coins Reward</p>
                 </div>

                 <div className="bg-white p-7 rounded-[2rem] border border-gray-100 mb-8 shadow-sm">
                     <h4 className="text-xs font-extrabold text-gray-400 uppercase mb-4 flex items-center gap-2 tracking-wider"><Info size={16}/> Instructions</h4>
                     <div className="text-sm text-gray-600 leading-7 font-medium whitespace-pre-line">{selectedTask.desc}</div>
                 </div>
                 
                 <a href={selectedTask.link} target="_blank" className="block w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-center text-sm mb-8 shadow-xl shadow-gray-200 flex items-center justify-center gap-3 hover:bg-black transition transform active:scale-[0.99]">
                    Go to Task Link <ExternalLink size={18}/>
                 </a>
                 
                 {selectedTask.type === 'submit' && (
                     <div className="bg-white p-7 rounded-[2.5rem] border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative">
                        <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 px-5 py-2 rounded-bl-3xl text-[10px] font-bold uppercase">Proof Required</div>
                        <h4 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2"><CheckSquare size={22} className="text-orange-500"/> Submit Proof</h4>
                        
                        <div className="mb-6">
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-2.5 block tracking-wide">Screenshot Link</label>
                            <div className="flex gap-2">
                                <input 
                                    className="w-full p-5 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 text-sm font-bold text-gray-900 transition placeholder-gray-300" 
                                    placeholder="Paste Image Link here..." 
                                    value={proofLink} 
                                    onChange={e => setProofLink(e.target.value)}
                                />
                                <button 
                                    onClick={() => window.open(settings.imageUploadSiteLink || 'https://imgbb.com', '_blank')}
                                    className="bg-orange-50 text-orange-600 w-16 rounded-2xl border border-orange-100 hover:bg-orange-100 transition flex items-center justify-center shadow-sm"
                                    title="Upload & Create Link"
                                >
                                    <UploadCloud size={24}/>
                                </button>
                            </div>
                        </div>

                        <div className="mb-8">
                             <label className="text-[11px] font-bold text-gray-400 uppercase mb-2.5 block tracking-wide">Note (Optional)</label>
                             <textarea 
                                rows={3}
                                className="w-full p-5 bg-gray-50/50 rounded-2xl border border-gray-100 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-50 text-sm font-bold text-gray-900 resize-none transition placeholder-gray-300" 
                                placeholder="Type any extra details..." 
                                value={proofNote} 
                                onChange={e => setProofNote(e.target.value)}
                            />
                        </div>

                        {/* THICKER SUBMIT BUTTON */}
                        <button onClick={handleLinkSubmit} className={`${THEME.button} w-full py-5 rounded-2xl font-extrabold text-base tracking-wide shadow-xl`}>Submit for Approval</button>
                     </div>
                 )}
             </div>
         );
    }

    return (
        <div className={`pb-28 ${THEME.bgMain} min-h-screen px-5 pt-6 animate-in fade-in`}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-extrabold text-gray-800">Earn Area</h1>
                <div className="bg-white px-3 py-1 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 shadow-sm">
                    {availableTasks.length} Available
                </div>
            </div>

            {/* Category Switcher */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('tasks')} 
                    className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${activeTab === 'tasks' ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-200' : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-500'}`}
                >
                    <ListTodo size={36} className="mb-1 transition-transform group-hover:scale-110"/>
                    <span className="font-extrabold text-sm">Micro Tasks</span>
                    <p className={`text-[10px] font-medium ${activeTab === 'tasks' ? 'text-orange-100' : 'text-gray-300'}`}>Like, Share & Earn</p>
                    {activeTab === 'tasks' && <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('gmail')} 
                    className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${activeTab === 'gmail' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-500'}`}
                >
                    <Mail size={36} className="mb-1 transition-transform group-hover:scale-110"/>
                    <span className="font-extrabold text-sm">Gmail Farm</span>
                    <p className={`text-[10px] font-medium ${activeTab === 'gmail' ? 'text-indigo-100' : 'text-gray-300'}`}>High Payout Jobs</p>
                    {activeTab === 'gmail' && <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>}
                </button>
            </div>
            
            {activeTab === 'gmail' ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Warning Card */}
                    <div className="bg-red-50 border border-red-100 p-5 rounded-[1.5rem] flex gap-4 items-start relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5"><AlertTriangle size={80} className="text-red-500"/></div>
                        <div className="bg-white p-2 rounded-xl shadow-sm text-red-500 z-10"><AlertTriangle size={24}/></div>
                        <div className="z-10">
                            <h4 className="text-sm font-extrabold text-red-700 uppercase mb-1 tracking-wide">Admin Notice</h4>
                            <p className="text-xs text-red-600 mb-4 leading-relaxed font-medium">
                                You MUST contact Admin before creating any Gmail. Creating wrong accounts will result in a ban.
                            </p>
                            <a href={settings.adminContactLink} target="_blank" className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-md shadow-red-200">
                                <MessageCircle size={16}/> Contact Admin
                            </a>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-7 rounded-[2rem] shadow-xl shadow-indigo-200 mb-4 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-extrabold mb-1">Sell Verified Gmail</h2>
                            <p className="text-indigo-100 text-xs mb-5">Create fresh accounts & earn instantly.</p>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                    <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">Current Rate</p>
                                    <p className="font-extrabold text-yellow-300 text-lg">৳{gmailTkRate} <span className="text-xs text-white opacity-80 font-normal">({gmailCoinRate} Coins)</span></p>
                                </div>
                            </div>
                        </div>
                        <Mail className="text-white opacity-10 absolute -right-6 -bottom-6 rotate-12 group-hover:scale-110 transition duration-700" size={130}/>
                    </div>

                    {!gmailReq ? (
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-5">
                                <Plus size={40}/>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Ready to Start?</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">Request a new job. Admin will provide you with a Name and Password to use.</p>
                            <button onClick={handleGmailRequest} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-200 text-sm hover:bg-indigo-700 transition active:scale-95">Request New Job</button>
                        </div>
                    ) : (
                        <div className="bg-white p-7 rounded-[2.5rem] shadow-lg border border-indigo-50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-5">
                                    <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Job Status</span>
                                    <span className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full tracking-wide ${gmailReq.status === 'requested' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>{gmailReq.status.replace('_', ' ')}</span>
                                </div>
                                
                                {gmailReq.status === 'credentials_sent' || gmailReq.status === 'recovery_requested' || gmailReq.status === 'recovery_sent' ? (
                                    <div className="space-y-8">
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">1</div>
                                                <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Create with these details</p>
                                            </div>
                                            <CopyField label="First Name" value={gmailReq.adminProvidedFirstName || 'N/A'} />
                                            <CopyField label="Last Name" value={gmailReq.adminProvidedLastName || 'N/A'} />
                                            <CopyField label="Password" value={gmailReq.adminProvidedPassword || 'N/A'} />
                                            
                                            {/* Gmail Handle Logic */}
                                            {gmailReq.userCreatedEmail && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold pl-1">Target Username</p>
                                                    <GmailHandleCopy handle={gmailReq.userCreatedEmail.replace('@gmail.com','')} />
                                                </div>
                                            )}

                                            {/* Recovery Email Display */}
                                            {gmailReq.adminProvidedRecoveryEmail && (
                                                <div className="mt-8 pt-6 border-t border-gray-50 animate-in fade-in">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">2</div>
                                                        <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wide">Add Recovery Email</p>
                                                    </div>
                                                    <CopyField label="Recovery Email" value={gmailReq.adminProvidedRecoveryEmail} />
                                                    <p className="text-[10px] text-gray-400 mt-2 italic text-center">Important: Add this recovery email to the account settings.</p>
                                                </div>
                                            )}
                                        </div>

                                        {gmailReq.status !== 'recovery_sent' ? (
                                            <div className="pt-6 border-t border-gray-50">
                                                 <p className="text-xs text-center text-gray-400 mb-4 font-medium">After creating the email using above Name & Password:</p>
                                                 <button onClick={handleRequestRecovery} className="w-full bg-amber-50 text-amber-600 border border-amber-100 py-5 rounded-2xl font-bold text-xs hover:bg-amber-100 transition shadow-sm uppercase tracking-wide">I have created it, Get Recovery Email</button>
                                            </div>
                                        ) : (
                                            <div className="pt-6 border-t border-gray-50">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">3</div>
                                                    <p className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Final Submission</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-5">
                                                    <input 
                                                        className="flex-1 p-5 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 text-right pr-2 text-gray-900 placeholder-gray-300" 
                                                        placeholder="Confirm username" 
                                                        value={gmailUserEmail.replace('@gmail.com', '')} 
                                                        onChange={e => setGmailUserEmail(e.target.value)}
                                                    />
                                                    <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 shadow-sm">
                                                        @gmail.com
                                                    </div>
                                                </div>
                                                {/* THICKER BUTTON */}
                                                <button onClick={handleGmailSubmit} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 uppercase tracking-wide">Submit for Payment</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-base font-bold text-gray-800">Processing Request...</p>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">Please wait while admin assigns credentials.</p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {availableTasks.map((task: any) => (
                        <div key={task.id} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-gray-50 flex items-center justify-between hover:border-orange-200 transition group cursor-pointer" onClick={() => { setSelectedTask(task); setViewMode('detail'); }}>
                            <div className="flex items-center gap-5">
                                {task.image ? (
                                    <img src={task.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 shadow-sm group-hover:scale-105 transition" />
                                ) : (
                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm group-hover:bg-orange-100 transition">
                                        {task.type === 'watch' ? <PlayCircle size={28}/> : <CheckSquare size={28}/>}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1 group-hover:text-orange-600 transition">{task.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">+{task.reward} Coins</span>
                                        <span className="text-[10px] text-gray-400 capitalize font-medium">{task.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-full text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition">
                                <ChevronRight size={22}/>
                            </div>
                        </div>
                    ))}
                    {availableTasks.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <ClipboardList size={32}/>
                            </div>
                            <p className="text-gray-400 font-bold text-sm">No tasks available right now.</p>
                            <p className="text-gray-400 text-xs mt-1">Check back later.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 5. Joining Bonus View (Extensive UI)
const JoiningBonusView = ({ user, setView, onUpdateUser, showPopup }: any) => {
    const [step, setStep] = useState(1);
    const [refInput, setRefInput] = useState('');
    const [referrer, setReferrer] = useState<UserData | null>(null);
    const [timer, setTimer] = useState(0);
    const [viewTab, setViewTab] = useState<'join' | 'my_referrals' | 'history'>('join');
    const [myReferrals, setMyReferrals] = useState<UserData[]>([]);
    const [bonusHistory, setBonusHistory] = useState<Transaction[]>([]);
    const [settings, setSettings] = useState(defaultSettings);
    const [myTrxs, setMyTrxs] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetch = async () => {
            const { data: s } = await supabase.from('app_settings').select('settings').single();
            if(s) setSettings({...defaultSettings, ...s.settings});

            const { data: refs } = await supabase.from('users').select('*').eq('uplineRefCode', user.refCode);
            if(refs) setMyReferrals(refs);

            const { data: trx } = await supabase.from('transactions').select('*').eq('userId', user.id);
            if(trx) {
                setMyTrxs(trx);
                setBonusHistory(trx.filter((t: any) => t.category === 'joining_bonus' || t.category === 'referral_bonus'));
            }
        };
        fetch();
    }, [user.id, user.refCode]);

    useEffect(() => {
        if(step === 2 && timer > 0) {
            const t = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(t);
        } else if (step === 2 && timer === 0) setStep(3);
    }, [step, timer]);

    const handleVerify = async () => {
        if(!refInput) return showPopup('warning', 'Please enter a code');
        const { data } = await supabase.from('users').select('*').eq('refCode', refInput).single();
        if(data) { setReferrer(data); showPopup('success', 'Referrer Found!'); } 
        else showPopup('error', 'Invalid Referral Code');
    };

    const handleClaimJoining = async () => {
        const bonus = settings.joiningBonusAmount || 100;
        const updatedUser = { ...user, balanceFree: (user.balanceFree || 0) + bonus, joiningBonusClaimed: true, uplineRefCode: referrer?.refCode || user.uplineRefCode };
        onUpdateUser(updatedUser);
        
        await supabase.from('transactions').insert([{ 
            id: Date.now().toString(), 
            userId: user.id,
            type: 'earning', 
            category: 'joining_bonus', 
            amount: bonus, 
            status: 'approved', 
            date: new Date().toISOString(), 
            details: 'Joining Bonus Claimed' 
        }]);
        showPopup('success', `+${bonus} Coins Added Successfully!`);
    };

    const handleClaimReferralBonus = async (refUser: UserData) => {
        // Simulating Ad Watch
        const w = window.open('https://google.com', '_blank');
        
        setTimeout(async () => {
             const bonus = settings.referralBonusAmount || 50;
             onUpdateUser({ ...user, balanceFree: (user.balanceFree || 0) + bonus });
             
             await supabase.from('transactions').insert([{
                 id: Date.now().toString(),
                 userId: user.id,
                 type: 'earning',
                 category: 'referral_bonus',
                 amount: bonus,
                 status: 'approved',
                 date: new Date().toISOString(),
                 details: `Referral Bonus from ${refUser.fullName}`,
                 referralUserId: refUser.id
             }]);
             showPopup('success', `+${bonus} Referral Bonus Claimed!`);
             
             // Refresh transactions
             const { data: trx } = await supabase.from('transactions').select('*').eq('userId', user.id);
             if(trx) setMyTrxs(trx);
        }, 3000); // 3 seconds delay simulate
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-5 pt-6 pb-24`}>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('account')} className="p-3.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                <h1 className="text-xl font-bold text-gray-800">Bonuses & Referrals</h1>
            </div>

            <div className="flex gap-2.5 mb-8 bg-white p-2 rounded-[1.5rem] w-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-x-auto scrollbar-hide">
                <button onClick={() => setViewTab('join')} className={`flex-1 px-4 py-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${viewTab === 'join' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Joining Bonus</button>
                <button onClick={() => setViewTab('my_referrals')} className={`flex-1 px-4 py-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${viewTab === 'my_referrals' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Referrals ({myReferrals.length})</button>
                <button onClick={() => setViewTab('history')} className={`flex-1 px-4 py-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${viewTab === 'history' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>History</button>
            </div>

            {viewTab === 'join' && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-orange-50 text-center relative overflow-hidden h-[60vh] flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                    {user.joiningBonusClaimed ? (
                        <div className="animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-emerald-200 shadow-lg">
                                <CheckCircle size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Bonus Claimed!</h2>
                            <p className="text-sm text-gray-500 font-medium">You have successfully received your joining bonus.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-8 animate-bounce">
                                <Gift size={48} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Welcome Gift</h2>
                            <p className="text-gray-500 text-sm mb-10 leading-relaxed px-4">Enter a referral code to unlock <span className="font-bold text-orange-500">{settings.joiningBonusAmount} coins</span> instantly.</p>

                            {!referrer ? (
                                <div className="space-y-5">
                                    <div className="relative">
                                        <input className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center font-extrabold text-xl tracking-widest outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-gray-900 placeholder-gray-300" placeholder="ENTER CODE" value={refInput} onChange={e => setRefInput(e.target.value)}/>
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={24}/>
                                    </div>
                                    <button onClick={handleVerify} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition active:scale-95 tracking-wide uppercase">Verify Code</button>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-bottom-10 space-y-6">
                                    <div className="bg-orange-50 p-5 rounded-3xl flex items-center gap-5 text-left border border-orange-100">
                                        <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 text-lg shadow-sm">{referrer.fullName.charAt(0)}</div>
                                        <div><p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider">Referrer</p><p className="font-bold text-gray-900 text-base">{referrer.fullName}</p></div>
                                    </div>
                                    {step === 1 && <button onClick={()=>{setStep(2); setTimer(10); window.open('https://google.com');}} className={`${THEME.button} w-full py-5 rounded-2xl font-bold text-sm`}>Watch Ad to Unlock</button>}
                                    {step === 2 && <button disabled className="w-full bg-gray-200 text-gray-500 py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"><Loader2 className="animate-spin" size={20}/> Wait {timer}s...</button>}
                                    {step === 3 && <button onClick={handleClaimJoining} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 animate-pulse hover:bg-emerald-600 transition">Claim Bonus Now</button>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {viewTab === 'my_referrals' && (
                <div className="space-y-4 animate-in fade-in">
                    {myReferrals.map((ref: UserData) => {
                        const hasClaimed = myTrxs.some((t: Transaction) => t.category === 'referral_bonus' && t.referralUserId === ref.id);
                        const canClaim = ref.joiningBonusClaimed && !hasClaimed;

                        return (
                            <div key={ref.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between hover:border-orange-100 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-base">{ref.fullName.charAt(0)}</div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{ref.fullName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">{ref.phone}</p>
                                    </div>
                                </div>
                                
                                {hasClaimed ? (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle size={12}/> Received</span>
                                ) : canClaim ? (
                                    <button onClick={() => handleClaimReferralBonus(ref)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-md shadow-orange-200 active:scale-95 transition hover:bg-orange-600">
                                        Claim +{settings.referralBonusAmount}
                                    </button>
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">Pending</span>
                                )}
                            </div>
                        );
                    })}
                    {myReferrals.length === 0 && (
                        <div className="text-center py-24 text-gray-400">
                            <Users size={48} className="mx-auto mb-4 opacity-20"/>
                            <p className="text-sm font-bold">No referrals yet.</p>
                            <p className="text-xs mt-1">Share your link to start earning.</p>
                        </div>
                    )}
                </div>
            )}

            {viewTab === 'history' && (
                <div className="space-y-3 animate-in fade-in">
                    {bonusHistory.map((t, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Gift size={22}/>
                                </div>
                                <div>
                                    <p className="font-bold text-xs text-gray-800 capitalize mb-0.5">{t.category.replace('_', ' ')}</p>
                                    <p className="text-[10px] text-gray-400">{formatFullTime(t.date)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-emerald-600">+{t.amount}</p>
                                <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-600">Approved</span>
                            </div>
                        </div>
                    ))}
                    {bonusHistory.length === 0 && <div className="text-center py-20 text-gray-400 text-xs">No bonus history found.</div>}
                </div>
            )}
        </div>
    );
};

// 6. Team View (Detailed)
const TeamView = ({ user }: any) => {
    const [referrals, setReferrals] = useState<UserData[]>([]);
    const [totalCommission, setTotalCommission] = useState(0);
    const [commissionsPerUser, setCommissionsPerUser] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchTeamData = async () => {
            // 1. Fetch Referrals
            const { data: refs } = await supabase.from('users').select('*').eq('uplineRefCode', user.refCode);
            if(refs) setReferrals(refs);

            // 2. Fetch Transactions to calculate earnings
            const { data: trxs } = await supabase.from('transactions').select('*').eq('userId', user.id);
            
            if(trxs) {
                // Calculate Total Referral Income (Bonus + Commissions)
                const total = trxs
                    .filter(t => t.category === 'referral_bonus' || t.category === 'referral_commission')
                    .reduce((sum, t) => sum + t.amount, 0);
                setTotalCommission(total);

                // Calculate per-user commission for the list
                const commMap: Record<string, number> = {};
                trxs.forEach((t: any) => {
                    if((t.category === 'referral_bonus' || t.category === 'referral_commission') && t.referralUserId) {
                        commMap[t.referralUserId] = (commMap[t.referralUserId] || 0) + t.amount;
                    }
                });
                setCommissionsPerUser(commMap);
            }
        };
        fetchTeamData();
    }, [user.refCode, user.id]);

    return (
        <div className={`pb-24 ${THEME.bgMain} min-h-screen px-5 pt-6 animate-in fade-in`}>
             <h1 className="text-2xl font-extrabold text-gray-800 mb-6">My Team</h1>
             
             {/* Stats Card */}
             <div className={`${THEME.primaryGradient} rounded-[2.5rem] p-10 text-white shadow-xl shadow-orange-500/20 mb-8 relative overflow-hidden`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full pointer-events-none"></div>
                 <div className="relative z-10 text-center">
                     <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-3 opacity-80">Team Overview</p>
                     <div className="flex justify-center gap-12">
                         <div className="text-center">
                             <h2 className="text-4xl font-extrabold mb-1">{referrals.length}</h2>
                             <p className="text-xs text-orange-100 font-medium">Members</p>
                         </div>
                         <div className="w-[1px] bg-white/20 h-12 mt-2"></div>
                         <div className="text-center">
                             <h2 className="text-4xl font-extrabold mb-1">{totalCommission}</h2>
                             <p className="text-xs text-orange-100 font-medium">Coins Earned</p>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Tools */}
             <div className="grid grid-cols-2 gap-4 mb-8">
                 <button onClick={() => navigator.clipboard.writeText(user.refCode)} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 flex flex-col items-center gap-3 active:scale-95 transition hover:shadow-lg">
                     <div className="p-3 bg-orange-50 rounded-full text-orange-500 mb-1"><Copy size={24}/></div>
                     <span className="font-bold text-xs text-gray-700">Copy Code</span>
                 </button>
                 <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.refCode}`)} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 flex flex-col items-center gap-3 active:scale-95 transition hover:shadow-lg">
                     <div className="p-3 bg-pink-50 rounded-full text-pink-500 mb-1"><Share2 size={24}/></div>
                     <span className="font-bold text-xs text-gray-700">Copy Link</span>
                 </button>
             </div>

             {/* List */}
             <div>
                 <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="font-bold text-gray-800 text-sm">Friends List</h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recent Activity</span>
                 </div>
                 <div className="space-y-4">
                     {referrals.map((ref: UserData) => {
                         const earnedFromUser = commissionsPerUser[ref.id] || 0;

                         return (
                            <div key={ref.id} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-gray-50 hover:border-orange-100 transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-base">{ref.fullName.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800 mb-0.5">{ref.fullName}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400 font-mono">{ref.phone}</p>
                                                {ref.accountType === 'premium' && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"><Crown size={8}/> PRO</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Balance</p>
                                        <p className="text-xs font-bold text-gray-800">{(ref.balanceFree || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Commission Earned</span>
                                    <span className="text-xs font-extrabold text-orange-600">+{earnedFromUser} Coins</span>
                                </div>
                            </div>
                         );
                     })}
                     {referrals.length === 0 && (
                         <div className="text-center py-16 text-gray-400">
                             <Users size={48} className="mx-auto mb-4 opacity-20"/>
                             <p className="text-sm font-bold">No referrals yet.</p>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

// 7. Account View (Profile Main - Fully Restored)
const AccountView = ({ user, setView, onLogout }: any) => {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('app_settings').select('settings').single();
            if(data) setSettings({...defaultSettings, ...data.settings});
        };
        fetch();
    }, []);

    const ProfileButton = ({ onClick, icon: Icon, label, color = "text-gray-600", badge }: any) => (
        <button 
            onClick={onClick}
            className="w-full bg-white p-5 rounded-[1.5rem] flex items-center justify-between border border-gray-50 mb-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] active:scale-[0.98] transition hover:border-orange-100 group"
        >
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-gray-50 group-hover:scale-110 transition duration-300`}>
                    <Icon size={22} />
                </div>
                <span className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                {badge && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{badge}</span>}
                <ChevronRight size={20} className="opacity-30 group-hover:opacity-100 transition text-orange-400" />
            </div>
        </button>
    );

    const MenuSectionTitle = ({ title }: { title: string }) => (
        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 ml-2 mt-8 opacity-80">{title}</h4>
    );

    // Dummy helper to simulate a notification badge
    const hasUnclaimedBonus = !user.joiningBonusClaimed;

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-32 animate-in fade-in`}>
            {/* Header Profile Card */}
            <div className="bg-white p-8 rounded-b-[3.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] mb-8 pt-12 text-center border-b border-gray-50 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                 
                 <div className="relative w-28 h-28 mx-auto mb-5 group">
                    <div className="w-full h-full p-1.5 rounded-full bg-gradient-to-tr from-orange-300 to-pink-300 group-hover:rotate-6 transition duration-500">
                        <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full rounded-full object-cover border-4 border-white"/>
                    </div>
                    {user.accountType === 'premium' && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-2.5 rounded-full border-4 border-white shadow-md">
                            <Crown size={16} fill="currentColor"/>
                        </div>
                    )}
                 </div>
                 
                 <h2 className="text-2xl font-extrabold text-gray-800 flex items-center justify-center gap-2 mb-1">
                     {user.fullName}
                 </h2>
                 <p className="text-sm text-gray-400 font-medium font-mono mb-8">{user.phone}</p>
                 
                 <div className="flex justify-center gap-4">
                     <button onClick={() => setView('withdraw')} className={`${THEME.button} px-10 py-3.5 rounded-full font-bold text-xs shadow-lg`}>Withdraw</button>
                     <button onClick={() => setView('profile_settings')} className="px-10 py-3.5 rounded-full font-bold text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 transition border border-gray-100">Edit Profile</button>
                 </div>
            </div>

            <div className="px-6">
                {user.accountType === 'free' && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-6 text-white shadow-xl shadow-gray-300 mb-8 flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition duration-300" onClick={() => setView('premium')}>
                        <div className="flex items-center gap-5">
                            <div className="bg-amber-400/20 p-4 rounded-2xl text-amber-400 group-hover:rotate-12 transition"><Crown size={28} fill="currentColor"/></div>
                            <div>
                                <h4 className="font-extrabold text-base mb-0.5">Upgrade Premium</h4>
                                <p className="text-[11px] opacity-70 font-medium">Unlock 5% Referral Bonus & More</p>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full group-hover:bg-white/20 transition">
                            <ChevronRight size={20}/>
                        </div>
                    </div>
                )}

                <div className={`${THEME.primaryGradient} rounded-[2.5rem] p-6 text-white shadow-xl shadow-orange-200/50 mb-8 flex items-center justify-between cursor-pointer group hover:scale-[1.02] transition duration-300`} onClick={() => setView('ramadan')}>
                    <div className="flex items-center gap-5">
                        <div className="bg-white/20 p-4 rounded-2xl group-hover:rotate-12 transition"><Moon size={28}/></div>
                        <div>
                            <h4 className="font-extrabold text-base mb-0.5">Ramadan Offer</h4>
                            <p className="text-[11px] opacity-80 font-medium">Special gifts waiting for you</p>
                        </div>
                    </div>
                    <ArrowUpRight size={20} className="opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition"/>
                </div>

                <MenuSectionTitle title="Earnings & Finance" />
                <ProfileButton onClick={() => setView('all_history')} icon={FileText} label="Transaction History" color="text-indigo-500"/>
                <ProfileButton onClick={() => setView('joining_bonus')} icon={Gift} label="Claim Bonuses" color="text-orange-500" badge={hasUnclaimedBonus ? '1' : null}/>
                
                <MenuSectionTitle title="Community & Support" />
                <ProfileButton onClick={() => setView('team')} icon={Users} label="My Team" color="text-pink-500"/>
                <ProfileButton onClick={() => window.open(settings.workVideoLink || 'https://youtube.com', '_blank')} icon={PlayCircle} label="How to Work?" color="text-rose-500"/>
                <ProfileButton onClick={() => setView('about_us')} icon={Info} label="About Us" color="text-blue-500"/>
                
                <MenuSectionTitle title="Account Actions" />
                <ProfileButton onClick={() => setView('profile_settings')} icon={Settings} label="Settings" color="text-gray-600"/>
                
                <button onClick={onLogout} className="w-full bg-red-50 p-5 rounded-[1.5rem] flex items-center justify-between border border-red-50 text-red-500 mt-8 hover:bg-red-100 transition active:scale-[0.98]">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center"><LogOut size={22}/></div>
                        <span className="font-bold text-sm">Log Out</span>
                    </div>
                </button>
                
                <p className="text-center text-[10px] text-gray-300 mt-10 font-mono mb-4">App Version 2.5.0 (Build 2026)</p>
            </div>
        </div>
    );
};

// 8. Premium View (NEW)
const PremiumView = ({ user, setView, showPopup }: any) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [method, setMethod] = useState('bkash');
    const [sender, setSender] = useState('');
    const [trxId, setTrxId] = useState('');
    const [existingReq, setExistingReq] = useState<PremiumRequest | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const { data: s } = await supabase.from('app_settings').select('settings').single();
            if(s) setSettings({...defaultSettings, ...s.settings});

            const { data: r } = await supabase.from('premium_requests').select('*').eq('userId', user.id).eq('status', 'pending').maybeSingle();
            setExistingReq(r);
        };
        fetch();
    }, [user.id]);

    const handleSubmit = async () => {
        if (!sender || !trxId) return showPopup('warning', 'Fill all fields');
        if (sender.length < 11) return showPopup('warning', 'Invalid Phone Number');

        const request: PremiumRequest = {
            id: Date.now().toString(),
            userId: user.id,
            method,
            senderNumber: sender,
            trxId: trxId,
            amount: settings.premiumCost,
            status: 'pending',
            date: new Date().toISOString()
        };

        await supabase.from('premium_requests').insert([request]);
        setExistingReq(request);
        showPopup('success', 'Premium Request Submitted! Admin will review shortly.');
    };

    const FeatureItem = ({ text }: {text: string}) => (
        <li className="flex items-start gap-3 text-sm text-gray-300">
            <CheckCircle size={18} className="text-amber-400 mt-0.5 shrink-0"/>
            <span className="leading-relaxed">{text}</span>
        </li>
    );

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-5 pt-6 pb-24 animate-in slide-in-from-right`}>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('account')} className="p-3.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                <h1 className="text-xl font-bold text-gray-800">Upgrade Premium</h1>
            </div>

            <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 border border-amber-500/30">
                        <Crown size={32} fill="currentColor"/>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-2">Be a Pro User</h2>
                    <p className="text-gray-400 text-xs mb-8 font-medium">Unlock exclusive earning opportunities & faster support.</p>
                    
                    <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md mb-8 inline-flex items-center gap-5 border border-white/5">
                         <div>
                             <span className="text-3xl font-extrabold text-amber-400">৳{settings.premiumCost}</span>
                             <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Lifetime Access</span>
                         </div>
                         <div className="h-8 w-[1px] bg-white/20"></div>
                         <div className="text-xs text-gray-300 font-medium">One-time<br/>Payment</div>
                    </div>

                    <ul className="space-y-4 mb-4">
                        <FeatureItem text="Get 5% Commission on Referral Gmail Sells" />
                        <FeatureItem text="Priority Withdrawals (processed first)" />
                        <FeatureItem text="Exclusive Premium Badge on Profile" />
                        <FeatureItem text="Access to Special High-Paying Tasks" />
                    </ul>
                </div>
            </div>

            {!existingReq ? (
                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-7">
                     <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Payment Details</h3>
                     
                     <div className="flex gap-4">
                         {['bkash', 'nagad'].map(m => (
                             <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-5 rounded-2xl border text-xs font-bold capitalize transition-all ${method === m ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white'}`}>{m}</button>
                         ))}
                     </div>
                     
                     <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
                         <p className="text-[10px] text-gray-400 uppercase font-extrabold mb-2 tracking-widest">Send Money To</p>
                         <p className="font-mono font-bold text-gray-900 text-xl select-all tracking-wider">{method === 'bkash' ? settings.bkash : settings.nagad}</p>
                         <p className="text-[10px] text-orange-500 font-bold mt-2">Personal Number (Send Money)</p>
                     </div>
                     
                     <div className="space-y-5">
                        <input className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-amber-400 transition placeholder-gray-400" placeholder="Your Wallet Number" value={sender} onChange={e => setSender(e.target.value)}/>
                        <input className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-amber-400 transition placeholder-gray-400" placeholder="Transaction ID (TrxID)" value={trxId} onChange={e => setTrxId(e.target.value)}/>
                     </div>
                     
                     {/* THICKER BUTTON */}
                     <button onClick={handleSubmit} className={`${THEME.button} w-full py-5 rounded-2xl font-extrabold text-sm shadow-xl`}>Active Membership Now</button>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-[2.5rem] border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-5 py-2 rounded-bl-3xl text-[10px] font-extrabold uppercase tracking-wide">Pending Approval</div>
                    <h3 className="font-bold text-gray-800 mb-8 text-lg">Request Summary</h3>
                    
                    <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
                            <span className="text-xs font-mono font-bold text-gray-800">#{existingReq.id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">TrxID</span>
                            <span className="text-xs font-mono font-bold text-gray-800">{existingReq.trxId}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Method</span>
                            <span className="text-xs font-bold text-gray-800 uppercase bg-gray-100 px-2 py-1 rounded">{existingReq.method}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Time</span>
                            <span className="text-[10px] font-bold text-gray-800">{formatFullTime(existingReq.date)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount Paid</span>
                            <span className="text-xl font-extrabold text-amber-600">৳{existingReq.amount}</span>
                        </div>
                    </div>
                    <div className="mt-8 bg-amber-50 p-4 rounded-xl text-center">
                        <p className="text-xs text-amber-700 font-medium">Please wait while admin verifies your payment. Usually takes 10-30 minutes.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// 9. All History View (NEW)
const AllHistoryView = ({ user, setView }: any) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('transactions').select('*').eq('userId', user.id).order('date', { ascending: false });
            if(data) setTransactions(data);
        };
        fetch();
    }, [user.id]);

    const filtered = transactions.filter((t: Transaction) => {
        if (filter === 'all') return true;
        if (filter === 'income') return t.type === 'earning' || t.type === 'bonus';
        if (filter === 'withdraw') return t.type === 'withdraw';
        return true;
    });

    const EmptyState = () => (
        <div className="text-center py-24 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <FileText size={32}/>
            </div>
            <p className="text-gray-400 font-bold text-sm">No transactions found.</p>
        </div>
    );

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-5 pt-6 pb-24 animate-in fade-in`}>
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('account')} className="p-3.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                <h1 className="text-xl font-bold text-gray-800">Transaction History</h1>
             </div>

             <div className="flex gap-2.5 mb-8 overflow-x-auto scrollbar-hide pb-2">
                 {['all', 'income', 'withdraw'].map(f => (
                     <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition border ${filter === f ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-100'}`}>
                         {f}
                     </button>
                 ))}
             </div>

             <div className="space-y-4">
                 {filtered.length > 0 ? filtered.map((t, i) => (
                     <div key={i} className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-gray-50 flex items-center justify-between hover:border-orange-100 transition">
                         <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === 'withdraw' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                 {t.type === 'withdraw' ? <Wallet size={22}/> : <CreditCard size={22}/>}
                             </div>
                             <div>
                                 <p className="font-bold text-xs text-gray-800 capitalize mb-1">{t.category.replace('_', ' ')}</p>
                                 <p className="text-[10px] text-gray-400 font-medium">{formatFullTime(t.date)}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className={`font-extrabold text-sm mb-1 ${t.type === 'withdraw' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                 {t.type === 'withdraw' ? '-' : '+'}
                                 {t.type === 'withdraw' ? `৳${t.amount}` : `${t.amount}`}
                             </p>
                             <span className={`text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide ${t.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : t.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</span>
                         </div>
                     </div>
                 )) : <EmptyState />}
             </div>
        </div>
    );
};

// 10. Ramadan View
const RamadanView = ({ setView }: any) => {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('app_settings').select('settings').single();
            if(data) setSettings({...defaultSettings, ...data.settings});
        };
        fetch();
    }, []);

    return (
        <div className={`min-h-screen bg-[#0F172A] pb-24 px-5 pt-6 text-white relative overflow-hidden animate-in zoom-in duration-500`}>
             {/* Decorative Stars & Elements */}
             <div className="absolute top-10 right-10 text-yellow-500 animate-pulse"><Sparkles size={24}/></div>
             <div className="absolute bottom-40 left-10 text-yellow-500 animate-pulse delay-700"><Sparkles size={16}/></div>
             <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20"></div>
             
             <div className="flex items-center gap-4 mb-8 relative z-10">
                <button onClick={() => setView('dashboard')} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-xl font-bold">Ramadan Offer</h1>
             </div>

             <div className="flex flex-col items-center justify-center text-center mt-12 relative z-10">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-400 blur-[40px] opacity-30 rounded-full"></div>
                    <Moon size={100} className="text-yellow-400 fill-yellow-400 relative z-10 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-pulse"/>
                 </div>
                 
                 <h2 className="text-4xl font-extrabold mb-4 font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500">Ramadan Kareem</h2>
                 
                 <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 mb-10 w-full shadow-2xl">
                     <div className="text-sm text-gray-200 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: settings.ramadanOfferHtml || '<p>Special offers coming soon!</p>'}} />
                 </div>

                 <a href={settings.ramadanOfferLink} target="_blank" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:scale-105 transition transform flex items-center justify-center gap-2">
                     Claim Offer Now <ArrowUpRight size={18}/>
                 </a>
             </div>
             
             {/* Mosque Silhouette Visual */}
             <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-emerald-900/80 to-transparent pointer-events-none"></div>
        </div>
    );
};

// 11. Profile Settings View
const SettingsView = ({ user, setView, onUpdateUser, showPopup }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(user.fullName);
    const [password, setPassword] = useState(''); // Keep empty to not show current password
    
    const handleSave = async () => {
        if (!name) return showPopup('warning', 'Name cannot be empty');
        
        const updates: any = { fullName: name };
        if (password && password.length >= 6) {
            updates.password = password;
        } else if (password && password.length < 6) {
            return showPopup('warning', 'Password too short (min 6 chars)');
        }

        const updatedUser = { ...user, ...updates };
        
        // Optimistic
        onUpdateUser(updatedUser);
        
        // DB
        const { error } = await supabase.from('users').update(updates).eq('id', user.id);
        
        if (error) {
            showPopup('error', 'Update Failed. Check internet.');
        } else {
            showPopup('success', 'Profile Updated Successfully');
            setView('account');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => { 
                const base64 = reader.result as string;
                onUpdateUser({ ...user, profileImage: base64 }); 
                await supabase.from('users').update({ profileImage: base64 }).eq('id', user.id);
                showPopup('success', 'Profile Photo Updated!'); 
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-24 px-5 pt-6 animate-in slide-in-from-right`}>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView('account')} className="p-3.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={22}/></button>
                <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
            </div>

            <div className="space-y-8">
                 <div className="flex flex-col items-center">
                     <div className="w-28 h-28 relative mb-4 group">
                         <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full object-cover"/>
                         </div>
                         <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-gray-900 text-white rounded-full shadow-lg border-2 border-white hover:bg-orange-500 transition active:scale-95"><Camera size={18}/></button>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                     </div>
                     <p className="text-xs text-gray-400 font-medium">Tap icon to change photo</p>
                 </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                    <div>
                        <label className="text-xs font-extrabold text-gray-400 uppercase mb-2 block tracking-wider ml-1">Full Name</label>
                        <input className="w-full p-5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-sm" value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div>
                        <label className="text-xs font-extrabold text-gray-400 uppercase mb-2 block tracking-wider ml-1">Phone Number</label>
                        <div className="relative">
                            <input disabled className="w-full p-5 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500 outline-none text-sm cursor-not-allowed" value={user.phone}/>
                            <Lock size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1"><Info size={12}/> Phone number cannot be changed for security.</p>
                    </div>
                    <div>
                        <label className="text-xs font-extrabold text-gray-400 uppercase mb-2 block tracking-wider ml-1">New Password</label>
                        <input className="w-full p-5 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-900 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition text-sm placeholder-gray-300" placeholder="Leave empty to keep same" value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>

                    <button onClick={handleSave} className={`${THEME.button} w-full py-5 rounded-2xl font-extrabold text-base tracking-wide mt-4 shadow-xl`}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Panel Wrapper ---
export const UserPanel = ({ user, onLogout, onUpdateUser }: { user: UserData, onLogout: () => void, onUpdateUser: (u: UserData) => void }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [popup, setPopup] = useState<{isOpen: boolean, type: 'success' | 'error' | 'warning', message: string}>({ isOpen: false, type: 'success', message: '' });
  const [settings, setSettings] = useState(defaultSettings);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const showPopup = (type: 'success' | 'error' | 'warning', message: string) => { setPopup({ isOpen: true, type, message }); };

  useEffect(() => {
    const init = async () => {
        const { data: s } = await supabase.from('app_settings').select('settings').single();
        if(s) setSettings({...defaultSettings, ...s.settings});

        const { data: t } = await supabase.from('transactions').select('*').eq('userId', user.id);
        if(t) setTransactions(t);
    };
    init();

    // Set up realtime subscription for transactions
    const channel = supabase
    .channel('public:transactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `userId=eq.${user.id}` }, (payload) => {
        if(payload.eventType === 'INSERT') setTransactions(prev => [...prev, payload.new as Transaction]);
        if(payload.eventType === 'UPDATE') setTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t));
    })
    .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const renderContent = () => {
     switch(currentView) {
         case 'dashboard': return <HomeView user={user} setView={setCurrentView} settings={settings} onUpdateUser={onUpdateUser} transactions={transactions} />;
         case 'account': return <AccountView user={user} setView={setCurrentView} onLogout={onLogout} />;
         case 'tasks': return <TaskListView user={user} showPopup={showPopup} onUpdateUser={onUpdateUser} />;
         case 'team': return <TeamView user={user} />;
         case 'withdraw': return <WithdrawView user={user} setView={setCurrentView} showPopup={showPopup} onUpdateUser={onUpdateUser} />;
         case 'joining_bonus': return <JoiningBonusView user={user} setView={setCurrentView} onUpdateUser={onUpdateUser} showPopup={showPopup} />;
         case 'ramadan': return <RamadanView setView={setCurrentView} />;
         case 'profile_settings': return <SettingsView user={user} setView={setCurrentView} onUpdateUser={onUpdateUser} showPopup={showPopup} />;
         case 'premium': return <PremiumView user={user} setView={setCurrentView} showPopup={showPopup} />;
         case 'all_history': return <AllHistoryView user={user} setView={setCurrentView} />;
         case 'about_us': return (
             <div className={`min-h-screen ${THEME.bgMain} px-5 pt-6 pb-32`}>
                 <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setCurrentView('account')} className="p-3 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                    <h1 className="text-xl font-bold text-gray-800">About Us</h1>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-sm text-gray-600 leading-relaxed shadow-sm" dangerouslySetInnerHTML={{ __html: settings.aboutText }} />
             </div>
         );
         default: return <HomeView user={user} setView={setCurrentView} settings={settings} onUpdateUser={onUpdateUser} transactions={transactions} />;
     }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl overflow-hidden font-sans border-x border-gray-50">
      {renderContent()}
      <FloatingSupport link={settings.telegramChannelLink} />
      <BottomNav currentView={currentView} setView={setCurrentView} />
      <CustomPopup isOpen={popup.isOpen} type={popup.type} message={popup.message} onClose={() => setPopup({ ...popup, isOpen: false })} />
    </div>
  );
};
