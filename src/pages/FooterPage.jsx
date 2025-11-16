import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone, Mailbox, Facebook, Linkedin } from "lucide-react";
import IshitaGalleryLogo from "../assets/watermark-ishita-gallery-logo.png";

/**
 * FooterPage Component
 * 
 * Displays the footer section that appears at the bottom of every page.
 * Contains company information, navigation links, social media links, and copyright.
 * 
 * For beginners:
 * - Uses React Router's Link component for navigation
 * - Links to placeholder pages are defined in routes.jsx
 * - Social media links open in new tabs (target="_blank")
 */
export default function FooterPage() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="px-4 md:px-15 lg:px-20">
        <div className="container mx-auto flex flex-col md:flex-row py-14 gap-10">
          <div className="w-full">
            <div className="text-2xl font-semibold w-[50%]">
              <img src={IshitaGalleryLogo} alt="Ishita Gallery Logo" />
            </div>
            <p className="mt-6 text-base leading-7 max-w-xl opacity-90">
              Crafting beautiful, meaningful statues that bring art and
              spirituality into your life. Over 15 years of traditional
              craftsmanship with modern excellence
            </p>
            <div className="mt-8 space-y-3 text-sm opacity-90">
              <div className="flex items-center gap-3">
                <MapPin size={20} />
                Andheri West, Mumbai, Maharashtra
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} />
                +91 987 654 3210
              </div>
              <div className="flex items-center gap-3">
                <Mailbox size={20} />
                info@ishitagallery.com
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row flex-wrap justify-starts xl:justify-end align-bottom gap-5 md:gap-10">
            <div>
              <div className="font-semibold text-lg mb-4">Company</div>
              <ul className="space-y-3 text-sm opacity-90">
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/customization">Customization</Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/faq">FAQ</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-lg mb-4">Categories</div>
              <ul className="space-y-3 text-sm opacity-90">
                <li>
                  <Link to="/filter?category=god-statues">God Statues</Link>
                </li>
                <li>
                  <Link to="/filter?category=motivational">
                    Motivational Statues
                  </Link>
                </li>
                <li>
                  <Link to="/filter?customizable=true">Custom Orders</Link>
                </li>
                <li>
                  <Link to="/filter?category=motivational">
                    Corporate Gifts
                  </Link>
                </li>
                <li>
                  <Link to="/filter?category=home-decor">Home Decor</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-lg mb-4">Support</div>
              <ul className="space-y-3 text-sm opacity-90">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Shipping Policy</li>
                <li>Return Policy</li>
                <li>Help Center</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="px-4 md:px-15 lg:px-20">
          <div className="container mx-auto py-4 flex flex-col-reverse md:flex-row gap-5 items-start md:items-center justify-between text-sm opacity-90">
            <div>© 2024 Ishita Gallery. All rights reserved.</div>
            <div className="flex items-center gap-3 text-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                <a target="_blank" href="https://facebook.com/" rel="noopener noreferrer">
                  <Facebook className="p-1" />
                </a>
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                <a target="_blank" href="https://instagram.com/" rel="noopener noreferrer">
                  <Instagram className="p-1" />
                </a>
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                <a target="_blank" href="https://x.com/" rel="noopener noreferrer">
                  𝕏
                </a>
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40">
                <a target="_blank" href="https://linkedin.com/" rel="noopener noreferrer">
                  <Linkedin className="p-1" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="lg:hidden"
        style={{ height:"66px" }}
      />
    </footer>
  );
}

