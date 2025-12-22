/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        optimizePackageImports: ['@google/generative-ai', 'firebase', 'jsmind'],
    },
}

module.exports = nextConfig
