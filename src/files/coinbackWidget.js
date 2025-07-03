let widgetVisible = false;
let testAddress = null;
let rewardsCheckInterval = null;
let loadData;
//let provider;
//let signer;
let isCoinbackWidgetOpen = false;

async function getUserAddress() {
  if (testAddress) return testAddress;
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (e) {
    console.error('Error getting user address:', e);
    return null;
  }
}

export async function createCoinbackWidget() {
  // Check if Ethereum provider is available
  if (!window.ethereum) {
    console.error('Ethereum provider not found');
    return;
  }

  // Initialize provider and signer
//  provider = new ethers.providers.Web3Provider(window.ethereum);
//  signer = provider.getSigner();

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
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translate(-50%, 20px);
      }
      to { 
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    @keyframes slideDown {
      from { 
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      to { 
        opacity: 0;
        transform: translate(-50%, 20px);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    #coinback-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 320px;
      z-index: 9999;
      background: white;
      color: #333;
      border-radius: 14px;
      padding: 0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      will-change: transform, opacity;
    }

    #coinback-widget.visible {
      display: block;
      animation: slideUp 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards;
    }

    #coinback-widget.closing {
      animation: slideDown 0.3s cubic-bezier(0.2, 0, 0.1, 1) forwards;
    }

    #coinback-widget.entering {
      animation: butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards;
    }

    #coinback-widget.exiting {
      animation: butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    #cbw-header {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
    }

    #coinback-widget h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #000;
    }

    #coinback-widget .subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    #cbw-close {
      position: absolute;
      top: 16px;
      right: 16px;
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
      z-index: 10;
    }

    #cbw-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000;
    }

    #cbw-content {
      padding: 16px 20px;
      position: relative;
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

    .radio-group input[type="radio"]:disabled + label {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .rewards-status {
      font-size: 14px;
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(0, 102, 255, 0.05);
      color: #0066FF;
    }

    .rewards-status.no-rewards {
      background: rgba(0, 0, 0, 0.05);
      color: #666;
    }

    .rewards-amount {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .rewards-amount-value {
      font-size: 24px;
      font-weight: 600;
    }

    #cbw-claim-btn {
      background: #0066FF;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    #cbw-claim-btn:hover {
      background: #0052D9;
    }

    #cbw-claim-btn:disabled {
      background: #e0e0e0;
      color: #999;
      cursor: not-allowed;
    }

    .rewards-stats {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }

    .rewards-stats .label {
      font-weight: 500;
    }

    .rewards-stats .value {
      font-weight: 600;
      color: #000;
    }

    .reward-list {
      max-height: 300px;
      overflow-y: auto;
      margin-top: 12px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .reward-item {
      padding: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .reward-item:last-child {
      border-bottom: none;
    }

    .reward-merchant {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .reward-amount {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #666;
    }

    .reward-date {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    #cbw-msg {
      margin-top: 12px;
      font-size: 13px;
      min-height: 1.2em;
      color: #666;
      text-align: center;
      padding: 8px;
      border-radius: 6px;
    }

    #cbw-msg.success {
      background: rgba(52, 199, 89, 0.1);
      color: #34C759;
    }

    #cbw-msg.error {
      background: rgba(255, 69, 58, 0.1);
      color: #FF453A;
    }

    #cbw-msg.pending {
      background: rgba(0, 122, 255, 0.1);
      color: #0066FF;
    }

    .test-address-input {
      margin-top: 16px;
      font-size: 12px;
    }

    .test-address-input input {
      width: 100%;
      padding: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      margin-top: 4px;
    }

    #cbw-iframe-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    height: 0;
    overflow: hidden;
    transition: height 0.3s ease, opacity 0.3s ease;
    background: white;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
    z-index: 10001;
    opacity: 0;
  }

    #cbw-iframe-container.active {
    height: 500px;
    opacity: 1;
  }

   #cbw-iframe-container iframe {
    width: 100%;
    height: 100%;
    border: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 14px;
  }
  
  #cbw-iframe-container iframe.loaded {
    opacity: 1;
  }
    
    #cbw-iframe-container iframe body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

    #cbw-iframe-close {
      position: absolute;
      top: 16px;
      right: 16px;
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
      z-index: 10;
    }

    #cbw-iframe-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000;
    }

  #cbw-iframe-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #0066FF;
    animation: spin 1s ease-in-out infinite;
    margin-right: 6px;
    vertical-align: middle;
    display: none;
  }
  #cbw-iframe-container.loading #cbw-iframe-spinner {
    display: block;
  }

    @media (max-width: 700px) {
      #cbw-iframe-container {
        transform: translate(-50%, -50%) !important;
        width: 90% !important;
        max-width: 320px;
      }
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'coinback-widget';
  container.innerHTML = `
    <div id="cbw-header">
      <h3>Coinback Rewards</h3>
      <p class="subtitle">Earn up to 8% in Coinback rewards on purchases made with your MetaMask Card.</p>
      <button id="cbw-close">✕</button>
    </div>
    <div id="cbw-content">
      <div class="radio-group">
        <input type="radio" name="cbw-tab" id="cbw-tab-rewards" value="rewards" checked />
        <label for="cbw-tab-rewards">Rewards</label>
        <input type="radio" name="cbw-tab" id="cbw-tab-details" value="details" />
        <label for="cbw-tab-details">Details</label>
      </div>
      
      <div class="tab-content active" id="rewards-tab">
        <div class="rewards-status no-rewards">Loading rewards...</div>
        <div class="rewards-amount">
          <div class="rewards-amount-value">$0.00</div>
          <button id="cbw-claim-btn" disabled>Claim</button>
        </div>
        <div class="rewards-stats">
          <div class="total-rewards"><span class="label">Total rewards:</span> <span class="value">$0.00</span></div>
        </div>
        <div class="rewards-stats">
          <div class="claimed-rewards"><span class="label">Claimed rewards:</span> <span class="value">$0.00</span></div>
        </div>
      </div>
      
      <div class="tab-content" id="details-tab">
        <div class="reward-list" id="reward-list"></div>
      </div>
      
      <div id="cbw-msg"></div>
      
      <div class="test-address-input">
        <label>Test Address (override):</label>
        <input type="text" id="cbw-test-address" placeholder="Enter address for testing" />
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Create iframe container (separate from main widget)
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'cbw-iframe-container';
  iframeContainer.innerHTML = `
    <div id="cbw-iframe-spinner"></div>
    <button id="cbw-iframe-close">✕</button>
  `;
  document.body.appendChild(iframeContainer);

  const rewardsTab = container.querySelector('#rewards-tab');
  const detailsTab = container.querySelector('#details-tab');
  const rewardsStatus = container.querySelector('.rewards-status');
  const rewardsAmount = container.querySelector('.rewards-amount-value');
  const claimBtn = container.querySelector('#cbw-claim-btn');
  const totalRewardsEl = container.querySelector('.total-rewards .value');
  const claimedRewardsEl = container.querySelector('.claimed-rewards .value');
  const rewardListEl = container.querySelector('#reward-list');
  const msgEl = container.querySelector('#cbw-msg');
  const closeBtn = container.querySelector('#cbw-close');
  const tabRadios = container.querySelectorAll('input[name="cbw-tab"]');
  const testAddressInput = container.querySelector('#cbw-test-address');
  const iframeCloseBtn = document.querySelector('#cbw-iframe-close');

  let rewardsData = null;
  let rewardDetails = null;
  let activeTab = 'rewards';

  async function fetchRewardsData(address) {
    try {
      const response = await fetch(`https://api.coinback.fun/api/user/stats?address=${address}`);
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      }
      throw new Error('Failed to fetch rewards data');
    } catch (e) {
      console.error('Error fetching rewards data:', e);
      throw e;
    }
  }

  async function fetchRewardDetails(address) {
    try {
      const response = await fetch(`https://api.coinback.fun/api/reward/list?status=1&address=${address}`);
      const data = await response.json();
      if (data.code === 200) {
        return data.data;
      }
      throw new Error('Failed to fetch reward details');
    } catch (e) {
      console.error('Error fetching reward details:', e);
      throw e;
    }
  }

  function renderRewardsTab() {
    if (!rewardsData) {
      rewardsStatus.textContent = 'Loading rewards...';
      rewardsStatus.className = 'rewards-status no-rewards';
      rewardsAmount.textContent = '$0.00';
      claimBtn.disabled = true;
      return;
    }

    const hasRewards = parseFloat(rewardsData.total_unclaimed_reward) > 0;
    
    if (hasRewards) {
      rewardsStatus.textContent = '🎉 Congrats! you have Coinback Rewards available to claim';
      rewardsStatus.className = 'rewards-status';
    } else {
      rewardsStatus.textContent = 'No rewards available for you at this time. Please check back later';
      rewardsStatus.className = 'rewards-status no-rewards';
    }

    rewardsAmount.textContent = `$${parseFloat(rewardsData.total_unclaimed_reward).toFixed(6)}`;
    totalRewardsEl.textContent = `$${parseFloat(rewardsData.total_reward).toFixed(6)}`;
    claimedRewardsEl.textContent = `$${parseFloat(rewardsData.total_claimed_reward).toFixed(6)}`;
    claimBtn.disabled = !hasRewards;

    const detailsTabRadio = container.querySelector('#cbw-tab-details');
    detailsTabRadio.disabled = !hasRewards;
    if (!hasRewards && activeTab === 'details') {
      container.querySelector('#cbw-tab-rewards').checked = true;
      rewardsTab.classList.add('active');
      detailsTab.classList.remove('active');
      activeTab = 'rewards';
    }
  }

  function renderRewardDetails() {
    if (!rewardDetails || rewardDetails.length === 0) {
      rewardListEl.innerHTML = '<div class="reward-item" style="text-align: center; color: #666;">No reward details available</div>';
      return;
    }

    const groupedRewards = {};
    rewardDetails.forEach(reward => {
      if (!groupedRewards[reward.merchant_name]) {
        groupedRewards[reward.merchant_name] = {
          amount: 0,
          value: 0,
          latestDate: 0
        };
      }
      groupedRewards[reward.merchant_name].amount += parseFloat(reward.token_amount);
      groupedRewards[reward.merchant_name].value += parseFloat(reward.token_value);
      if (reward.transaction_time > groupedRewards[reward.merchant_name].latestDate) {
        groupedRewards[reward.merchant_name].latestDate = reward.transaction_time;
      }
    });

    rewardListEl.innerHTML = '';
    Object.entries(groupedRewards).forEach(([merchant, data]) => {
      const item = document.createElement('div');
      item.className = 'reward-item';
      
      const date = new Date(data.latestDate * 1000);
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      item.innerHTML = `
        <div class="reward-merchant">
          <span>${merchant}</span>
          <span>$${data.value.toFixed(6)}</span>
        </div>
        <div class="reward-amount">
          <span>${data.amount.toLocaleString()} ${merchant}</span>
        </div>
        <div class="reward-date">Earned on ${dateStr}</div>
      `;
      
      rewardListEl.appendChild(item);
    });
  }

  async function claimRewards() {
  const address = await getUserAddress();
  if (!address) {
    showMessage('Failed to get wallet address', 'error');
    return;
  }

  let iframeContainer = document.getElementById('cbw-iframe-container');
  if (!iframeContainer) {
    iframeContainer = document.createElement('div');
    iframeContainer.id = 'cbw-iframe-container';
    iframeContainer.innerHTML = `
      <div id="cbw-iframe-spinner"></div>
      <button id="cbw-iframe-close">✕</button>
    `;
    document.body.appendChild(iframeContainer);
    
    // Add close button event listener
    document.getElementById('cbw-iframe-close').addEventListener('click', closeIframe);
  }

  // Show loading state
  iframeContainer.classList.add('loading');
  iframeContainer.classList.add('active');

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.coinback.fun/users/reward?address=${address}`;
  
  // Clear previous iframe if exists
  const oldIframe = iframeContainer.querySelector('iframe');
  if (oldIframe) oldIframe.remove();
  
  iframeContainer.appendChild(iframe);

  // When iframe loads
  iframe.onload = () => {
    iframeContainer.classList.remove('loading');
    iframe.classList.add('loaded');
  };

  // Start checking for claim success
  startClaimStatusCheck(address);
}

  function closeIframe() {
  const iframeContainer = document.getElementById('cbw-iframe-container');
  if (iframeContainer) {
    iframeContainer.classList.remove('active');
    setTimeout(() => {
      iframeContainer.classList.remove('loading');
      const iframe = iframeContainer.querySelector('iframe');
      if (iframe) iframe.classList.remove('loaded');
    }, 300);
  }
  stopClaimStatusCheck();
}

  function startClaimStatusCheck(address) {
    // Clear any existing interval
    stopClaimStatusCheck();
    
    // Check every 3 seconds
    rewardsCheckInterval = setInterval(async () => {
      try {
        const data = await fetchRewardsData(address);
        if (parseFloat(data.total_unclaimed_reward) === 0) {
          // Claim successful
          stopClaimStatusCheck();
          closeIframe();
          showMessage('Rewards claimed successfully!', 'success');
          await loadData(address); // Refresh data
        }
      } catch (e) {
        console.error('Error checking claim status:', e);
      }
    }, 3000);
  }

  function stopClaimStatusCheck() {
    if (rewardsCheckInterval) {
      clearInterval(rewardsCheckInterval);
      rewardsCheckInterval = null;
    }
  }

  function showMessage(text, type = '') {
    msgEl.textContent = text;
    msgEl.className = type ? ` ${type}` : '';
  }

  function clearMessage() {
    msgEl.textContent = '';
    msgEl.className = '';
  }

  loadData = async function(address) {
    try {
      showMessage('Loading data...', 'pending');
      [rewardsData, rewardDetails] = await Promise.all([
        fetchRewardsData(address),
        fetchRewardDetails(address)
      ]);
      
      renderRewardsTab();
      renderRewardDetails();
      clearMessage();
    } catch (e) {
      console.error('Error loading data:', e);
      showMessage('Failed to load rewards data', 'error');
    }
  };

  async function initWidget(showWidget = false) {
    if (showWidget) {
      container.classList.remove('closing');
      container.style.display = 'block';
      container.classList.add('visible');
      widgetVisible = true;
    } else {
      container.style.display = 'none';
      widgetVisible = false;
    }
    
    const address = await getUserAddress();
    if (address) {
      await loadData(address);
    } else {
      showMessage('Wallet not connected', 'error');
    }
  }

  // Event listeners
  tabRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      activeTab = e.target.value;
      rewardsTab.classList.toggle('active', activeTab === 'rewards');
      detailsTab.classList.toggle('active', activeTab === 'details');
    });
  });

  claimBtn.addEventListener('click', claimRewards);
  closeBtn.addEventListener('click', closeCoinbackWidget);
  iframeCloseBtn.addEventListener('click', closeIframe);

  testAddressInput.addEventListener('change', async (e) => {
    const address = e.target.value.trim();
    if (address) {
      testAddress = address;
      showMessage(`Using test address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`, 'pending');
      await loadData(address);
    } else {
      testAddress = null;
      clearMessage();
      const address = await getUserAddress();
      if (address) {
        await loadData(address);
      }
    }
  });

  // Initialize
  initWidget(false);
}

function openCoinbackWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('coinback-widget');
        if (!container) return resolve();
        if (isCoinbackWidgetOpen) return resolve();
        container.classList.remove('exiting');
        container.style.display = 'block';
        void container.offsetWidth;
        container.classList.add('entering');
        isCoinbackWidgetOpen = true;
        container.removeEventListener('animationend', resolve);
        container.addEventListener('animationend', resolve, { once: true });
        (async () => {
            const address = testAddress || (await getUserAddress());
            if (address && loadData) {
                await loadData(address);
            }
        })();
    });
}

function closeCoinbackWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('coinback-widget');
        if (!container) return resolve();
        if (!isCoinbackWidgetOpen) return resolve();
        container.classList.remove('entering');
        container.classList.add('exiting');
        const onAnimationEnd = () => {
            container.style.display = 'none';
            container.classList.remove('exiting');
            isCoinbackWidgetOpen = false;
            container.removeEventListener('animationend', onAnimationEnd);
            resolve();
        };
        container.addEventListener('animationend', onAnimationEnd, { once: true });
    });
}

// Add trigger to header bar
document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('coinback-trigger');
  if (trigger) {
    trigger.addEventListener('click', openCoinbackWidget);
  }
});

export { openCoinbackWidget, closeCoinbackWidget, isCoinbackWidgetOpen };
