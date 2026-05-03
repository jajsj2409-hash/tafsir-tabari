/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Bookmark, 
  Quote, ZoomIn, ZoomOut, Search, List
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Book, ArabicFont, Theme, Bookmark as BookmarkType } from './types';
import { saveBookmark, getBookmarks, saveQuote, updateBook } from './storage';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  book: Book;
  font: ArabicFont;
  fontSize: number;
  theme: Theme;
  onBack: () => void;
}

export default function ReaderView({ book, font, fontSize, theme, onBack }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(book.lastReadPage || 1);
  const [scale, setScale] = useState(1.0);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(book.fileBlob);
    setPdfUrl(url);
    loadBookmarks();
    return () => URL.revokeObjectURL(url);
  }, [book]);

  const loadBookmarks = async () => {
    const b = await getBookmarks(book.id);
    setBookmarks(b);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    updateBook({ ...book, totalPages: numPages });
  };

  const changePage = (offset: number) => {
    const next = Math.min(Math.max(1, pageNumber + offset), numPages);
    setPageNumber(next);
    updateBook({ ...book, lastReadPage: next });
  };

  const handleAddBookmark = async () => {
    const newB: BookmarkType = {
      id: crypto.randomUUID(),
      bookId: book.id,
      page: pageNumber,
      label: `صفحة ${pageNumber}`,
      createdAt: Date.now()
    };
    await saveBookmark(newB);
    loadBookmarks();
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const handleSaveQuote = async () => {
    if (!selectedText) return;
    await saveQuote({
      id: crypto.randomUUID(),
      bookId: book.id,
      text: selectedText,
      page: pageNumber,
      createdAt: Date.now()
    });
    setSelectedText('');
    alert('تم حفظ الاقتباس بنجاح');
  };

  return (
    <div className="h-full flex flex-col relative bg-transparent" dir="rtl">
      {/* Immersive Reader Container */}
      <div 
        className="flex-1 overflow-auto flex justify-center p-4 md:p-8"
        onClick={() => setShowControls(!showControls)}
        onMouseUp={handleSelection}
      >
        <div className="max-w-4xl w-full flex flex-col items-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center gap-4 py-20">
                <Loader />
                <p>جاري تحميل الكتاب...</p>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              className="shadow-2xl rounded-sm overflow-hidden"
              customTextRenderer={({ str }) => {
                // Apply custom fonts to text layer if possible (experimental)
                return str;
              }}
            />
          </Document>
        </div>
      </div>

      {/* Floating Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-40"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass bg-black/50 p-5 rounded-[40px] border border-white/10 flex items-center justify-between ios-shadow">
              <div className="flex items-center gap-1.5">
                <ControlButton 
                  onClick={onBack} 
                  icon={<ArrowRight size={20} />} 
                />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <div className="flex items-center bg-white/5 rounded-2xl p-1">
                  <ControlButton 
                    onClick={() => setScale(s => Math.max(0.5, s - 0.1))} 
                    icon={<ZoomOut size={16} />} 
                  />
                  <ControlButton 
                    onClick={() => setScale(s => Math.min(2.5, s + 0.1))} 
                    icon={<ZoomIn size={16} />} 
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1 mx-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-20 active:scale-90 transition-all font-bold"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <span className="text-[13px] font-black w-24 text-center tracking-tighter">صفحة {pageNumber} / {numPages}</span>

                  <button 
                    onClick={() => changePage(1)}
                    disabled={pageNumber >= numPages}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-20 active:scale-90 transition-all font-bold"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
                <div className="w-full max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(pageNumber / numPages) * 100}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <ControlButton 
                  active={bookmarks.some(b => b.page === pageNumber)}
                  onClick={handleAddBookmark} 
                  icon={<Bookmark size={18} />} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Prompt */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 glass bg-blue-600 p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-blue-400"
          >
            <p className="text-white font-bold text-sm">حفظ كإقتباس؟</p>
            <button 
              onClick={handleSaveQuote}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-90"
            >
              حفظ الآن
            </button>
            <button onClick={() => setSelectedText('')} className="p-2 text-white/60">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ControlButton({ icon, label, onClick, active }: { icon: any, label?: string, onClick: () => void, active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-white/10 text-zinc-300'
      }`}
    >
      {icon}
      {label && <span className="text-xs font-bold">{label}</span>}
    </button>
  );
}

function Loader() {
  return (
    <div className="flex space-x-2 justify-center items-center">
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
