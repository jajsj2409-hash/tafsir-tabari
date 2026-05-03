/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Sun, Moon, Cloud, Type, Bell, 
  ChevronRight, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Theme, ArabicFont, QuoteSettings } from './types';

interface Props {
  theme: Theme;
  setTheme: (t: Theme) => void;
  font: ArabicFont;
  setFont: (f: ArabicFont) => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  quoteSettings: QuoteSettings;
  setQuoteSettings: (s: QuoteSettings) => void;
}

export default function SettingsView({ 
  theme, setTheme, font, setFont, fontSize, setFontSize, 
  quoteSettings, setQuoteSettings 
}: Props) {
  
  const fonts: { id: ArabicFont, name: string }[] = [
    { id: 'Amiri', name: 'خط الأميري (كلاسيكي)' },
    { id: 'Tajawal', name: 'خط تجول (عصري)' },
    { id: 'Scheherazade New', name: 'خط شهرزاد (نسخ)' },
    { id: 'system', name: 'خط النظام' }
  ];

  return (
    <div className="p-6 max-w-xl mx-auto space-y-10 pb-20" dir="rtl">
      {/* Theme Section */}
      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[3px] opacity-40 px-2">مظهر التطبيق</h3>
        
        <div className="grid grid-cols-3 gap-5">
          <ThemeCard 
            label="مشرق" 
            active={theme === 'light'} 
            onClick={() => setTheme('light')}
            icon={<Sun size={22} />}
            colors="bg-white border-zinc-200 text-zinc-900"
          />
          <ThemeCard 
            label="ليلي" 
            active={theme === 'dark'} 
            onClick={() => setTheme('dark')}
            icon={<Moon size={22} />}
            colors="bg-zinc-900 border-zinc-800 text-white"
          />
          <ThemeCard 
            label="غروب" 
            active={theme === 'sunset'} 
            onClick={() => setTheme('sunset')}
            icon={<Cloud size={22} />}
            colors="bg-[#1a1028] border-[#3a2a4a] text-[#f0e6d8]"
          />
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[3px] opacity-40 px-2">تخصيص الخط</h3>

        <div className="glass rounded-[32px] overflow-hidden border-white/5 divide-y divide-white/5">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f.id)}
              className="w-full px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-all active:bg-white/10"
            >
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold" style={{ fontFamily: f.id === 'system' ? 'inherit' : f.id }}>{f.name}</span>
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">عينة من النص العربي</span>
              </div>
              {font === f.id && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" />}
            </button>
          ))}
        </div>

        <div className="glass rounded-[32px] p-8 border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <span className="font-black text-xs uppercase tracking-widest opacity-60">حجم الخط</span>
            <span className="text-blue-400 font-black text-sm">{fontSize}px</span>
          </div>
          <input 
            type="range" 
            min="16" 
            max="36" 
            value={fontSize} 
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="mt-8 p-6 bg-black/20 rounded-[24px] border border-white/5">
            <p className="leading-[1.8] text-center" style={{ fontSize: `${fontSize}px`, fontFamily: font === 'system' ? 'inherit' : font }}>
              إن هذا القرآن يهدي للتي هي أقوم ويبشر المؤمنين.
            </p>
          </div>
        </div>
      </section>

      {/* Notification Control UI remains similar but with new styling */}
      <section className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[3px] opacity-40 px-2">الإشعارات الذكية</h3>
        <div className="glass rounded-[32px] p-8 border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="font-bold">تفعيل ميزة الاقتباسات</p>
              <p className="text-[11px] opacity-40 font-medium">ستتلقى اقتباسات إيمانية دورية من كتبك</p>
            </div>
            <button 
              onClick={() => setQuoteSettings({ ...quoteSettings, enabled: !quoteSettings.enabled })}
              className={`w-14 h-8 rounded-full transition-all relative ${quoteSettings.enabled ? 'bg-blue-600 shadow-[0_0_15px_#2563eb66]' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 rounded-full w-6 h-6 bg-white transition-all shadow-md ${quoteSettings.enabled ? 'right-7' : 'right-1'}`} />
            </button>
          </div>

          <div className={`space-y-6 transition-all duration-500 ${quoteSettings.enabled ? 'opacity-100' : 'opacity-20 select-none grayscale'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase opacity-60 tracking-widest">تكرار التنبيه كل</span>
              <span className="text-blue-400 font-black">
                {quoteSettings.intervalMinutes >= 60 
                  ? `${Math.floor(quoteSettings.intervalMinutes / 60)} ساعة` 
                  : `${quoteSettings.intervalMinutes} دقيقة`}
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="720"
              step="5"
              value={quoteSettings.intervalMinutes} 
              onChange={(e) => setQuoteSettings({ ...quoteSettings, intervalMinutes: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ThemeCard({ label, active, onClick, icon, colors }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-4 p-5 rounded-[32px] border-2 transition-all duration-300 ${
        active ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-2xl shadow-blue-500/20' : 'border-white/5 hover:border-white/10 bg-white/5'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${active ? 'scale-110' : ''} ${colors}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-blue-400' : 'opacity-40'}`}>{label}</span>
    </button>
  );
}
