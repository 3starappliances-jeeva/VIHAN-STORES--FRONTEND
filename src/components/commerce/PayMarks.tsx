import { cn } from '@/lib/utils';

/**
 * Payment brand marks.
 *
 * Google Pay and Paytm are the full-colour artwork the shop owner supplied;
 * the rest are paths from Simple Icons (CC0 1.0). The trademarks remain the
 * property of their owners — a merchant may show them to indicate the methods
 * it accepts, which is exactly what they are used for here. Each is shown in
 * its own official colour and never recoloured, stretched or combined.
 *
 * Every mark is decorative: the method name is always set in real text beside
 * it, so the icon is aria-hidden and nothing depends on recognising it.
 */
const marks = {
  googlepay: { title: 'Google Pay', src: '/images/pay/googlepay.png', aspect: 1 },
  phonepe: { title: 'PhonePe', color: '#5F259F', d: 'M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243 1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z' },
  paytm: { title: 'Paytm', src: '/images/pay/paytm.png', aspect: 3 },
  visa: { title: 'Visa', color: '#1A1F71', d: 'M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z' },
  mastercard: { title: 'Mastercard', color: '#EB001B', d: 'M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z' },
} as const;

export type PayMarkId = keyof typeof marks;

export const PayMark = ({ id, size = 20, className }: { id: PayMarkId; size?: number; className?: string }) => {
  const m = marks[id];
  // Full-colour artwork keeps its own palette, so it ships as an image rather
  // than a single-fill path. Same contract either way: decorative, fixed box.
  if ('src' in m) {
    // `size` is the square box the glyph marks fill. A wordmark is three times
    // wider than it is tall, and squeezing one into that box leaves an
    // unreadable sliver — so a wide mark gets a wider box instead and keeps its
    // own proportions. The 1.5 cap is what still fits the 32px tile it sits in.
    const w = Math.round(size * Math.min(m.aspect, 1.5));
    const h = Math.round(w / m.aspect);
    return (
      <img
        src={m.src}
        alt=""
        width={w}
        height={h}
        style={{ width: w, height: h }}
        className={cn('shrink-0 object-contain', className)}
        loading="lazy"
        decoding="async"
        aria-hidden
      />
    );
  }
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={m.color} className={cn('shrink-0', className)} aria-hidden focusable="false">
      <title>{m.title}</title>
      <path d={m.d} />
    </svg>
  );
};

/**
 * The UPI apps as a checkout button shows them \u2014 overlapping discs, the way a
 * stack of avatars reads.
 *
 * Each mark sits on its own white slot: Google Pay and Paytm are full-colour
 * artwork that needs a light ground, and a shared slot makes three marks with
 * different grounds read as one set. The slot is `rounded-full` with a fixed
 * height and free width, so the two square marks come out as circles while the
 * Paytm wordmark becomes a pill instead of being crushed into one.
 *
 * Decorative: Button renders `iconRight` aria-hidden, and the label carries the
 * action. Never let these stand in for naming the payment method.
 */
const upiStack = ['googlepay', 'phonepe', 'paytm'] as const;

export const UpiMarkStack = ({ size = 14, className }: { size?: number; className?: string }) => (
  <span className={cn('flex items-center', className)}>
    {upiStack.map((id, i) => (
      <span key={id} className={cn('inline-grid h-6 place-items-center rounded-full bg-white px-1 ring-1 ring-ink/10', i > 0 && '-ml-1.5')}>
        <PayMark id={id} size={size} />
      </span>
    ))}
  </span>
);
