/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Theme = 'dark' | 'light' | 'sunset';
export type ArabicFont = 'Amiri' | 'Tajawal' | 'Scheherazade New' | 'system';

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  label: string;
  createdAt: number;
}

export interface Quote {
  id: string;
  bookId: string;
  text: string;
  page: number;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  fileBlob: Blob;
  addedAt: number;
  lastReadPage: number;
  totalPages: number;
}

export interface QuoteSettings {
  enabled: boolean;
  intervalMinutes: number; // For notifications simulation
}
