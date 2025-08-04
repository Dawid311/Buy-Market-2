import type { NextApiRequest, NextApiResponse } from 'next';
import { ParaSwapService, SwapRequest, SwapResponse } from '../../services/paraswap';

interface WebhookRequest extends NextApiRequest {
  body: {
    ethAmount: string;
    recipientAddress?: string;
    slippage?: number;
  };
}

export default async function handler(
  req: WebhookRequest,
  res: NextApiResponse<SwapResponse | { error: string }>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Validate environment variables
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Validate request body
    const { ethAmount, recipientAddress, slippage } = req.body;
    
    if (!ethAmount) {
      return res.status(400).json({ error: 'ethAmount is required' });
    }

    // Validate ETH amount
    const ethAmountNum = parseFloat(ethAmount);
    if (isNaN(ethAmountNum) || ethAmountNum <= 0) {
      return res.status(400).json({ error: 'Invalid ethAmount. Must be a positive number.' });
    }

    if (ethAmountNum < 0.0001) {
      return res.status(400).json({ error: 'Minimum ethAmount is 0.0001 ETH for sufficient liquidity.' });
    }

    // Validate slippage if provided
    if (slippage !== undefined) {
      const slippageNum = Number(slippage);
      if (isNaN(slippageNum) || slippageNum < 1 || slippageNum > 5000) {
        return res.status(400).json({ error: 'Invalid slippage. Must be between 1 and 5000 basis points.' });
      }
    }

    console.log('📥 Webhook received:', {
      ethAmount,
      recipientAddress,
      slippage,
      timestamp: new Date().toISOString()
    });

    // Initialize ParaSwap service
    const paraSwapService = new ParaSwapService(privateKey);
    
    // Log wallet info
    const walletAddress = paraSwapService.getWalletAddress();
    const ethBalance = await paraSwapService.getETHBalance();
    
    console.log('💼 Wallet info:', {
      address: walletAddress,
      ethBalance: ethBalance
    });

    // Validate wallet has sufficient balance
    if (parseFloat(ethBalance) < ethAmountNum) {
      return res.status(400).json({ 
        error: `Insufficient ETH balance. Required: ${ethAmount} ETH, Available: ${ethBalance} ETH` 
      });
    }

    // Create swap request
    const swapRequest: SwapRequest = {
      ethAmount,
      recipientAddress,
      slippage
    };

    // Execute the swap
    console.log('🔄 Executing swap...');
    const swapResult = await paraSwapService.executeSwap(swapRequest);

    if (swapResult.success) {
      console.log('✅ Swap completed successfully:', swapResult);
      
      // Nach erfolgreichem Kauf: Token an Zielwallet senden
      const targetWallet = '0xFe5F6cE95efB135b93899AF70B12727F93FEE6E2';
      console.log('🚀 Initiating token transfer to target wallet:', targetWallet);
      
      try {
        // Alle gekauften DFAITH Token an die Zielwallet senden
        const transferResult = await paraSwapService.transferDFAITHTokens(targetWallet);
        
        if (transferResult.success) {
          console.log('✅ Token transfer completed successfully:', transferResult);
          
          // Erfolgreiche Response mit Swap- und Transfer-Informationen
          return res.status(200).json({
            ...swapResult,
            tokenTransfer: {
              success: true,
              transactionHash: transferResult.transactionHash,
              amountTransferred: transferResult.amountTransferred,
              gasUsed: transferResult.gasUsed,
              recipientAddress: targetWallet
            }
          });
        } else {
          console.error('❌ Token transfer failed:', transferResult.error);
          
          // Swap war erfolgreich, aber Transfer fehlgeschlagen
          return res.status(200).json({
            ...swapResult,
            tokenTransfer: {
              success: false,
              error: transferResult.error,
              recipientAddress: targetWallet
            }
          });
        }
      } catch (transferError: any) {
        console.error('❌ Token transfer error:', transferError);
        
        // Swap war erfolgreich, aber Transfer-Prozess hatte einen Fehler
        return res.status(200).json({
          ...swapResult,
          tokenTransfer: {
            success: false,
            error: transferError.message || 'Token transfer process failed',
            recipientAddress: targetWallet
          }
        });
      }
    } else {
      console.error('❌ Swap failed:', swapResult.error);
      return res.status(400).json(swapResult);
    }

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    
    // Handle specific error types
    if (error.message?.includes('insufficient liquidity')) {
      return res.status(400).json({ 
        error: 'Insufficient liquidity for this amount. Try a larger amount (min. 0.001 ETH) or try again later.' 
      });
    }
    
    if (error.message?.includes('price impact')) {
      return res.status(400).json({ 
        error: 'High price impact detected. Try with a smaller amount.' 
      });
    }
    
    if (error.message?.includes('ParaSwap')) {
      return res.status(400).json({ 
        error: `ParaSwap API error: ${error.message}` 
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error occurred during swap execution' 
    });
  }
}
