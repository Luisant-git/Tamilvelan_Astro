/** @type {import('next').NextConfig} */

// This app serves only /api/* JSON routes (no pages), so the page-response
// security headers/CSP from the original unified app don't apply here —
// CORS + rate-limiting for /api/* is already fully handled by
// src/middleware.ts, which moved over unchanged.
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
