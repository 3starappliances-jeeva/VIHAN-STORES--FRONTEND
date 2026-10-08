import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';

/**
 * Regression guard for the "page jumps back to the top while scrolling" bug.
 *
 * The carousel used to advance with element.scrollIntoView(), which scrolls
 * every scrollable ancestor — including the document. Once the reader had
 * scrolled past the hero, each autoplay tick dragged the whole page back up.
 * Advancing must only ever move the rail's own scrollLeft.
 *
 * The carousel has no arrows or dots — it advances by itself — so these drive
 * the autoplay timer rather than clicking a control.
 */
describe('Hero carousel', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let elementScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    elementScrollTo = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView as unknown as Element['scrollIntoView'];
    Element.prototype.scrollTo = elementScrollTo as unknown as Element['scrollTo'];
  });

  afterEach(() => vi.useRealTimers());

  const setup = () => render(<Hero />, { wrapper: MemoryRouter });

  it('never calls scrollIntoView, which would scroll the page as well as the rail', () => {
    vi.useFakeTimers();
    setup();

    vi.advanceTimersByTime(12_000); // two autoplay ticks

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(elementScrollTo).toHaveBeenCalled();
  });

  it('advances by scrolling the rail horizontally only', () => {
    vi.useFakeTimers();
    setup();

    vi.advanceTimersByTime(6_000);
    expect(elementScrollTo).toHaveBeenCalled();

    // Every call sets `left` and leaves `top` alone — a vertical value here
    // would move the page.
    for (const [arg] of elementScrollTo.mock.calls) {
      expect(arg).toHaveProperty('left');
      expect(arg).not.toHaveProperty('top');
    }
  });

  it('does not autoplay while the hero is scrolled off screen', () => {
    // Capture the IntersectionObserver callback so we can report the hero as hidden.
    let notify: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          notify = cb;
        }
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn();
        root = null;
        rootMargin = '';
        thresholds = [];
      },
    );
    vi.useFakeTimers();
    setup();

    notify?.([{ isIntersecting: false }]);
    elementScrollTo.mockClear();
    vi.advanceTimersByTime(12_000); // two autoplay ticks

    expect(elementScrollTo).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
