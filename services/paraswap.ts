import { ethers } from 'ethers';
import axios from 'axios';
import {
  BASE_CHAIN_ID,
  BASE_RPC_URL,
  DFAITH_TOKEN,
  DFAITH_DECIMALS,
  ETH_DECIMALS,
  PARASWAP_API_URL,
  ETH_ADDRESS_PARASWAP,
  DEFAULT_SLIPPAGE,
  DEFAULT_GAS_MULTIPLIER
} from '../config/constants';

export interface SwapRequest {
  ethAmount: string; // ETH amount as string (e.g., "0.1")
  recipientAddress?: string; // Optional recipient, defaults to wallet address
  slippage?: number; // Slippage in basis points (default: 100 = 1%)
}

export interface SwapResponse {
  success: boolean;
  transactionHash?: string;
  dfaithReceived?: string;
  ethSpent?: string;
  gasUsed?: string;
  error?: string;
  priceRoute?: any;
}

export class ParaSwapService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Get price quote from ParaSwap for ETH -> DFAITH swap
   */
  async getQuote(ethAmountStr: string, slippage: number = DEFAULT_SLIPPAGE): Promise<any> {
    try {
      const ethAmountWei = ethers.parseEther(ethAmountStr).toString();
      
      const priceParams = new URLSearchParams({
        srcToken: ETH_ADDRESS_PARASWAP,
        destToken: DFAITH_TOKEN,
        srcDecimals: ETH_DECIMALS.toString(),
        destDecimals: DFAITH_DECIMALS.toString(),
        amount: ethAmountWei,
        network: BASE_CHAIN_ID.toString(),
        side: 'SELL',
        userAddress: this.wallet.address,
        slippage: slippage.toString(),
        maxImpact: '50' // Allow up to 50% price impact
      });

      console.log('🔍 Getting ParaSwap quote...', Object.fromEntries(priceParams));
      
      const response = await axios.get(`${PARASWAP_API_URL}/prices?${priceParams}`);
      
      if (!response.data?.priceRoute) {
        throw new Error('Invalid price route received from ParaSwap');
      }

      console.log('✅ ParaSwap quote received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ParaSwap quote error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Insufficient liquidity for this amount. Try a larger amount (min. 0.001 ETH)');
      }
      
      if (error.response?.data?.message?.includes('ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT')) {
        throw new Error('High price impact detected. Try with a smaller amount.');
      }
      
      throw new Error(`ParaSwap quote failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Build transaction data from ParaSwap
   */
  async buildTransaction(priceRoute: any, slippage: number = DEFAULT_SLIPPAGE): Promise<any> {
    try {
      const buildTxParams = {
        srcToken: ETH_ADDRESS_PARASWAP,
        destToken: DFAITH_TOKEN,
        srcAmount: priceRoute.srcAmount,
        priceRoute: priceRoute,
        userAddress: this.wallet.address,
        slippage: slippage.toString()
      };

      console.log('🔨 Building ParaSwap transaction...', buildTxParams);

      const response = await axios.post(
        `${PARASWAP_API_URL}/transactions/${BASE_CHAIN_ID}`,
        buildTxParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'DawidFaithWebhook/1.0'
          }
        }
      );

      if (!response.data?.to || !response.data?.data) {
        throw new Error('Invalid transaction data received from ParaSwap');
      }

      console.log('✅ ParaSwap transaction built:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ParaSwap build transaction error:', error.response?.data || error.message);
      throw new Error(`ParaSwap build transaction failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Execute the swap transaction
   */
  async executeSwap(request: SwapRequest): Promise<SwapResponse> {
    try {
      console.log('🚀 Starting ETH -> DFAITH swap...', request);

      // Validate input
      const ethAmount = parseFloat(request.ethAmount);
      if (ethAmount <= 0 || ethAmount < 0.0001) {
        throw new Error('Invalid ETH amount. Minimum: 0.0001 ETH');
      }

      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      const ethAmountWei = ethers.parseEther(request.ethAmount);
      
      if (balance < ethAmountWei) {
        throw new Error(`Insufficient ETH balance. Required: ${request.ethAmount} ETH, Available: ${ethers.formatEther(balance)} ETH`);
      }

      // Get quote from ParaSwap
      const slippage = request.slippage || DEFAULT_SLIPPAGE;
      const quoteData = await this.getQuote(request.ethAmount, slippage);

      // Build transaction
      const txData = await this.buildTransaction(quoteData.priceRoute, slippage);

      // Estimate gas with buffer
      const gasEstimate = await this.provider.estimateGas({
        to: txData.to,
        data: txData.data,
        value: txData.value || '0',
        from: this.wallet.address
      });

      const gasLimit = Math.floor(Number(gasEstimate) * DEFAULT_GAS_MULTIPLIER);

      // Execute transaction
      console.log('📝 Executing swap transaction...');
      const tx = await this.wallet.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: txData.value || '0',
        gasLimit: gasLimit
      });

      console.log('⏳ Waiting for transaction confirmation...', tx.hash);
      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Calculate received DFAITH amount
      const expectedDFaith = Number(quoteData.priceRoute.destAmount) / Math.pow(10, DFAITH_DECIMALS);

      console.log('🎉 Swap successful!', {
        txHash: tx.hash,
        ethSpent: request.ethAmount,
        dfaithReceived: expectedDFaith.toFixed(DFAITH_DECIMALS),
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        success: true,
        transactionHash: tx.hash,
        dfaithReceived: expectedDFaith.toFixed(DFAITH_DECIMALS),
        ethSpent: request.ethAmount,
        gasUsed: receipt.gasUsed.toString(),
        priceRoute: quoteData.priceRoute
      };

    } catch (error: any) {
      console.error('❌ Swap execution failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred during swap'
      };
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get ETH balance
   */
  async getETHBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}
