/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出：构建产物输出到 out/，可直接部署到
  // Cloudflare Pages / GitHub Pages 等任意静态托管
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./content/**/*'],
    },
  },
}
module.exports = nextConfig
