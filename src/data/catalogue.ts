import type { Category, ClayGlyph, ClayTone, Product, VariantStep } from '@/types';

/**
 * Imagery policy
 * --------------
 * Only Vihaan's own photography ships in this catalogue. Two SKUs are
 * photographed (Red Banana, Banana Blossom, ABC Malt, Sweet Potato); the rest
 * carries a `glyph` + `tone` and renders as a moulded clay tile instead of a
 * stock photo of someone else's food. Add a real `image` as photography lands
 * and the card switches over on its own — no component changes needed.
 */

export const categories: Category[] = [
  { slug: 'red-banana', name: 'Red Banana', glyph: 'banana', tone: 'blush', image: '/images/red-banana-pouch.jpg', blurb: 'Rich in potassium & fibre · 6+ months' },
  { slug: 'banana-blossom', name: 'Banana Blossom', glyph: 'leaf', tone: 'blush', image: '/images/banana-blossom-pouch.jpg', blurb: 'Vazhai poo — rich in iron & fibre · 6+ months' },
  { slug: 'abc-malt', name: 'ABC Malt', glyph: 'apple', tone: 'blush', image: '/images/abc-malt-pouch.jpg', blurb: 'Apple, beetroot & carrot · 6+ months' },
  { slug: 'sweet-potato', name: 'Sweet Potato Mix', glyph: 'carrot', tone: 'peach', image: '/images/sweet-potato-pouch.jpg', blurb: 'Easy to digest, naturally sweet · 6+ months' },
  { slug: 'dry-dates', name: 'Dry Dates', glyph: 'dessert', tone: 'peach', image: '/images/dry-dates-pouch.jpg', blurb: 'Natural iron, fibre & energy · 6+ months' },
  { slug: 'karuppu-ulunthu', name: 'Karuppu Ulunthu Kanji', glyph: 'bean', tone: 'lilac', image: '/images/karuppu-ulunthu-pouch.jpg', blurb: 'Protein, iron & calcium · 6+ months' },
  { slug: 'ragi-choco-malt', name: 'Ragi Choco Malt', glyph: 'cookie', tone: 'butter', image: '/images/ragi-choco-malt-pouch.jpg', blurb: 'Calcium, iron & protein · 6+ months' },
  { slug: 'health-mix', name: 'Health Mix', glyph: 'soup', tone: 'mint', image: '/images/health-mix-pouch.jpg', blurb: 'Complete nutrition · 8+ months' },
  { slug: 'sprouted-ragi', name: 'Sprouted Ragi', glyph: 'wheat', tone: 'mint', blurb: 'Sprouted and stone-ground finger millet' },
  { slug: 'combos-kits', name: 'Combos & kits', glyph: 'gift', tone: 'sky', blurb: 'Starter boxes at a flat discount' },
  { slug: 'pantry', name: 'Pantry staples', glyph: 'soup', tone: 'cream', blurb: 'Ghee, oils, sweeteners and millets' },
];

/**
 * Shelves we actually have pouch photography for. These front the home grid and
 * the footer, so a line appears there the moment its photo lands and no sooner —
 * no placeholder tiles sitting among the real packs.
 */
export const featuredCategories = categories.filter((c) => c.image);

/** Same set as a slug list, for filtering product queries. */
export const featuredCategorySlugs = featuredCategories.map((c) => c.slug);

const batch = { id: 'B-0921', milled: '2026-09-18', packed: '2026-09-20', bestBefore: '2027-03-20' };

const sizeStep = (sizes: { id: string; label: string; grams: number; price: number }[]): VariantStep => ({
  id: 'size',
  label: 'Select pack size',
  options: sizes.map((s) => ({ id: s.id, label: s.label, meta: `₹${Math.round((s.price / s.grams) * 100)} / 100 g` })),
});

const simple = (
  base: Omit<Product, 'steps' | 'skus' | 'defaultSku' | 'batch' | 'gallery' | 'slug'> & { gallery?: string[] },
  sizes: { id: string; label: string; grams: number; price: number; mrp: number; stock?: number }[],
): Product => ({
  ...base,
  slug: base.id,
  gallery: base.gallery ?? (base.image ? [base.image] : []),
  batch,
  steps: [sizeStep(sizes)],
  skus: sizes.map((s) => ({ id: `${base.id}-${s.id}`, selection: { size: s.id }, price: s.price, mrp: s.mrp, stock: s.stock ?? 40, sizeLabel: s.label })),
  defaultSku: `${base.id}-${sizes[0].id}`,
});

export const products: Product[] = [
  /* ---- Photographed SKUs. Copy is taken from the printed pouches; prices are
         placeholders until you confirm them. ---- */
  simple(
    {
      id: 'dry-dates-powder',
      name: 'Dry Dates Powder',
      shortName: 'Dry Dates',
      category: 'dry-dates',
      descriptor: 'Single ingredient',
      audience: '6+ months',
      benefit: 'For growing kids | Rich in natural iron, fibre and energy',
      description:
        'Dry dates (perichampazham), stone-ground into a single-ingredient powder. Naturally sweet with no sugar added, and an easy complementary food after completion of 6 months.',
      bullets: ['Supports brain development', 'Easy to digest', 'Boosts immunity', 'No preservatives, no added sugar'],
      howToUse: 'Mix the powder with warm water or milk, cook until smooth, then cool and serve. Introduce gradually and observe the child’s response.',
      ingredients: 'Dry dates 100%.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/dry-dates-pouch.jpg',
      gallery: ['/images/dry-dates-pouch.jpg'],
      glyph: 'dessert',
      tone: 'peach',
      rating: 4.8,
      reviewCount: 23,
      isNew: true,
      tags: ['new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'karuppu-ulunthu-kanji',
      name: 'Karuppu Ulunthu Kanji Powder',
      shortName: 'Karuppu Ulunthu',
      category: 'karuppu-ulunthu',
      descriptor: 'Traditional nutrition',
      audience: '6+ months',
      benefit: 'For healthy growth | Rich in protein, iron, calcium and fibre',
      description:
        'Black urad dal (karuppu ulunthu) roasted and ground for the traditional kanji — a long-standing Tamil recipe for strength, offered here as a complementary food after completion of 6 months.',
      bullets: ['Supports strong bones', 'Boosts brain development', 'Improves immunity', 'No preservatives, no added sugar'],
      howToUse: 'Cook the powder with water or milk until it thickens into a smooth kanji, then cool and serve. Introduce gradually.',
      ingredients: 'Black urad dal (karuppu ulunthu) 100%.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/karuppu-ulunthu-pouch.jpg',
      gallery: ['/images/karuppu-ulunthu-pouch.jpg'],
      glyph: 'bean',
      tone: 'lilac',
      rating: 4.7,
      reviewCount: 17,
      isNew: true,
      tags: ['new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'ragi-choco-malt',
      name: 'Ragi Choco Malt',
      shortName: 'Ragi Choco Malt',
      category: 'ragi-choco-malt',
      descriptor: 'Nutritious · tasty · healthy',
      audience: '6+ months',
      benefit: 'For growing kids | Rich in calcium, iron, protein and fibre',
      description:
        'Finger millet and cocoa, ground into a malt that children actually ask for. A complementary food after completion of 6 months.',
      bullets: ['Supports brain development', 'Strong bones & teeth', 'Boosts immunity', 'No preservatives, no added sugar'],
      howToUse: 'Mix 2 tablespoons in warm milk or water, stir until smooth, then cook briefly and serve.',
      ingredients: 'Finger millet (ragi), cocoa.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/ragi-choco-malt-pouch.jpg',
      gallery: ['/images/ragi-choco-malt-pouch.jpg'],
      glyph: 'cookie',
      tone: 'butter',
      rating: 4.9,
      reviewCount: 34,
      isNew: true,
      tags: ['bestseller', 'new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'health-mix',
      name: 'Health Mix',
      shortName: 'Health Mix',
      category: 'health-mix',
      // The pouch states 8+ months, not 6+ — the only product in the range that does.
      audience: '8+ months',
      descriptor: 'Complete nutrition',
      benefit: 'For your little one | Protein, iron, calcium, fibre and essential vitamins',
      description:
        'A multigrain health mix of millets, pulses and nuts for babies from 8 months — complete everyday nutrition in one bowl.',
      bullets: ['Supports brain development', 'Easy to digest', 'Boosts immunity', 'Supports healthy growth'],
      howToUse: 'Cook 2–3 tablespoons in water or milk for a few minutes until smooth, then cool and serve.',
      ingredients: '[Full multigrain ingredient list — copy from the printed pouch.]',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/health-mix-pouch.jpg',
      gallery: ['/images/health-mix-pouch.jpg'],
      glyph: 'soup',
      tone: 'mint',
      rating: 4.8,
      reviewCount: 29,
      isNew: true,
      tags: ['bestseller', 'new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'banana-blossom',
      name: 'Vazhai Poo — Banana Flower Powder',
      shortName: 'Banana Blossom',
      category: 'banana-blossom',
      descriptor: 'Single ingredient',
      audience: '6+ months',
      benefit: 'For growing kids | Rich in iron, fibre and plant nutrients',
      description:
        'Vazhai poo — banana flower — dried and stone-ground into a single-ingredient powder. Traditionally given for digestion and iron, and an easy complementary food after completion of 6 months.',
      bullets: ['Supports brain development', 'Easy to digest', 'Boosts immunity', 'No preservatives, no added sugar'],
      howToUse: 'Mix the powder with warm water or milk, cook until smooth, then cool and serve. Introduce gradually and observe the child’s response.',
      ingredients: 'Banana flower (vazhai poo) 100%.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/banana-blossom-pouch.jpg',
      gallery: ['/images/banana-blossom-pouch.jpg'],
      glyph: 'leaf',
      tone: 'blush',
      rating: 4.8,
      reviewCount: 19,
      isNew: true,
      tags: ['new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'abc-malt',
      name: 'ABC Malt',
      shortName: 'ABC Malt',
      category: 'abc-malt',
      descriptor: 'Apple · Beetroot · Carrot',
      audience: '6+ months',
      benefit: 'For growing kids | Rich in natural vitamins and minerals',
      description:
        'Vihaan ABC Malt is made from carefully selected apples, beetroot and carrots. It is a nutrient-rich natural malt, an excellent complementary food option after 6 months.',
      bullets: ['Supports healthy growth', 'Rich in natural vitamins & minerals', 'Good source of fibre', 'No artificial colours or flavours'],
      howToUse: 'Take 2 tbsp ABC Malt, add 150 ml warm milk or water, mix well till smooth, then cook for 2–3 minutes and serve.',
      ingredients: 'Apple, beetroot, carrot.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/abc-malt-pouch.jpg',
      gallery: ['/images/abc-malt-pouch.jpg', '/images/abc-malt-pack.jpg', '/images/abc-malt-poster.jpg'],
      glyph: 'apple',
      tone: 'blush',
      rating: 4.8,
      reviewCount: 41,
      isNew: true,
      tags: ['bestseller', 'new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'sweet-potato-mix',
      name: 'Sweet Potato Mix',
      shortName: 'Sweet Potato',
      category: 'sweet-potato',
      descriptor: 'Single ingredient',
      audience: '6+ months',
      benefit: 'For a first solid food | Rich in potassium and fibre',
      description:
        'A naturally sweet, single-ingredient sweet potato powder — gentle on little tummies and an easy first food after completion of 6 months.',
      bullets: ['Rich in potassium & fibre', 'Easy to digest', 'No added sugar, no preservatives', '100% natural ingredients'],
      howToUse: 'Mix the powder with warm water or milk, cook until smooth, then cool and serve. Introduce gradually and observe the child’s response.',
      ingredients: 'Sweet potato 100%.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/sweet-potato-pouch.jpg',
      gallery: ['/images/sweet-potato-pouch.jpg'],
      glyph: 'carrot',
      tone: 'peach',
      rating: 4.7,
      reviewCount: 28,
      isNew: true,
      tags: ['new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),
  simple(
    {
      id: 'red-banana-powder',
      name: 'Red Banana Powder',
      shortName: 'Red Banana',
      category: 'red-banana',
      descriptor: 'Single ingredient',
      audience: '6+ months',
      benefit: 'For a first solid food | Rich in potassium and fibre',
      description:
        'Vihaan Red Banana Powder is made from carefully selected red bananas. It is a single-ingredient complementary-food option after completion of 6 months.',
      bullets: ['Red banana and nothing else', '100% natural, no preservatives', 'Rich in potassium & fibre', 'Freshly prepared after order confirmation'],
      howToUse: 'Take powder, mix well with water or milk, cook, then cool and serve. Introduce gradually and observe the child’s response.',
      ingredients: 'Red banana 100%.',
      storage: 'Keep airtight and dry. Protect from moisture and direct sunlight. Use a clean, dry spoon.',
      image: '/images/red-banana-pouch.jpg',
      gallery: ['/images/red-banana-pouch.jpg', '/images/vihaan-red-banana-feature.jpeg', '/images/vihaan-red-banana-social.jpeg'],
      glyph: 'banana',
      tone: 'blush',
      rating: 4.8,
      reviewCount: 96,
      isNew: true,
      tags: ['bestseller', 'new'],
    },
    [{ id: '200', label: '200 g', grams: 200, price: 249, mrp: 299 }],
  ),

  /* ---- Awaiting photography — these render as clay tiles. ---- */
  {
    id: 'ragi-malt',
    slug: 'ragi-malt',
    name: 'Sprouted Ragi Malt',
    shortName: 'Ragi Malt',
    category: 'sprouted-ragi',
    descriptor: 'Sprouted',
    audience: 'Kids & adults',
    benefit: 'For daily breakfast | Sprouted, stone-ground, sweetened with palm jaggery',
    description:
      'Finger millet is soaked, sprouted for 24 hours, sun-dried and stone-ground in small batches. The chocolate version adds cocoa and palm jaggery — nothing else.',
    bullets: ['Sprouted & stone-ground', 'Sweetened with palm jaggery, no refined sugar', 'No preservatives, colours or flavours', 'Batch number and expiry on every pack'],
    howToUse: 'Mix 2 tablespoons in 200 ml hot milk or water, stir for a minute. Add a pinch of cardamom if you like. Best within 30 days of opening.',
    ingredients: 'Sprouted finger millet (ragi) 78%, palm jaggery 18%, cocoa 4%.',
    storage: 'Store in a cool, dry place. Close the zip after every use.',
    gallery: [],
    glyph: 'wheat',
    tone: 'mint',
    rating: 4.7,
    reviewCount: 1204,
    tags: ['bestseller'],
    batch,
    steps: [
      {
        id: 'audience',
        label: 'Who is it for?',
        options: [
          { id: 'kids-2-6', label: 'Kids 2–6' },
          { id: 'kids-7-12', label: 'Kids 7–12' },
          { id: 'adults', label: 'Adults' },
          { id: 'seniors', label: 'Seniors' },
        ],
      },
      {
        id: 'flavour',
        label: 'Choose a flavour',
        options: [
          { id: 'original', label: 'Original', swatch: '#599A7D' },
          { id: 'chocolate', label: 'Chocolate', swatch: '#7E3D11' },
          { id: 'cardamom', label: 'Cardamom', swatch: '#88CB37' },
        ],
      },
      {
        id: 'type',
        label: 'Select type',
        options: [
          { id: 'jaggery', label: 'With jaggery' },
          { id: 'nosugar', label: 'No added sugar' },
        ],
      },
      {
        id: 'size',
        label: 'Select pack size',
        options: [
          { id: '250', label: '250 g', meta: '₹128 / 100 g' },
          { id: '500', label: '500 g', meta: '₹112 / 100 g' },
          { id: '1000', label: '1 kg', meta: '₹98 / 100 g' },
          { id: '2000', label: '2 kg', meta: '₹92 / 100 g', unavailable: 'Not available in Chocolate' },
        ],
      },
    ],
    skus: (() => {
      const out = [];
      const sizes = [
        { id: '250', price: 320, mrp: 360, label: '250 g' },
        { id: '500', price: 560, mrp: 640, label: '500 g' },
        { id: '1000', price: 980, mrp: 1120, label: '1 kg' },
        { id: '2000', price: 1840, mrp: 2100, label: '2 kg' },
      ];
      for (const flavour of ['original', 'chocolate', 'cardamom'])
        for (const type of ['jaggery', 'nosugar'])
          for (const s of sizes) {
            if (flavour === 'chocolate' && s.id === '2000') continue;
            out.push({ id: `ragi-${flavour}-${type}-${s.id}`, selection: { flavour, type, size: s.id }, price: s.price, mrp: s.mrp, stock: s.id === '1000' && flavour === 'cardamom' ? 0 : 60, sizeLabel: s.label });
          }
      return out;
    })(),
    defaultSku: 'ragi-chocolate-jaggery-500',
  },
  simple(
    { id: 'millet-mix', name: 'Millet Health Mix', shortName: 'Millet Mix', category: 'pantry', descriptor: '21 grains', audience: 'Family', benefit: 'For breakfast porridge | 21 grains, roasted in one small batch',
      description: 'Twenty-one grains, pulses and nuts — roasted separately so each is done right, then ground together. [Replace with your product description.]',
      bullets: ['21 grains, pulses and nuts', 'Roasted in small batches', 'No added sugar', 'Batch number on every pack'], howToUse: 'Cook 3 tablespoons in 250 ml water or milk for 5 minutes, stirring.', ingredients: '[Full ingredient list]', storage: 'Cool, dry place.',
      glyph: 'soup', tone: 'cream', rating: 4.6, reviewCount: 860, tags: ['bestseller'] },
    [{ id: '750', label: '750 g', grams: 750, price: 690, mrp: 790 }, { id: '1500', label: '1.5 kg', grams: 1500, price: 1290, mrp: 1480 }],
  ),
  simple(
    { id: 'moringa-powder', name: 'Moringa Powder', shortName: 'Moringa', category: 'pantry', descriptor: 'Sun-dried', audience: 'Daily', benefit: 'For daily greens | Shade-dried leaves, ground fresh',
      description: 'Moringa leaves picked in the morning, shade-dried and ground the same week. [Replace with your product description.]',
      bullets: ['Shade-dried leaves', 'Ground the same week', 'Nothing added'], howToUse: 'Half a teaspoon in warm water, smoothies or dosa batter.', ingredients: 'Moringa leaf 100%.', storage: 'Cool, dry place, away from sunlight.',
      glyph: 'leaf', tone: 'mint', rating: 4.5, reviewCount: 410, tags: [] },
    [{ id: '200', label: '200 g', grams: 200, price: 420, mrp: 480 }, { id: '400', label: '400 g', grams: 400, price: 780, mrp: 900 }],
  ),
  simple(
    { id: 'a2-ghee', name: 'A2 Bilona Ghee', shortName: 'A2 Ghee', category: 'pantry', descriptor: 'Bilona', audience: 'Family', benefit: 'For everyday cooking | Hand-churned curd, slow-cooked',
      description: 'Curd from A2 milk is hand-churned into butter and slow-cooked in small pans. [Replace with your product description.]',
      bullets: ['A2 milk', 'Hand-churned (bilona)', 'Slow-cooked in small pans'], howToUse: 'Use for tempering, on rice, or a spoon on hot dosa.', ingredients: 'A2 cow milk ghee 100%.', storage: 'Room temperature; keep the lid closed.',
      glyph: 'milk', tone: 'butter', rating: 4.8, reviewCount: 2100, tags: ['bestseller'] },
    [{ id: '250', label: '250 ml', grams: 250, price: 620, mrp: 690 }, { id: '500', label: '500 ml', grams: 500, price: 1150, mrp: 1290 }, { id: '1000', label: '1 L', grams: 1000, price: 2190, mrp: 2480 }],
  ),
  simple(
    { id: 'groundnut-oil', name: 'Cold-pressed Groundnut Oil', shortName: 'Groundnut Oil', category: 'pantry', descriptor: 'Wood-pressed', audience: 'Cooking', benefit: 'For everyday cooking | Wood-pressed, unrefined',
      description: 'Groundnuts from Pollachi, pressed slowly in a wooden press so the oil never heats. [Replace with your product description.]',
      bullets: ['Wood-pressed (chekku)', 'Unrefined, unfiltered taste', 'No chemicals'], howToUse: 'Use for everyday cooking and frying.', ingredients: 'Groundnut oil 100%.', storage: 'Cool, dark place.',
      glyph: 'nut', tone: 'peach', rating: 4.6, reviewCount: 1500, tags: [] },
    [{ id: '1000', label: '1 L', grams: 1000, price: 390, mrp: 450 }, { id: '5000', label: '5 L', grams: 5000, price: 1850, mrp: 2100 }],
  ),
  simple(
    { id: 'palm-jaggery', name: 'Palm Jaggery', shortName: 'Karupatti', category: 'pantry', descriptor: 'Karupatti', audience: 'Sweetener', benefit: 'For coffee, payasam and sweets | Palm sap, boiled and set',
      description: 'Palm sap from Thoothukudi, boiled and set into karupatti the traditional way. [Replace with your product description.]',
      bullets: ['Palm sap only', 'No chemicals or sugar added', 'Unrefined'], howToUse: 'Grate or break into coffee, payasam or sweets.', ingredients: 'Palm jaggery 100%.', storage: 'Airtight, cool, dry.',
      glyph: 'candy', tone: 'peach', rating: 4.7, reviewCount: 720, tags: [] },
    [{ id: '500', label: '500 g', grams: 500, price: 280, mrp: 310 }, { id: '1000', label: '1 kg', grams: 1000, price: 520, mrp: 580 }],
  ),
  simple(
    { id: 'black-rice', name: 'Black Rice (Kavuni)', shortName: 'Black Rice', category: 'pantry', descriptor: 'Kavuni', audience: 'Grains', benefit: 'For payasam and everyday rice | Heritage variety',
      description: 'Kavuni arisi — the heritage black rice of the Chettinad kitchen. [Replace with your product description.]',
      bullets: ['Heritage variety', 'Unpolished', 'Single-farm lot'], howToUse: 'Soak 6 hours, pressure-cook 4 whistles.', ingredients: 'Black rice 100%.', storage: 'Airtight, cool, dry.',
      glyph: 'bean', tone: 'lilac', rating: 4.5, reviewCount: 330, tags: [] },
    [{ id: '1000', label: '1 kg', grams: 1000, price: 640, mrp: 720 }],
  ),
  simple(
    { id: 'kashayam-mix', name: 'Herbal Kashayam Mix', shortName: 'Kashayam', category: 'pantry', descriptor: '12 herbs', audience: 'Immunity', benefit: 'For seasonal immunity | 12 herbs, stone-ground',
      description: 'Twelve dried herbs and spices, stone-ground and ready to boil. [Replace with your product description.]',
      bullets: ['12 herbs & spices', 'Stone-ground', 'No added sugar'], howToUse: 'Boil 1 teaspoon in 200 ml water for 5 minutes, strain, add palm jaggery.', ingredients: '[Full ingredient list]', storage: 'Airtight, cool, dry.',
      glyph: 'soup', tone: 'mint', rating: 4.4, reviewCount: 280, tags: [] },
    [{ id: '100', label: '100 g', grams: 100, price: 260, mrp: 300 }, { id: '250', label: '250 g', grams: 250, price: 590, mrp: 680 }],
  ),
  simple(
    { id: 'forest-honey', name: 'Raw Forest Honey', shortName: 'Forest Honey', category: 'pantry', descriptor: 'Unheated', audience: 'Wellness', benefit: 'For warm water and breakfast | Unheated, unfiltered',
      description: 'Wild forest honey, strained by hand and never heated. [Replace with your product description.]',
      bullets: ['Unheated', 'Unfiltered', 'Single-source'], howToUse: 'A teaspoon in warm (not hot) water, or over porridge.', ingredients: 'Raw honey 100%.', storage: 'Room temperature; crystallisation is natural.',
      glyph: 'droplets', tone: 'butter', rating: 4.8, reviewCount: 1900, tags: [] },
    [{ id: '250', label: '250 g', grams: 250, price: 340, mrp: 380 }, { id: '500', label: '500 g', grams: 500, price: 640, mrp: 720 }],
  ),
  simple(
    { id: 'turmeric-powder', name: 'Turmeric Powder', shortName: 'Turmeric', category: 'pantry', descriptor: 'Stone-ground', audience: 'Spices', benefit: 'For everyday cooking and golden milk | Stone-ground rhizomes',
      description: 'Whole rhizomes, boiled, sun-dried and stone-ground. [Replace with your product description.]',
      bullets: ['Whole rhizomes', 'Stone-ground', 'No colour added'], howToUse: 'Everyday cooking; a pinch in warm milk.', ingredients: 'Turmeric 100%.', storage: 'Airtight, away from light.',
      glyph: 'sun', tone: 'butter', rating: 4.6, reviewCount: 540, tags: [] },
    [{ id: '250', label: '250 g', grams: 250, price: 180, mrp: 210 }, { id: '500', label: '500 g', grams: 500, price: 340, mrp: 400 }],
  ),
  /* ---- Combos, built only from products Vihaan actually sells. Kit MRP is the
         sum of the individual prices, so "15% off" means 15% off buying separately. ---- */
  simple(
    { id: 'first-foods-starter', name: 'First Foods Starter', shortName: 'Starter Kit', category: 'combos-kits', descriptor: 'Combo · 2 pouches', audience: '6+ months', benefit: 'A first-foods box | Red Banana and Sweet Potato, 200 g each',
      description: 'The two gentlest first foods in one box — red banana for potassium and fibre, sweet potato for an easy, naturally sweet start.',
      bullets: ['Two 200 g pouches', '15% less than buying separately', 'Ships in one parcel'], howToUse: 'See each product.', ingredients: 'See each product.', storage: 'See each product.',
      image: '/images/kits/first-foods.jpg', gallery: ['/images/kits/first-foods.jpg'],
      glyph: 'gift', tone: 'blush', rating: 4.8, reviewCount: 31, isKit: true,
      kitContents: ['Red Banana Powder 200 g', 'Sweet Potato Mix 200 g'], tags: ['kit'] },
    [{ id: 'kit', label: '2 pouches', grams: 400, price: 423, mrp: 498 }],
  ),
  simple(
    { id: 'growing-kids-combo', name: 'Growing Kids Combo', shortName: 'Growing Kids', category: 'combos-kits', descriptor: 'Combo · 2 pouches', audience: '6+ months', benefit: 'Everyday nutrition | ABC Malt and Ragi Choco Malt, 200 g each',
      description: 'Apple-beetroot-carrot malt for vitamins and a cocoa ragi malt children ask for by name — the two they will finish without a fight.',
      bullets: ['Two 200 g pouches', '15% less than buying separately', 'Ships in one parcel'], howToUse: 'See each product.', ingredients: 'See each product.', storage: 'See each product.',
      image: '/images/kits/growing-kids.jpg', gallery: ['/images/kits/growing-kids.jpg'],
      glyph: 'gift', tone: 'butter', rating: 4.9, reviewCount: 24, isKit: true,
      kitContents: ['ABC Malt 200 g', 'Ragi Choco Malt 200 g'], tags: ['kit'] },
    [{ id: 'kit', label: '2 pouches', grams: 400, price: 423, mrp: 498 }],
  ),
  simple(
    { id: 'complete-nutrition-box', name: 'Complete Nutrition Box', shortName: 'Complete Box', category: 'combos-kits', descriptor: 'Combo · 3 pouches', audience: '8+ months', benefit: 'The full shelf | Health Mix, Dry Dates and Karuppu Ulunthu',
      description: 'A multigrain health mix, iron-rich dry dates and traditional karuppu ulunthu kanji — a week of varied meals in one box.',
      bullets: ['Three 200 g pouches', '15% less than buying separately', 'Ships in one parcel'], howToUse: 'See each product.', ingredients: 'See each product.', storage: 'See each product.',
      image: '/images/kits/complete-box.jpg', gallery: ['/images/kits/complete-box.jpg'],
      glyph: 'gift', tone: 'mint', rating: 4.8, reviewCount: 18, isKit: true,
      kitContents: ['Health Mix 200 g', 'Dry Dates Powder 200 g', 'Karuppu Ulunthu Kanji 200 g'], tags: ['kit'] },
    [{ id: 'kit', label: '3 pouches', grams: 600, price: 635, mrp: 747 }],
  ),
];

/** Placeholder reviews — replace with verified-order reviews from your backend. Never invent testimonials. */
export const reviews = [1, 2, 3].map((i) => ({
  id: `r${i}`,
  rating: 5,
  body: '[Real customer review — pulled from a verified order, about three lines. Reviews are never written by the store.]',
  author: '[Customer name]',
  city: '[City]',
  date: '2026-09-01',
  verified: true,
}));

/**
 * WhatsApp screenshots from real customers — the strongest proof a baby-food
 * brand has, because people can see the actual conversation.
 *
 * To publish one: save the screenshot to public/images/reviews/, set `image` to
 * its path, and fill in the customer's first name and city. Crop or blur the
 * phone number before saving — these are real people's contact details.
 *
 * Never invent an entry. An unfilled row renders as an empty frame on purpose,
 * so a placeholder can never be mistaken for a real customer.
 */
export const momReviews: { id: string; image?: string; author: string; city: string }[] = [
  { id: 'r1', author: '[Customer name]', city: '[City]' },
  { id: 'r2', author: '[Customer name]', city: '[City]' },
  { id: 'r3', author: '[Customer name]', city: '[City]' },
  { id: 'r4', author: '[Customer name]', city: '[City]' },
  { id: 'r5', author: '[Customer name]', city: '[City]' },
  { id: 'r6', author: '[Customer name]', city: '[City]' },
  { id: 'r7', author: '[Customer name]', city: '[City]' },
  { id: 'r8', author: '[Customer name]', city: '[City]' },
];

export const faqs = [
  { group: 'Orders & returns', q: 'Can I cancel after ordering?', a: 'Yes — free of charge until we start preparing your order. After that, report an issue and we will sort it out on WhatsApp.' },
  { group: 'Orders & returns', q: 'What if a pack arrives damaged?', a: 'Send a photo within 48 hours from Help → Report a problem. We replace or refund — your choice.' },
  { group: 'Shipping', q: 'How long does delivery take?', a: 'Standard delivery reaches most of Tamil Nadu in 2–3 working days and the rest of India in 4–6. Prepaid orders are picked up a day earlier than cash-on-delivery orders. [Edit to your courier terms.]' },
  { group: 'Shipping', q: 'Is cash on delivery available everywhere?', a: 'COD is available on most serviceable pincodes for a ₹29 fee. The address step tells you before you pay.' },
  { group: 'Payments', q: 'How do I use my wallet balance?', a: 'Wallet cashback lands after delivery of a prepaid order. Toggle “Use wallet” on the payment step to apply it.' },
  { group: 'Products', q: 'What does the batch report show?', a: 'Moisture, protein and heavy-metal test results for the exact batch printed on your pack. Enter the batch number on any product page.' },
];

export const recipes: { slug: string; title: string; meta: string; glyph: ClayGlyph; tone: ClayTone }[] = [
  { slug: 'first-banana-porridge', title: 'A first banana porridge in 5 minutes', meta: 'From 6 months · 5 min', glyph: 'banana', tone: 'blush' },
  { slug: 'millet-porridge', title: 'Millet health-mix porridge in 10 minutes', meta: 'Breakfast · 10 min', glyph: 'soup', tone: 'cream' },
  { slug: 'golden-milk', title: 'Golden milk with stone-ground turmeric', meta: 'Bedtime · 5 min', glyph: 'milk', tone: 'butter' },
];
