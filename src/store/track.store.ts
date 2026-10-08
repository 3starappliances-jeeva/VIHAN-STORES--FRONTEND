import { create } from 'zustand';
import type { Order } from '@/types';

/**
 * Guest tracking: orders verified with order number + updates mobile are kept in memory
 * only — never in the URL or localStorage — so the privacy promise on the track page holds.
 */
interface TrackState {
  verified: Record<string, Order>;
  remember: (order: Order) => void;
  update: (order: Order) => void;
}

export const useTrackStore = create<TrackState>()((set) => ({
  verified: {},
  remember: (order) => set((s) => ({ verified: { ...s.verified, [order.id]: order } })),
  update: (order) => set((s) => (s.verified[order.id] ? { verified: { ...s.verified, [order.id]: order } } : s)),
}));
