
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

// --- GLOBAL STYLES & THEME (Updated for Slim Native App Feel) ---
const THEME = {
    primaryGradient: 'bg-gradient-to-r from-orange-500 to-rose-500', 
    bgMain: 'bg-[#F8F9FA]', // Slightly darker white for contrast
    card: 'bg-white rounded-2xl shadow-sm border border-gray-100', // Reduced rounding
    textHighlight: 'text-orange-600',
    // Slimmer button style
    button: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all duration-300 py-3 rounded-xl font-bold text-sm'
};

const INPUT_STYLE = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition text-sm placeholder-gray-400";

// --- Helper Components ---

const CustomPopup = ({ isOpen, type, message, onClose }: { isOpen: boolean, type: 'success' | 'error' | 'warning', message: string, onClose: () => void }) => {
    if (!isOpen) return null;
    const icons = {
        success: <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />,
        error: <XCircle size={40} className="text-rose-500 mx-auto mb-3" />,
        warning: <AlertTriangle size={40} className="text-amber-500 mx-auto mb-3" />
    };
    const titles = { success: 'Success', error: 'Failed', warning: 'Notice' };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center transform transition-all scale-100 animate-in zoom-in-95 relative overflow-hidden">
                <div className="mt-2">{icons[type]}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{titles[type]}</h3>
                <p className="text-gray-500 mb-6 text-xs font-medium leading-relaxed">{message}</p>
                <button onClick={onClose} className={`w-full py-3 rounded-xl font-bold text-xs text-white ${THEME.primaryGradient} shadow-md active:scale-95`}>
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
            className="fixed bottom-20 right-4 z-40 bg-[#0088cc] text-white p-3.5 rounded-full shadow-lg shadow-blue-400/40 hover:scale-110 transition-transform active:scale-90 flex items-center justify-center group"
        >
            <Send size={20} className="-ml-0.5 mt-0.5" />
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
        <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 mt-2 cursor-pointer hover:bg-gray-100 transition active:scale-[0.99]" onClick={copy}>
            <span className="font-mono text-xs font-bold text-gray-700">@{handle}</span>
            <button className="text-[10px] font-bold text-white bg-gray-900 px-2 py-1 rounded-lg">
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
          className={`flex flex-col items-center justify-center gap-1 transition-all w-16 relative py-2 ${isActive ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <div className={`relative transition-transform duration-300`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          {isActive && <div className="w-1 h-1 bg-orange-600 rounded-full mt-0.5"></div>}
        </button>
      );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-2 pt-1 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] flex justify-between items-center max-w-md mx-auto">
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
          const { data } = await supabase.from('users').select('*').order('balanceFree', { ascending: false }).limit(10);
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
    <div className={`pb-24 animate-in fade-in ${THEME.bgMain} min-h-screen font-sans`}>
      
      {/* Ramadan Special Banner - Compact */}
      <div 
        onClick={() => setView('ramadan')}
        className="mx-4 mt-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white text-center py-2.5 px-4 cursor-pointer relative overflow-hidden shadow-md shadow-emerald-600/20 transform transition active:scale-95 flex items-center justify-between"
      >
          <div className="flex items-center gap-2">
             <Moon size={14} className="text-yellow-300 fill-yellow-300"/>
             <span className="text-[10px] font-bold tracking-widest uppercase">RAMADAN OFFER</span>
          </div>
          <ChevronRight size={14} className="opacity-80"/>
      </div>

      <div className="px-4 pt-4">
        {/* Header Section - Slimmer */}
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
                <div onClick={() => setView('account')} className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-orange-400 to-pink-500 cursor-pointer shadow-sm active:scale-95 transition">
                    <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full object-cover rounded-full border border-white"/>
                </div>
                <div>
                    <h1 className="text-base font-bold text-gray-900 leading-none mb-0.5">Hi, {user.fullName.split(' ')[0]}</h1>
                    <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${user.accountType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-white border border-gray-200 text-gray-500'}`}>
                            {user.accountType === 'premium' ? <Crown size={8} fill="currentColor"/> : <User size={8}/>}
                            {user.accountType === 'premium' ? 'PRO' : 'Basic'}
                        </span>
                    </div>
                </div>
            </div>
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 hover:text-orange-500 transition active:scale-90">
                <Bell size={18}/>
            </button>
        </div>
        
        {/* Main Balance Card - Compact */}
        <div className={`${THEME.primaryGradient} rounded-2xl p-5 shadow-lg shadow-orange-500/20 mb-6 relative overflow-hidden text-white`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full pointer-events-none mix-blend-overlay"></div>
            
            <div className="relative z-10 text-center">
                <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-90">Total Balance</p>
                <h1 className="text-4xl font-extrabold flex items-center justify-center gap-1 mb-2 tracking-tighter leading-none">
                    <span className="text-xl opacity-80 mt-1 font-serif">৳</span>
                    {((user.balanceFree || 0) / 1000).toFixed(2)} 
                </h1>
                
                <div className="inline-flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full mb-4 backdrop-blur-sm border border-white/10">
                    <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow]"></div>
                    <p className="text-[10px] font-bold text-white tracking-wide">{(user.balanceFree || 0).toLocaleString()} Coins</p>
                </div>
                
                <div className="flex justify-center gap-4 border-t border-white/20 pt-3">
                    <div className="text-center w-1/2">
                        <p className="text-[9px] text-orange-50 font-bold uppercase tracking-wider mb-0.5">Today's Earn</p>
                        <p className="font-bold text-sm">৳{todaysIncome}</p>
                    </div>
                    <div className="w-[1px] bg-white/20 h-8"></div>
                    <div className="text-center w-1/2">
                        <p className="text-[9px] text-orange-50 font-bold uppercase tracking-wider mb-0.5">Active Time</p>
                        <p className="font-bold text-sm font-mono tracking-tight">{activeTimeDisplay || "00:00"}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Telegram Action Banner - Slimmer */}
        <a 
            href={settings.telegramChannelLink} 
            target="_blank" 
            className="flex items-center justify-between bg-[#2AABEE] text-white p-3.5 rounded-xl shadow-md shadow-blue-400/20 mb-5 hover:brightness-110 transition active:scale-[0.98] group relative overflow-hidden"
        >
            <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Send size={18} className="ml-0.5 text-white"/></div>
                <div>
                    <h3 className="font-bold text-sm leading-none">Join Telegram</h3>
                    <p className="text-[10px] text-blue-100 font-medium opacity-90 mt-0.5">Payment proofs & updates</p>
                </div>
            </div>
            <ArrowUpRight size={18} className="text-white opacity-80"/>
        </a>

        {/* Invite & Earn Banner - Compact */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600"><Gift size={16}/></div>
                    <h3 className="font-bold text-gray-800 text-xs">Refer & Earn</h3>
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">+{settings.premiumUpgradeBonus || 50} Coins</span>
            </div>
            <button onClick={() => navigator.clipboard.writeText(inviteLink)} className={`${THEME.primaryGradient} w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98]`}>
                <Copy size={14}/> Copy Invite Link
            </button>
        </div>

        {/* Daily Rewards Grid - Smaller */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5"><Clock size={14} className="text-orange-500"/> Daily Check-in</h3>
                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">Reset: 12 AM</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map((d) => (
                <div key={d} className={`rounded-xl py-2.5 flex flex-col items-center justify-center shadow-sm border transition-all active:scale-95 cursor-pointer group ${d <= 1 ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300 hover:border-orange-200'}`}>
                    {d <= 1 ? <CheckCircle size={16} className="mb-1 text-white"/> : <Lock size={16} className="mb-1"/>}
                    <span className="text-[9px] font-bold tracking-wide">Day {d}</span>
                </div>
                ))}
            </div>
        </div>

        {/* Leaderboard Section - Compact List */}
        <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-3 px-1">
                <Trophy size={14} className="text-orange-500"/>
                <h3 className="font-bold text-gray-800 text-xs">Top Earners</h3>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-3 space-y-2">
                {leaderboard.map((u, idx) => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-[10px] ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {idx + 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <img src={u.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-8 h-8 rounded-full object-cover border border-gray-100"/>
                                <div>
                                    <p className="font-bold text-xs text-gray-800 leading-tight">{u.fullName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-orange-600">{(u.balanceFree || 0).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// 3. Withdraw View
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

        const updatedUser = { ...user, balanceFree: (user.balanceFree || 0) - withdrawAmountCoins };
        onUpdateUser(updatedUser);

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
            showPopup('error', 'Failed to submit request.');
        } else {
            await supabase.from('users').update({ balanceFree: updatedUser.balanceFree }).eq('id', user.id);
            showPopup('success', 'Request Submitted!');
            setAmount('');
            setNumber('');
        }
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-20 px-4 pt-4 animate-in slide-in-from-right`}>
             <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold text-gray-800">Withdraw</h1>
             </div>

             <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg mb-6 text-center relative overflow-hidden">
                 <div className="relative z-10">
                     <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Available</p>
                     <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2 mb-1">
                         ৳ {((user.balanceFree || 0) / 1000).toFixed(2)}
                     </h1>
                     <div className="inline-block bg-white/10 px-3 py-0.5 rounded-md backdrop-blur-md">
                        <p className="text-[9px] font-bold text-gray-300">1000 Coins = 1 Taka</p>
                     </div>
                 </div>
             </div>

             <h3 className="font-bold text-gray-800 mb-3 text-xs px-1">Select Amount</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                 {presetAmounts.map((preset:any, idx:number) => (
                     <button 
                        key={idx}
                        onClick={() => setAmount(preset.tk.toString())}
                        className={`p-3 rounded-xl border text-center transition-all duration-200 group ${amount === preset.tk.toString() ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200 shadow-sm' : 'bg-white border-gray-100 hover:border-orange-100'}`}
                     >
                         <h4 className={`text-lg font-extrabold mb-0.5 ${amount === preset.tk.toString() ? 'text-orange-600' : 'text-gray-800'}`}>৳{preset.tk}</h4>
                         <p className="text-[10px] text-gray-400 font-bold">{preset.coins} Coins</p>
                     </button>
                 ))}
             </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 mb-4">
                 <div>
                     <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-2 ml-1">Payment Method</label>
                     <div className="flex gap-3">
                         {['bkash', 'nagad'].map(m => (
                             <button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${method === m ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-white'}`}>
                                 {m}
                             </button>
                         ))}
                     </div>
                 </div>
                 <div>
                     <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-2 ml-1">Wallet Number</label>
                     <input type="number" className={INPUT_STYLE} placeholder="017xxxxxxxx" value={number} onChange={e => setNumber(e.target.value)}/>
                 </div>
                 <div>
                     <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-2 ml-1">Amount</label>
                     <input type="number" className={INPUT_STYLE} placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)}/>
                 </div>

                 <button onClick={handleWithdraw} className={`${THEME.button} w-full mt-2`}>
                     Confirm Withdraw
                 </button>
             </div>
        </div>
    );
};

// 4. Task List View
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
        if (!trx) return true;
        if (trx.status === 'rejected') return true; 
        return false; 
    });

    const gmailCoinRate = user.accountType === 'premium' ? (settings.gmailRatePremium || 13000) : (settings.gmailRateFree || 12000);
    const gmailTkRate = gmailCoinRate / 1000;

    const handleLinkSubmit = async () => {
         if (!proofLink.startsWith('http')) return showPopup('warning', 'Link must start with http/https.');
         
         const { error } = await supabase.from('transactions').insert([{
             id: Date.now().toString(),
             userId: user.id,
             type: 'earning',
             category: 'task',
             amount: selectedTask.reward,
             status: 'pending',
             date: new Date().toISOString(),
             details: `Task: ${selectedTask.title}`,
             proofUrl: proofLink + (proofNote ? ` | Note: ${proofNote}` : ''),
             taskId: selectedTask.id
         }]);
         
         if (error) {
             showPopup('error', 'Submission Failed.');
         } else {
             showPopup('success', 'Submitted! Wait for approval.');
             setViewMode('list');
             setProofLink('');
             setProofNote('');
             setMyTrxs([...myTrxs, { category: 'task', details: selectedTask.title, status: 'pending' } as any]);
         }
    };

    const handleGmailRequest = async () => {
        const newReq = { id: Date.now().toString(), userId: user.id, status: 'requested', date: new Date().toISOString() };
        const { error } = await supabase.from('gmail_requests').insert([newReq]);
        if(!error) {
            setGmailReq(newReq as any);
            showPopup('success', 'Requested! Wait for credentials.');
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
                id: Date.now().toString(), userId: user.id, type: 'earning', category: 'sell', amount: gmailCoinRate, status: 'pending', date: new Date().toISOString(), details: `Gmail Sell: ${fullEmail}` 
            }]);
            showPopup('success', 'Submitted!');
        } else {
            showPopup('error', 'Failed');
        }
    };

    const handleRequestRecovery = async () => {
        if(!gmailReq) return;
        await supabase.from('gmail_requests').update({ status: 'recovery_requested' }).eq('id', gmailReq.id);
        setGmailReq({...gmailReq, status: 'recovery_requested'});
    };

    const CopyField = ({label, value}: {label: string, value: string}) => (
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
            <div className="overflow-hidden">
                <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5 tracking-wider">{label}</p>
                <p className="font-bold text-gray-800 text-xs truncate select-all">{value}</p>
            </div>
            <button onClick={() => {navigator.clipboard.writeText(value); showPopup('success', 'Copied!');}} className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-indigo-600 active:scale-95 transition shrink-0 border border-gray-100"><Copy size={16}/></button>
        </div>
    );

    if (viewMode === 'detail' && selectedTask) {
         return (
             <div className={`pb-20 ${THEME.bgMain} min-h-screen px-4 pt-4 animate-in slide-in-from-right`}>
                 <div className="flex items-center gap-3 mb-6">
                     <button onClick={() => setViewMode('list')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                     <h1 className="text-lg font-bold text-gray-800">Task Details</h1>
                 </div>
                 
                 <div className="bg-white rounded-2xl p-6 text-center mb-6 shadow-sm border border-gray-100">
                     {selectedTask.image && <img src={selectedTask.image} className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover shadow-sm"/>}
                     <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTask.title}</h2>
                     <span className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full mt-2 inline-block">+{selectedTask.reward} Coins</span>
                 </div>

                 <div className="bg-white p-5 rounded-2xl border border-gray-100 mb-6">
                     <h4 className="text-[10px] font-extrabold text-gray-400 uppercase mb-3 flex items-center gap-2"><Info size={14}/> Instructions</h4>
                     <div className="text-sm text-gray-600 leading-6 whitespace-pre-line">{selectedTask.desc}</div>
                 </div>
                 
                 <a href={selectedTask.link} target="_blank" className="block w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-center text-sm mb-6 shadow-md flex items-center justify-center gap-2 hover:bg-black transition active:scale-[0.99]">
                    Go to Link <ExternalLink size={16}/>
                 </a>
                 
                 {selectedTask.type === 'submit' && (
                     <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm relative">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">Submit Proof</h4>
                        
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Screenshot Link</label>
                            <div className="flex gap-2">
                                <input className={INPUT_STYLE} placeholder="Image Link" value={proofLink} onChange={e => setProofLink(e.target.value)}/>
                                <button onClick={() => window.open(settings.imageUploadSiteLink || 'https://imgbb.com', '_blank')} className="bg-orange-50 text-orange-600 w-12 rounded-xl border border-orange-100 flex items-center justify-center shadow-sm" title="Upload"><UploadCloud size={20}/></button>
                            </div>
                        </div>
                        <button onClick={handleLinkSubmit} className={`${THEME.button} w-full`}>Submit Proof</button>
                     </div>
                 )}
             </div>
         );
    }

    return (
        <div className={`pb-24 ${THEME.bgMain} min-h-screen px-4 pt-4 animate-in fade-in`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-extrabold text-gray-800">Earn</h1>
                <div className="bg-white px-2.5 py-0.5 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 shadow-sm">
                    {availableTasks.length} Available
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setActiveTab('tasks')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${activeTab === 'tasks' ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>
                    <ListTodo size={24} className="mb-0.5"/>
                    <span className="font-bold text-xs">Micro Tasks</span>
                </button>
                <button onClick={() => setActiveTab('gmail')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${activeTab === 'gmail' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>
                    <Mail size={24} className="mb-0.5"/>
                    <span className="font-bold text-xs">Gmail Farm</span>
                </button>
            </div>
            
            {activeTab === 'gmail' ? (
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                        <AlertTriangle size={20} className="text-red-500 shrink-0"/>
                        <div>
                            <p className="text-[10px] text-red-600 mb-2 font-medium leading-relaxed">
                                You MUST contact Admin before creating any Gmail. Creating wrong accounts will result in a ban.
                            </p>
                            <a href={settings.adminContactLink} target="_blank" className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold inline-block shadow-sm">Contact Admin</a>
                        </div>
                    </div>

                    <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-200 mb-2 relative overflow-hidden">
                        <h2 className="text-xl font-bold mb-0.5">Sell Gmail</h2>
                        <p className="text-indigo-100 text-xs mb-3">Create fresh accounts & earn.</p>
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md inline-block">
                            <p className="font-bold text-yellow-300 text-sm">৳{gmailTkRate} <span className="text-[10px] text-white opacity-80">({gmailCoinRate} Coins)</span></p>
                        </div>
                    </div>

                    {!gmailReq ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500 text-xs mb-4">Request a new job to get credentials.</p>
                            <button onClick={handleGmailRequest} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md text-xs">Request New Job</button>
                        </div>
                    ) : (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md tracking-wide ${gmailReq.status === 'requested' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>{gmailReq.status.replace('_', ' ')}</span>
                                </div>
                                
                                {gmailReq.status === 'credentials_sent' || gmailReq.status === 'recovery_requested' || gmailReq.status === 'recovery_sent' ? (
                                    <div className="space-y-4">
                                        <CopyField label="First Name" value={gmailReq.adminProvidedFirstName || 'N/A'} />
                                        <CopyField label="Last Name" value={gmailReq.adminProvidedLastName || 'N/A'} />
                                        <CopyField label="Password" value={gmailReq.adminProvidedPassword || 'N/A'} />
                                        
                                        {gmailReq.userCreatedEmail && <div className="space-y-1"><p className="text-[9px] text-gray-400 uppercase font-bold pl-1">Target</p><GmailHandleCopy handle={gmailReq.userCreatedEmail.replace('@gmail.com','')} /></div>}

                                        {gmailReq.adminProvidedRecoveryEmail && (
                                            <div className="mt-4 pt-3 border-t border-gray-50">
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Add Recovery</p>
                                                <CopyField label="Recovery Email" value={gmailReq.adminProvidedRecoveryEmail} />
                                            </div>
                                        )}

                                        {gmailReq.status !== 'recovery_sent' ? (
                                            <button onClick={handleRequestRecovery} className="w-full bg-amber-50 text-amber-600 border border-amber-100 py-3 rounded-xl font-bold text-xs mt-2">I created it, Get Recovery</button>
                                        ) : (
                                            <div className="pt-3 border-t border-gray-50 mt-2">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <input className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold outline-none" placeholder="Confirm username" value={gmailUserEmail.replace('@gmail.com', '')} onChange={e => setGmailUserEmail(e.target.value)}/>
                                                    <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-500">@gmail.com</div>
                                                </div>
                                                <button onClick={handleGmailSubmit} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs shadow-md">Submit for Payment</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Loader2 className="animate-spin text-indigo-500 mx-auto mb-3" size={24}/>
                                        <p className="text-xs text-gray-500">Waiting for admin...</p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {availableTasks.map((task: any) => (
                        <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.99] transition cursor-pointer" onClick={() => { setSelectedTask(task); setViewMode('detail'); }}>
                            <div className="flex items-center gap-4">
                                {task.image ? (
                                    <img src={task.image} className="w-12 h-12 rounded-xl object-cover bg-gray-50" />
                                ) : (
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                        {task.type === 'watch' ? <PlayCircle size={24}/> : <CheckSquare size={24}/>}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{task.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">+{task.reward} Coins</span>
                                        <span className="text-[9px] text-gray-400 capitalize">{task.type}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300"/>
                        </div>
                    ))}
                    {availableTasks.length === 0 && <div className="text-center py-12 text-gray-400 text-xs">No tasks available.</div>}
                </div>
            )}
        </div>
    );
};

// 5. Joining Bonus View
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
            id: Date.now().toString(), userId: user.id, type: 'earning', category: 'joining_bonus', amount: bonus, status: 'approved', date: new Date().toISOString(), details: 'Joining Bonus Claimed' 
        }]);
        showPopup('success', `+${bonus} Coins Added!`);
    };

    const handleClaimReferralBonus = async (refUser: UserData) => {
        const w = window.open('https://google.com', '_blank');
        setTimeout(async () => {
             const bonus = settings.referralBonusAmount || 50;
             onUpdateUser({ ...user, balanceFree: (user.balanceFree || 0) + bonus });
             await supabase.from('transactions').insert([{
                 id: Date.now().toString(), userId: user.id, type: 'earning', category: 'referral_bonus', amount: bonus, status: 'approved', date: new Date().toISOString(), details: `Bonus from ${refUser.fullName}`, referralUserId: refUser.id
             }]);
             showPopup('success', `+${bonus} Bonus Claimed!`);
             const { data: trx } = await supabase.from('transactions').select('*').eq('userId', user.id);
             if(trx) setMyTrxs(trx);
        }, 3000);
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-4 pt-4 pb-20`}>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold text-gray-800">Bonuses</h1>
            </div>

            <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl w-full shadow-sm border border-gray-100">
                <button onClick={() => setViewTab('join')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${viewTab === 'join' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'}`}>Joining</button>
                <button onClick={() => setViewTab('my_referrals')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${viewTab === 'my_referrals' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'}`}>Referrals</button>
                <button onClick={() => setViewTab('history')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${viewTab === 'history' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500'}`}>History</button>
            </div>

            {viewTab === 'join' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50 text-center h-[50vh] flex flex-col justify-center">
                    {user.joiningBonusClaimed ? (
                        <div className="animate-in zoom-in duration-500">
                            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Bonus Claimed!</h2>
                            <p className="text-xs text-gray-500">You already received your joining bonus.</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            <Gift size={40} className="text-orange-500 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Welcome Gift</h2>
                            <p className="text-gray-500 text-xs mb-6 px-4">Enter a referral code to get <span className="font-bold text-orange-500">{settings.joiningBonusAmount} coins</span>.</p>

                            {!referrer ? (
                                <div className="space-y-4">
                                    <input className={INPUT_STYLE + " text-center tracking-widest uppercase"} placeholder="ENTER CODE" value={refInput} onChange={e => setRefInput(e.target.value)}/>
                                    <button onClick={handleVerify} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-xs shadow-md">Verify Code</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-orange-50 p-3 rounded-xl flex items-center gap-3 border border-orange-100">
                                        <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700 text-xs">{referrer.fullName.charAt(0)}</div>
                                        <div className="text-left"><p className="text-[9px] text-orange-400 font-bold uppercase">Referrer</p><p className="font-bold text-gray-900 text-sm">{referrer.fullName}</p></div>
                                    </div>
                                    {step === 1 && <button onClick={()=>{setStep(2); setTimer(10); window.open('https://google.com');}} className={`${THEME.button} w-full`}>Watch Ad to Unlock</button>}
                                    {step === 2 && <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16}/> Wait {timer}s...</button>}
                                    {step === 3 && <button onClick={handleClaimJoining} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-md">Claim Bonus</button>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {viewTab === 'my_referrals' && (
                <div className="space-y-3 animate-in fade-in">
                    {myReferrals.map((ref: UserData) => {
                        const hasClaimed = myTrxs.some((t: Transaction) => t.category === 'referral_bonus' && t.referralUserId === ref.id);
                        const canClaim = ref.joiningBonusClaimed && !hasClaimed;
                        return (
                            <div key={ref.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">{ref.fullName.charAt(0)}</div>
                                    <div><p className="font-bold text-xs text-gray-800">{ref.fullName}</p></div>
                                </div>
                                {hasClaimed ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Received</span> : canClaim ? <button onClick={() => handleClaimReferralBonus(ref)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold">Claim +{settings.referralBonusAmount}</button> : <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">Pending</span>}
                            </div>
                        );
                    })}
                    {myReferrals.length === 0 && <div className="text-center py-12 text-gray-400 text-xs">No referrals yet.</div>}
                </div>
            )}

            {viewTab === 'history' && (
                <div className="space-y-2 animate-in fade-in">
                    {bonusHistory.map((t, i) => (
                        <div key={i} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Gift size={16}/></div>
                                <div><p className="font-bold text-xs text-gray-800 capitalize">{t.category.replace('_', ' ')}</p><p className="text-[9px] text-gray-400">{formatFullTime(t.date)}</p></div>
                            </div>
                            <p className="font-bold text-xs text-emerald-600">+{t.amount}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 6. Team View
const TeamView = ({ user }: any) => {
    const [referrals, setReferrals] = useState<UserData[]>([]);
    const [totalCommission, setTotalCommission] = useState(0);

    useEffect(() => {
        const fetchTeamData = async () => {
            const { data: refs } = await supabase.from('users').select('*').eq('uplineRefCode', user.refCode);
            if(refs) setReferrals(refs);
            const { data: trxs } = await supabase.from('transactions').select('*').eq('userId', user.id);
            if(trxs) {
                const total = trxs.filter(t => t.category === 'referral_bonus' || t.category === 'referral_commission').reduce((sum, t) => sum + t.amount, 0);
                setTotalCommission(total);
            }
        };
        fetchTeamData();
    }, [user.refCode, user.id]);

    return (
        <div className={`pb-24 ${THEME.bgMain} min-h-screen px-4 pt-4 animate-in fade-in`}>
             <h1 className="text-xl font-extrabold text-gray-800 mb-6">My Team</h1>
             
             <div className={`${THEME.primaryGradient} rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 mb-6 relative overflow-hidden`}>
                 <div className="relative z-10 text-center">
                     <p className="text-orange-100 text-[9px] font-bold uppercase tracking-widest mb-2 opacity-80">Team Overview</p>
                     <div className="flex justify-center gap-8">
                         <div className="text-center"><h2 className="text-3xl font-extrabold mb-0.5">{referrals.length}</h2><p className="text-[9px] text-orange-100 font-medium">Members</p></div>
                         <div className="w-[1px] bg-white/20 h-10 mt-1"></div>
                         <div className="text-center"><h2 className="text-3xl font-extrabold mb-0.5">{totalCommission}</h2><p className="text-[9px] text-orange-100 font-medium">Coins Earned</p></div>
                     </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                 <button onClick={() => navigator.clipboard.writeText(user.refCode)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center gap-1 active:scale-95 transition">
                     <Copy size={20} className="text-orange-500 mb-1"/>
                     <span className="font-bold text-xs text-gray-700">Copy Code</span>
                 </button>
                 <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.refCode}`)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center gap-1 active:scale-95 transition">
                     <Share2 size={20} className="text-pink-500 mb-1"/>
                     <span className="font-bold text-xs text-gray-700">Copy Link</span>
                 </button>
             </div>

             <h3 className="font-bold text-gray-800 text-xs mb-3 px-1">Friends List</h3>
             <div className="space-y-3">
                 {referrals.map((ref: UserData) => (
                    <div key={ref.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs">{ref.fullName.charAt(0)}</div>
                            <div>
                                <p className="font-bold text-xs text-gray-800 mb-0.5">{ref.fullName}</p>
                                <div className="flex items-center gap-2">
                                    {ref.accountType === 'premium' && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded">PRO</span>}
                                    <span className="text-[9px] text-gray-400">Bal: {ref.balanceFree?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 ))}
                 {referrals.length === 0 && <div className="text-center py-12 text-gray-400 text-xs">No referrals yet.</div>}
             </div>
        </div>
    );
};

// 7. Account View (Profile Main - Slimmer)
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
            className="w-full bg-white p-3.5 rounded-xl flex items-center justify-between border border-gray-50 mb-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition hover:border-orange-100 group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color} bg-gray-50`}>
                    <Icon size={18} />
                </div>
                <span className="font-bold text-xs text-gray-800">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {badge && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-md">{badge}</span>}
                <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-400 transition" />
            </div>
        </button>
    );

    const MenuSectionTitle = ({ title }: { title: string }) => (
        <h4 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1 mt-6 opacity-70">{title}</h4>
    );

    const hasUnclaimedBonus = !user.joiningBonusClaimed;

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-24 animate-in fade-in`}>
            {/* Header Profile Card - Smaller */}
            <div className="bg-white p-6 rounded-b-3xl shadow-sm mb-6 pt-8 text-center border-b border-gray-50">
                 <div className="relative w-20 h-20 mx-auto mb-3">
                    <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full rounded-full object-cover border-2 border-orange-100"/>
                    {user.accountType === 'premium' && <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1.5 rounded-full border-2 border-white"><Crown size={12} fill="currentColor"/></div>}
                 </div>
                 
                 <h2 className="text-lg font-extrabold text-gray-800 mb-0.5">{user.fullName}</h2>
                 <p className="text-xs text-gray-400 font-medium font-mono mb-5">{user.phone}</p>
                 
                 <div className="flex justify-center gap-3">
                     <button onClick={() => setView('withdraw')} className={`${THEME.button} px-8 py-2.5 rounded-full text-xs shadow-md`}>Withdraw</button>
                     <button onClick={() => setView('profile_settings')} className="px-8 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-600 border border-gray-100">Edit Profile</button>
                 </div>
            </div>

            <div className="px-4">
                {user.accountType === 'free' && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-md mb-6 flex items-center justify-between cursor-pointer active:scale-95 transition" onClick={() => setView('premium')}>
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-400/20 p-2.5 rounded-xl text-amber-400"><Crown size={20} fill="currentColor"/></div>
                            <div><h4 className="font-bold text-sm mb-0.5">Upgrade Premium</h4><p className="text-[10px] opacity-70 font-medium">Unlock 5% Bonus & More</p></div>
                        </div>
                        <ChevronRight size={16} className="opacity-50"/>
                    </div>
                )}

                <div className={`${THEME.primaryGradient} rounded-2xl p-4 text-white shadow-md mb-6 flex items-center justify-between cursor-pointer active:scale-95 transition`} onClick={() => setView('ramadan')}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2.5 rounded-xl"><Moon size={20}/></div>
                        <div><h4 className="font-bold text-sm mb-0.5">Ramadan Offer</h4><p className="text-[10px] opacity-80 font-medium">Special gifts waiting</p></div>
                    </div>
                    <ArrowUpRight size={16} className="opacity-80"/>
                </div>

                <MenuSectionTitle title="Earnings & Finance" />
                <ProfileButton onClick={() => setView('all_history')} icon={FileText} label="History" color="text-indigo-500"/>
                <ProfileButton onClick={() => setView('joining_bonus')} icon={Gift} label="Claim Bonuses" color="text-orange-500" badge={hasUnclaimedBonus ? '1' : null}/>
                
                <MenuSectionTitle title="Community & Support" />
                <ProfileButton onClick={() => setView('team')} icon={Users} label="My Team" color="text-pink-500"/>
                <ProfileButton onClick={() => window.open(settings.workVideoLink || 'https://youtube.com', '_blank')} icon={PlayCircle} label="How to Work?" color="text-rose-500"/>
                <ProfileButton onClick={() => setView('about_us')} icon={Info} label="About Us" color="text-blue-500"/>
                
                <MenuSectionTitle title="Account" />
                <ProfileButton onClick={() => setView('profile_settings')} icon={Settings} label="Settings" color="text-gray-600"/>
                
                <button onClick={onLogout} className="w-full bg-red-50 p-3.5 rounded-xl flex items-center justify-between border border-red-50 text-red-500 mt-6 active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center"><LogOut size={18}/></div>
                        <span className="font-bold text-xs">Log Out</span>
                    </div>
                </button>
                
                <p className="text-center text-[9px] text-gray-300 mt-8 mb-2">v2.5.0</p>
            </div>
        </div>
    );
};

// 8. Premium View
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
        const request: PremiumRequest = { id: Date.now().toString(), userId: user.id, method, senderNumber: sender, trxId: trxId, amount: settings.premiumCost, status: 'pending', date: new Date().toISOString() };
        await supabase.from('premium_requests').insert([request]);
        setExistingReq(request);
        showPopup('success', 'Submitted! Reviewing...');
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-4 pt-4 pb-20 animate-in slide-in-from-right`}>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold text-gray-800">Premium</h1>
            </div>

            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden mb-6">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-4 border border-amber-500/30"><Crown size={24} fill="currentColor"/></div>
                    <h2 className="text-2xl font-extrabold mb-1">Be a Pro</h2>
                    <p className="text-gray-400 text-xs mb-4">Unlock exclusive earning opportunities.</p>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md mb-4 inline-flex items-center gap-3 border border-white/5">
                         <div><span className="text-xl font-extrabold text-amber-400">৳{settings.premiumCost}</span><span className="text-[9px] text-gray-400 block font-bold uppercase">Lifetime</span></div>
                    </div>
                    <ul className="space-y-2 text-xs text-gray-300">
                        <li className="flex gap-2"><CheckCircle size={14} className="text-amber-400"/> 5% Referral Commission</li>
                        <li className="flex gap-2"><CheckCircle size={14} className="text-amber-400"/> Priority Withdrawals</li>
                        <li className="flex gap-2"><CheckCircle size={14} className="text-amber-400"/> Premium Badge</li>
                    </ul>
                </div>
            </div>

            {!existingReq ? (
                <div className="bg-white p-5 rounded-2xl border border-orange-50 shadow-sm space-y-4">
                     <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Payment Details</h3>
                     <div className="flex gap-3">
                         {['bkash', 'nagad'].map(m => (<button key={m} onClick={() => setMethod(m)} className={`flex-1 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${method === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>{m}</button>))}
                     </div>
                     <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                         <p className="text-[9px] text-gray-400 uppercase font-extrabold mb-1">Send Money To</p>
                         <p className="font-mono font-bold text-gray-900 text-base select-all">{method === 'bkash' ? settings.bkash : settings.nagad}</p>
                     </div>
                     <div className="space-y-3">
                        <input className={INPUT_STYLE} placeholder="Your Wallet Number" value={sender} onChange={e => setSender(e.target.value)}/>
                        <input className={INPUT_STYLE} placeholder="Transaction ID (TrxID)" value={trxId} onChange={e => setTrxId(e.target.value)}/>
                     </div>
                     <button onClick={handleSubmit} className={`${THEME.button} w-full`}>Active Now</button>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm text-center">
                    <p className="text-amber-600 font-bold text-sm mb-2">Request Pending</p>
                    <p className="text-xs text-gray-500">Please wait for admin approval.</p>
                </div>
            )}
        </div>
    );
};

// 9. All History View
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

    return (
        <div className={`min-h-screen ${THEME.bgMain} px-4 pt-4 pb-20 animate-in fade-in`}>
             <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold text-gray-800">History</h1>
             </div>

             <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                 {['all', 'income', 'withdraw'].map(f => (
                     <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-[10px] font-bold capitalize whitespace-nowrap transition border ${filter === f ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-100'}`}>
                         {f}
                     </button>
                 ))}
             </div>

             <div className="space-y-3">
                 {filtered.length > 0 ? filtered.map((t, i) => (
                     <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'withdraw' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                 {t.type === 'withdraw' ? <Wallet size={18}/> : <CreditCard size={18}/>}
                             </div>
                             <div>
                                 <p className="font-bold text-[10px] text-gray-800 capitalize mb-0.5">{t.category.replace('_', ' ')}</p>
                                 <p className="text-[9px] text-gray-400 font-medium">{formatFullTime(t.date)}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className={`font-bold text-xs mb-0.5 ${t.type === 'withdraw' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                 {t.type === 'withdraw' ? '-' : '+'} {t.amount}
                             </p>
                             <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${t.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : t.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{t.status}</span>
                         </div>
                     </div>
                 )) : <div className="text-center py-12 text-gray-400 text-xs">No transactions.</div>}
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
        <div className={`min-h-screen bg-[#0F172A] pb-20 px-4 pt-4 text-white relative overflow-hidden animate-in zoom-in duration-500`}>
             <div className="absolute top-10 right-10 text-yellow-500 animate-pulse"><Sparkles size={20}/></div>
             <div className="flex items-center gap-3 mb-8 relative z-10">
                <button onClick={() => setView('dashboard')} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold">Ramadan Offer</h1>
             </div>

             <div className="flex flex-col items-center justify-center text-center mt-10 relative z-10">
                 <Moon size={80} className="text-yellow-400 fill-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-pulse"/>
                 <h2 className="text-3xl font-extrabold mb-3 font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500">Ramadan Kareem</h2>
                 <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8 w-full shadow-lg">
                     <div className="text-xs text-gray-200 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: settings.ramadanOfferHtml || '<p>Special offers coming soon!</p>'}} />
                 </div>
                 <a href={settings.ramadanOfferLink} target="_blank" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold text-xs shadow-lg hover:scale-105 transition transform flex items-center justify-center gap-2">
                     Claim Offer Now <ArrowUpRight size={16}/>
                 </a>
             </div>
        </div>
    );
};

// 11. Profile Settings View
const SettingsView = ({ user, setView, onUpdateUser, showPopup }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(user.fullName);
    const [password, setPassword] = useState(''); 
    
    const handleSave = async () => {
        if (!name) return showPopup('warning', 'Name cannot be empty');
        const updates: any = { fullName: name };
        if (password && password.length >= 6) { updates.password = password; } 
        else if (password && password.length < 6) { return showPopup('warning', 'Password too short'); }

        const updatedUser = { ...user, ...updates };
        onUpdateUser(updatedUser);
        const { error } = await supabase.from('users').update(updates).eq('id', user.id);
        
        if (error) { showPopup('error', 'Failed.'); } 
        else { showPopup('success', 'Updated'); setView('account'); }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => { 
                const base64 = reader.result as string;
                onUpdateUser({ ...user, profileImage: base64 }); 
                await supabase.from('users').update({ profileImage: base64 }).eq('id', user.id);
                showPopup('success', 'Photo Updated!'); 
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen ${THEME.bgMain} pb-20 px-4 pt-4 animate-in slide-in-from-right`}>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                <h1 className="text-lg font-bold text-gray-800">Edit Profile</h1>
            </div>

            <div className="space-y-6">
                 <div className="flex flex-col items-center">
                     <div className="w-20 h-20 relative mb-3 group">
                         <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img src={user.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} className="w-full h-full object-cover"/>
                         </div>
                         <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full shadow-lg border-2 border-white active:scale-95"><Camera size={14}/></button>
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
                     </div>
                 </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5 block ml-1">Full Name</label>
                        <input className={INPUT_STYLE} value={name} onChange={e => setName(e.target.value)}/>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5 block ml-1">Phone</label>
                        <div className="relative">
                            <input disabled className={INPUT_STYLE + " bg-gray-100 text-gray-500 cursor-not-allowed"} value={user.phone}/>
                            <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase mb-1.5 block ml-1">New Password</label>
                        <input className={INPUT_STYLE} placeholder="Leave empty to keep same" value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>

                    <button onClick={handleSave} className={`${THEME.button} w-full mt-2`}>
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

    const channel = supabase.channel('public:transactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `userId=eq.${user.id}` }, (payload) => {
        if(payload.eventType === 'INSERT') setTransactions(prev => [...prev, payload.new as Transaction]);
        if(payload.eventType === 'UPDATE') setTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t));
    }).subscribe();

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
             <div className={`min-h-screen ${THEME.bgMain} px-4 pt-4 pb-24`}>
                 <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setCurrentView('account')} className="p-2.5 bg-white rounded-full hover:bg-gray-50 text-gray-700 shadow-sm transition"><ChevronLeft size={20}/></button>
                    <h1 className="text-lg font-bold text-gray-800">About Us</h1>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed shadow-sm" dangerouslySetInnerHTML={{ __html: settings.aboutText }} />
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
