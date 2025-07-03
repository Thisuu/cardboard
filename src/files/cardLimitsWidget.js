function loadEthers() {
  return new Promise((resolve, reject) => {
    if (window.ethers) {
      resolve(window.ethers);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.min.js';
    script.onload = () => resolve(window.ethers);
    script.onerror = () => reject(new Error('Failed to load Ethers.js'));
    document.head.appendChild(script);
  });
}

//cardLimitsWidget.js
let widgetVisible = false;
let refreshAllAllowances;
let revokeAllAllowances;
let signer; // Move signer to module scope
let provider; // Move provider to module scope
let selectedToken;
let selectedVersion;
let currentBalance;
let CARD_CONTRACTS;
let isCardLimitsWidgetOpen = false;

export async function createCardLimitsWidget() {
  let ethers;
  try {
    ethers = await loadEthers();
  } catch (error) {
    console.error('Failed to load Ethers.js:', error);
    return;
  }

  if (!window.ethereum) {
    console.error('window.ethereum required');
    return;
  }

  // Initialize provider and signer
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();

  // First convert all addresses to lowercase before checksumming
  const supportedTokens = [
    { 
      symbol: 'USDC', 
      address: ethers.utils.getAddress('0x176211869ca2b568f2a7d4ee941e073a821ee1ff'), // All lowercase
      decimals: 6, 
      icon: 'https://app.aave.com/icons/tokens/usdc.svg' 
    },
    { 
      symbol: 'USDT', 
      address: ethers.utils.getAddress('0xa219439258ca9da29e9cc4ce5596924745e12b93'), 
      decimals: 6, 
      icon: 'https://app.aave.com/icons/tokens/usdt.svg' 
    },
    { 
      symbol: 'aUSDC', 
      address: ethers.utils.getAddress('0x374d7860c4f2f604de0191298dd393703cce84f3'), 
      decimals: 6, 
      icon: 'https://app.aave.com/icons/tokens/usdc.svg' 
    },
    { 
      symbol: 'WETH', 
      address: ethers.utils.getAddress('0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f'), 
      decimals: 18, 
      icon: 'https://app.aave.com/icons/tokens/eth.svg' 
    },
    { 
      symbol: 'EURe', 
      address: ethers.utils.getAddress('0x3ff47c5bf409c86533fe1f4907524d304062428d'), 
      decimals: 18, 
      icon: 'https://app.aave.com/icons/tokens/eure.svg' 
    },
    { 
      symbol: 'GBPe', 
      address: ethers.utils.getAddress('0x3Bce82cf1A2bc357F956dd494713Fe11DC54780f'), 
      decimals: 18, 
      icon: 'https://cdn-icons-png.flaticon.com/512/182/182924.png' 
    },
  ];

  CARD_CONTRACTS = {
    US: ethers.utils.getAddress('0xa90b298d05c2667ddc64e2a4e17111357c215dd2'),
    International: ethers.utils.getAddress('0x9dd23a4a0845f10d65d293776b792af1131c7b30')
  };

  // Add Inter font if not already present
  if (!document.querySelector('#inter-font')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'inter-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fontLink);
  }

  const style = document.createElement('style');
  style.textContent = `
  @media (prefers-reduced-motion: no-preference) {
  #card-limits-widget {
    filter: blur(0); /* Fixes Chrome rendering issues */
  }
}

@keyframes butterIn {
  0% {
    opacity: 0;
    transform: translate(-50%, 10px);
    filter: blur(0.4px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
}

@keyframes butterOut {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 8px);
    filter: blur(0.4px);
  }
}

#card-limits-widget.entering {
  animation: butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards;
}

#card-limits-widget.exiting {
  animation: butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

  #card-limits-widget {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    width: 340px;
    z-index: 9999;
    background: white;
    color: #333;
    border-radius: 14px;
    padding: 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    transform: translateZ(0) translate(-50%, -50%);
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
  /* GPU-optimized blur */
  filter: opacity(1);
  }

  #clw-header {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  position: relative; /* For absolute positioning of close button */
}

  #card-limits-widget h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  line-height: 1.3;
  width: calc(100% - 24px); /* Leave space for close button */
}

#card-limits-widget h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #666;
  line-height: 1.4;
  width: calc(100% - 24px);
}

  #clw-close {
  position: absolute;
  right: 20px;
  top: 18px;key
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #888;
    transition: all 0.15s ease;
  }

  #clw-close:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #000;
  }

  #clw-content {
    padding: 16px 20px;
  }

  .radio-group {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px;
    border-radius: 8px;
  }

  .radio-group label {
    font-size: 13px;
    background: transparent;
    padding: 6px 12px;
    border-radius: 6px;
    color: #666;
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 500;
    flex: 1;
    text-align: center;
  }

  .radio-group input[type="radio"] {
    display: none;
  }

  .radio-group input[type="radio"]:checked + label {
    background: white;
    color: #0066FF;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .token-list {
    margin-bottom: 16px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .token-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .token-item:last-child {
    border-bottom: none;
  }

  .token-item:hover {
    background: #f9f9f9;
  }

  .token-item.selected {
    background: #f0f6ff;
  }

  .token-item.selected .allowance {
    color: #0066FF;
    font-weight: 500;
  }

  .token-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: contain;
    background: #f5f5f5;
  }

  .token-name {
    display: flex;
    align-items: center;
  }

  .input-container {
    margin-bottom: 16px;
  }

  .input-container label {
    display: block;
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .input-row {
    position: relative;
  }

  .input-row input {
    width: 100%;
    padding: 10px 12px;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    color: #000;
    font-size: 14px;
    outline: none;
    transition: all 0.15s ease;
    box-sizing: border-box;
  }

  .input-row input:focus {
    border-color: #0066FF;
    box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
  }

  /* Slider styles */
  .slider-container {
    margin-top: 12px;
  }
  
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e0e0e0;
    outline: none;
    margin: 10px 0;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0066FF;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
  
  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0066FF;
    cursor: pointer;
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 11px;
    color: #888;
  }

  .slider-labels span {
    cursor: pointer;
    transition: color 0.15s ease;
  }
  
  .slider-labels span:hover {
    color: #0066FF;
  }

  .button-group {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  #clw-set-limit, #clw-revoke-limit {
    flex: 1;
    padding: 10px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #clw-set-limit {
    background: #0066FF;
    color: white;
  }

  #clw-set-limit:hover {
    background: #0052D9;
  }

  #clw-set-limit:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }

  #clw-revoke-limit {
    background: white;
    color: #FF453A;
    border: 1px solid rgba(255, 69, 58, 0.2);
  }

  #clw-revoke-limit:hover {
    background: rgba(255, 69, 58, 0.05);
  }

  #clw-revoke-limit:disabled {
    color: #999;
    border-color: #e0e0e0;
    cursor: not-allowed;
  }

  #clw-revoke-all {
    width: 100%;
    padding: 10px;
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    color: #FF453A;
    border: 1px solid rgba(255, 69, 58, 0.2);
    margin-top: 8px;
  }
  
  #clw-revoke-all:hover {
    background: rgba(255, 69, 58, 0.05);
  }
  
  #clw-revoke-all:disabled {
    color: #999;
    border-color: #e0e0e0;
    cursor: not-allowed;
  }

  #clw-msg {
    margin-top: 12px;
    font-size: 13px;
    min-height: 1.2em;
    color: #666;
    text-align: center;
    padding: 8px;
    border-radius: 6px;
  }

  #clw-msg.success {
    background: rgba(52, 199, 89, 0.1);
    color: #34C759;
  }

  #clw-msg.error {
    background: rgba(255, 69, 58, 0.1);
    color: #FF453A;
  }

  #clw-msg.pending {
    background: rgba(0, 122, 255, 0.1);
    color: #0066FF;
  }
  
 /* Smoother button interactions */
#clw-set-limit, #clw-revoke-limit, #clw-revoke-all {
  transition: 
    transform 100ms ease-out,
    background-color 150ms ease-out,
    box-shadow 150ms ease-out;
}

#clw-set-limit:active, #clw-revoke-limit:active, #clw-revoke-all:active {
  transform: scale(0.98);
}
`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'card-limits-widget';
  container.innerHTML = `
    <div id="clw-header">
      <h3>Card Spending Limits</h3>
      <h4>Control how much you spend — set precise spending limits on your MetaMask Card.</h4>
      <button id="clw-close">✕</button>
    </div>
    <div id="clw-content">
      <div class="radio-group">
        <input type="radio" name="clw-version" id="clw-v-int" value="International" checked />
        <label for="clw-v-int">International</label>
        <input type="radio" name="clw-version" id="clw-v-us" value="US" />
        <label for="clw-v-us">US</label>
      </div>
      
      <div class="token-list" id="clw-token-list"></div>
      
      <div class="input-container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label>Set Spending Limit</label>
          <span id="clw-balance-display" style="font-size: 12px; color: #666;"></span>
        </div>
        <div class="input-row">
          <input type="number" id="clw-new-limit" placeholder="0.00" min="0" step="any" />
        </div>
        <div class="slider-container">
          <input type="range" min="0" max="100" value="0" class="slider" id="clw-limit-slider">
          <div class="slider-labels">
            <span data-percent="0">0%</span>
            <span data-percent="25">25%</span>
            <span data-percent="50">50%</span>
            <span data-percent="75">75%</span>
            <span data-percent="100">100%</span>
          </div>
        </div>
      </div>
      
      <div class="button-group">
        <button id="clw-revoke-limit" disabled>Revoke</button>
        <button id="clw-set-limit" disabled>Set Limit</button>
      </div>
      
      <button id="clw-revoke-all" disabled>Revoke All</button>
      
      <div id="clw-msg"></div>
    </div>
`;
  document.body.appendChild(container);

  const tokenListEl = container.querySelector('#clw-token-list');
  const newLimitEl = container.querySelector('#clw-new-limit');
  const sliderEl = container.querySelector('#clw-limit-slider');
  const setBtn = container.querySelector('#clw-set-limit');
  const revokeBtn = container.querySelector('#clw-revoke-limit');
  const revokeAllBtn = container.querySelector('#clw-revoke-all');
  const msgEl = container.querySelector('#clw-msg');
  const closeBtn = container.querySelector('#clw-close');
  const sliderLabels = container.querySelectorAll('.slider-labels span');

  // ERC20 ABI for ethers.js
  const erc20ABI = [
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
  ];

  selectedToken = supportedTokens[0];
  selectedVersion = 'International';
  currentBalance = 0;

  refreshAllAllowances = async function() {
    clearMessage();
    const card = CARD_CONTRACTS[selectedVersion];
    const acct = await signer.getAddress();
    let hasNonZeroAllowances = false;
    let selectedTokenHasAllowance = false;
    
    try {
      // First fetch all allowances
      await Promise.all(supportedTokens.map(async (token) => {
        const tokenContract = new ethers.Contract(token.address, erc20ABI, provider);
        const rawAllowance = await tokenContract.allowance(acct, card);
        const allowanceValue = parseFloat(ethers.utils.formatUnits(rawAllowance, token.decimals));
        
        if (allowanceValue > 0) {
          hasNonZeroAllowances = true;
          if (token.symbol === selectedToken.symbol) {
            selectedTokenHasAllowance = true;
          }
        }
        
        const tokenElement = document.querySelector(`.token-item[data-symbol="${token.symbol}"]`);
        if (tokenElement) {
          const allowanceEl = tokenElement.querySelector('.allowance');
          allowanceEl.textContent = allowanceValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          });
        }
      }));

      revokeAllBtn.disabled = !hasNonZeroAllowances;
      revokeBtn.disabled = !selectedTokenHasAllowance;

      // Fetch balance for selected token
      const selectedTokenContract = new ethers.Contract(selectedToken.address, erc20ABI, provider);
      const balance = await selectedTokenContract.balanceOf(acct);
      currentBalance = parseFloat(ethers.utils.formatUnits(balance, selectedToken.decimals));
      document.getElementById('clw-balance-display').textContent = 
        `Balance: ${currentBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: selectedToken.decimals > 6 ? 6 : 2 // Show max 6 decimals for tokens with >6 decimals
  })} ${selectedToken.symbol}`; // Add token symbol here

      // Highlight selected token
      document.querySelectorAll('.token-item').forEach(el => {
        el.classList.remove('selected');
      });
      document.querySelector(`.token-item[data-symbol="${selectedToken.symbol}"]`)?.classList.add('selected');
      
      setBtn.disabled = false;
    } catch (e) {
      console.error('Error:', e);
      document.getElementById('clw-balance-display').textContent = 'Balance: Error';
      revokeAllBtn.disabled = true;
      revokeBtn.disabled = true;
      if (!e.message.includes('balanceOf')) {
        showMessage('Error fetching allowances', 'error');
      }
    }
  };

  async function initWidget(showWidget = false) {
    renderTokenList();
    
    if (showWidget) {
      container.style.display = 'block';
      widgetVisible = true;
    } else {
      container.style.display = 'none';
      widgetVisible = false;
    }
    
    // Load data in background
    document.querySelectorAll('.token-item .allowance').forEach(el => {
      el.textContent = 'Loading...';
    });
    document.getElementById('clw-balance-display').textContent = 'Balance: Loading...';
    
    await refreshAllAllowances();
    
    const defaultTokenElement = document.querySelector(`.token-item[data-symbol="${selectedToken.symbol}"]`);
    if (defaultTokenElement) {
      defaultTokenElement.classList.add('selected');
    }
  }

  function renderTokenList() {
    tokenListEl.innerHTML = '';
    supportedTokens.forEach(tok => {
      const div = document.createElement('div');
      div.className = 'token-item';
      div.dataset.symbol = tok.symbol;
      div.innerHTML = `
        <div class="token-name">
          <img src="${tok.icon}" class="token-icon" alt="${tok.symbol}" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDBDNS4zNzQgMCAwIDUuMzczIDAgMTJzNS4zNzQgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTNTEuNjI2IDAgMTIgMHptMCAxOC4yNS0zLjQ1NSAwLTYuMjUtMi43OTUtNi4yNS02LjI1UzguNTQ1IDUuNzUgMTIgNS43NXM2LjI1IDIuNzk1IDYuMjUgNi4yNS0yLjc5NSA2LjI1LTYuMjUgNi4yNXoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3N2Zz4='">
          <span>${tok.symbol}</span>
        </div>
        <span class="allowance">Loading...</span>
      `;
      div.onclick = async () => {
        // Remove 'selected' class from all tokens
        document.querySelectorAll('.token-item').forEach(el => {
          el.classList.remove('selected');
        });
        // Add 'selected' class to clicked token
        div.classList.add('selected');
        selectedToken = tok;
        
        // Show loading state for balance
        document.getElementById('clw-balance-display').textContent = 'Balance: Loading...';
        sliderEl.value = 0;
        newLimitEl.value = '';
        
        // Refresh data
        await refreshAllAllowances();
      };
      tokenListEl.appendChild(div);
    });
  }

  function showMessage(text, type = '') {
    msgEl.textContent = text;
    msgEl.className = type ? ` ${type}` : '';
  }

  function clearMessage() {
    msgEl.textContent = '';
    msgEl.className = '';
  }

  async function setAllowance() {
    const amt = newLimitEl.value.trim();
    if (!amt || isNaN(amt) || Number(amt) < 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }

    try {
      const amountInWei = ethers.utils.parseUnits(amt, selectedToken.decimals);
      const card = CARD_CONTRACTS[selectedVersion];
      
      showMessage('Processing transaction...', 'pending');
      
      const token = new ethers.Contract(selectedToken.address, erc20ABI, signer);

      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await token.estimateGas.approve(card, amountInWei);
      } catch (err) {
        console.error('Gas estimation error:', err);
        throw new Error('Transaction would likely fail: ' + err.message);
      }

      const tx = await token.approve(card, amountInWei, {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });

      showMessage('✓ Limit set successfully!', 'success');
      await tx.wait(); // Wait for confirmation
      refreshAllAllowances();
    } catch (e) {
      console.error('Transaction error:', e);
      showMessage(`✗ Failed: ${e.message.split('(')[0]}`, 'error');
    }
  }

  async function revokeAllowance() {
    try {
      const card = CARD_CONTRACTS[selectedVersion];
      showMessage('Processing transaction...', 'pending');
      
      const token = new ethers.Contract(selectedToken.address, erc20ABI, signer);
      
      const gasEstimate = await token.estimateGas.approve(card, 0);
      
      const tx = await token.approve(card, 0, {
        gasLimit: gasEstimate.mul(120).div(100)
      });
      
      showMessage('✓ Allowance revoked!', 'success');
      await tx.wait();
      refreshAllAllowances();
    } catch (e) {
      console.error('Error revoking allowance:', e);
      showMessage(`✗ Failed: ${e.message.split('(')[0]}`, 'error');
    }
  }

  revokeAllAllowances = async function() {
    const card = CARD_CONTRACTS[selectedVersion];
    const acct = await signer.getAddress();
    
    showMessage('Revoking all allowances...', 'pending');
    revokeAllBtn.disabled = true;
    
    try {
      for (const token of supportedTokens) {
        try {
          const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);
          const rawAllowance = await tokenContract.allowance(acct, card);
          const allowanceValue = parseFloat(ethers.utils.formatUnits(rawAllowance, token.decimals));
          
          if (allowanceValue > 0) {
            const gasEstimate = await tokenContract.estimateGas.approve(card, 0);
            const tx = await tokenContract.approve(card, 0, {
              gasLimit: gasEstimate.mul(120).div(100)
            });
            await tx.wait();
          }
        } catch (tokenError) {
          console.error(`Error revoking ${token.symbol}:`, tokenError);
        }
      }
      
      showMessage('✓ All allowances revoked!', 'success');
      refreshAllAllowances();
    } catch (e) {
      console.error('Error revoking all allowances:', e);
      showMessage(`✗ Failed to revoke all: ${e.message.split('(')[0]}`, 'error');
      revokeAllBtn.disabled = false;
    }
  };

  // Event listeners
  container.querySelectorAll('input[name="clw-version"]').forEach(radio => {
    radio.addEventListener('change', e => {
      selectedVersion = e.target.value;
      refreshAllAllowances();
    });
  });

  // Slider interaction
  sliderEl.addEventListener('input', function() {
    const percentage = this.value;
    const calculatedValue = (currentBalance * percentage) / 100;
    newLimitEl.value = calculatedValue.toFixed(selectedToken.decimals);
    setBtn.disabled = !newLimitEl.value.trim();
  });

  // Percentage label clicks
  sliderLabels.forEach(label => {
    label.addEventListener('click', () => {
      const percent = parseInt(label.dataset.percent);
      sliderEl.value = percent;
      
      // Trigger the input event to update the value
      const event = new Event('input');
      sliderEl.dispatchEvent(event);
    });
  });

  // Input field interaction
  newLimitEl.addEventListener('input', function() {
    const value = parseFloat(this.value) || 0;
    const percentage = Math.min(100, (value / currentBalance) * 100);
    sliderEl.value = percentage;
    setBtn.disabled = !this.value.trim();
  });

  setBtn.addEventListener('click', setAllowance);
  revokeBtn.addEventListener('click', revokeAllowance);
  revokeAllBtn.addEventListener('click', revokeAllAllowances);
  closeBtn.addEventListener('click', closeCardLimitsWidget);

  // Initialize
  renderTokenList();
  widgetVisible = false;
  initWidget(false);
}

function openCardLimitsWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('card-limits-widget');
        if (!container) return resolve();
        if (isCardLimitsWidgetOpen) return resolve();
        container.classList.remove('exiting');
        container.style.display = 'block';
        void container.offsetWidth;
        container.classList.add('entering');
        isCardLimitsWidgetOpen = true;
        refreshAllAllowances();
        container.removeEventListener('animationend', resolve);
        container.addEventListener('animationend', resolve, { once: true });
    });
}

function closeCardLimitsWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('card-limits-widget');
        if (!container) return resolve();
        if (!isCardLimitsWidgetOpen) return resolve();
        container.classList.remove('entering');
        container.classList.add('exiting');
        const onAnimationEnd = () => {
            container.style.display = 'none';
            container.classList.remove('exiting');
            isCardLimitsWidgetOpen = false;
            container.removeEventListener('animationend', onAnimationEnd);
            resolve();
        };
        container.addEventListener('animationend', onAnimationEnd, { once: true });
    });
}

export { openCardLimitsWidget, closeCardLimitsWidget, isCardLimitsWidgetOpen };
