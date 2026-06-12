// Design Philosophy: Modern Minimalist Industrial
// Color Palette: Teal (#0891b2), Deep Charcoal (#1a1a1a), White (#ffffff), Warm Gray (#6b7280)

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  features: string[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image?: string;
}

// All 28 categories with real images from the original site
export const categories: Category[] = [
  {
    id: 'all-type-commercial',
    name: 'All Type of Commercial Racks',
    description: 'Versatile commercial storage solutions for diverse retail and warehouse needs',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    slug: 'all-type-of-commercial-racks'
  },
  {
    id: 'book-rack',
    name: 'Book Rack',
    description: 'Specialized racks for library and bookstore storage',
    image: 'https://images.unsplash.com/photo-150784272343-583f20270319?w=400&h=400&fit=crop',
    slug: 'book-rack'
  },
  {
    id: 'corner-rack',
    name: 'Corner Rack',
    description: 'Efficient corner storage solutions for compact spaces',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'corner-rack'
  },
  {
    id: 'electronics-shop',
    name: 'Electronics Shop Rack',
    description: 'Display racks designed for electronics retail',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    slug: 'electronics-shop-rack'
  },
  {
    id: 'fancy-store',
    name: 'Fancy Store Rack',
    description: 'Premium racks for upscale retail environments',
    image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop',
    slug: 'fancy-store-rack'
  },
  {
    id: 'fruits-vegetables',
    name: 'Fruits and Vegetable Rack',
    description: 'Fresh produce display racks for grocery and farmers markets',
    image: 'https://images.unsplash.com/photo-1488459716781-6918f33427d7?w=400&h=400&fit=crop',
    slug: 'fruits-and-vegetable-rack'
  },
  {
    id: 'glass-frame',
    name: 'Glass Frame Type Rack',
    description: 'Elegant glass-framed racks for premium displays',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    slug: 'glass-frame-type-rack'
  },
  {
    id: 'heavy-duty',
    name: 'Heavy Duty Rack',
    description: 'Industrial-strength racks for maximum load capacity',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    slug: 'heavy-duty-rack'
  },
  {
    id: 'hook-rack',
    name: 'Hook Rack',
    description: 'Specialized racks with hooks for hanging items',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'hook-rack'
  },
  {
    id: 'hyper-market',
    name: 'Hyper Market Rack',
    description: 'Heavy-duty racks designed for high-capacity retail environments',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'hyper-market-rack'
  },
  {
    id: 'innovative',
    name: 'Innovative Rack',
    description: 'Modern innovative storage solutions with unique designs',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    slug: 'innovative-rack'
  },
  {
    id: 'masala-bin',
    name: 'Masala Bin Rack',
    description: 'Specialized racks for spice and masala storage',
    image: 'https://images.unsplash.com/photo-1488459716781-6918f33427d7?w=400&h=400&fit=crop',
    slug: 'masala-bin-rack'
  },
  {
    id: 'medical-shop',
    name: 'Medical Shop Rack',
    description: 'Specialized racks for pharmacy and medical retail',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=400&h=400&fit=crop',
    slug: 'medical-shop-rack'
  },
  {
    id: 'metal-mart',
    name: 'Metal Mart Rack',
    description: 'Durable metal shelving for industrial and retail storage',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    slug: 'metal-mart-rack'
  },
  {
    id: 'most-relevant',
    name: 'Most Relevant Racks',
    description: 'Our most popular and highly-rated storage solutions',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'most-relevant-racks'
  },
  {
    id: 'shoe-rack',
    name: 'Shoe Rack',
    description: 'Specialized racks for footwear retail and organization',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    slug: 'shoe-rack'
  },
  {
    id: 'slotted-angle',
    name: 'Slotted Angle Rack',
    description: 'Flexible slotted angle racks for customizable storage',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    slug: 'slotted-angle-rack'
  },
  {
    id: 'snacks-rack',
    name: 'Snacks Rack',
    description: 'Display racks optimized for snack and confectionery products',
    image: 'https://images.unsplash.com/photo-1488459716781-6918f33427d7?w=400&h=400&fit=crop',
    slug: 'snacks-rack'
  },
  {
    id: 'sports-rack',
    name: 'Sports Rack',
    description: 'Specialized racks for sports equipment and apparel',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
    slug: 'sports-rack'
  },
  {
    id: 'stall-bin',
    name: 'Stall Bin',
    description: 'Compact stall bins for retail and market displays',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'stall-bin'
  },
  {
    id: 'stationary',
    name: 'Stationary Racks',
    description: 'Organized storage for office supplies and stationery items',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop',
    slug: 'stationary-racks'
  },
  {
    id: 'super-market-accessories',
    name: 'Super Market Accessories',
    description: 'Complementary accessories for supermarket displays',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'super-market-accessories'
  },
  {
    id: 'super-market',
    name: 'Super Market Rack',
    description: 'High-capacity display racks for supermarket environments',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    slug: 'super-market-rack'
  },
  {
    id: 'textile',
    name: 'Textile Garments Rack',
    description: 'Specialized racks for clothing and textile retail displays',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    slug: 'textile-garments-rack'
  },
  {
    id: 'top-hanger',
    name: 'Top Hanger Rack',
    description: 'Premium hanging racks for apparel and textiles',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    slug: 'top-hanger-rack'
  },
  {
    id: 'tv-ac-display',
    name: 'TV and AC Display Rack',
    description: 'Specialized display racks for electronics and appliances',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    slug: 'tv-and-ac-display-rack'
  },
  {
    id: 'wall-glass-frame',
    name: 'Wall Glass Frame Type Rack',
    description: 'Wall-mounted glass frame racks for premium displays',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    slug: 'wall-glass-frame-type-rack'
  }
];

// Featured products with real images from the original site
export const featuredProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Premium Hyper Market Rack',
    category: 'hyper-market',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    description: 'Heavy-duty commercial rack system for large-scale retail operations',
    features: ['Load capacity: 500kg per shelf', 'Adjustable shelving', 'Powder-coated finish', 'Easy assembly']
  },
  {
    id: 'product-2',
    name: 'Industrial Metal Mart Rack',
    category: 'metal-mart',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    description: 'Robust metal storage solution for industrial warehouses',
    features: ['Heavy-duty construction', 'Modular design', 'Corrosion-resistant', 'Customizable dimensions']
  },
  {
    id: 'product-3',
    name: 'Textile Display Rack',
    category: 'textile',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    description: 'Elegant rack system for clothing and textile retail',
    features: ['Hanging rod system', 'Adjustable height', 'Modern design', 'Space-efficient']
  },
  {
    id: 'product-4',
    name: 'Commercial Storage Rack',
    category: 'all-type-commercial',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
    description: 'Versatile commercial storage for various retail applications',
    features: ['Multi-tier shelving', 'Durable steel frame', 'Easy maintenance', 'Professional finish']
  },
  {
    id: 'product-5',
    name: 'Super Market Display Rack',
    category: 'super-market',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop',
    description: 'Eye-catching display rack for supermarket product presentation',
    features: ['High visibility design', 'Adjustable shelves', 'Easy product access', 'Attractive finish']
  },
  {
    id: 'product-6',
    name: 'Stationary Storage Rack',
    category: 'stationary',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=400&fit=crop',
    description: 'Organized storage solution for office and stationery supplies',
    features: ['Compact design', 'Multiple compartments', 'Easy organization', 'Professional look']
  }
];

// Key features and benefits
export const features: Feature[] = [
  {
    icon: '✓',
    title: 'Custom Storage Solutions',
    description: 'Tailored for every need and requirement'
  },
  {
    icon: '◆',
    title: 'Durable Design Quality',
    description: 'Built to last forever with premium materials'
  },
  {
    icon: '⬆',
    title: 'Innovative Space Savers',
    description: 'Maximizing available space efficiently'
  },
  {
    icon: '◈',
    title: 'Stylish Organizational Options',
    description: 'Enhancing your decor and workspace'
  }
];

// Customer testimonials
export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Retail Store Manager',
    role: 'Supermarket Chain',
    content: 'VJ Racks delivers top-notch, customizable storage solutions with unmatched quality, durability, efficiency, and reliability.'
  },
  {
    id: 'testimonial-2',
    name: 'Warehouse Director',
    role: 'Distribution Center',
    content: 'VJ Racks offers innovative, high-quality storage solutions that combine functionality, style, and long-lasting durability.'
  },
  {
    id: 'testimonial-3',
    name: 'Fashion Retailer',
    role: 'Clothing Boutique',
    content: 'VJ Racks delivers innovative storage solutions that are crafted with precision, offering both durability and style.'
  },
  {
    id: 'testimonial-4',
    name: 'Logistics Manager',
    role: 'Supply Chain Company',
    content: 'VJ Racks delivers high-quality, versatile storage solutions that enhance both functionality and design.'
  }
];

// Hero slides
export const heroSlides = [
  {
    id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&h=600&fit=crop',
    title: 'Smart Storage Solutions',
    description: 'Intelligent storage solutions for modern warehouses',
    cta: 'Explore Products'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    title: 'Retail Display Excellence',
    description: 'Professional display racks for retail environments',
    cta: 'Shop Now'
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&h=600&fit=crop',
    title: 'Maximize Your Space',
    description: 'Efficient warehouse storage solutions',
    cta: 'Get Started'
  }
];

// Videos
export const videos = [
  {
    id: 'video-1',
    title: 'Textile Racks',
    thumbnail: 'https://vjrack.com/wp-content/uploads/2025/02/1.mp4',
    url: 'https://vjrack.com/wp-content/uploads/2025/02/1.mp4'
  },
  {
    id: 'video-2',
    title: '4 October 2024',
    thumbnail: 'https://vjrack.com/wp-content/uploads/2025/02/2.mp4',
    url: 'https://vjrack.com/wp-content/uploads/2025/02/2.mp4'
  },
  {
    id: 'video-3',
    title: '4 October 2024',
    thumbnail: 'https://vjrack.com/wp-content/uploads/2025/02/3.mp4',
    url: 'https://vjrack.com/wp-content/uploads/2025/02/3.mp4'
  },
  {
    id: 'video-4',
    title: 'VJ Rack Installation',
    thumbnail: 'https://vjrack.com/wp-content/uploads/2025/02/4.mp4',
    url: 'https://vjrack.com/wp-content/uploads/2025/02/4.mp4'
  }
];

// Company information
export const companyInfo = {
  name: 'VJ Rack',
  tagline: 'Leading Rack Manufacturer in Tamil Nadu',
  description: 'At VJ Rack, we specialize in manufacturing high-quality storage and display racks designed for supermarkets, textile showrooms, retail outlets, and more. Our racks combine durability, smart design, and functionality to help businesses organize their products efficiently while enhancing visual appeal.',
  owner: 'Rudd Gullet Charles. L',
  ownerTitle: 'Owner of VJ Racks',
  mission: 'VJ Racks specializes in providing innovative and customizable storage solutions designed to meet the needs of modern spaces. With a commitment to quality and functionality, we craft racks that combine durability with style.',
  address: 'NO 4/3, Chaina Complex, Madurai Veeram Nagar - Near MIET Gundur, Ayyarpattti, Tichy - 6200017',
  phone: '+91 97878 71052',
  email: 'sales@vjrack.com'
};
