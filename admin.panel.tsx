
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ClipboardList, 
  Settings, LogOut, Bell, Search, 
  CheckCircle, XCircle, AlertCircle, 
  Menu, X, Wallet, Shield, TrendingUp, 
  Briefcase, Save, Plus, ArrowRight,
  UserCheck, Zap, ToggleLeft, ToggleRight,
  Youtube, CheckSquare, Trash2, Edit3, Coins, Crown,
  Percent, Image as ImageIcon, Link as LinkIcon,
  MessageCircle, Globe, Clock, Check, RefreshCw, Filter
} from 'lucide-react';
import { UserData, DB_KEYS, GmailRequest, PremiumRequest, AccountType } from './types';
import { supabase } from './supabaseClient';

// --- Styled Constants for Advanced Look ---
const CARD_BASE = "bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300";
const INPUT_BASE = "w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition bg-gray-50/50 text-gray-900 font-bold text-sm placeholder-gray-400";
const BTN_PRIMARY = "bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white px-8 py-3 rounded-2xl font-extrabold text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 flex items-center gap-2 justify-center tracking-wide";
const BTN_SECONDARY = "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center gap-2 justify-center shadow-sm active:scale-95";
const BADGE_BASE = "px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider";

// --- Components ---

const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-top-10 transition-all duration-300 border-l-4 ${type === 'success' ? 'bg-white border-emerald-500 text-emerald-800' : 'bg-white border-rose-500 text-rose-800'}`}>
            <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                {type === 'success' ? <Check size={18} strokeWidth={3}/> : <AlertCircle size={18} strokeWidth={3}/>}
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-900">{type === 'success' ? 'Success' : 'Error'}</h4>
                <p className="text-xs font-medium text-gray-500">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 hover:bg-gray-100 p-1.5 rounded-full transition"><X size={16}/></button>
        </div>
    );
};

const NavItem = ({ id, icon: Icon, label, count, activeTab, setActiveTab, setSidebarOpen }: any) => (
    <button 
        onClick={() => { setActiveTab(id); setSidebarOpen(false); }} 
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group relative mb-1
        ${activeTab === id 
            ? 'bg-white/10 text-white font-bold shadow-inner' 
            : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-4">
            <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} className={activeTab === id ? 'text-orange-400' : 'text-gray-500 group-hover:text-gray-300'} />
            <span className="text-sm tracking-wide">{label}</span>
        </div>
        {count > 0 && (
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${activeTab === id ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                {count}
            </span>
        )}
        {activeTab === id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-l-full"></div>}
    </button>
);

const UserProfileHeader = ({ userId, users }: { userId: string, users: UserData[] }) => {
    const u = users.find(user => user.id === userId);
    if (!u) return <div className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">User not found</div>;
    return (
        <div className="flex items-center gap-4 mb-5 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div className="relative">
                <img 
                src={u.profileImage || "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"} 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                {u.accountType === 'premium' && <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1 rounded-full border-2 border-white"><Crown size={10} fill="currentColor"/></div>}
            </div>
            <div>
                <p className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    {u.fullName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">{u.phone}</span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{(u.balanceFree || 0).toLocaleString()} Coins</span>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className={`${CARD_BASE} p-6 flex items-start justify-between group hover:-translate-y-1`}>
        <div className="relative z-10">
            <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{value}</h3>
            {trend && <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2 bg-emerald-50 w-fit px-2 py-1 rounded-lg"><TrendingUp size={12}/> {trend}</p>}
        </div>
        <div className={`w-14 h-14 rounded-[1.2rem] ${color} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition duration-300`}>
            <Icon size={26} strokeWidth={2.5}/>
        </div>
    </div>
);

// --- Sub-Components ---

const DashboardView = ({ users, trxs, premiumRequests, setActiveTab }: any) => {
    const pendingWithdraws = trxs.filter((t:any) => t.type === 'withdraw' && t.status === 'pending').length;
    const pendingPremium = premiumRequests.filter((r:any) => r.status === 'pending').length;
    const totalPaid = trxs.filter((t:any) => t.type === 'withdraw' && t.status === 'approved').reduce((a:any,b:any) => a + b.amount, 0);
    
    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={users.length} icon={Users} color="bg-gradient-to-br from-blue-500 to-indigo-600" trend="+ Active" />
                <StatCard title="Pending Withdraws" value={pendingWithdraws} icon={AlertCircle} color="bg-gradient-to-br from-orange-500 to-red-500" />
                <StatCard title="Premium Requests" value={pendingPremium} icon={Crown} color="bg-gradient-to-br from-amber-400 to-yellow-600" />
                <StatCard title="Total Paid" value={`৳${(totalPaid || 0).toLocaleString()}`} icon={CheckCircle} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
            </div>
            
            <div className="bg-gradient-to-r from-orange-600 to-rose-600 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-orange-500/30">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Admin Dashboard</h2>
                        <p className="text-orange-100 max-w-lg font-medium">Manage users, payments, and system configurations efficiently from this advanced panel.</p>
                    </div>
                    <button onClick={() => setActiveTab('premium')} className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-extrabold hover:bg-orange-50 transition shadow-xl active:scale-95 whitespace-nowrap">
                        Review Premium Requests
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                <Zap size={250} className="absolute -right-10 -bottom-24 text-white opacity-10 rotate-12"/>
            </div>
        </div>
    );
};

const UserManagerView = ({ users, setUsers, notify }: any) => {
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const filtered = users.filter((u:UserData) => u.phone.includes(search) || u.fullName.toLowerCase().includes(search.toLowerCase()));

    const handleUpdateUser = async () => {
        if(!editingUser) return;
        const { error } = await supabase.from('users').update(editingUser).eq('id', editingUser.id);
        if(!error) {
            const newList = users.map((u:UserData) => u.id === editingUser.id ? editingUser : u);
            setUsers(newList);
            setEditingUser(null);
            notify('success', 'User Updated Successfully');
        } else {
            notify('error', 'Update Failed');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if(!confirm("Are you sure you want to delete this user?")) return;
        await supabase.from('users').delete().eq('id', id);
        const newList = users.filter((u:UserData) => u.id !== id);
        setUsers(newList);
        notify('success', 'User Deleted');
    };

    if (editingUser) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-6 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-extrabold text-gray-900">Edit User Profile</h3>
                    <button onClick={() => setEditingUser(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                </div>
                
                <div className="space-y-6">
                    <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-3xl shadow-sm border-4 border-orange-100">
                            {editingUser.fullName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-extrabold text-xl text-gray-900">{editingUser.fullName}</h4>
                            <p className="text-sm font-medium text-gray-500 font-mono">{editingUser.phone}</p>
                            <span className={`inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full uppercase ${editingUser.accountType === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>{editingUser.accountType}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Coins Balance</label><input type="number" className={INPUT_BASE} value={editingUser.balanceFree} onChange={e => setEditingUser({...editingUser, balanceFree: parseFloat(e.target.value)})}/></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Password</label><input className={INPUT_BASE} value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})}/></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Account Type</label>
                            <select className={INPUT_BASE} value={editingUser.accountType} onChange={e => setEditingUser({...editingUser, accountType: e.target.value as AccountType})}>
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Status</label>
                            <select className={INPUT_BASE} value={editingUser.isBlocked ? 'blocked' : 'active'} onChange={e => setEditingUser({...editingUser, isBlocked: e.target.value === 'blocked'})}>
                                <option value="active">Active (Allowed)</option>
                                <option value="blocked">Blocked (Restricted)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button onClick={handleUpdateUser} className={`${BTN_PRIMARY} w-full`}>Save Changes</button>
                        <button onClick={() => setEditingUser(null)} className={`${BTN_SECONDARY} w-full`}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${CARD_BASE} min-h-[80vh] animate-in fade-in pb-20`}>
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
                <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-3"><Users size={28} className="text-orange-600"/> User Management</h3>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-4 text-gray-400" size={20}/>
                    <input className={`${INPUT_BASE} pl-12 py-3.5 bg-gray-50`} placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-extrabold text-left tracking-wider">
                        <tr>
                            <th className="p-6 pl-8">User Info</th>
                            <th className="p-6">Wallet</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map((u:UserData) => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition group">
                                <td className="p-6 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-orange-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition">{u.fullName}</p>
                                            <p className="text-xs text-gray-400 font-mono">{u.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{(u.balanceFree || 0).toLocaleString()}</span>
                                </td>
                                <td className="p-6">
                                    {u.accountType === 'premium' ? 
                                        <span className={`${BADGE_BASE} bg-amber-100 text-amber-700 border border-amber-200 flex w-fit items-center gap-1`}><Crown size={10} fill="currentColor"/> Premium</span> : 
                                        <span className={`${BADGE_BASE} bg-gray-100 text-gray-500 border border-gray-200`}>Free</span>
                                    }
                                </td>
                                <td className="p-6 text-right pr-8 flex justify-end gap-3">
                                    <button onClick={() => setEditingUser(u)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition shadow-sm border border-blue-100"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition shadow-sm border border-red-100"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FinanceView = ({ trxs, users, settings, setSettings, saveSettings, handleTransactionAction }: any) => {
    const [view, setView] = useState<'requests' | 'settings'>('requests');
    const pendingWithdraws = trxs.filter((t:any) => t.type === 'withdraw' && t.status === 'pending');

    const updatePreset = (index: number, field: 'tk' | 'coins', value: number) => {
        const newPresets = [...(settings.withdrawPresets || [])];
        if (!newPresets[index]) newPresets[index] = { tk: 0, coins: 0 };
        newPresets[index][field] = value;
        setSettings({ ...settings, withdrawPresets: newPresets });
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                 <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-3"><Wallet size={28} className="text-orange-600"/> Finance Hub</h3>
                 <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={()=>setView('requests')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='requests' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Requests</button>
                    <button onClick={()=>setView('settings')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='settings' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Setup</button>
                 </div>
            </div>

            {view === 'requests' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingWithdraws.map((t:any) => (
                        <div key={t.id} className={`${CARD_BASE} p-6 relative group border-l-4 border-l-orange-500`}>
                            <UserProfileHeader userId={t.userId} users={users} />
                            
                            <div className="flex justify-between items-start mb-5">
                                <p className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Withdrawal Request</p>
                                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">{t.method}</span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">Amount</span>
                                    <span className="text-lg font-extrabold text-gray-900">৳{t.amount}</span>
                                </div>
                                <div className="w-full h-[1px] bg-gray-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">Number</span>
                                    <span className="text-xs font-mono font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">{t.senderNumber}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => handleTransactionAction(t.id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs transition shadow-md shadow-emerald-200">Approve</button>
                                <button onClick={() => handleTransactionAction(t.id, 'rejected')} className="bg-white border border-rose-100 text-rose-500 py-3 rounded-xl font-bold text-xs hover:bg-rose-50 transition">Reject</button>
                            </div>
                        </div>
                    ))}
                    {pendingWithdraws.length === 0 && (
                        <div className="col-span-full py-24 text-center text-gray-400 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="opacity-20" size={40}/></div>
                            <p className="font-bold text-sm">All caught up!</p>
                            <p className="text-xs">No pending withdrawals.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`${CARD_BASE} p-8 max-w-3xl mx-auto`}>
                    <h4 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Settings size={22} className="text-orange-600"/> Withdrawal Configuration</h4>
                    
                    <div className="mb-8 flex items-center justify-between bg-orange-50 p-6 rounded-3xl border border-orange-100">
                        <div>
                            <p className="font-bold text-base text-gray-900">Withdrawal System</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">Toggle to enable or disable new requests.</p>
                        </div>
                        <button onClick={()=>setSettings({...settings, withdrawEnabled: !settings.withdrawEnabled})} className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${settings.withdrawEnabled ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-200 text-gray-400'}`}>
                           {settings.withdrawEnabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>} {settings.withdrawEnabled ? 'System Active' : 'System Paused'}
                        </button>
                    </div>

                    <div className="mb-8">
                        <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Minimum Withdraw (Taka)</label>
                        <input type="number" className={INPUT_BASE} value={settings.minWithdraw || 100} onChange={e => setSettings({...settings, minWithdraw: parseFloat(e.target.value)})}/>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 shadow-sm">
                        <label className="text-sm font-extrabold text-gray-900 uppercase mb-5 block flex items-center gap-2"><LayoutDashboard size={16}/> Package Presets</label>
                        <div className="grid grid-cols-1 gap-4">
                            {[0, 1, 2, 3].map(idx => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center gap-4 hover:border-orange-200 transition group">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Amount (Tk)</label>
                                        <input 
                                          type="number" 
                                          className="w-full font-bold text-gray-900 outline-none bg-transparent border-b border-gray-300 focus:border-orange-500 text-sm py-1 transition" 
                                          value={settings.withdrawPresets?.[idx]?.tk || 0} 
                                          onChange={e => updatePreset(idx, 'tk', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-[1px] h-8 bg-gray-200"></div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Cost (Coins)</label>
                                        <input 
                                          type="number" 
                                          className="w-full font-bold text-orange-600 outline-none bg-transparent border-b border-gray-300 focus:border-orange-500 text-sm py-1 transition" 
                                          value={settings.withdrawPresets?.[idx]?.coins || 0} 
                                          onChange={e => updatePreset(idx, 'coins', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={() => saveSettings(settings)} className={`${BTN_PRIMARY} w-full`}><Save size={20}/> Save Configuration</button>
                </div>
            )}
        </div>
    );
};

const PremiumRequestsView = ({ premiumRequests, users, settings, setSettings, saveSettings, handlePremiumAction }: any) => {
    const [view, setView] = useState<'requests' | 'settings'>('requests');
    const pending = premiumRequests.filter((r:any) => r.status === 'pending');

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                 <h3 className="font-extrabold text-2xl text-gray-900 flex items-center gap-3"><Crown size={28} className="text-amber-500"/> Premium Zone</h3>
                 <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                    <button onClick={()=>setView('requests')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='requests' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Requests</button>
                    <button onClick={()=>setView('settings')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='settings' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Setup</button>
                 </div>
            </div>

            {view === 'requests' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pending.map((req:any) => {
                        return (
                          <div key={req.id} className={`${CARD_BASE} p-6 border-l-4 border-l-amber-500`}>
                              <UserProfileHeader userId={req.userId} users={users} />

                              <div className="flex justify-between items-start mb-5">
                                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg uppercase tracking-wide">Premium Upgrade</span>
                                  <span className="text-xl font-extrabold text-gray-900">৳{req.amount}</span>
                              </div>
                              
                              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-3">
                                  <div className="flex justify-between">
                                      <span className="text-xs font-bold text-gray-500">Method</span>
                                      <span className="text-xs font-bold text-gray-900 uppercase bg-white px-2 py-0.5 rounded border border-gray-200">{req.method}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-xs font-bold text-gray-500">Sender</span>
                                      <span className="text-xs font-mono font-bold text-gray-700">{req.senderNumber}</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-xs font-bold text-gray-500">TrxID</span>
                                      <span className="text-xs font-mono font-bold text-gray-700">{req.trxId}</span>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                  <button onClick={() => handlePremiumAction(req.id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs transition shadow-md shadow-emerald-200">Approve</button>
                                  <button onClick={() => handlePremiumAction(req.id, 'rejected')} className="bg-white border border-rose-100 text-rose-500 py-3 rounded-xl font-bold text-xs hover:bg-rose-50 transition">Reject</button>
                              </div>
                          </div>
                        );
                    })}
                    {pending.length === 0 && (
                        <div className="col-span-full py-24 text-center text-gray-400 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="opacity-20" size={40}/></div>
                            <p className="font-bold text-sm">No pending requests</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={`${CARD_BASE} p-8 max-w-3xl mx-auto`}>
                    <h4 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Settings size={22} className="text-amber-500"/> Membership Settings</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Premium Cost (Taka)</label>
                            <input type="number" className={INPUT_BASE} value={settings.premiumCost || 500} onChange={e => setSettings({...settings, premiumCost: parseFloat(e.target.value)})}/>
                        </div>
                        <div>
                            <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Referral Bonus (Coins)</label>
                            <input type="number" className={INPUT_BASE} value={settings.premiumUpgradeBonus || 50} onChange={e => setSettings({...settings, premiumUpgradeBonus: parseFloat(e.target.value)})}/>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Earned by upline when user upgrades.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Bkash Merchant/Personal</label>
                        <input className={INPUT_BASE} value={settings.bkash || ''} onChange={e => setSettings({...settings, bkash: e.target.value})}/>
                    </div>
                    <div className="mb-6">
                        <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Nagad Merchant/Personal</label>
                        <input className={INPUT_BASE} value={settings.nagad || ''} onChange={e => setSettings({...settings, nagad: e.target.value})}/>
                    </div>

                    <div className="mb-8">
                        <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Premium Benefits (HTML)</label>
                        <textarea rows={4} className={INPUT_BASE} value={settings.premiumDesc || ''} onChange={e => setSettings({...settings, premiumDesc: e.target.value})}/>
                    </div>

                    <button onClick={() => saveSettings(settings)} className={`${BTN_PRIMARY} w-full`}><Save size={20}/> Save Settings</button>
                </div>
            )}
        </div>
    );
};

const JobsView = ({ tasks, setTasks, trxs, settings, setSettings, handleTransactionAction, notify, users }: any) => {
    const [view, setView] = useState<'tasks' | 'submissions'>('tasks');
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null); // State for editing task
    const [newTask, setNewTask] = useState<any>({ title: '', desc: '', link: '', reward: 10, type: 'submit', image: '' });
    const submissions = trxs.filter((t:any) => t.category === 'task' && t.status === 'pending');

    const handleOpenAddModal = () => {
        setEditingTask(null);
        setNewTask({ title: '', desc: '', link: '', reward: 10, type: 'submit', image: '' });
        setShowModal(true);
    };

    const handleOpenEditModal = (task: any) => {
        setEditingTask(task);
        setNewTask(task);
        setShowModal(true);
    };

    const handleSaveTask = async () => {
        if (editingTask) {
            // Update existing task
            const { error } = await supabase.from('tasks').update(newTask).eq('id', editingTask.id);
            if (error) {
                notify('error', 'Failed to update task');
                return;
            }
            const updatedTasks = tasks.map((t: any) => t.id === editingTask.id ? newTask : t);
            setTasks(updatedTasks);
            notify('success', 'Task Updated Successfully');
        } else {
            // Add new task
            const newTaskObj = { ...newTask, id: Date.now().toString(), status: 'active', type: 'submit' };
            const { error } = await supabase.from('tasks').insert([newTaskObj]);
            if (error) {
                notify('error', 'Failed to add task');
                return;
            }
            const updatedTasks = [...tasks, newTaskObj];
            setTasks(updatedTasks);
            notify('success', 'Task Added Successfully');
        }
        setShowModal(false);
        setEditingTask(null);
        setNewTask({ title: '', desc: '', link: '', reward: 10, type: 'submit', image: '' });
    };

    const handleDeleteTask = async (id: string) => {
        if(!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
        
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        
        if (error) {
            notify('error', 'Failed to delete task. Check RLS policies.');
            console.error("Delete Error:", error);
        } else {
            const updated = tasks.filter((t:any) => t.id !== id);
            setTasks(updated);
            notify('success', 'Task Deleted Successfully');
        }
    };

    const handleTaskProof = (trxId: string, status: string) => {
        handleTransactionAction(trxId, status as any);
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
             <div className="flex justify-between items-center">
                <div className="flex gap-2 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-gray-100">
                    <button onClick={() => setView('tasks')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view === 'tasks' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Active Jobs</button>
                    <button onClick={() => setView('submissions')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view === 'submissions' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Proofs ({submissions.length})</button>
                </div>
                <div className="flex gap-3">
                     <button onClick={()=>setSettings({...settings, taskSystemEnabled: !settings.taskSystemEnabled})} className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 border transition-all ${settings.taskSystemEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                         {settings.taskSystemEnabled ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>} {settings.taskSystemEnabled ? 'System ON' : 'System OFF'}
                     </button>
                     {view === 'tasks' && <button onClick={handleOpenAddModal} className={BTN_PRIMARY}><Plus size={20}/> New Task</button>}
                </div>
             </div>

             {view === 'tasks' ? (
                 <div className="grid gap-5">
                     {tasks.map((task:any) => (
                         <div key={task.id} className={`${CARD_BASE} p-6 flex items-center justify-between group`}>
                             <div className="flex items-center gap-6">
                                 {task.image ? (
                                     <img src={task.image} className="w-16 h-16 rounded-2xl object-cover bg-gray-100 shadow-md group-hover:scale-105 transition duration-500" />
                                 ) : (
                                     <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                                          <CheckSquare size={32}/>
                                     </div>
                                 )}
                                 <div>
                                     <h4 className="font-extrabold text-lg text-gray-900 mb-1">{task.title}</h4>
                                     <p className="text-xs font-medium text-gray-500 line-clamp-1 max-w-md">{task.desc}</p>
                                     <div className="flex items-center gap-2 mt-2">
                                         <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 flex items-center gap-1"><Coins size={10}/> {task.reward} Coins</span>
                                         <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase">{task.type}</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex gap-3">
                                 <button onClick={() => handleOpenEditModal(task)} className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition shadow-sm border border-blue-100" title="Edit Task"><Edit3 size={20}/></button>
                                 <button onClick={() => handleDeleteTask(task.id)} className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition shadow-sm border border-red-100" title="Delete Task"><Trash2 size={20}/></button>
                             </div>
                         </div>
                     ))}
                     {tasks.length === 0 && <p className="text-center text-gray-400 py-16 font-bold text-sm">No active tasks found.</p>}
                 </div>
             ) : (
                 <div className="grid gap-5">
                     {submissions.map((t:any) => (
                         <div key={t.id} className={`${CARD_BASE} p-6`}>
                             {/* FIX: Passed users prop instead of empty array */}
                             <UserProfileHeader userId={t.userId} users={users} /> 
                             <div className="flex justify-between items-start mb-4">
                                 <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2"><CheckSquare size={16} className="text-orange-500"/> {t.details}</h4>
                                 <span className="text-orange-600 font-extrabold text-sm bg-orange-50 px-3 py-1 rounded-lg">+{t.amount} Coins</span>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 break-all">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Proof Submission</p>
                                 <a href={t.proofUrl?.split(' | ')[0]} target="_blank" className="text-blue-600 text-sm font-medium underline hover:text-blue-700 transition block mb-2">{t.proofUrl?.split(' | ')[0]}</a>
                                 {t.proofUrl?.includes(' | Note: ') && (
                                     <div className="pt-3 border-t border-gray-200">
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">User Note</p>
                                         <p className="text-xs text-gray-700 italic">"{t.proofUrl.split(' | Note: ')[1]}"</p>
                                     </div>
                                 )}
                             </div>
                             <div className="flex gap-3 justify-end">
                                 <button onClick={() => handleTaskProof(t.id, 'rejected')} className="px-6 py-3 bg-white border border-rose-100 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-50 transition shadow-sm">Reject</button>
                                 <button onClick={() => handleTaskProof(t.id, 'approved')} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition shadow-md shadow-emerald-200">Approve</button>
                             </div>
                         </div>
                     ))}
                      {submissions.length === 0 && <p className="text-center text-gray-400 py-16 font-bold text-sm">No pending proofs.</p>}
                 </div>
             )}

             {/* Add/Edit Task Modal */}
             {showModal && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                     <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 animate-in zoom-in-95 shadow-2xl relative">
                         <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                             <h3 className="font-extrabold text-xl text-gray-900">{editingTask ? 'Edit Task Details' : 'Create New Task'}</h3>
                             <button onClick={() => setShowModal(false)} className="bg-gray-50 p-2.5 rounded-full hover:bg-gray-100 transition"><X size={20}/></button>
                         </div>
                         
                         <div className="space-y-6">
                             {/* Image Field Added */}
                             <div>
                                 <label className="text-xs font-extrabold text-gray-500 uppercase mb-2 block ml-1 tracking-wider">Task Icon (Image URL)</label>
                                 <input className={INPUT_BASE} placeholder="https://imgur.com/..." value={newTask.image} onChange={e=>setNewTask({...newTask, image: e.target.value})}/>
                             </div>
                             <div>
                                 <label className="text-xs font-extrabold text-gray-500 uppercase mb-2 block ml-1 tracking-wider">Task Title</label>
                                 <input className={INPUT_BASE} placeholder="e.g., Subscribe & Like" value={newTask.title} onChange={e=>setNewTask({...newTask, title: e.target.value})}/>
                             </div>
                             <div>
                                  <label className="text-xs font-extrabold text-gray-500 uppercase mb-2 block ml-1 tracking-wider">Instructions</label>
                                  <textarea rows={3} className={INPUT_BASE} placeholder="Step-by-step guide..." value={newTask.desc} onChange={e=>setNewTask({...newTask, desc: e.target.value})}/>
                             </div>
                             <div>
                                 <label className="text-xs font-extrabold text-gray-500 uppercase mb-2 block ml-1 tracking-wider">Target Link</label>
                                 <input className={INPUT_BASE} placeholder="https://youtube.com/..." value={newTask.link} onChange={e=>setNewTask({...newTask, link: e.target.value})}/>
                             </div>
                             <div>
                                 <label className="text-xs font-extrabold text-gray-500 uppercase mb-2 block ml-1 tracking-wider">Reward (Coins)</label>
                                 <input type="number" className={INPUT_BASE} placeholder="50" value={newTask.reward} onChange={e=>setNewTask({...newTask, reward: Number(e.target.value)})}/>
                             </div>
                         </div>
                         <div className="flex gap-4 mt-8 pt-4 border-t border-gray-50">
                             <button onClick={handleSaveTask} className={`${BTN_PRIMARY} w-full shadow-xl`}>{editingTask ? 'Update Task' : 'Publish Task'}</button>
                             <button onClick={() => setShowModal(false)} className={`${BTN_SECONDARY} w-full`}>Cancel</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

const RecoveryView = ({ gmailRequests, setGmailRequests, users, setUsers, settings, setSettings, saveSettings, notify }: any) => {
    const [view, setView] = useState('requests');
    const [inputs, setInputs] = useState<any>({}); 

    const newRequests = gmailRequests.filter((r:any) => r.status === 'requested');
    const waitingUser = gmailRequests.filter((r:any) => r.status === 'credentials_sent' || r.status === 'recovery_requested');
    const finalReview = gmailRequests.filter((r:any) => r.status === 'submitted');

    const handleUpdateReq = async (id: string, updates: any) => {
         const { error } = await supabase.from('gmail_requests').update(updates).eq('id', id);
         if(error) { notify('error', 'Update Failed'); return; }

         const updated = gmailRequests.map((r:any) => r.id === id ? { ...r, ...updates } : r);
         setGmailRequests(updated as GmailRequest[]);
         setInputs({});
         notify('success', "Updated Successfully");
    };

    const handleDeleteGmailReq = async (id: string) => {
        if(!confirm("Are you sure you want to permanently delete this request?")) return;
        const { error } = await supabase.from('gmail_requests').delete().eq('id', id);
        
        if(error) {
            notify('error', 'Delete Failed. Check Database Policy.');
        } else {
            const updated = gmailRequests.filter((r:any) => r.id !== id);
            setGmailRequests(updated);
            notify('success', 'Request Deleted Permanently');
        }
    };

    const handleApproveGmail = async (req: GmailRequest) => {
        let updatedUsers = [...users];
        let user = updatedUsers.find(u => u.id === req.userId);
        if(!user) return;

        const paymentAmount = user?.accountType === 'premium' ? (settings.gmailRatePremium || 13000) : (settings.gmailRateFree || 12000);

        // Update User Balance
        user = { ...user, balanceFree: (user.balanceFree || 0) + paymentAmount };
        await supabase.from('users').update({ balanceFree: user.balanceFree }).eq('id', user.id);

        await supabase.from('transactions').insert([{
            id: Date.now().toString(),
            userId: req.userId,
            type: 'earning',
            category: 'sell',
            amount: paymentAmount,
            status: 'approved',
            date: new Date().toISOString(),
            details: `Gmail Sell: ${req.userCreatedEmail}`
        }]);

        // Referral Commission
        if(user.uplineRefCode) {
            const upline = updatedUsers.find(u => u.refCode === user.uplineRefCode);
            if(upline && upline.accountType === 'premium') {
                const commission = Math.floor(paymentAmount * ((settings.referralCommissionPercent || 5) / 100));
                if(commission > 0) {
                    await supabase.from('users').update({ balanceFree: (upline.balanceFree || 0) + commission }).eq('id', upline.id);
                    await supabase.from('transactions').insert([{
                        id: (Date.now() + 1).toString(),
                        userId: upline.id,
                        type: 'earning',
                        category: 'referral_commission',
                        amount: commission,
                        status: 'approved',
                        date: new Date().toISOString(),
                        details: `5% Commission from ${user.fullName} (Gmail Sell)`,
                        referralUserId: user.id 
                    }]);
                }
            }
        }

        // Update Request Status
        await handleUpdateReq(req.id, { status: 'approved' });
        
        notify('success', "Gmail Approved, User Paid & Commission Sent");
    };

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
             <div className="flex justify-between items-center">
                 <div className="flex gap-2 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-gray-100">
                    <button onClick={()=>setView('requests')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='requests' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>New Req ({newRequests.length})</button>
                    <button onClick={()=>setView('process')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='process' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Process ({waitingUser.length})</button>
                    <button onClick={()=>setView('review')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='review' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Review ({finalReview.length})</button>
                    <button onClick={()=>setView('settings')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${view==='settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Config</button>
                 </div>
             </div>

             {view === 'settings' ? (
                 <div className={`${CARD_BASE} p-8 max-w-3xl mx-auto`}>
                      <h4 className="text-lg font-extrabold text-gray-900 mb-8 flex items-center gap-2"><Settings size={22} className="text-indigo-600"/> Gmail System Config</h4>
                      
                      <div className="mb-8 flex items-center justify-between bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <div>
                            <p className="font-bold text-base text-gray-900">System Status</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">Enable or disable new gmail requests.</p>
                        </div>
                        <button onClick={()=>setSettings({...settings, gmailSystemEnabled: !settings.gmailSystemEnabled})} className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${settings.gmailSystemEnabled ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                           {settings.gmailSystemEnabled ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>} {settings.gmailSystemEnabled ? 'Active' : 'Disabled'}
                        </button>
                      </div>

                      <div className="mb-6">
                           <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Admin Name (For Display)</label>
                           <input className={INPUT_BASE} placeholder="e.g. Admin 1" value={settings.adminName || 'Admin'} onChange={e => setSettings({...settings, adminName: e.target.value})}/>
                      </div>
                      <div className="mb-6">
                           <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Admin Contact Link (Telegram)</label>
                           <input className={INPUT_BASE} placeholder="https://t.me/..." value={settings.adminContactLink || ''} onChange={e => setSettings({...settings, adminContactLink: e.target.value})}/>
                      </div>

                      <div className="mb-8">
                          <label className="text-xs font-extrabold text-gray-500 uppercase mb-3 block ml-1 tracking-wider">Instructions (HTML)</label>
                          <textarea rows={6} className={INPUT_BASE} value={settings.gmailInstructionHtml || ''} onChange={e => setSettings({...settings, gmailInstructionHtml: e.target.value})}/>
                      </div>
                      
                      <button onClick={() => saveSettings(settings)} className={`${BTN_PRIMARY} w-full`}><Save size={20}/> Save Settings</button>
                 </div>
             ) : (
             <div className="grid gap-5">
                 {view === 'requests' && newRequests.map((r:any) => (
                     <div key={r.id} className={`${CARD_BASE} p-6`}>
                         <div className="flex justify-between items-start mb-4">
                             <UserProfileHeader userId={r.userId} users={users} />
                             <button onClick={() => handleDeleteGmailReq(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm border border-red-100" title="Delete Request"><Trash2 size={20}/></button>
                         </div>
                         
                         <div className="flex justify-between items-center mb-6">
                             <span className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 border border-gray-200">ID: {r.id.slice(-6)}</span>
                             <span className="text-xs font-bold text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                         </div>
                         
                         <div className="space-y-4 mb-6">
                             <div>
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 block">Target Email</label>
                                <input className={INPUT_BASE} placeholder="e.g. user123 (without @gmail)" onChange={e => setInputs({...inputs, [r.id]: {...inputs[r.id], e: e.target.value}})} />
                             </div>
                             <div className="grid grid-cols-3 gap-3">
                                 <input className={INPUT_BASE} placeholder="First Name" onChange={e => setInputs({...inputs, [r.id]: {...inputs[r.id], f: e.target.value}})} />
                                 <input className={INPUT_BASE} placeholder="Last Name" onChange={e => setInputs({...inputs, [r.id]: {...inputs[r.id], l: e.target.value}})} />
                                 <input className={INPUT_BASE} placeholder="Password" onChange={e => setInputs({...inputs, [r.id]: {...inputs[r.id], p: e.target.value}})} />
                             </div>
                         </div>
                         
                         <button onClick={() => handleUpdateReq(r.id, { 
                             status: 'credentials_sent', 
                             adminProvidedFirstName: inputs[r.id]?.f, 
                             adminProvidedLastName: inputs[r.id]?.l,
                             adminProvidedPassword: inputs[r.id]?.p,
                             userCreatedEmail: inputs[r.id]?.e 
                         })} className={`${BTN_PRIMARY} w-full shadow-lg`}>Send Credentials</button>
                     </div>
                 ))}

                 {view === 'process' && waitingUser.map((r:any) => (
                     <div key={r.id} className={`${CARD_BASE} p-6`}>
                         <div className="flex justify-between items-start mb-4">
                             <UserProfileHeader userId={r.userId} users={users} />
                             <button onClick={() => handleDeleteGmailReq(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm border border-red-100" title="Delete Request"><Trash2 size={20}/></button>
                         </div>
                         <div className="flex justify-between mb-4">
                             <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wide">Status: {r.status.replace('_', ' ')}</span>
                         </div>
                         {r.status === 'recovery_requested' ? (
                             <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                                 <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckSquare size={16}/> User created: <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200">{r.userCreatedEmail}</span></p>
                                 <input className={`${INPUT_BASE} bg-white`} placeholder="Enter Recovery Email to give user" onChange={e => setInputs({...inputs, rec: e.target.value})} />
                                 <button onClick={() => handleUpdateReq(r.id, { status: 'recovery_sent', adminProvidedRecoveryEmail: inputs.rec })} className={`${BTN_PRIMARY} w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500`}>Send Recovery Email</button>
                             </div>
                         ) : (
                             <p className="text-sm text-gray-500 font-medium italic py-4 text-center bg-gray-50 rounded-xl border border-gray-100">Waiting for user to create email...</p>
                         )}
                     </div>
                 ))}

                 {view === 'review' && finalReview.map((r:any) => {
                     const u = users.find((u:any) => u.id === r.userId);
                     const upline = u?.uplineRefCode ? users.find((up:any) => up.refCode === u.uplineRefCode) : null;
                     const isUplinePremium = upline?.accountType === 'premium';
                     
                     return (
                      <div key={r.id} className={`${CARD_BASE} p-6 border-l-4 border-emerald-500 relative`}>
                          <div className="flex justify-between items-start mb-4">
                              <UserProfileHeader userId={r.userId} users={users} />
                              <button onClick={() => handleDeleteGmailReq(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition shadow-sm border border-red-100" title="Delete Request"><Trash2 size={20}/></button>
                          </div>
                          
                          <h4 className="font-extrabold text-gray-900 mb-4 text-sm flex items-center gap-2"><Search size={16}/> Review Submission</h4>
                          <div className="bg-gray-50 p-5 rounded-2xl text-sm space-y-2 mb-6 border border-gray-100 font-medium text-gray-700">
                              <p className="flex justify-between"><span>Created Email:</span> <span className="font-bold font-mono text-gray-900">{r.userCreatedEmail}</span></p>
                              <p className="flex justify-between"><span>Password:</span> <span className="font-bold font-mono text-gray-900">{r.adminProvidedPassword}</span></p>
                              <p className="flex justify-between"><span>Recovery Used:</span> <span className="font-bold font-mono text-gray-900">{r.adminProvidedRecoveryEmail}</span></p>
                              {isUplinePremium ? (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-orange-600 font-bold text-xs flex items-center gap-1.5">
                                          <Zap size={14}/> Upline is Premium: Commission will be sent automatically.
                                      </p>
                                  </div>
                              ) : (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-gray-400 text-xs mt-1">Upline not Premium / No Upline.</p>
                                  </div>
                              )}
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => handleUpdateReq(r.id, { status: 'rejected' })} className="flex-1 bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-bold text-xs hover:bg-rose-50 transition shadow-sm">Reject</button>
                              <button onClick={() => handleApproveGmail(r)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs transition shadow-md shadow-emerald-200">Approve & Pay</button>
                          </div>
                      </div>
                 )})}
             </div>
             )}
        </div>
    );
};

const SettingsView = ({ settings, setSettings, saveSettings, notify }: any) => {
    const [newAd, setNewAd] = useState('');
    const bonusAds = settings.bonusAds || [];

    const addAd = () => {
        if (!newAd) return;
        const updated = [...bonusAds, newAd];
        setSettings({...settings, bonusAds: updated});
        setNewAd('');
    };

    const removeAd = (idx: number) => {
        const updated = bonusAds.filter((_:any, i:number) => i !== idx);
        setSettings({...settings, bonusAds: updated});
    };

    return (
    <div className="max-w-4xl space-y-8 pb-40">
        <div className={CARD_BASE}>
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                <Settings className="text-orange-600" size={20}/>
                <h3 className="font-bold text-lg text-gray-800">Global Configuration</h3>
            </div>
            
            <div className="p-6 space-y-8">
                {/* General */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">General Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">App Name</label><input className={INPUT_BASE} value={settings.appName || ''} onChange={e => setSettings({...settings, appName: e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Telegram Channel</label><input className={INPUT_BASE} value={settings.telegramChannelLink || ''} onChange={e => setSettings({...settings, telegramChannelLink: e.target.value})}/></div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">How to Work Video Link</label>
                            <input className={INPUT_BASE} value={settings.workVideoLink || ''} onChange={e => setSettings({...settings, workVideoLink: e.target.value})} placeholder="https://youtube.com/..." />
                        </div>
                    </div>
                </div>

                {/* Gmail Rates (NEW) */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">Gmail Rates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Free User Rate (Coins)</label>
                            <input type="number" className={INPUT_BASE} value={settings.gmailRateFree || 12000} onChange={e => setSettings({...settings, gmailRateFree: parseFloat(e.target.value)})}/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Premium User Rate (Coins)</label>
                            <input type="number" className={INPUT_BASE} value={settings.gmailRatePremium || 13000} onChange={e => setSettings({...settings, gmailRatePremium: parseFloat(e.target.value)})}/>
                        </div>
                    </div>
                    <div className="mt-4">
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Gmail Referral Commission (%)</label>
                         <input type="number" className={INPUT_BASE} value={settings.referralCommissionPercent || 5} onChange={e => setSettings({...settings, referralCommissionPercent: parseFloat(e.target.value)})}/>
                         <p className="text-[10px] text-gray-400 mt-1">Percentage premium uplines get from downline gmail sales.</p>
                    </div>
                </div>

                {/* Task Configuration */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">Task Configuration</h4>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Image Upload Site Link</label>
                        <input className={INPUT_BASE} value={settings.imageUploadSiteLink || 'https://imgbb.com'} onChange={e => setSettings({...settings, imageUploadSiteLink: e.target.value})}/>
                    </div>
                </div>

                {/* Rewards Logic (Joining & Referrer) */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">Bonus Logic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Joining Bonus Amount (Coins)</label>
                            <input type="number" className={INPUT_BASE} value={settings.joiningBonusAmount || 0} onChange={e => setSettings({...settings, joiningBonusAmount: parseFloat(e.target.value)})}/>
                            <p className="text-[10px] text-gray-400 mt-1">Amount the new user gets after watching ad.</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Referrer Reward (Coins)</label>
                            <input type="number" className={INPUT_BASE} value={settings.referralBonusAmount || 0} onChange={e => setSettings({...settings, referralBonusAmount: parseFloat(e.target.value)})}/>
                            <p className="text-[10px] text-gray-400 mt-1">Amount the referrer gets when referee claims.</p>
                        </div>
                    </div>
                </div>

                {/* Ad Management for Bonus Claims */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Youtube size={16}/> Bonus Claim Ads Manager</h4>
                    
                    <div className="mb-4">
                        <label className="text-xs font-bold text-indigo-500 uppercase mb-1 block">Ad Watch Duration (Seconds)</label>
                        <input type="number" className={INPUT_BASE} value={settings.bonusAdDuration || 10} onChange={e => setSettings({...settings, bonusAdDuration: parseFloat(e.target.value)})}/>
                    </div>

                    <div className="mb-2">
                         <label className="text-xs font-bold text-indigo-500 uppercase mb-1 block">Add New Ad Link</label>
                         <div className="flex gap-2">
                             <input className={INPUT_BASE} placeholder="https://..." value={newAd} onChange={e => setNewAd(e.target.value)}/>
                             <button onClick={addAd} className="bg-indigo-600 text-white px-4 rounded-xl font-bold"><Plus/></button>
                         </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        {bonusAds.map((ad: string, i: number) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-indigo-200 flex justify-between items-center text-sm font-medium text-gray-700">
                                <span className="truncate flex-1">{ad}</span>
                                <button onClick={() => removeAd(i)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        {bonusAds.length === 0 && <p className="text-gray-400 text-xs italic">No ads added yet.</p>}
                    </div>
                </div>

                {/* Ramadan Offer (NEW) */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">Ramadan Offer</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Offer Description (HTML)</label>
                            <textarea rows={2} className={INPUT_BASE} value={settings.ramadanOfferHtml || ''} onChange={e => setSettings({...settings, ramadanOfferHtml: e.target.value})}/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Offer Link</label>
                            <input className={INPUT_BASE} value={settings.ramadanOfferLink || ''} onChange={e => setSettings({...settings, ramadanOfferLink: e.target.value})}/>
                        </div>
                    </div>
                </div>

                {/* Economy */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2 flex items-center gap-2"><Coins size={14}/> Coin Economy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Coin Rate (Coins per 1 Taka)</label>
                            <input type="number" className={INPUT_BASE} value={settings.coinRate || 1000} onChange={e => setSettings({...settings, coinRate: parseFloat(e.target.value)})}/>
                        </div>
                    </div>
                </div>

                {/* Content (HTML) */}
                <div>
                    <h4 className="text-xs font-extrabold text-orange-500 uppercase tracking-widest mb-4 border-b border-orange-100 pb-2">Content (HTML)</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">About Us</label>
                            <textarea rows={4} className={INPUT_BASE} value={settings.aboutText || ''} onChange={e => setSettings({...settings, aboutText: e.target.value})}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0 z-10">
                <button onClick={() => saveSettings(settings)} className={BTN_PRIMARY}><Save size={18}/> Save All Changes</button>
            </div>
        </div>
    </div>
)};

// --- Main Component ---

export const AdminPanel = ({ user, onLogout }: { user: UserData, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Data States
  const [users, setUsers] = useState<UserData[]>([]);
  const [trxs, setTrxs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [gmailRequests, setGmailRequests] = useState<GmailRequest[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<PremiumRequest[]>([]);
  
  const refreshData = async () => {
      const { data: u } = await supabase.from('users').select('*');
      if(u) setUsers(u);

      const { data: t } = await supabase.from('transactions').select('*');
      if(t) setTrxs(t);

      const { data: ts } = await supabase.from('tasks').select('*');
      if(ts) setTasks(ts as any);

      const { data: g } = await supabase.from('gmail_requests').select('*');
      if(g) setGmailRequests(g as any);

      const { data: p } = await supabase.from('premium_requests').select('*');
      if(p) setPremiumRequests(p as any);

      const { data: s } = await supabase.from('app_settings').select('settings').single();
      if(s) setSettings(s.settings);
      else {
          // Defaults if no settings
          const defaultSettings = {
              appName: 'Aitaskify',
              minWithdraw: 100,
              withdrawEnabled: true,
              taskSystemEnabled: true,
              gmailSystemEnabled: true,
              coinRate: 1000, 
              premiumCost: 500,
              premiumUpgradeBonus: 50, 
              referralCommissionPercent: 5, 
              gmailRateFree: 12000,    
              gmailRatePremium: 13000, 
              withdrawPresets: [
                { tk: 3000, coins: 3000000 },
                { tk: 1200, coins: 1200000 },
                { tk: 600, coins: 600000 },
                { tk: 130, coins: 130000 }
              ],
              bonusAds: ['https://google.com'],
              bonusAdDuration: 5,
          };
          setSettings(defaultSettings);
      }
  };

  useEffect(() => { refreshData(); }, []);

  const notify = (type: 'success' | 'error', message: string) => {
      setNotification({ message, type });
  };

  const saveSettings = async (newSettings: any) => {
      setSettings(newSettings);
      
      // Update DB
      const { error } = await supabase.from('app_settings').upsert({ id: 1, settings: newSettings });
      
      if(!error) {
          localStorage.setItem('app_settings', JSON.stringify(newSettings));
          window.dispatchEvent(new Event('storage')); 
          notify('success', "Settings Saved Successfully!");
      } else {
          notify('error', "Failed to save settings");
      }
  };

  const handleTransactionAction = async (trxId: string, action: 'approved' | 'rejected') => {
      const trx = trxs.find(t => t.id === trxId);
      if (!trx) return;
      
      await supabase.from('transactions').update({ status: action }).eq('id', trxId);
      
      if (action === 'rejected' && trx.type === 'withdraw') {
          // Refund balance on reject
          const u = users.find(user => user.id === trx.userId);
          if(u) {
              const refundAmount = Number(trx.amount) * (settings.coinRate || 1000);
              const newBal = (u.balanceFree || 0) + refundAmount;
              await supabase.from('users').update({ balanceFree: newBal }).eq('id', u.id);
              
              // Local update for UI
              setUsers(users.map(user => user.id === u.id ? { ...user, balanceFree: newBal } : user));
          }
      }
      
      setTrxs(trxs.map(t => t.id === trxId ? { ...t, status: action } : t));
      notify(action === 'approved' ? 'success' : 'error', `Transaction ${action}`);
  };

  const handlePremiumAction = async (reqId: string, action: 'approved' | 'rejected') => {
      const req = premiumRequests.find(r => r.id === reqId);
      if(!req) return;

      await supabase.from('premium_requests').update({ status: action }).eq('id', reqId);
      setPremiumRequests(premiumRequests.map(r => r.id === reqId ? { ...r, status: action } : r));

      if(action === 'approved') {
          const u = users.find(user => user.id === req.userId);
          if(u) {
              await supabase.from('users').update({ accountType: 'premium' }).eq('id', u.id);
              
              if(u.uplineRefCode) {
                   const upline = users.find(up => up.refCode === u.uplineRefCode);
                   if(upline) {
                       const bonus = settings.premiumUpgradeBonus || 50; 
                       await supabase.from('users').update({ balanceFree: (upline.balanceFree || 0) + bonus }).eq('id', upline.id);
                       await supabase.from('transactions').insert([{
                           id: (Date.now() + 1).toString(),
                           userId: upline.id,
                           type: 'earning',
                           category: 'referral_bonus',
                           amount: bonus,
                           status: 'approved',
                           date: new Date().toISOString(),
                           details: `Referral Bonus: ${u.fullName} upgraded to Premium`,
                           referralUserId: u.id 
                       }]);
                   }
              }
              
              await supabase.from('transactions').insert([{
                  id: Date.now().toString(),
                  userId: req.userId,
                  type: 'expense',
                  category: 'premium_purchase',
                  amount: req.amount,
                  status: 'approved',
                  date: new Date().toISOString(),
                  details: `Premium Purchased via ${req.method} (${req.senderNumber})`
              }]);
              
              // Refresh users list locally
              setUsers(users.map(user => user.id === u.id ? { ...user, accountType: 'premium' } : user));
          }
      }
      notify(action === 'approved' ? 'success' : 'error', `Premium Request ${action}`);
  };

  // Calculate Badge Counts
  const pendingWithdraws = trxs.filter(t => t.type === 'withdraw' && t.status === 'pending').length;
  const pendingPremium = premiumRequests.filter(r => r.status === 'pending').length;
  const pendingTaskSubmissions = trxs.filter(t => t.category === 'task' && t.status === 'pending').length;
  const pendingGmail = gmailRequests.filter(r => r.status === 'requested').length + gmailRequests.filter(r => r.status === 'submitted').length; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900 relative">
      
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-[#0F172A] text-white z-50 transform transition-transform duration-300 shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex flex-col`}>
          <div className="p-8 flex items-center gap-4 border-b border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-orange-600/30">A</div>
              <div>
                  <h2 className="font-extrabold text-xl leading-none mb-1.5 tracking-tight">Aitaskify</h2>
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md w-fit">Admin v3.0</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-400 hover:text-white transition"><X/></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
              <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen}/>
              
              <div className="pt-8 pb-3 px-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Management Console</div>
              <NavItem id="users" icon={Users} label="User Base" activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
              <NavItem id="premium" icon={Crown} label="Premium Requests" count={pendingPremium} activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
              <NavItem id="finance" icon={Wallet} label="Withdrawals" count={pendingWithdraws} activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
              <NavItem id="jobs" icon={Briefcase} label="Jobs & Tasks" count={pendingTaskSubmissions} activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
              <NavItem id="recovery" icon={Shield} label="Gmail Recovery" count={pendingGmail} activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
              
              <div className="pt-8 pb-3 px-4 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">System</div>
              <NavItem id="settings" icon={Settings} label="Configuration" activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
          </nav>

          <div className="p-6 border-t border-white/10 bg-[#0B1120]">
              <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 bg-white/5 text-rose-400 py-4 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition active:scale-95 border border-white/5 hover:border-rose-500">
                  <LogOut size={20}/> Sign Out
              </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 z-40 sticky top-0 shadow-sm">
              <div className="flex items-center gap-4">
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"><Menu size={28}/></button>
                  <h2 className="text-2xl font-extrabold text-gray-900 capitalize tracking-tight flex items-center gap-3">
                      {activeTab === 'dashboard' && <LayoutDashboard className="text-orange-500"/>}
                      {activeTab === 'users' && <Users className="text-orange-500"/>}
                      {activeTab === 'finance' && <Wallet className="text-orange-500"/>}
                      {activeTab === 'jobs' && <Briefcase className="text-orange-500"/>}
                      {activeTab.replace('_', ' ')}
                  </h2>
              </div>
              <div className="flex items-center gap-6">
                  <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-orange-500 transition shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative active:scale-95">
                      <Bell size={22}/>
                      <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                  <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                      <div className="text-right hidden md:block">
                          <p className="text-sm font-bold text-gray-900">Super Admin</p>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Online</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-extrabold text-orange-600 text-lg">A</div>
                      </div>
                  </div>
              </div>
          </header>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth bg-[#F8FAFC]">
              <div className="max-w-7xl mx-auto">
                  {activeTab === 'dashboard' && <DashboardView users={users} trxs={trxs} premiumRequests={premiumRequests} setActiveTab={setActiveTab}/>}
                  {activeTab === 'users' && <UserManagerView users={users} setUsers={setUsers} notify={notify} />}
                  {activeTab === 'premium' && <PremiumRequestsView premiumRequests={premiumRequests} users={users} settings={settings} setSettings={setSettings} saveSettings={saveSettings} handlePremiumAction={handlePremiumAction} notify={notify} />}
                  {activeTab === 'finance' && <FinanceView trxs={trxs} users={users} settings={settings} setSettings={setSettings} saveSettings={saveSettings} handleTransactionAction={handleTransactionAction} notify={notify} />}
                  {activeTab === 'settings' && <SettingsView settings={settings} setSettings={setSettings} saveSettings={saveSettings} notify={notify} />}
                  {/* FIX: Passed users={users} to JobsView */}
                  {activeTab === 'jobs' && <JobsView tasks={tasks} setTasks={setTasks} trxs={trxs} settings={settings} setSettings={setSettings} handleTransactionAction={handleTransactionAction} notify={notify} users={users} />}
                  {activeTab === 'recovery' && <RecoveryView gmailRequests={gmailRequests} setGmailRequests={setGmailRequests} users={users} setUsers={setUsers} settings={settings} setSettings={setSettings} saveSettings={saveSettings} notify={notify} />}
              </div>
          </div>
      </main>
    </div>
  );
};
