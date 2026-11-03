/** Things the couple can build in their garden with love coins. */
export interface GardenItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  /** Another item that must be built first */
  requires?: string;
  /** Anchor point in the 160×100 scene (ground contact) and drawing scale */
  x: number;
  y: number;
  scale: number;
  /** Drawn behind the flowers (far away) instead of in front */
  far?: boolean;
  /** Keeps flowers out of this box around the anchor: [halfWidth, height] */
  clear: [number, number];
}

export const GARDEN_ITEMS: GardenItem[] = [
  { id: 'mailbox', name: 'Love mailbox', emoji: '💌', cost: 40, description: 'A little pink mailbox for love letters', x: 94, y: 81, scale: 0.7, clear: [3, 8] },
  { id: 'bench', name: 'Garden bench', emoji: '🪑', cost: 60, description: 'A bench for two under the tree', x: 106, y: 82, scale: 0.75, clear: [7, 7] },
  { id: 'picnic', name: 'Picnic for two', emoji: '🧺', cost: 70, description: 'Checked blanket, basket and two glasses', x: 98, y: 95, scale: 0.8, clear: [9, 4] },
  { id: 'lanterns', name: 'Lantern path', emoji: '🏮', cost: 90, description: 'Glowing lanterns that light up at night', x: 80, y: 99, scale: 1, clear: [12, 22] },
  { id: 'mushrooms', name: 'Fairy ring', emoji: '🍄', cost: 80, description: 'Little mushrooms that glow at night', x: 65, y: 97, scale: 0.8, clear: [8, 6] },
  { id: 'bunnies', name: 'Bunny pair', emoji: '🐰', cost: 100, description: 'Two bunnies who never leave each other', x: 15, y: 97, scale: 0.8, clear: [8, 8] },
  { id: 'pets', name: 'Kitty & puppy', emoji: '🐱', cost: 110, description: 'Two fluffy friends who love you both', x: 117, y: 86, scale: 0.7, clear: [7, 6] },
  { id: 'swing', name: 'Swing for two', emoji: '🎠', cost: 120, description: 'A wooden swing to sit side by side', x: 60, y: 84, scale: 0.75, clear: [8, 14] },
  { id: 'pond', name: 'Swan pond', emoji: '🦢', cost: 150, description: 'A shimmering pond with two swans', x: 42, y: 92, scale: 1, clear: [18, 6] },
  { id: 'bridge', name: 'Little bridge', emoji: '🌉', cost: 120, description: 'A wooden bridge over your pond', requires: 'pond', x: 42, y: 92, scale: 1, clear: [11, 7] },
  { id: 'arch', name: 'Rose arch', emoji: '🌹', cost: 180, description: 'An arch covered in roses', x: 80, y: 90, scale: 0.85, clear: [8, 16] },
  { id: 'fountain', name: 'Wishing fountain', emoji: '⛲', cost: 250, description: 'A sparkling fountain to make wishes', x: 124, y: 94, scale: 0.9, clear: [9, 14] },
  { id: 'hammock', name: 'Hammock for two', emoji: '🌴', cost: 140, description: 'Swaying between two little trees', x: 52, y: 76, scale: 0.75, far: true, clear: [10, 16] },
  { id: 'telescope', name: 'Stargazing telescope', emoji: '🔭', cost: 200, description: 'Count the stars together at night', x: 146, y: 89, scale: 0.8, clear: [6, 12] },
  { id: 'treehouse', name: 'Tree house', emoji: '🌳', cost: 300, description: 'A secret tree house just for you two', x: 129, y: 74, scale: 0.85, far: true, clear: [12, 30] },
  { id: 'balloon', name: 'Heart balloon', emoji: '🎈', cost: 350, description: 'A heart-shaped hot-air balloon in your sky', x: 36, y: 34, scale: 0.9, far: true, clear: [0, 0] },
  { id: 'windmill', name: 'Windmill', emoji: '🌬️', cost: 400, description: 'A windmill turning on the far hill', x: 153, y: 61, scale: 0.7, far: true, clear: [0, 0] },
  { id: 'cottage', name: 'Our cottage', emoji: '🏡', cost: 500, description: 'Your cozy home with a glowing window', x: 26, y: 70, scale: 0.95, far: true, clear: [14, 24] },
  { id: 'gazebo', name: 'Fairy-light gazebo', emoji: '✨', cost: 800, description: 'A gazebo wrapped in twinkling lights', x: 104, y: 73, scale: 0.75, far: true, clear: [10, 22] },
  // More things to build: a bigger shop
  { id: 'tulips', name: 'Tulip bed', emoji: '🌷', cost: 30, description: 'Rows of tulips in every colour', x: 8, y: 86, scale: 0.7, clear: [4, 4] },
  { id: 'pumpkins', name: 'Pumpkin patch', emoji: '🎃', cost: 40, description: 'Round pumpkins ready for autumn', x: 136, y: 100, scale: 0.6, clear: [4, 3] },
  { id: 'birdhouse', name: 'Birdhouse', emoji: '🐦', cost: 45, description: 'A cosy house for singing birds', x: 70, y: 70, scale: 0.7, far: true, clear: [3, 6] },
  { id: 'windchimes', name: 'Wind chimes', emoji: '🎐', cost: 50, description: 'Chimes that sing when the breeze blows', x: 92, y: 58, scale: 0.8, far: true, clear: [0, 0] },
  { id: 'sunflowers', name: 'Sunflower row', emoji: '🌻', cost: 55, description: 'Tall sunflowers that turn to the sun', x: 152, y: 100, scale: 0.7, clear: [5, 6] },
  { id: 'heartgarland', name: 'Heart garland', emoji: '💗', cost: 60, description: 'Pink hearts strung across the sky', x: 100, y: 40, scale: 0.9, far: true, clear: [0, 0] },
  { id: 'campfire', name: 'Campfire', emoji: '🔥', cost: 75, description: 'Toast marshmallows together at night', x: 30, y: 98, scale: 0.6, clear: [3, 4] },
  { id: 'kite', name: 'Kite', emoji: '🪁', cost: 85, description: 'A heart kite dancing above the garden', x: 128, y: 30, scale: 0.8, far: true, clear: [0, 0] },
  { id: 'moonlamp', name: 'Moon lamp', emoji: '🌙', cost: 130, description: 'A crescent moon that glows softly', x: 64, y: 52, scale: 0.8, far: true, clear: [3, 6] },
  { id: 'cherry', name: 'Cherry blossom tree', emoji: '🌸', cost: 220, description: 'Pink petals drift down on you both', x: 4, y: 66, scale: 0.9, far: true, clear: [10, 26] },
  { id: 'rainbow', name: 'Rainbow arch', emoji: '🌈', cost: 300, description: 'A rainbow over the garden, just for you', x: 120, y: 44, scale: 1, far: true, clear: [0, 0] },
];

export const ITEM_BY_ID = Object.fromEntries(GARDEN_ITEMS.map((i) => [i.id, i])) as Record<string, GardenItem>;
