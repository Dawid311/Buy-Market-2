import type { NextApiRequest, NextApiResponse } from 'next';

interface StatusResponse {
  status: string;
  timestamp: string;
  wallet?: {
    address: string;
    ethBalance: string;
  };
  config: {
    dfaithToken: string;
    baseChainId: number;
    minEthAmount: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | { error: string }>
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    const privateKey = process.env.PRIVATE_KEY;
    const response: StatusResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config: {
        dfaithToken: process.env.DFAITH_TOKEN_ADDRESS || '0x69eFD833288605f320d77eB2aB99DDE62919BbC1',
        baseChainId: 8453,
        minEthAmount: '0.0001'
      }
    };

    // If private key is available, show wallet info
    if (privateKey) {
      try {
        const { ParaSwapService } = await import('../../services/paraswap');
        const paraSwapService = new ParaSwapService(privateKey);
        
        response.wallet = {
          address: paraSwapService.getWalletAddress(),
          ethBalance: await paraSwapService.getETHBalance()
        };
      } catch (error) {
        console.error('Error getting wallet info:', error);
        // Continue without wallet info
      }
    }

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
}
