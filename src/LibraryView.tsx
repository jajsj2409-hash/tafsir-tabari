/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, BookOpen, Trash2, FileUp, Loader2 } from 'lucide-react';
import { Book } from './types';
import { saveBook, deleteBook } from './storage';

interface Props {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onBooksRefresh: () => void;
  isAdmin: boolean;
}

export default function LibraryView({ books, onOpenBook, onBooksRefresh, isAdmin }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      const newBook: Book = {
        id: crypto.randomUUID(),
        title: file.name.replace('.pdf', ''),
        author: 'غير معروف',
        fileBlob: file,
        addedAt: Date.now(),
        lastReadPage: 1,
        totalPages: 0,
      };
      await saveBook(newBook);
      onBooksRefresh();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا الكتاب؟')) {
      await deleteBook(id);
      onBooksRefresh();
    }
  };

  return (
    <div className="p-6 pb-20" dir="rtl">
      {/* Welcome Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="welcome-card glass p-8 rounded-[32px] text-center mb-10 ios-shadow relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
        <BookOpen className="mx-auto mb-4 text-blue-500 animate-float" size={50} />
        <h3 className="text-xl font-bold font-serif mb-2">مرحباً بك في مختصر تفسير الطبري</h3>
        <p className="text-xs opacity-60 font-medium">جامع البيان عن تأويل آي القرآن - إعداد الشيخ محمد أبو كرات</p>
      </motion.div>

      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-lg font-bold font-sans flex items-center gap-2">
          الكتب المتاحة
          <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] opacity-40 font-black">{books.length}</span>
        </h3>
        
        {isAdmin && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 text-sm font-bold"
          >
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            <span>إضافة كتاب جديد</span>
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf" 
          onChange={handleFileUpload} 
        />
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-[40px] border-dashed border-2 border-white/5 opacity-40 mx-2">
          <BookOpen size={48} className="mb-4" />
          <p className="text-sm font-bold">لا توجد كتب متاحة حالياً</p>
          <p className="text-[10px] uppercase font-bold mt-1">سيتم التحديث قريباً من قبل الإدارة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-2">
          {books.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ y: -8 }}
              onClick={() => onOpenBook(book)}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4.2] glass rounded-[32px] overflow-hidden mb-4 border-white/5 shadow-lg shadow-black/20 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all p-4 flex flex-col items-center justify-between text-center relative">
                <div className="w-10 h-1 bg-blue-500/30 rounded-full mb-2" />
                <BookIcon size={40} className="text-blue-500/20 mb-4" />
                <h4 className="text-sm font-serif font-bold line-clamp-3 leading-relaxed">{book.title}</h4>
                <div className="text-[10px] font-bold opacity-40 uppercase mt-auto">تفسير • PDF</div>
                
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(e, book.id)}
                    className="absolute top-4 left-4 p-2 bg-red-500/20 hover:bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
