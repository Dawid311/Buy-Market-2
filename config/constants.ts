// Base Chain Configuration
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Token Addresses on Base Chain
export const DFAITH_TOKEN = process.env.DFAITH_TOKEN_ADDRESS || '0x69eFD833288605f320d77eB2aB99DDE62919BbC1';
export const DFAITH_DECIMALS = 2;
export const ETH_DECIMALS = 18;

// ParaSwap Configuration
export const PARASWAP_API_URL = 'https://apiv5.paraswap.io';
export const ETH_ADDRESS_PARASWAP = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; // ParaSwap ETH representation

// Default Slippage (1%)
export const DEFAULT_SLIPPAGE = 100; // 100 basis points = 1%

// Gas Configuration
export const DEFAULT_GAS_MULTIPLIER = 1.2; // 20% gas buffer
