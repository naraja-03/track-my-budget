import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a simple SVG for the OG image
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Logo Circle -->
      <circle cx="600" cy="250" r="80" fill="white" fill-opacity="0.2"/>
      <circle cx="600" cy="250" r="60" fill="white"/>
      
      <!-- Rupee Symbol -->
      <text x="600" y="275" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#3B82F6">₹</text>
      
      <!-- Title -->
      <text x="600" y="400" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="white">Track My Budget</text>
      
      <!-- Subtitle -->
      <text x="600" y="460" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="white" fill-opacity="0.9">Smart Expense Management</text>
      
      <!-- Bottom Text -->
      <text x="600" y="540" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white" fill-opacity="0.8">Track expenses • Set goals • Achieve financial success</text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000');
  
  return res.send(svg);
}
