'use client';

import { useState } from 'react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-500 border-b-4 border-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white text-gray-800 flex items-center justify-center font-bold text-lg">
              LH
            </div>
            <span className="font-bold text-xl">LEONIDAS HERMES</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#dashboard" className="hover:bg-gray-700 px-3 py-2 font-medium">DASHBOARD</a>
            <a href="#transcription" className="hover:bg-gray-700 px-3 py-2 font-medium">TRANSCRIPTION</a>
            <a href="#analytics" className="hover:bg-gray-700 px-3 py-2 font-medium">ANALYTICS</a>
            <a href="#settings" className="hover:bg-gray-700 px-3 py-2 font-medium">SETTINGS</a>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-700"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-2">
            <a href="#dashboard" className="block px-3 py-2 hover:bg-gray-700 font-medium">DASHBOARD</a>
            <a href="#transcription" className="block px-3 py-2 hover:bg-gray-700 font-medium">TRANSCRIPTION</a>
            <a href="#analytics" className="block px-3 py-2 hover:bg-gray-700 font-medium">ANALYTICS</a>
            <a href="#settings" className="block px-3 py-2 hover:bg-gray-700 font-medium">SETTINGS</a>
            <div className="px-3 py-2 border-t border-gray-700 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}