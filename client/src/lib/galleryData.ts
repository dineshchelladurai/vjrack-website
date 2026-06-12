export interface GalleryImage {
  id: string;
  src: string;
  category: string;
  alt: string;
}

export const galleryCategories = ['All', 'Commercial Racks', 'Supermarket', 'Textile', 'Innovative', 'Metal & Heavy Duty', 'Vegetable & Fruit', 'Stationery & Shoe', 'Projects & Awards'];

export const galleryImages: GalleryImage[] = [
  // Commercial Racks
  { id: 'g1', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-typeracks-2-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 1' },
  { id: 'g2', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-7-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 2' },
  { id: 'g3', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-5-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 3' },
  { id: 'g4', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-6-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 4' },
  { id: 'g5', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-4-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 5' },
  { id: 'g6', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-racks-3-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 6' },
  { id: 'g7', src: 'https://vjrack.com/wp-content/uploads/2025/02/all-type-racks-1-430x573.png', category: 'Commercial Racks', alt: 'Commercial Rack Type 7' },
  { id: 'g8', src: 'https://vjrack.com/wp-content/uploads/2025/02/1-430x573.png', category: 'Commercial Racks', alt: 'Corner Rack' },

  // Vegetable & Fruit
  { id: 'g9', src: 'https://vjrack.com/wp-content/uploads/2025/02/vegetable-racks-2-430x573.png', category: 'Vegetable & Fruit', alt: 'Vegetable Rack 1' },
  { id: 'g10', src: 'https://vjrack.com/wp-content/uploads/2025/02/vegetable-racks-1-430x573.png', category: 'Vegetable & Fruit', alt: 'Vegetable Rack 2' },
  { id: 'g11', src: 'https://vjrack.com/wp-content/uploads/2025/02/vegetable-rack-4-430x573.png', category: 'Vegetable & Fruit', alt: 'Vegetable Rack 3' },
  { id: 'g12', src: 'https://vjrack.com/wp-content/uploads/2025/02/vegetable-rack-3-430x573.png', category: 'Vegetable & Fruit', alt: 'Vegetable Rack 4' },
  { id: 'g13', src: 'https://vjrack.com/wp-content/uploads/2025/01/fruits-and-vegetable-rack-section.jpg', category: 'Vegetable & Fruit', alt: 'Fruits and Vegetable Section' },

  // Supermarket
  { id: 'g14', src: 'https://vjrack.com/wp-content/uploads/2025/02/hypermarket-430x573.png', category: 'Supermarket', alt: 'Hypermarket Rack 1' },
  { id: 'g15', src: 'https://vjrack.com/wp-content/uploads/2025/02/hypermarket-1-430x573.png', category: 'Supermarket', alt: 'Hypermarket Rack 2' },
  { id: 'g16', src: 'https://vjrack.com/wp-content/uploads/2025/02/hypermarket-6-430x573.png', category: 'Supermarket', alt: 'Hypermarket Rack 3' },
  { id: 'g17', src: 'https://vjrack.com/wp-content/uploads/2025/02/17-430x573.png', category: 'Supermarket', alt: 'Supermarket Display 1' },
  { id: 'g18', src: 'https://vjrack.com/wp-content/uploads/2025/02/18-430x573.png', category: 'Supermarket', alt: 'Supermarket Display 2' },
  { id: 'g19', src: 'https://vjrack.com/wp-content/uploads/2025/02/19-430x573.png', category: 'Supermarket', alt: 'Supermarket Display 3' },
  { id: 'g20', src: 'https://vjrack.com/wp-content/uploads/2025/02/20-430x573.png', category: 'Supermarket', alt: 'Supermarket Display 4' },
  { id: 'g21', src: 'https://vjrack.com/wp-content/uploads/2025/02/16-430x573.png', category: 'Supermarket', alt: 'Supermarket Display 5' },
  { id: 'g22', src: 'https://vjrack.com/wp-content/uploads/2025/02/supermarket-6-430x573.png', category: 'Supermarket', alt: 'Supermarket Rack 1' },
  { id: 'g23', src: 'https://vjrack.com/wp-content/uploads/2025/02/supermarket-5-430x573.png', category: 'Supermarket', alt: 'Supermarket Rack 2' },
  { id: 'g24', src: 'https://vjrack.com/wp-content/uploads/2025/02/supermarket-1-430x573.png', category: 'Supermarket', alt: 'Supermarket Rack 3' },
  { id: 'g25', src: 'https://vjrack.com/wp-content/uploads/2025/02/masala-rack-430x573.png', category: 'Supermarket', alt: 'Masala Bin Rack' },
  { id: 'g26', src: 'https://vjrack.com/wp-content/uploads/2025/02/3-430x573.png', category: 'Supermarket', alt: 'Snacks Rack' },
  { id: 'g27', src: 'https://vjrack.com/wp-content/uploads/2025/02/6-430x573.png', category: 'Supermarket', alt: 'Stall Bin' },
  { id: 'g28', src: 'https://vjrack.com/wp-content/uploads/2025/02/cash-counter-metal-drew-1000x1000-removebg-preview.png', category: 'Supermarket', alt: 'Cash Counter' },

  // Innovative Racks
  { id: 'g29', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-9-430x573.png', category: 'Innovative', alt: 'Innovative Rack 1' },
  { id: 'g30', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-8-430x573.png', category: 'Innovative', alt: 'Innovative Rack 2' },
  { id: 'g31', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-7-430x573.png', category: 'Innovative', alt: 'Innovative Rack 3' },
  { id: 'g32', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-6-430x573.png', category: 'Innovative', alt: 'Innovative Rack 4' },
  { id: 'g33', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-5-430x573.png', category: 'Innovative', alt: 'Innovative Rack 5' },
  { id: 'g34', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-4-430x573.png', category: 'Innovative', alt: 'Innovative Rack 6' },
  { id: 'g35', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-3-430x573.png', category: 'Innovative', alt: 'Innovative Rack 7' },
  { id: 'g36', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-2-430x573.png', category: 'Innovative', alt: 'Innovative Rack 8' },
  { id: 'g37', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-1-430x573.png', category: 'Innovative', alt: 'Innovative Rack 9' },
  { id: 'g38', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-10-430x573.png', category: 'Innovative', alt: 'Innovative Rack 10' },
  { id: 'g39', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-11-430x573.png', category: 'Innovative', alt: 'Innovative Rack 11' },
  { id: 'g40', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-12-430x573.png', category: 'Innovative', alt: 'Innovative Rack 12' },
  { id: 'g41', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-13-430x573.png', category: 'Innovative', alt: 'Innovative Rack 13' },
  { id: 'g42', src: 'https://vjrack.com/wp-content/uploads/2025/02/Innovative-racks-14-430x573.png', category: 'Innovative', alt: 'Innovative Rack 14' },

  // Metal & Heavy Duty
  { id: 'g43', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-8-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 1' },
  { id: 'g44', src: 'https://vjrack.com/wp-content/uploads/2025/02/metalrack-1-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 2' },
  { id: 'g45', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-7-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 3' },
  { id: 'g46', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-5-430x573.png', category: 'Metal & Heavy Duty', alt: 'Slotted Angle Rack' },
  { id: 'g47', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-4-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 4' },
  { id: 'g48', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-3-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 5' },
  { id: 'g49', src: 'https://vjrack.com/wp-content/uploads/2025/02/metal-6-430x573.png', category: 'Metal & Heavy Duty', alt: 'Metal Rack 6' },

  // Most Relevant
  { id: 'g50', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-9-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 1' },
  { id: 'g51', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-8-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 2' },
  { id: 'g52', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-6-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 3' },
  { id: 'g53', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-5-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 4' },
  { id: 'g54', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-4-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 5' },
  { id: 'g55', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-2-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 6' },
  { id: 'g56', src: 'https://vjrack.com/wp-content/uploads/2025/02/Most-relevant-racks-1-430x573.png', category: 'Commercial Racks', alt: 'Most Relevant Rack 7' },

  // Textile
  { id: 'g57', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-rack-1-430x573.png', category: 'Textile', alt: 'Textile Rack 1' },
  { id: 'g58', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-6-430x573.png', category: 'Textile', alt: 'Textile Rack 2' },
  { id: 'g59', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-5-430x573.png', category: 'Textile', alt: 'Textile Rack 3' },
  { id: 'g60', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-4-430x573.png', category: 'Textile', alt: 'Textile Rack 4' },
  { id: 'g61', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-3-430x573.png', category: 'Textile', alt: 'Textile Rack 5' },
  { id: 'g62', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-2-430x573.png', category: 'Textile', alt: 'Textile Rack 6' },
  { id: 'g63', src: 'https://vjrack.com/wp-content/uploads/2025/02/textile-7-430x573.png', category: 'Textile', alt: 'Textile Rack 7' },
  { id: 'g64', src: 'https://vjrack.com/wp-content/uploads/2025/02/10-430x573.png', category: 'Textile', alt: 'Top Hanger Rack' },

  // Stationery & Shoe
  { id: 'g65', src: 'https://vjrack.com/wp-content/uploads/2025/02/shoerack-3-430x573.png', category: 'Stationery & Shoe', alt: 'Shoe Rack 1' },
  { id: 'g66', src: 'https://vjrack.com/wp-content/uploads/2025/02/shoerack-1-430x573.png', category: 'Stationery & Shoe', alt: 'Shoe Rack 2' },
  { id: 'g67', src: 'https://vjrack.com/wp-content/uploads/2025/02/stationary-6-430x573.png', category: 'Stationery & Shoe', alt: 'Stationery Rack 1' },
  { id: 'g68', src: 'https://vjrack.com/wp-content/uploads/2025/02/stationary-5-430x573.png', category: 'Stationery & Shoe', alt: 'Stationery Rack 2' },
  { id: 'g69', src: 'https://vjrack.com/wp-content/uploads/2025/02/stationary-3-430x573.png', category: 'Stationery & Shoe', alt: 'Stationery Rack 3' },
  { id: 'g70', src: 'https://vjrack.com/wp-content/uploads/2025/02/stationary-4-430x573.png', category: 'Stationery & Shoe', alt: 'Stationery Rack 4' },
  { id: 'g71', src: 'https://vjrack.com/wp-content/uploads/2025/02/stationary-2-430x573.png', category: 'Stationery & Shoe', alt: 'Stationery Rack 5' },

  // Glass & Display
  { id: 'g72', src: 'https://vjrack.com/wp-content/uploads/2025/02/9-430x573.png', category: 'Commercial Racks', alt: 'Glass Frame Rack' },
  { id: 'g73', src: 'https://vjrack.com/wp-content/uploads/2025/02/2-430x573.png', category: 'Commercial Racks', alt: 'Hook Rack' },
  { id: 'g74', src: 'https://vjrack.com/wp-content/uploads/2025/02/4-430x573.png', category: 'Commercial Racks', alt: 'TV & AC Display Rack' },
  { id: 'g75', src: 'https://vjrack.com/wp-content/uploads/2025/02/5-430x573.png', category: 'Commercial Racks', alt: 'Display Rack' },
  { id: 'g76', src: 'https://vjrack.com/wp-content/uploads/2025/02/7-430x573.png', category: 'Commercial Racks', alt: 'Wall Glass Frame Rack' },

  // Projects & Awards
  { id: 'g77', src: 'https://vjrack.com/wp-content/uploads/2025/01/live1-2.jpg', category: 'Projects & Awards', alt: 'Live Project 1' },
  { id: 'g78', src: 'https://vjrack.com/wp-content/uploads/2025/01/live2-1.jpg', category: 'Projects & Awards', alt: 'Live Project 2' },
  { id: 'g79', src: 'https://vjrack.com/wp-content/uploads/2025/01/live3-1.jpg', category: 'Projects & Awards', alt: 'Live Project 3' },
  { id: 'g80', src: 'https://vjrack.com/wp-content/uploads/2025/02/IMG-20250210-WA0032.jpg', category: 'Projects & Awards', alt: 'VJ Rack Project' },
  { id: 'g81', src: 'https://vjrack.com/wp-content/uploads/2025/02/IMG-20250210-WA0057.jpg', category: 'Projects & Awards', alt: 'VJ Rack Installation' },
  { id: 'g82', src: 'https://vjrack.com/wp-content/uploads/2025/02/IMG-20250210-WA0086.jpg', category: 'Projects & Awards', alt: 'VJ Rack Showroom' },
  { id: 'g83', src: 'https://vjrack.com/wp-content/uploads/2025/02/IMG-20250210-WA0038-1.jpg', category: 'Projects & Awards', alt: 'VJ Rack Setup' },
  { id: 'g84', src: 'https://vjrack.com/wp-content/uploads/2025/02/IMG-20250210-WA0093.jpg', category: 'Projects & Awards', alt: 'VJ Rack Store' },
  { id: 'g85', src: 'https://vjrack.com/wp-content/uploads/2025/01/award1.jpg', category: 'Projects & Awards', alt: 'VJ Rack Award 1' },
  { id: 'g86', src: 'https://vjrack.com/wp-content/uploads/2025/01/award3.jpg', category: 'Projects & Awards', alt: 'VJ Rack Award 2' },
  { id: 'g87', src: 'https://vjrack.com/wp-content/uploads/2025/01/award2-e1736409675182.png', category: 'Projects & Awards', alt: 'VJ Rack Award 3' },
  { id: 'g88', src: 'https://vjrack.com/wp-content/uploads/2025/01/customer1-1067x800.jpg', category: 'Projects & Awards', alt: 'Happy Customer 1' },
  { id: 'g89', src: 'https://vjrack.com/wp-content/uploads/2025/01/customer2-2-1067x800.jpg', category: 'Projects & Awards', alt: 'Happy Customer 2' },
  { id: 'g90', src: 'https://vjrack.com/wp-content/uploads/2025/01/customer3.jpg', category: 'Projects & Awards', alt: 'Happy Customer 3' },
];
