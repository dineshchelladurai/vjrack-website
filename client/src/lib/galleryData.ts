export interface GalleryImage {
  id: string;
  src: string;
  thumbnailSrc?: string;
  category: string;
  alt: string;
}

export const galleryCategories = ['All', 'Commercial Racks', 'Supermarket', 'Textile', 'Innovative', 'Metal & Heavy Duty', 'Vegetable & Fruit', 'Stationery & Shoe', 'Projects & Awards'];

// Default images removed — all gallery content is now managed via Admin uploads.
// This prevents broken images when the old vjrack.com domain is retired.
export const galleryImages: GalleryImage[] = [];
