const sukoonPrimaryImage = `${import.meta.env.BASE_URL}products/sukoon-1.png?v=20260525`
const sukoonSecondaryImage = `${import.meta.env.BASE_URL}products/sukoon-2.png?v=20260525`

export const products = [
  {
    id: 'midnight-linen-hoodie',
    name: 'Sukoon',
    category: 'Hoodies',
    price: 699,
    tag: 'Limited drop',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: '450gsm brushed cotton',
    description: 'A heavyweight hoodie with tonal embroidery and a quiet charcoal drape.',
    longDescription:
      'Tailored for oversized comfort with a fashion-editorial silhouette, this hoodie pairs brushed cotton warmth with softly embroidered poetry on the cuff and spine.',
    images: [
      sukoonPrimaryImage,
      sukoonSecondaryImage,
    ],
  },
  {
    id: 'ash-silhouette-tee',
    name: 'Ash Silhouette Tee',
    category: 'Oversized T-Shirts',
    price: 86,
    tag: 'Bestseller',
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Organic heavyweight jersey',
    description: 'Oversized cut, muted typography, and a washed finish that feels lived in.',
    longDescription:
      'An oversized T-shirt cut with broad shoulders and a fluid hem. The front hosts a sparse line of verse, while the back remains almost bare for a restrained luxury effect.',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'silver-margin-jacket',
    name: 'Silver Margin Jacket',
    category: 'Limited Edition',
    price: 224,
    tag: 'Collector piece',
    sizes: ['S', 'M', 'L'],
    material: 'Structured twill with satin lining',
    description: 'A sharp-edged outer layer with silver thread details and poetic lining.',
    longDescription:
      'This limited jacket is finished with a satin interior printed in excerpt fragments and softly reflective threadwork that catches light without overwhelming the silhouette.',
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520367745676-285a13e3d0f0?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'verse-stacked-rings',
    name: 'Verse Stacked Rings',
    category: 'Poetry Wearables',
    price: 72,
    tag: 'New arrival',
    sizes: ['One Size'],
    material: 'Silver-plated alloy',
    description: 'Minimal rings etched with tiny language fragments and polished edges.',
    longDescription:
      'A set of stackable rings designed to echo the margins of a printed page. Subtle inscriptions and a soft silver sheen give them a collectible editorial character.',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617038260849-f1d16b8eb5da?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'afterlight-membership',
    name: 'Afterlight Membership',
    category: 'Membership',
    price: 24,
    tag: 'Monthly access',
    sizes: null,
    material: 'Digital access',
    description: 'Private audio letters, exclusive essays, and early access to drops.',
    longDescription:
      'A recurring digital membership that opens exclusive podcast sessions, members-only archive posts, and first invitations to limited apparel releases.',
    images: [
      'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    id: 'paper-bloom-print',
    name: 'Paper Bloom Print',
    category: 'Poetry Wearables',
    price: 64,
    tag: 'Signed edition',
    sizes: ['A4', 'A3'],
    material: 'Archival matte paper',
    description: 'A gallery-style print pairing abstract florals with original typography.',
    longDescription:
      'Printed on archival matte stock with a silver foil signature mark, this piece is designed to sit between art print and poem page.',
    images: [
      'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529429617124-aee711a5ac1c?auto=format&fit=crop&w=900&q=80',
    ],
  },
]

export const poems = [
  {
    slug: 'velvet-hours',
    title: 'Velvet Hours',
    collection: 'Nocturne Archive',
    meta: 'Read time · 3 minutes',
    excerpt: 'The room kept your voice the way velvet keeps the outline of a hand.',
    body: `The room kept your voice\nThe way velvet keeps the outline of a hand.\n\nI touched the curtain just to know\nWhat silence looked like in expensive light.\n\nYou were already leaving.\nThe mirror knew before I did.\n\nAnd still, every dark hallway after that\nWore your shape like a tailored coat.`,
  },
  {
    slug: 'marble-evening',
    title: 'Marble Evening',
    collection: 'Slow Fires',
    meta: 'Read time · 4 minutes',
    excerpt: 'We stood beneath a marble evening, polished by rain and unfinished thoughts.',
    body: `We stood beneath a marble evening,\nPolished by rain and unfinished thoughts.\n\nSome loves do not break.\nThey simply become architecture.\n\nA staircase. A doorway.\nA room you cannot stop entering.\n\nI still carry your absence\nLike a key cut from silver air.`,
  },
  {
    slug: 'soft-ruin',
    title: 'Soft Ruin',
    collection: 'Letters After Midnight',
    meta: 'Read time · 2 minutes',
    excerpt: 'There is a kind of ruin that arrives in silk, not thunder.',
    body: `There is a kind of ruin\nThat arrives in silk, not thunder.\n\nIt lowers itself into your life,\nCrosses one leg,\nAnd begins renaming things.\n\nThe window becomes witness.\nThe ash becomes prayer.\nThe body becomes a house\nStill lit after everyone leaves.`,
  },
  {
    slug: 'the-last-gold',
    title: 'The Last Gold',
    collection: 'House of Echoes',
    meta: 'Read time · 5 minutes',
    excerpt: 'Morning spilled its last gold across the floor as if apology could be beautiful.',
    body: `Morning spilled its last gold across the floor\nAs if apology could be beautiful.\n\nYou said my name without touching it.\nI said nothing and called that mercy.\n\nThe city kept moving beyond the glass,\nIndifferent and jeweled.\n\nBut in here,\nTime folded itself into a shirt,\nLeft it on the chair,\nAnd never came back for it.`,
  },
]

export const podcasts = [
  {
    id: 'after-hours-room',
    title: 'After Hours Room',
    series: 'Audio Poetry Salon',
    duration: '18 min',
    description: 'An intimate spoken-word episode layered with distant room tone, breath, and ambient synth.',
  },
  {
    id: 'the-voice-between-pages',
    title: 'The Voice Between Pages',
    series: 'Private Listening',
    duration: '24 min',
    description: 'A reflective episode about collecting language, clothing, and memory in the same emotional wardrobe.',
  },
  {
    id: 'soft-lights-essay',
    title: 'Soft Lights Essay',
    series: 'Members Broadcast',
    duration: '14 min',
    description: 'A short-form audio letter exploring luxury as restraint, atmosphere, and honest feeling.',
  },
]

export const ebooks = [
  {
    id: 'book-01',
    title: 'The Quiet Wardrobe',
    subtitle: 'Poems on memory, fabric, and longing',
    format: 'e-book',
    price: 22,
    description: 'A digital poetry collection arranged like a fashion editorial, with soft black-and-ivory spreads.',
  },
  {
    id: 'book-02',
    title: 'Nocturne Letters',
    subtitle: 'Audio notes and midnight essays',
    format: 'digital bundle',
    price: 28,
    description: 'An extended e-book with companion audio reflections and a downloadable art print.',
  },
  {
    id: 'book-03',
    title: 'Silver Margins',
    subtitle: 'Limited poetry print folio',
    format: 'print set',
    price: 34,
    description: 'A collector bundle of printable poetry sheets designed for framing or gifting.',
  },
]

export const reviews = [
  {
    name: 'Ariana, collector',
    quote: 'Every detail feels intentional. It reads like a poem and shops like a luxury house.',
  },
  {
    name: 'Milan, listener',
    quote: 'The audio section feels cinematic and intimate at the same time. It slows you down in the best way.',
  },
  {
    name: 'Nadia, reader',
    quote: 'The typography, spacing, and products all feel like they belong to the same emotional world.',
  },
  {
    name: 'Rhea, stylist',
    quote: 'This is what happens when poetry is treated with the visual discipline of fashion.',
  },
]

export const faqs = [
  {
    question: 'Do you ship apparel internationally?',
    answer: 'Yes. The storefront is structured for global shipping, with delivery windows and final rates ready to plug into your preferred fulfillment stack.',
  },
  {
    question: 'How are digital products delivered?',
    answer: 'E-books, audio bundles, and printable art are delivered instantly through secure post-purchase download links and account access.',
  },
  {
    question: 'What does the membership include?',
    answer: 'Membership includes private audio letters, early access to drops, exclusive archive content, and members-only releases.',
  },
  {
    question: 'Can this storefront connect to payment gateways?',
    answer: 'Yes. The checkout experience is designed to be payment integration ready, with clean handoff points for providers like Stripe or Razorpay.',
  },
]

export const storeStats = [
  { value: '12k+', label: 'Readers and listeners' },
  { value: '38', label: 'Published pieces and editions' },
  { value: '9', label: 'Limited apparel drops' },
]
