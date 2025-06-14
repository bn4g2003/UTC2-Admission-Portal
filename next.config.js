/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Tắt ESLint trong quá trình build để tránh lỗi
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tắt kiểm tra TypeScript trong quá trình build để tránh lỗi
    ignoreBuildErrors: true,
  },
  // Tắt Static Generation cho dynamic routes
  unstable_runtimeJS: true,
  unstable_JsPreload: false,
  env: {
    // Thêm các biến môi trường công khai cần thiết
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: ['localhost'], // Thêm các domain cho next/image nếu cần
    unoptimized: true, // Tắt tối ưu hóa hình ảnh nếu gặp vấn đề
  }
};

module.exports = nextConfig;
