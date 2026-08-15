
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rborrvzoskomssoklaxc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;