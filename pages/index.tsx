export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🚀 Dawid Faith Webhook API</h1>
      <p>Automated D.FAITH token purchase API using ParaSwap on Base Chain</p>
      
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>📡 API Endpoints</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3>POST /api/swap</h3>
          <p>Execute ETH to D.FAITH swap via ParaSwap</p>
          <pre style={{ background: '#e0e0e0', padding: '0.5rem', borderRadius: '4px' }}>
{`{
  "ethAmount": "0.1",
  "slippage": 100,
  "recipientAddress": "0x..." (optional)
}`}
          </pre>
        </div>
        
        <div>
          <h3>GET /api/health</h3>
          <p>Check API status and wallet balance</p>
        </div>
      </div>
      
      <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>✅ Features</h2>
        <ul>
          <li>✅ Automatic ETH to D.FAITH swaps via ParaSwap</li>
          <li>✅ Base Chain (8453) support</li>
          <li>✅ Configurable slippage (default: 1%)</li>
          <li>✅ Balance validation</li>
          <li>✅ Comprehensive error handling</li>
          <li>✅ Transaction confirmation</li>
          <li>✅ Vercel deployment ready</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h2>⚙️ Configuration</h2>
        <p>Set the following environment variables:</p>
        <ul>
          <li><code>PRIVATE_KEY</code> - Wallet private key for executing swaps</li>
          <li><code>BASE_RPC_URL</code> - Base chain RPC URL (optional)</li>
          <li><code>DFAITH_TOKEN_ADDRESS</code> - D.FAITH token address (optional)</li>
        </ul>
      </div>
    </div>
  );
}
