import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import './Footer.css'
import axios from "axios";

const Footer = () => {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products/get-all-products");
      if (res.data.success) {
        setProduk(res.data.data);
      }
    } catch (err) {
      console.error("Gagal fetch produk:", err);
    }
  };

  return (
    <footer className="bg-black text-white border-t-2 border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 items-start">
            
          <div className="flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shrink-0">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <img src="/image/janAgro.png" alt="logo" className="w-6 h-6 object-contain" />
                </div>
              </div>
              <span className="text-xl md:text-2xl font-light tracking-tight">Jan Agro</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empowering Farmers with Quality Products and Expert Support. 
              Dedicated to sustainable agricultural growth.
            </p>
            
            <div className="flex space-x-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-semibold mb-6 text-lg text-white">Produk Jan Agro</h3>
            <ul className="space-y-3 text-sm text-gray-400">
             {produk.slice(0, 5).map((p) => (
              <li key={p._id}>
                <Link to={`/product/${p._id}`} className="hover:text-white transition-colors block truncate">
                  {p.name}
                </Link>   
              </li>
              ))}
              <li>
                <Link to="/shop" className="text-white font-medium hover:underline mt-2 inline-block">
                  View All Products &rarr;
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold mb-6 text-lg text-white">Contact & Support</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-white" />
                <div className="leading-relaxed">
                  <p className="font-medium text-white">Jan Agro Indonesia</p>
                  <p>Pondok Chandra Indah No. 69</p>
                  <p>Surabaya 10130, Indonesia</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={18} className="shrink-0 text-white" />
                <div>
                  <p className="font-medium text-white hover:underline cursor-pointer">+62 811 762 788</p>
                  <p className="text-xs opacity-75">Mon - Fri, 09:00 - 17:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-white" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white hover:underline cursor-pointer break-all">
                    janagronusantara@gmail.com
                  </p>
                  <p className="text-xs opacity-75">General Inquiry</p>
                </div>
              </div>
            </div>
          </div>
            
          <div className="flex flex-col">
            <h3 className="font-semibold mb-6 text-lg text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/location" className="hover:text-white transition-colors">Find a Warehouse</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Opportunities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="max-w-md">
              <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Subscribe to receive the latest news and exclusive offers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white w-full sm:w-64"
              />
              <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 md:mb-0 text-center md:text-left">
            &copy; {new Date().getFullYear()} Jan Agro Nusantara. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;