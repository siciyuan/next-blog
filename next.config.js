/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./content/**/*'],
    },
  },
}
module.exports = nextConfig
