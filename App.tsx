
import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { User, Budget, Expense } from './types';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = db.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsReady(true);
  }, []);

  const handleLogin = (username: string) => {
    const newUser = db.register(username);
    setUser(newUser);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FreedomTrack</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm hidden sm:inline">Hi, <span className="font-semibold">{user.username}</span></span>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!user ? (
          <div className="max-w-md mx-auto mt-12">
            <AuthForm onLogin={handleLogin} />
          </div>
        ) : (
          <Dashboard user={user} />
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 bg-white mt-auto">
        &copy; {new Date().getFullYear()} FreedomTrack MVP. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;
