import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HardDrive, 
  ShieldCheck, 
  Trash2, 
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';
import { User } from '../types';
import { 
  getStoredAccounts, 
  loginWithPin, 
  deleteStoredAccount, 
  StoredAccount 
} from '../utils/authStorage';
import { sound } from '../utils/soundEngine';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    refreshAccounts();
  }, []);

  const refreshAccounts = () => {
    const accs = getStoredAccounts();
    setSavedAccounts(accs);
  };

  const handlePinChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 1) {
      // Pasted multiple digits
      const digits = cleaned.slice(0, 4).split('');
      const newPin = [...pinDigits];
      digits.forEach((d, i) => {
        if (i < 4) newPin[i] = d;
      });
      setPinDigits(newPin);
      sound.playClick();
      const nextIndex = Math.min(digits.length, 3);
      pinRefs[nextIndex]?.current?.focus();
      return;
    }

    const newPin = [...pinDigits];
    newPin[index] = cleaned;
    setPinDigits(newPin);
    setError(null);

    if (cleaned) {
      sound.playClick();
      // Move to next input
      if (index < 3) {
        pinRefs[index + 1]?.current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      sound.playClick();
      pinRefs[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      pinRefs[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      pinRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    sound.playClick();
    if (digit === 'backspace') {
      const lastFilled = pinDigits.map((d, i) => (d ? i : -1)).filter((i) => i >= 0).pop();
      if (lastFilled !== undefined) {
        const newPin = [...pinDigits];
        newPin[lastFilled] = '';
        setPinDigits(newPin);
        pinRefs[lastFilled]?.current?.focus();
      }
      return;
    }

    const firstEmpty = pinDigits.findIndex((d) => !d);
    if (firstEmpty !== -1) {
      const newPin = [...pinDigits];
      newPin[firstEmpty] = digit;
      setPinDigits(newPin);
      setError(null);
      if (firstEmpty < 3) {
        pinRefs[firstEmpty + 1]?.current?.focus();
      }
    }
  };

  const handleQuickSelect = (acc: StoredAccount) => {
    sound.playClick();
    setName(acc.name);
    setSelectedAccountId(acc.id);
    setPinDigits(['', '', '', '']);
    setError(null);
    setTimeout(() => {
      pinRefs[0]?.current?.focus();
    }, 50);
  };

  const handle1ClickLogin = (acc: StoredAccount) => {
    sound.playSuccess();
    setName(acc.name);
    const pin = acc.pin || '1234';
    setPinDigits(pin.split(''));
    setIsLoading(true);
    setTimeout(() => {
      const result = loginWithPin(acc.name, pin);
      setIsLoading(false);
      if (result.success && result.user) {
        onLogin(result.user);
      }
    }, 300);
  };

  const handleDeleteAccount = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sound.playPop();
    deleteStoredAccount(id);
    refreshAccounts();
    if (selectedAccountId === id) {
      setSelectedAccountId(null);
      setName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pinDigits.join('');

    if (!name.trim()) {
      setError('Please enter your name');
      sound.playPop();
      return;
    }

    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits of your PIN');
      sound.playPop();
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginWithPin(name.trim(), fullPin);
      setIsLoading(false);

      if (result.success && result.user) {
        sound.playSuccess();
        onLogin(result.user);
      } else {
        sound.playPop();
        setError(result.error || 'Failed to sign in. Please verify your PIN.');
      }
    }, 250);
  };

  const fullPinEntered = pinDigits.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20">
            <Radio className="h-7 w-7 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Pulse Social
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                <HardDrive className="h-2.5 w-2.5" />
                Local Store
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Sign in with your Name & 4-Digit Security PIN
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/60 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Your Name / Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
              {name.trim() && (
                <p className="text-[11px] text-neutral-500 pl-1">
                  Profile handle will be:{' '}
                  <span className="text-indigo-400 font-medium">
                    @{name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}
                  </span>
                </p>
              )}
            </div>

            {/* 4-Digit PIN */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-300">
                  4-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {showPin ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Hide PIN</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Show PIN</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4 Pin Boxes */}
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={pinDigits[index]}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 text-center text-xl font-bold text-white shadow-inner focus:border-indigo-500 focus:bg-indigo-950/20 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-all"
                    placeholder="•"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5 px-0.5">
                <span>Enter 4 numbers (0–9)</span>
                <span className="flex items-center gap-1 text-emerald-400/90">
                  <ShieldCheck className="h-3 w-3" />
                  Local store protected
                </span>
              </div>
            </div>

            {/* Tactile On-Screen Numeric Keypad for fast entry */}
            <div className="pt-1">
              <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-neutral-950/50 border border-neutral-800/60">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-10 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-sm font-semibold text-neutral-200 active:scale-95 transition-all"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setPinDigits(['', '', '', '']);
                    pinRefs[0]?.current?.focus();
                  }}
                  className="h-10 rounded-xl bg-neutral-900/40 hover:bg-neutral-800/60 text-xs font-medium text-neutral-400 active:scale-95 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-10 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-sm font-semibold text-neutral-200 active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-10 rounded-xl bg-neutral-900/40 hover:bg-neutral-800/60 text-xs font-medium text-neutral-400 active:scale-95 transition-all"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className={`w-full rounded-xl py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                fullPinEntered && name.trim()
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-indigo-600/30 hover:opacity-95 active:scale-[0.99]'
                  : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50'
              }`}
            >
              {isLoading ? (
                <span>Accessing Local Store...</span>
              ) : (
                <>
                  <span>Sign In to Pulse</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Saved Accounts in Local Store */}
          {savedAccounts.length > 0 && (
            <div className="pt-2 border-t border-neutral-800/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">
                  Saved on this Device ({savedAccounts.length})
                </span>
                <span className="text-[10px] text-neutral-500">Local Store</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {savedAccounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleQuickSelect(acc)}
                      className={`group flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-indigo-500/60 bg-indigo-950/30'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 hover:bg-neutral-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.name}
                            className="h-8 w-8 rounded-lg object-cover ring-1 ring-neutral-800 shrink-0"
                          />
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${acc.avatarGradient} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
                          >
                            {acc.avatarInitials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-neutral-200 truncate group-hover:text-white">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate">
                            {acc.handle} · PIN: {acc.pin}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handle1ClickLogin(acc);
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[10px] font-semibold transition-colors"
                        >
                          Quick In
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAccount(e, acc.id)}
                          title="Remove from device"
                          className="p-1 text-neutral-600 hover:text-rose-400 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights Footer */}
        <div className="text-center text-[11px] text-neutral-500 space-y-1">
          <p>
            🔒 Account sessions and profiles are managed locally in your browser storage.
          </p>
          <p>
            Tip: You can use any name and 4-digit PIN, or click any saved account above.
          </p>
        </div>
      </div>
    </div>
  );
};
