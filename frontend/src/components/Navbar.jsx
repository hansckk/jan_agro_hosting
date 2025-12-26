import React, { useState } from "react";
import {
  Menu,
  X,
  User,
  MapPin,
  ShoppingBag,
  Info,
  Home,
  Shield,
  Briefcase,
} from "lucide-react";
import { Navbar as FlowNav } from "flowbite-react";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({
  setShowProfile,
  user,
  isAdmin,
  isPemilik,
}) => {
  console.log("Navbar Component Props:", { user, isAdmin, isPemilik });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "shop", label: "Shop", icon: ShoppingBag, path: "/shop" },
    { id: "about", label: "About", icon: Info, path: "/about" },
    { id: "location", label: "Location", icon: MapPin, path: "/location" },
  ];

  const getNavLinkClasses = (isActive) => {
    const baseClasses =
      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap";
    if (isActive) {
      return `${baseClasses} text-black bg-white shadow-md`;
    }
    return `${baseClasses} text-gray-300 hover:text-white hover:bg-white/10`;
  };

  const getMobileNavLinkClasses = (isActive) => {
    const baseClasses =
      "flex items-center space-x-2 w-full px-3 py-3 rounded-md text-base font-medium transition-all duration-200";
    if (isActive) {
      return `${baseClasses} text-black bg-white shadow-md`;
    }
    return `${baseClasses} text-gray-300 hover:text-white hover:bg-white/10`;
  };

  return (
    <FlowNav
      fluid
      className="fixed top-0 left-0 right-0 z-50 !bg-black backdrop-blur-md border-b border-gray-800 rounded-none p-0"
    >
      <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <img src="/image/janAgro.png" alt="logo" className="w-6 h-6 object-contain" />
            </div>
          </div>
        </Link>

        {/* ======================================= */}
        {/* ========= DESKTOP MENU ================ */}
        {/* ======================================= */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => getNavLinkClasses(isActive)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => getNavLinkClasses(isActive)}
            >
              <Shield size={16} />
              <span>Admin</span>
            </NavLink>
          )}

          {isPemilik && (
            <NavLink
              to="/ceo"
              className={({ isActive }) => getNavLinkClasses(isActive)}
            >
              <Briefcase size={16} />
              <span>CEO Panel</span>
            </NavLink>
          )}

          {/* Tombol Profile */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-all duration-200"
          >
            <User size={16} />
            <span className="truncate max-w-[100px]">{user ? user.name : "Profile"}</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-gray-300 p-2 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ======================================= */}
      {/* ========= MOBILE MENU ================= */}
      {/* ======================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-black border-t border-gray-800 absolute top-16 left-0 right-0 shadow-xl h-screen overflow-y-auto pb-20">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => getMobileNavLinkClasses(isActive)}
                >
                    <Icon size={20} />
                    <span>{item.label}</span>
                </NavLink>
                );
            })}

            {isAdmin && (
                <NavLink
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => getMobileNavLinkClasses(isActive)}
                >
                <Shield size={20} />
                <span>Admin</span>
                </NavLink>
            )}
            
            {isPemilik && (
                <NavLink
                to="/ceo"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => getMobileNavLinkClasses(isActive)}
                >
                <Briefcase size={20} />
                <span>CEO Panel</span>
                </NavLink>
            )}

            <div className="border-t border-gray-800 my-2 pt-2"></div>

            {/* Mobile Profile */}
            <button
                onClick={() => {
                setShowProfile(true);
                setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
                <User size={20} />
                <span>{user ? user.name : "Profile"}</span>
            </button>
          </div>
        </div>
      )}
    </FlowNav>
  );
};

export default Navbar;