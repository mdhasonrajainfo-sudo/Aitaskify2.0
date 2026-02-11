
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPage } from './landing';
import { Auth } from './auth';
import { UserPanel } from './user.panel';
import { AdminPanel } from './admin.panel';
import { UserData, DB_KEYS } from './types';
import { supabase } from './supabaseClient';

// --- Default Data for Initialization ---
const INITIAL_ADMIN: UserData = {
  id: 'admin_01',
  fullName: 'Super Admin',
  phone: '01455875542',
  email: 'admin@mrhason.com',
  password: '855#@#@Gfewghu',
  refCode: '09464646',
  uplineRefCode: '',
  role: 'admin',
  accountType: 'premium',
  joiningDate: new Date().toISOString(),
  balanceFree: 0,
  balancePremium: 10000,
  balanceDeposit: 0,
  totalWithdraw: 0,
  withdrawCount: 0,
  isBlocked: false,
  availableTypingJobIds: []
};

const initializeDB = async () => {
    // Check if admin exists using maybeSingle to avoid errors if 0 rows
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', INITIAL_ADMIN.phone)
        .maybeSingle();

    if (!data) {
        // Prepare Admin Data: Remove fields not in DB schema to avoid error
        const { availableTypingJobIds, activePackageId, packageExpiryDate, quizUsage, ...adminData } = INITIAL_ADMIN;
        
        const { error: insertError } = await supabase.from('users').insert([adminData]);
        if(insertError) {
            console.error("Failed to create admin:", insertError.message);
        } else {
            console.log("Admin account created successfully.");
        }
    }
};

const App = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState('landing'); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeDB();
    const session = localStorage.getItem(DB_KEYS.CURRENT_USER);
    if (session) {
      const localUser = JSON.parse(session);
      refreshUser(localUser.phone, localUser.password);
    }
  }, []);

  const refreshUser = async (phone: string, pass: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('password', pass)
        .maybeSingle();
      
      if (data) {
          setCurrentUser(data);
          localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(data));
      }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentView('admin_panel');
      } else {
        setCurrentView('user_panel');
      }
    } else if (currentView === 'user_panel' || currentView === 'admin_panel') {
      setCurrentView('landing');
    }
  }, [currentUser]);

  const handleRegister = async (data: any) => {
    setLoading(true);
    
    // Check if user exists (using maybeSingle for safety)
    const { data: existing } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', data.phone)
        .maybeSingle();
    
    if (existing) {
      alert("User already exists with this phone number!");
      setLoading(false);
      return;
    }
    
    const uplineCode = '09464646'; // Default Admin Code

    const newUser: UserData = {
      id: Date.now().toString(),
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      password: data.password,
      refCode: Math.floor(100000 + Math.random() * 900000).toString(),
      uplineRefCode: uplineCode,
      role: 'user',
      accountType: 'free',
      joiningDate: new Date().toISOString(),
      balanceFree: 0, 
      balancePremium: 0,
      balanceDeposit: 0,
      totalWithdraw: 0,
      withdrawCount: 0,
      isBlocked: false,
      availableTypingJobIds: []
    };

    // Prepare User Data: Remove fields not in DB schema
    const { availableTypingJobIds, activePackageId, packageExpiryDate, quizUsage, ...dbUser } = newUser;

    const { error } = await supabase.from('users').insert([dbUser]);

    if (error) {
        alert("Registration failed: " + error.message);
    } else {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(newUser));
        setCurrentUser(newUser);
        alert(`Welcome ${newUser.fullName}! Account created successfully.`);
    }
    setLoading(false);
  };

  const handleLogin = async (phone: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .eq('password', pass)
        .maybeSingle();

    setLoading(false);

    if (data) {
      if(data.isBlocked) {
          alert("Account Blocked by Admin");
          return false;
      }
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(data));
      setCurrentUser(data);
      return true;
    } else {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleProfileUpdate = async (updatedUser: UserData) => {
     // Optimistic update
     setCurrentUser(updatedUser);
     localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
     
     // Remove non-DB fields before update
     const { availableTypingJobIds, activePackageId, packageExpiryDate, quizUsage, ...dbUpdate } = updatedUser;

     await supabase.from('users').update(dbUpdate).eq('id', updatedUser.id);
  };

  // Routing Logic
  if (currentView === 'landing') return <LandingPage onNavigate={(page) => setCurrentView(page)} />;
  
  if (currentView === 'login') return (
     <Auth 
        mode="login" 
        onLogin={handleLogin} 
        onRegister={() => setCurrentView('register')}
        onBack={() => setCurrentView('landing')}
        loading={loading}
     />
  );

  if (currentView === 'register') return (
     <Auth 
        mode="register" 
        onRegister={handleRegister} 
        onLogin={() => setCurrentView('login')}
        onBack={() => setCurrentView('login')} 
        loading={loading}
     />
  );

  if (currentView === 'admin_panel' && currentUser) return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  if (currentView === 'user_panel' && currentUser) return <UserPanel user={currentUser} onLogout={handleLogout} onUpdateUser={handleProfileUpdate} />;

  return <LandingPage onNavigate={(page) => setCurrentView(page)} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
