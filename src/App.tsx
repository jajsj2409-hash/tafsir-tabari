/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Book as BookIcon, Quote as QuoteIcon, 
  Settings as SettingsIcon, Sun, Moon, Cloud, 
  ChevronRight, PlusCircle, Smartphone
} from 'lucide-react';
import { Theme, ArabicFont, Book, QuoteSettings } from './types';
import LibraryView from './LibraryView';
import ReaderView from './ReaderView';
import SettingsView from './SettingsView';
import { getBooks, getQuotes } from './storage';

export default function App() {
  const [activeView, setActiveView] = useState<'library' | 'reader' | 'settings'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [font, setFont] = useState<ArabicFont>('Amiri');
  const [fontSize, setFontSize] = useState(20);
  const [books, setBooks] = useState<Book[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [quoteSettings, setQuoteSettings] = useState<QuoteSettings>({
    enabled: true,
    intervalMinutes: 30
  });

  const handleTitleClick = () => {
    if (isAdmin) return;
    const newCount = adminClicks + 1;
    if (newCount === 5) {
      const pass = prompt('أدخل كلمة مرور لوحة التحكم:');
      if (pass === 'admin123') {
        setIsAdmin(true);
        alert('تم تفعيل وضع الإدارة بنجاح ✅');
      }
      setAdminClicks(0);
    } else {
      setAdminClicks(newCount);
      // Reset clicks if no activity for 2 seconds
      setTimeout(() => setAdminClicks(0), 2000);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const refreshBooks = async () => {
    const loaded = await getBooks();
    setBooks(loaded);
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    setActiveView('reader');
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[300px] z-50 glass border-l bg-black/20 p-8 flex flex-col shadow-2xl"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-2xl font-black font-sans bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">الإعدادات</h1>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-3">
                <NavItem 
                  icon={<BookIcon size={18} />} 
                  label="المكتبة الرئيسية" 
                  active={activeView === 'library'} 
                  onClick={() => { setActiveView('library'); setSidebarOpen(false); }}
                />
                <NavItem 
                  icon={<SettingsIcon size={18} />} 
                  label="تخصيص المظهر" 
                  active={activeView === 'settings'} 
                  onClick={() => { setActiveView('settings'); setSidebarOpen(false); }}
                />
              </nav>

              <div className="mt-auto space-y-6 pt-8 border-t border-white/5">
                <div className="flex items-center justify-around bg-black/40 p-1.5 rounded-2xl glass">
                  <ThemeToggle icon={<Sun size={18} />} active={theme === 'light'} onClick={() => setTheme('light')} />
                  <ThemeToggle icon={<Moon size={18} />} active={theme === 'dark'} onClick={() => setTheme('dark')} />
                  <ThemeToggle icon={<Cloud size={18} />} active={theme === 'sunset'} onClick={() => setTheme('sunset')} />
                </div>
                <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-widest">مكتبتي الزجاجية v1.0</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        {/* iOS Style Status Bar */}
        <div className="flex justify-between items-center px-8 pt-2 pb-1 text-[11px] font-bold opacity-60 z-50" dir="rtl">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            <span>{currentTime}</span>
            {!isOnline && <span className="text-[9px] text-red-500 mr-2">بدون إنترنت</span>}
          </div>
          <div className="flex gap-2 items-center">
            <Smartphone size={12} />
            <div className="w-5 h-2.5 border border-current rounded-sm relative">
              <div className="absolute inset-px bg-current rounded-[1px] w-3/4" />
            </div>
          </div>
        </div>

        {/* Dynamic Header */}
        <header className="px-6 py-4 flex items-center justify-between z-30" dir="rtl">
          <div 
            className="flex flex-col cursor-pointer active:opacity-70 transition-opacity"
            onClick={handleTitleClick}
          >
            <h2 className="text-2xl font-black font-sans leading-none">
              {activeView === 'library' && 'مختصر تفسير الطبري'}
              {activeView === 'reader' && 'القراءة'}
              {activeView === 'settings' && 'ضبط المظهر'}
            </h2>
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500/80 mt-1">من إنتاج "الشيخ محمد أبو كرات"</span>
          </div>

          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-white/5 hover:bg-white/10 glass rounded-2xl transition-all shadow-lg active:scale-90"
          >
            <Menu size={22} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {activeView === 'library' && (
                <LibraryView books={books} onOpenBook={handleOpenBook} onBooksRefresh={refreshBooks} isAdmin={isAdmin} />
              )}
              {activeView === 'reader' && selectedBook && (
                <ReaderView 
                  book={selectedBook} 
                  font={font} 
                  fontSize={fontSize} 
                  theme={theme}
                  onBack={() => setActiveView('library')}
                />
              )}
              {activeView === 'settings' && (
                <SettingsView 
                  theme={theme} 
                  setTheme={setTheme}
                  font={font}
                  setFont={setFont}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  quoteSettings={quoteSettings}
                  setQuoteSettings={setQuoteSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <QuoteNotification settings={quoteSettings} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
      }`}
    >
      <span className={active ? 'text-blue-400' : 'text-zinc-400'}>{icon}</span>
      <span className={`text-sm ${active ? 'font-bold' : 'font-normal'}`}>{label}</span>
      {active && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
    </button>
  );
}

function ThemeToggle({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all ${active ? 'bg-white/10 text-blue-400 scale-110 shadow-lg' : 'text-zinc-500'}`}
    >
      {icon}
    </button>
  );
}

function QuoteNotification({ settings }: { settings: QuoteSettings }) {
  const [visible, setVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>('');

  useEffect(() => {
    if (!settings.enabled) return;

    const showRandomQuote = async () => {
      const savedQuotes = await getQuotes();
      const defaultQuotes = [
        "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ",
        "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        "إِنَّ مَعَ الْعُسْرِ يُسْرًا"
      ];
      
      const allQuotes = savedQuotes.length > 0 
        ? savedQuotes.map(q => q.text) 
        : defaultQuotes;

      const random = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setCurrentQuote(random);
      setVisible(true);
      setTimeout(() => setVisible(false), 8000);
    };

    // Initial delay then repeat
    const interval = setInterval(showRandomQuote, settings.intervalMinutes * 60000);
    
    // Show one soon after start if enabled
    const initialShow = setTimeout(showRandomQuote, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialShow);
    };
  }, [settings]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: -20, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 glass bg-black/60 rounded-3xl border border-white/20 shadow-2xl max-w-[90%] text-center"
          dir="rtl"
        >
          <div className="flex flex-col items-center gap-2">
            <QuoteIcon size={16} className="text-blue-400" />
            <p className="font-serif text-lg leading-relaxed">{currentQuote}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
