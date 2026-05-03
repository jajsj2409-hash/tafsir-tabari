/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { get, set, del, keys } from 'idb-keyval';
import { Book, Bookmark, Quote } from './types';

const BOOKS_KEY = 'reader_books';
const BOOKMARKS_KEY = 'reader_bookmarks';
const QUOTES_KEY = 'reader_quotes';

export async function saveBook(book: Book): Promise<void> {
  const currentBooks = (await get<Book[]>(BOOKS_KEY)) || [];
  await set(BOOKS_KEY, [...currentBooks, book]);
}

export async function getBooks(): Promise<Book[]> {
  return (await get<Book[]>(BOOKS_KEY)) || [];
}

export async function updateBook(updatedBook: Book): Promise<void> {
  const currentBooks = (await get<Book[]>(BOOKS_KEY)) || [];
  const nextBooks = currentBooks.map(b => b.id === updatedBook.id ? updatedBook : b);
  await set(BOOKS_KEY, nextBooks);
}

export async function deleteBook(id: string): Promise<void> {
  const currentBooks = (await get<Book[]>(BOOKS_KEY)) || [];
  await set(BOOKS_KEY, currentBooks.filter(b => b.id !== id));
}

// Bookmarks
export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  const all = (await get<Bookmark[]>(BOOKMARKS_KEY)) || [];
  await set(BOOKMARKS_KEY, [...all, bookmark]);
}

export async function getBookmarks(bookId: string): Promise<Bookmark[]> {
  const all = (await get<Bookmark[]>(BOOKMARKS_KEY)) || [];
  return all.filter(b => b.bookId === bookId);
}

// Quotes
export async function saveQuote(quote: Quote): Promise<void> {
  const all = (await get<Quote[]>(QUOTES_KEY)) || [];
  await set(QUOTES_KEY, [...all, quote]);
}

export async function getQuotes(): Promise<Quote[]> {
  return (await get<Quote[]>(QUOTES_KEY)) || [];
}

export async function deleteQuote(id: string): Promise<void> {
  const all = (await get<Quote[]>(QUOTES_KEY)) || [];
  await set(QUOTES_KEY, all.filter(q => q.id !== id));
}
