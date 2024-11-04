/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // <=== enables static exports
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
    unoptimized: true
  },
  assetPrefix: "/",
};

export default nextConfig;
