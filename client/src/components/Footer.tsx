import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { companyInfo } from '@/lib/data';
import { useLocation } from 'wouter';

export default function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-foreground text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div>
            <div className="text-2xl font-bold mb-4">
              VJ<span className="text-primary">Rack</span>
            </div>
            <p className="text-gray-300 text-sm md:text-base mb-6">
              {companyInfo.tagline}
            </p>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              {companyInfo.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => navigate('/')} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop')} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Shop
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/blog')} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-lg mb-6">Products</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Commercial Racks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Hyper Market Racks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Textile Racks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  Storage Solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {companyInfo.address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`tel:${companyInfo.phone}`} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  {companyInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="text-gray-300 hover:text-primary transition-colors duration-200 text-sm md:text-base">
                  {companyInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © {new Date().getFullYear()} VJ Rack. All rights reserved. | Leading Rack Manufacturer in Tamil Nadu
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" rel="noopener noreferrer" target="_blank" aria-label="Facebook" className="p-2 bg-gray-800 hover:bg-primary rounded-lg transition-colors duration-200">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" rel="noopener noreferrer" target="_blank" aria-label="Instagram" className="p-2 bg-gray-800 hover:bg-primary rounded-lg transition-colors duration-200">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" rel="noopener noreferrer" target="_blank" aria-label="LinkedIn" className="p-2 bg-gray-800 hover:bg-primary rounded-lg transition-colors duration-200">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" rel="noopener noreferrer" target="_blank" aria-label="Twitter" className="p-2 bg-gray-800 hover:bg-primary rounded-lg transition-colors duration-200">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
