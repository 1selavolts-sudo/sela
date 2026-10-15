/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: []
  },
  async headers() {
    // Stop other sites from framing the Control Center, which would allow clickjacking of logout and login.
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }
        ]
      }
    ];
  }
};

export default nextConfig;
