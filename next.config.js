/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    DFAITH_TOKEN_ADDRESS: '0x69eFD833288605f320d77eB2aB99DDE62919BbC1'
  }
}

module.exports = nextConfig
