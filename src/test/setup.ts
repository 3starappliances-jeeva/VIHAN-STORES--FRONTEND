import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@/i18n';

// jsdom lacks matchMedia / scrollTo / IntersectionObserver
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
class IO {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IO;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
