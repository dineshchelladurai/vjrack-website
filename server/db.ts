import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogPosts.json');
const HIDDEN_GALLERY_FILE = path.join(DATA_DIR, 'hiddenGallery.json');
const CUSTOM_GALLERY_FILE = path.join(DATA_DIR, 'customGallery.json');

const ADMIN_CONFIG_FILE = path.join(DATA_DIR, 'adminConfig.json');

// In-memory data store
let enquiries: any[] = [];
let blogPosts: any[] = [];
let hiddenGalleryImages: string[] = [];
let customGalleryImages: any[] = [];
let adminConfig: any = { passwordHash: null, recoveryEmail: null, totpSecret: null };
let enquiryIdCounter = 1;

// Load initial data
try {
  if (fs.existsSync(ENQUIRIES_FILE)) {
    enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf-8'));
    if (enquiries.length > 0) enquiryIdCounter = Math.max(...enquiries.map(e => e.id)) + 1;
  }
  if (fs.existsSync(BLOGS_FILE)) {
    blogPosts = JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf-8'));
  }
  if (fs.existsSync(HIDDEN_GALLERY_FILE)) {
    hiddenGalleryImages = JSON.parse(fs.readFileSync(HIDDEN_GALLERY_FILE, 'utf-8'));
  }
  if (fs.existsSync(CUSTOM_GALLERY_FILE)) {
    customGalleryImages = JSON.parse(fs.readFileSync(CUSTOM_GALLERY_FILE, 'utf-8'));
  }
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    adminConfig = { ...adminConfig, ...JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8')) };
  }
} catch (error) {
  console.error("Failed to load data from disk:", error);
}

// Helpers for saving (now asynchronous to prevent event loop blocking)
async function saveEnquiries() { await fs.promises.writeFile(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2)); }
async function saveBlogPosts() { await fs.promises.writeFile(BLOGS_FILE, JSON.stringify(blogPosts, null, 2)); }
async function saveHiddenImages() { await fs.promises.writeFile(HIDDEN_GALLERY_FILE, JSON.stringify(hiddenGalleryImages, null, 2)); }
async function saveCustomImages() { await fs.promises.writeFile(CUSTOM_GALLERY_FILE, JSON.stringify(customGalleryImages, null, 2)); }

// --- Enquiries ---
export function insertEnquiry(enq: any) {
  const newId = enquiryIdCounter++;
  enq.id = newId;
  enquiries.push(enq);
  saveEnquiries();
  return newId;
}

export function getAllEnquiries() {
  return [...enquiries].reverse();
}

// --- Blog Posts ---
export function insertBlogPost(post: any) {
  blogPosts.unshift(post);
  saveBlogPosts();
  return post;
}

export function getAllBlogPosts() {
  return [...blogPosts];
}

export function deleteBlogPost(id: string) {
  const initialLength = blogPosts.length;
  blogPosts = blogPosts.filter(p => p.id !== id);
  if (blogPosts.length < initialLength) {
    saveBlogPosts();
    return true;
  }
  return false;
}

// --- Gallery ---
export function getHiddenImages() {
  return [...hiddenGalleryImages];
}

export function setHiddenImages(ids: string[]) {
  hiddenGalleryImages = ids;
  saveHiddenImages();
  return ids;
}

export function getCustomImages() {
  return [...customGalleryImages];
}

export function setCustomImages(images: any[]) {
  customGalleryImages = images;
  saveCustomImages();
  return images;
}

// --- Admin Config ---
export function getAdminConfig() {
  return { ...adminConfig };
}

export function updateAdminConfig(updates: any) {
  adminConfig = { ...adminConfig, ...updates };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(adminConfig, null, 2));
  return adminConfig;
}

// --- Custom Assets (Categories & Products) ---
const CUSTOM_ASSETS_FILE = path.join(DATA_DIR, 'customAssets.json');
let customAssets: Record<string, string> = {};

try {
  if (fs.existsSync(CUSTOM_ASSETS_FILE)) {
    customAssets = JSON.parse(fs.readFileSync(CUSTOM_ASSETS_FILE, 'utf-8'));
  }
} catch (error) {
  console.error("Failed to load custom assets:", error);
}

function saveCustomAssets() {
  fs.writeFileSync(CUSTOM_ASSETS_FILE, JSON.stringify(customAssets, null, 2));
}

export function getCustomAssets() {
  return { ...customAssets };
}

export function updateCustomAsset(id: string, imagePath: string) {
  customAssets[id] = imagePath;
  saveCustomAssets();
  return customAssets;
}

export function deleteCustomAsset(id: string) {
  delete customAssets[id];
  saveCustomAssets();
  return customAssets;
}
