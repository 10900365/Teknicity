import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import landingVideo from "../assets/VIDEO.mp4";

const LandingPage = () => {
  const [stats, setStats] = useState({ repairs: 0, shops: 0, customers: 0 });

  useEffect(() => {
    let repairs = 0, shops = 0, customers = 0;
    const interval = setInterval(() => {
      if (repairs < 260) repairs += Math.ceil(260 / 25);
      if (shops < 42) shops += Math.ceil(42 / 20);
      if (customers < 1300) customers += Math.ceil(1300 / 30);
      setStats({ repairs, shops, customers });
      if (repairs >= 260 && shops >= 42 && customers >= 1300) clearInterval(interval);
    }, 60);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <video autoPlay muted loop playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0">
        <source src={landingVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[#14002b]/80 backdrop-blur-[3px] z-0"></div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 w-full bg-gradient-to-b from-[#14002b]/80 via-[#1a0039]/70 to-transparent backdrop-blur-md border-b border-pink-500/20 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                  <svg className="w-6 h-6 text-[#1a0039]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-pink-400 tracking-tight">Teknicity</span>
              </div>

              <Link to="/login" className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 hover:from-fuchsia-600 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-pink-500/40 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-60 pb-24 text-center text-white relative">
          <div className="absolute top-/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-[120px] animate-pulse"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-10">
              Mobile Repair{" "}
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text animate-pulse">
                Management System
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
              Manage repairs with neon precision! Empower your shop with futuristic design and energy.
            </p>

            <Link to="/login" className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 hover:from-fuchsia-600 hover:to-pink-500 text-white px-10 py-3 rounded-full font-semibold text-lg inline-flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform">
              Start Managing Repairs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mt-16 bg-gradient-to-br from-purple-900/40 via-fuchsia-900/20 to-blue-900/40 border border-pink-400/20 shadow-lg shadow-pink-500/20 backdrop-blur-md rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{stats.repairs}+</div>
                <div className="text-gray-200 text-sm">Repairs Managed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{stats.shops}+</div>
                <div className="text-gray-200 text-sm">Active Shops</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{stats.customers}+</div>
                <div className="text-gray-200 text-sm">Happy Customers</div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;
