// shoppingListWidget.js
// Global state variables
let widgetVisible = false;
let signer;
let provider;
let contract;
let activeTab = 'wishlist';
let currentPage = 0;
let isLoading = false;
const ITEMS_PER_PAGE = 10;
let isShoppingListWidgetOpen = false;

// Shopping List Contract ABI
const SHOPPING_LIST_ABI = [
    "function addItem(bytes32 _name) external",
    "function togglePurchased(uint256 _itemId) external",
    "function deleteItem(uint256 _itemId) external",
    "function getItem(uint256 _itemId) external view returns (bytes32 name, bool purchasedStatus, bool existsStatus)",
    "function getItemCount() external view returns (uint256)",
    "function getHistory(uint256 _index) external view returns (uint256 itemId, uint8 action, uint256 timestamp)",
    "function getHistoryCount() external view returns (uint256)",
    "event ItemAdded(address indexed user, uint256 indexed itemId, bytes32 name)",
    "event ItemToggled(address indexed user, uint256 indexed itemId, bool purchased)",
    "event ItemDeleted(address indexed user, uint256 indexed itemId)"
];

// Contract bytecode placeholder (replace with actual bytecode)
const SHOPPING_LIST_BYTECODE = '6080604052348015600f57600080fd5b5061064c8061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632c95ad521461005c5780633129e77314610071578063651ea6f1146100a6578063654fc833146100b95780637749cf23146100cc575b600080fd5b61006f61006a366004610568565b6100dd565b005b61008461007f366004610568565b61021c565b6040805193845291151560208401521515908201526060015b60405180910390f35b61006f6100b4366004610568565b6102d6565b61006f6100c7366004610568565b61044e565b606c5460405190815260200161009d565b6064606c54106101295760405162461bcd60e51b8152602060048201526012602482015271125d195b481b1a5b5a5d081c995858da195960721b60448201526064015b60405180910390fd5b606c546064811061014c5760405162461bcd60e51b815260040161012090610581565b8160008260648110610160576101606105b0565b01556000606482818110610176576101766105b0565b602091828204019190066101000a81548160ff0219169083151502179055506001606882606481106101aa576101aa6105b0565b602091828204019190066101000a81548160ff021916908315150217905550606c60008154809291906101dc906105c6565b9091555050604051828152819033907f4ec8d713e5c83065f2c149f90d95719d8fa6f55088577ad6c7aa0bddab7761d49060200160405180910390a35050565b6000806000606c5484106102425760405162461bcd60e51b8152600401610120906105ed565b606484106102625760405162461bcd60e51b815260040161012090610581565b60008460648110610275576102756105b0565b01546064856064811061028a5761028a6105b0565b602081049091015460ff601f9092166101000a900416606886606481106102b3576102b36105b0565b602091828204019190069054906101000a900460ff169250925092509193909250565b606c5481106102f75760405162461bcd60e51b8152600401610120906105ed565b606481106103175760405162461bcd60e51b815260040161012090610581565b6068816064811061032a5761032a6105b0565b602081049091015460ff601f9092166101000a9004166103825760405162461bcd60e51b8152602060048201526013602482015272125d195b48191bd95cc81b9bdd08195e1a5cdd606a1b6044820152606401610120565b60648160648110610395576103956105b0565b602081049091015460ff601f9092166101000a900416156064828181106103be576103be6105b0565b602091828204019190066101000a81548160ff02191690831515021790555080336001600160a01b03167f6d384e64b540f776d6a309716096690b37a7753b25801faa790d989acee6a1ab6064846064811061041c5761041c6105b0565b602091828204019190069054906101000a900460ff16604051610443911515815260200190565b60405180910390a350565b606c54811061046f5760405162461bcd60e51b8152600401610120906105ed565b6064811061048f5760405162461bcd60e51b815260040161012090610581565b606881606481106104a2576104a26105b0565b602081049091015460ff601f9092166101000a9004166104fa5760405162461bcd60e51b8152602060048201526013602482015272125d195b48191bd95cc81b9bdd08195e1a5cdd606a1b6044820152606401610120565b60006068826064811061050f5761050f6105b0565b602091828204019190066101000a81548160ff02191690831515021790555080336001600160a01b03167f21c5ff13f7a7163d7cd6a98d82517de93dcc833b527ad63a5550894be16070c860405160405180910390a350565b60006020828403121561057a57600080fd5b5035919050565b6020808252601590820152744974656d204944206f7574206f6620626f756e647360581b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b6000600182016105e657634e487b7160e01b600052601160045260246000fd5b5060010190565b6020808252600f908201526e125b9d985b1a59081a5d195b481251608a1b60408201526060019056fea2646970667358221220538f97b67589aa0df14eb95eab6389626e2bc7ef1b90a31f8d68f970c001a23164736f6c634300081e0033';

// Design tokens
const designTokens = {
    colors: {
        background: '#f5f5f7',
        surface: '#ffffff',
        primary: '#0071e3',
        primaryHover: '#0077ed',
        text: '#1d1d1f',
        textSecondary: '#86868b',
        border: '#d2d2d7',
        success: '#34c759',
        error: '#ff3b30',
        warning: '#ff9500',
        purchased: '#34c759',
        deleted: '#ff3b30'
    },
    shadows: {
        widget: '0 12px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        button: '0 1px 3px rgba(0, 0, 0, 0.08)',
        buttonHover: '0 2px 6px rgba(0, 0, 0, 0.12)'
    },
    radii: {
        small: '6px',
        medium: '12px',
        large: '18px'
    },
    spacing: {
        small: '8px',
        medium: '16px',
        large: '24px'
    }
};

function openShoppingListWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('shopping-list-widget');
        if (!container) return resolve();
        if (isShoppingListWidgetOpen) return resolve();
        container.classList.remove('exiting');
        container.style.display = 'block';
        void container.offsetWidth;
        container.classList.add('entering');
        isShoppingListWidgetOpen = true;
        container.removeEventListener('animationend', resolve);
        container.addEventListener('animationend', resolve, { once: true });
    });
}

function closeShoppingListWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('shopping-list-widget');
        if (!container) return resolve();
        if (!isShoppingListWidgetOpen) return resolve();
        container.classList.remove('entering');
        container.classList.add('exiting');
        const onAnimationEnd = () => {
            container.style.display = 'none';
            container.classList.remove('exiting');
            isShoppingListWidgetOpen = false;
            container.removeEventListener('animationend', onAnimationEnd);
            resolve();
        };
        container.addEventListener('animationend', onAnimationEnd, { once: true });
    });
}

// Main widget creation function
async function createShoppingListWidget() {
    // Check if widget already exists
    if (document.getElementById('shopping-list-widget')) {
        openShoppingListWidget();
        return;
    }

    // Reset state variables
    activeTab = 'wishlist';
    currentPage = 0;
    isLoading = false;

    // Load Ethers.js dynamically
    if (!window.ethers) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => {
            script.onload = resolve;
            script.onerror = () => {
                console.error('Failed to load Ethers.js');
                resolve();
            };
        });
    }

    if (!window.ethereum) {
        showGlobalMessage('Please install MetaMask to use the Shopping List widget', 'error');
        return;
    }

    // Initialize provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
        await provider.send('eth_requestAccounts', []);
        signer = provider.getSigner();
    } catch (error) {
        showGlobalMessage('Failed to connect wallet: ' + error.message, 'error');
        return;
    }

    // Create widget structure
    createWidgetStructure();

    // Initialize contract
    await initializeContract();
}

function createWidgetStructure() {
    // Add Inter font
    if (!document.querySelector('#inter-font')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'inter-font';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
        document.head.appendChild(fontLink);
    }

    // Create widget styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        #shopping-list-widget {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 380px;
            z-index: 9999;
            background: ${designTokens.colors.surface};
            color: ${designTokens.colors.text};
            border-radius: ${designTokens.radii.large};
            padding: 0;
            box-shadow: ${designTokens.shadows.widget};
            overflow: hidden;
            animation: slideUp 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards;
            will-change: transform, opacity;
            border: 1px solid ${designTokens.colors.border};
        }
        #slw-header {
            padding: ${designTokens.spacing.medium} ${designTokens.spacing.large};
            border-bottom: 1px solid ${designTokens.colors.border};
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
        }
        #slw-header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: ${designTokens.colors.text};
        }
        #slw-header p {
            margin: 4px 0 0;
            font-size: 13px;
            color: ${designTokens.colors.textSecondary};
        }
        #slw-close {
            background: none;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: ${designTokens.radii.small};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: ${designTokens.colors.textSecondary};
            transition: all 0.15s ease;
        }
        #slw-close:hover {
            background: rgba(0, 0, 0, 0.05);
            color: ${designTokens.colors.text};
        }
        .slw-radio-group {
            display: flex;
            gap: 4px;
            margin-bottom: 0;
            background: rgba(0, 0, 0, 0.05);
            padding: 4px;
            border-radius: ${designTokens.radii.medium};
            margin: 0 ${designTokens.spacing.large};
            margin-top: ${designTokens.spacing.medium};
        }
        .slw-radio-group label {
            font-size: 13px;
            background: transparent;
            padding: 6px 12px;
            border-radius: 6px;
            color: ${designTokens.colors.textSecondary};
            cursor: pointer;
            transition: all 0.15s ease;
            font-weight: 500;
            flex: 1;
            text-align: center;
        }
        .slw-radio-group input[type="radio"] {
            display: none;
        }
        .slw-radio-group input[type="radio"]:checked + label {
            background: white;
            color: ${designTokens.colors.primary};
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        #slw-content {
            padding: ${designTokens.spacing.large};
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
            background: ${designTokens.colors.background};
        }
        .slw-homepage {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        }
        .slw-homepage h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 10px;
            color: ${designTokens.colors.text};
        }
        .slw-homepage p {
            font-size: 14px;
            color: ${designTokens.colors.textSecondary};
            margin: 0 0 20px;
            max-width: 280px;
            line-height: 1.5;
        }
        .slw-homepage img {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
            opacity: 0.8;
        }
        .slw-deploy-btn {
            padding: 10px 24px;
            background: ${designTokens.colors.primary};
            color: white;
            border: none;
            border-radius: ${designTokens.radii.medium};
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: ${designTokens.shadows.button};
        }
        .slw-deploy-btn:hover {
            background: ${designTokens.colors.primaryHover};
            box-shadow: ${designTokens.shadows.buttonHover};
        }
        .slw-deploy-btn:disabled {
            background: #e0e0e0;
            color: #999;
            cursor: not-allowed;
            box-shadow: none;
        }
        .slw-empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
            color: ${designTokens.colors.textSecondary};
            text-align: center;
            animation: fadeIn 0.3s ease;
        }
        .slw-empty-state svg {
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }
        .slw-empty-state p {
            margin: 8px 0 0;
            font-size: 13px;
        }
        .slw-item-list {
            margin: 0;
            padding: 0;
            list-style: none;
            animation: fadeIn 0.3s ease;
        }
        .slw-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: ${designTokens.radii.small};
            margin-bottom: ${designTokens.spacing.small};
            background: ${designTokens.colors.surface};
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition: all 0.15s ease;
        }
        .slw-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .slw-item-checkbox {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 1px solid ${designTokens.colors.border};
            border-radius: ${designTokens.radii.small};
            margin-right: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }
        .slw-item-checkbox:checked {
            background: ${designTokens.colors.primary};
            border-color: ${designTokens.colors.primary};
        }
        .slw-item-checkbox:checked::after {
            content: "✓";
            color: white;
            font-size: 12px;
        }
        .slw-item-name {
            flex: 1;
            font-size: 14px;
            transition: all 0.15s ease;
        }
        .slw-item-name.completed {
            color: ${designTokens.colors.textSecondary};
            text-decoration: line-through;
        }
        .slw-item-delete {
            background: none;
            border: none;
            width: 24px;
            height: 24px;
            border-radius: ${designTokens.radii.small};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: ${designTokens.colors.textSecondary};
            transition: all 0.15s ease;
            opacity: 0;
        }
        .slw-item:hover .slw-item-delete {
            opacity: 1;
        }
        .slw-item-delete:hover {
            background: rgba(255, 59, 48, 0.1);
            color: ${designTokens.colors.error};
        }
        .slw-add-item-container {
            display: flex;
            margin-top: ${designTokens.spacing.small};
            margin-bottom: 0px;
            gap: ${designTokens.spacing.small};
            padding: 0 ${designTokens.spacing.large} ${designTokens.spacing.small};
            background: ${designTokens.colors.background};
        }
        #slw-new-item {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid ${designTokens.colors.border};
            border-radius: ${designTokens.radii.medium};
            font-size: 14px;
            outline: none;
            transition: all 0.15s ease;
            background: ${designTokens.colors.surface};
        }
        #slw-new-item:focus {
            border-color: ${designTokens.colors.primary};
            box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }
        #slw-add-item {
            padding: 10px 16px;
            background: ${designTokens.colors.primary};
            color: white;
            border: none;
            border-radius: ${designTokens.radii.medium};
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: ${designTokens.shadows.button};
        }
        #slw-add-item:hover {
            background: ${designTokens.colors.primaryHover};
            box-shadow: ${designTokens.shadows.buttonHover};
        }
        #slw-add-item:disabled {
            background: #e0e0e0;
            color: #999;
            cursor: not-allowed;
            box-shadow: none;
        }
        #slw-msg {
            margin: ${designTokens.spacing.small} ${designTokens.spacing.large} 0;
            font-size: 13px;
            min-height: 1.2em;
            color: ${designTokens.colors.textSecondary};
            text-align: center;
            padding: 8px;
            border-radius: ${designTokens.radii.small};
            animation: fadeIn 0.3s ease;
        }
        #slw-msg.success {
            background: rgba(52, 199, 89, 0.1);
            color: ${designTokens.colors.success};
        }
        #slw-msg.error {
            background: rgba(255, 69, 58, 0.1);
            color: ${designTokens.colors.error};
        }
        #slw-msg.pending {
            background: rgba(0, 122, 255, 0.1);
            color: ${designTokens.colors.primary};
        }
        .slw-pagination {
            display: flex;
            justify-content: center;
            gap: ${designTokens.spacing.small};
            margin-top: 0px;
            padding: 0 ${designTokens.spacing.large};
            background: ${designTokens.colors.background};
            margin-bottom: ${designTokens.spacing.large};
        }
        .slw-pagination-btn {
            padding: 8px 16px;
            background: ${designTokens.colors.surface};
            color: ${designTokens.colors.text};
            border: 1px solid ${designTokens.colors.border};
            border-radius: ${designTokens.radii.medium};
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: ${designTokens.shadows.button};
        }
        .slw-pagination-btn:hover {
            background: #f5f5f5;
            box-shadow: ${designTokens.shadows.buttonHover};
        }
        .slw-pagination-btn:disabled {
            background: ${designTokens.colors.surface};
            color: ${designTokens.colors.textSecondary};
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.7;
        }
        .slw-history-list {
            margin: 0;
            padding: 0;
            list-style: none;
            animation: fadeIn 0.3s ease;
        }
        .slw-history-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-radius: ${designTokens.radii.small};
            margin-bottom: ${designTokens.spacing.small};
            background: ${designTokens.colors.surface};
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            transition: all 0.15s ease;
        }
        .slw-history-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .slw-history-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .slw-history-icon.purchased {
            background: rgba(52, 199, 89, 0.1);
            color: ${designTokens.colors.purchased};
        }
        .slw-history-icon.deleted {
            background: rgba(255, 59, 48, 0.1);
            color: ${designTokens.colors.deleted};
        }
        .slw-history-icon.added {
            background: rgba(0, 122, 255, 0.1);
            color: ${designTokens.colors.primary};
        }
        .slw-history-details {
            flex: 1;
            font-size: 13px;
        }
        .slw-history-item-name {
            font-weight: 500;
            margin-bottom: 2px;
        }
        .slw-history-item-action {
            color: ${designTokens.colors.textSecondary};
            font-size: 12px;
        }
        .slw-history-item-time {
            color: ${designTokens.colors.textSecondary};
            font-size: 11px;
            text-align: right;
            min-width: 80px;
            margin-left: 12px;
        }
        .slw-loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top-color: ${designTokens.colors.primary};
            animation: spin 1s ease-in-out infinite;
            margin-right: 6px;
            vertical-align: middle;
        }
        .global-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: ${designTokens.radii.medium};
            background: ${designTokens.colors.surface};
            box-shadow: ${designTokens.shadows.widget};
            z-index: 10000;
            display: flex;
            align-items: center;
            animation: slideUp 0.3s ease forwards;
            border: 1px solid ${designTokens.colors.border};
        }
        .global-message.error {
            color: ${designTokens.colors.error};
        }
        .global-message img {
            margin-right: 8px;
        }
        #shopping-list-widget.entering {
          animation: butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards;
        }
        #shopping-list-widget.exiting {
          animation: butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
    `;
    document.head.appendChild(style);

    // Create widget container
    const container = document.createElement('div');
    container.id = 'shopping-list-widget';
    container.innerHTML = `
    <div id="slw-header">
        <div>
            <h2>Shopping List</h2>
            <p>On-chain shopping management</p>
        </div>
        <button id="slw-close" aria-label="Close widget">✕</button>
    </div>
    <div id="slw-tabs-container" style="display: none;">
        <div class="slw-radio-group">
            <input type="radio" name="slw-tab" id="slw-tab-wishlist" value="wishlist" checked>
            <label for="slw-tab-wishlist">Wishlist</label>
            <input type="radio" name="slw-tab" id="slw-tab-history" value="history">
            <label for="slw-tab-history">History</label>
        </div>
    </div>
    <div id="slw-content">
        <!-- Content will be dynamically loaded -->
    </div>
    <div id="slw-controls" style="display: none;">
        <div class="slw-add-item-container">
            <input type="text" id="slw-new-item" placeholder="Add new item..." aria-label="New item name">
            <button id="slw-add-item" disabled>Add</button>
        </div>
        <div id="slw-msg"></div>
        <div class="slw-pagination">
            <button class="slw-pagination-btn" id="slw-prev-page" disabled>Previous</button>
            <button class="slw-pagination-btn" id="slw-next-page" disabled>Next</button>
        </div>
    </div>
`;
    document.body.appendChild(container);
}

// Updated initializeContract function
async function initializeContract() {
    const userAddress = await signer.getAddress();
    const contentEl = document.querySelector('#slw-content');
    const controlsEl = document.querySelector('#slw-controls');
    const tabsContainer = document.querySelector('#slw-tabs-container');

    // Reset state variables
    activeTab = 'wishlist';
    currentPage = 0;
    isLoading = false;

    // Check for deployed contract
    const storedAddress = localStorage.getItem(`shoppingList_${userAddress}`);
    let isDeployed = false;
    
    if (storedAddress) {
        contract = new ethers.Contract(storedAddress, SHOPPING_LIST_ABI, signer);
        try {
            // Verify contract exists and is valid
            await contract.getItemCount();
            isDeployed = true;
        } catch (err) {
            console.error('Invalid contract address:', err);
            localStorage.removeItem(`shoppingList_${userAddress}`);
            contract = null;
        }
    }

    if (isDeployed) {
        controlsEl.style.display = 'block';
        tabsContainer.style.display = 'block'; // Show tabs only when contract is deployed
        await renderContent();
        setupEventListeners();
    } else {
        renderHomepage();
        setupCloseListener(); // Setup close button listener for homepage
    }
}

// New function to handle close button on homepage
function setupCloseListener() {
    const closeBtn = document.querySelector('#slw-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeShoppingListWidget);
    }
}

// Updated deployContract function
async function deployContract() {
    const contentEl = document.querySelector('#slw-content');
    const controlsEl = document.querySelector('#slw-controls');
    const tabsContainer = document.querySelector('#slw-tabs-container');
    const deployBtn = contentEl.querySelector('#deploy-contract-btn');
    
    try {
        deployBtn.disabled = true;
        deployBtn.innerHTML = '<span class="slw-loading-spinner"></span> Creating...';
        
        showMessage('Deploying your shopping list contract...', 'pending');
        
        const factory = new ethers.ContractFactory(SHOPPING_LIST_ABI, SHOPPING_LIST_BYTECODE, signer);
        contract = await factory.deploy();
        await contract.deployed();
        
        // Save contract address to localStorage
        const userAddress = await signer.getAddress();
        localStorage.setItem(`shoppingList_${userAddress}`, contract.address);
        
        // Update UI - show tabs and controls
        controlsEl.style.display = 'block';
        tabsContainer.style.display = 'block';
        await renderContent();
        setupEventListeners();
        
        showMessage('Shopping list created successfully!', 'success');
    } catch (err) {
        console.error('Failed to deploy contract:', err);
        showMessage('Failed to create shopping list: ' + err.message, 'error');
        
        if (deployBtn) {
            deployBtn.disabled = false;
            deployBtn.textContent = 'Create Shopping List';
        }
    }
}

function renderHomepage() {
    const contentEl = document.querySelector('#slw-content');
    contentEl.innerHTML = `
        <div class="slw-homepage">
            <h2>Welcome to Your<br>Shopping List</h2>
            <p>Create a secure, on-chain shopping list to easily track and manage your items directly on the blockchain, anytime and from anywhere.</p>
            <img src="https://i.imgur.com/8FwJJqB.png" alt="Shopping List" style="width:80px;height:80px;margin-bottom:20px;opacity:0.8;" />
            <button class="slw-deploy-btn" id="deploy-contract-btn">Create Shopping List</button>
        </div>
    `;
    
    const deployBtn = contentEl.querySelector('#deploy-contract-btn');
    deployBtn.addEventListener('click', deployContract);
}

function setupEventListeners() {
    const container = document.getElementById('shopping-list-widget');
    const contentEl = container.querySelector('#slw-content');
    const newItemEl = container.querySelector('#slw-new-item');
    const addBtn = container.querySelector('#slw-add-item');
    const msgEl = container.querySelector('#slw-msg');
    const closeBtn = container.querySelector('#slw-close');
    const tabRadios = container.querySelectorAll('input[name="slw-tab"]');
    const prevPageBtn = container.querySelector('#slw-prev-page');
    const nextPageBtn = container.querySelector('#slw-next-page');

    newItemEl.addEventListener('input', (e) => {
        const isValid = e.target.value.trim().length > 0;
        addBtn.disabled = !isValid;
        
        // Optional: Visual feedback
        if (isValid) {
            addBtn.style.opacity = '1';
            addBtn.style.cursor = 'pointer';
        } else {
            addBtn.style.opacity = '0.7';
            addBtn.style.cursor = 'not-allowed';
        }
    });

    newItemEl.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && newItemEl.value.trim()) {
            await addItem();
        }
    });

    addBtn.addEventListener('click', addItem);

    tabRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (isLoading) return;
            activeTab = radio.value;
            currentPage = 0; // Reset page on tab switch
            renderContent();
        });
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 0 && !isLoading) {
            currentPage--;
            renderContent();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (!isLoading) {
            currentPage++;
            renderContent();
        }
    });

    closeBtn.addEventListener('click', closeShoppingListWidget);

    // Listen for contract events
    contract.on('ItemAdded', () => renderContent());
    contract.on('ItemToggled', () => renderContent());
    contract.on('ItemDeleted', () => renderContent());
}

async function renderContent() {
    if (activeTab === 'wishlist') {
        await renderWishlist();
    } else {
        await renderHistory();
    }
}

async function renderWishlist() {
    const contentEl = document.querySelector('#slw-content');
    if (isLoading) return;
    
    isLoading = true;
    try {
        const itemCount = await contract.getItemCount();
        const start = currentPage * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, itemCount);
        const items = [];

        // Show loading state
        contentEl.innerHTML = `
            <div style="display: flex; justify-content: center; padding: 40px 0;">
                <span class="slw-loading-spinner"></span>
            </div>
        `;

        // Batch fetch items for better performance
        const batchSize = 5;
        for (let i = start; i < end; i += batchSize) {
            const batchEnd = Math.min(i + batchSize, end);
            const batchPromises = [];
            
            for (let j = i; j < batchEnd; j++) {
                batchPromises.push(contract.getItem(j));
            }
            
            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach((item, index) => {
                if (item.existsStatus) {
                    items.push({
                        id: i + index,
                        name: ethers.utils.parseBytes32String(item.name),
                        purchased: item.purchasedStatus
                    });
                }
            });
        }

        const prevPageBtn = document.querySelector('#slw-prev-page');
        const nextPageBtn = document.querySelector('#slw-next-page');
        prevPageBtn.disabled = currentPage === 0;
        nextPageBtn.disabled = end >= itemCount;

        if (items.length === 0 && start === 0) {
            renderEmptyState();
            return;
        }

        const listEl = document.createElement('ul');
        listEl.className = 'slw-item-list';

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'slw-item';
            li.innerHTML = `
                <input type="checkbox" class="slw-item-checkbox" ${item.purchased ? 'checked' : ''} 
                    data-id="${item.id}" ${isLoading ? 'disabled' : ''}>
                <span class="slw-item-name ${item.purchased ? 'completed' : ''}">${item.name}</span>
                <button class="slw-item-delete" data-id="${item.id}" ${isLoading ? 'disabled' : ''}>
                    ✕
                </button>
            `;
            listEl.appendChild(li);
        });

        contentEl.innerHTML = '';
        contentEl.appendChild(listEl);

        // Attach event listeners scoped to contentEl
        const checkboxes = contentEl.querySelectorAll('.slw-item-checkbox');
        const deleteBtns = contentEl.querySelectorAll('.slw-item-delete');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', toggleItem);
            // Ensure enabled after loading
            checkbox.disabled = false;
        });
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', deleteItem);
            // Ensure enabled after loading
            btn.disabled = false;
        });
    } catch (error) {
        showMessage('Error loading items: ' + error.message, 'error');
        console.error(error);
    } finally {
        isLoading = false;
    }
}

async function renderHistory() {
    const contentEl = document.querySelector('#slw-content');
    if (isLoading) return;
    
    isLoading = true;
    try {
        // First check if the contract supports history
        let historySupported = true;
        let historyCount = 0;
        
        try {
            historyCount = await contract.getHistoryCount();
        } catch (error) {
            console.log("History not supported by this contract");
            historySupported = false;
        }

        if (!historySupported) {
            renderHistoryNotSupported();
            return;
        }

        const start = currentPage * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, historyCount);
        const historyItems = [];

        // Show loading state
        contentEl.innerHTML = `
            <div style="display: flex; justify-content: center; padding: 40px 0;">
                <span class="slw-loading-spinner"></span>
            </div>
        `;

        if (historyCount === 0) {
            renderEmptyHistoryState();
            return;
        }

        // Batch fetch history items
        const batchSize = 5;
        for (let i = start; i < end; i += batchSize) {
            const batchEnd = Math.min(i + batchSize, end);
            const batchPromises = [];
            
            for (let j = i; j < batchEnd; j++) {
                batchPromises.push(contract.getHistory(j));
            }
            
            const batchResults = await Promise.all(batchPromises);
            for (let j = 0; j < batchResults.length; j++) {
                const [itemId, action, timestamp] = batchResults[j];
                
                // Get item details if it still exists
                let itemName = "Deleted Item";
                try {
                    const item = await contract.getItem(itemId);
                    if (item.existsStatus) {
                        itemName = ethers.utils.parseBytes32String(item.name);
                    }
                } catch (error) {
                    console.log("Item not found, using default name");
                }
                
                historyItems.push({
                    id: i + j,
                    itemId: itemId,
                    action: action, // 0 = added, 1 = purchased, 2 = deleted
                    name: itemName,
                    timestamp: new Date(timestamp * 1000)
                });
            }
        }

        const prevPageBtn = document.querySelector('#slw-prev-page');
        const nextPageBtn = document.querySelector('#slw-next-page');
        prevPageBtn.disabled = currentPage === 0;
        nextPageBtn.disabled = end >= historyCount;

        if (historyItems.length === 0 && start === 0) {
            renderEmptyHistoryState();
            return;
        }

        const listEl = document.createElement('ul');
        listEl.className = 'slw-history-list';

        historyItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'slw-history-item';
            
            let actionText = "";
            let iconClass = "";
            let iconSymbol = "";
            
            switch(item.action) {
                case 0: // Added
                    actionText = "Added to list";
                    iconClass = "added";
                    iconSymbol = "+";
                    break;
                case 1: // Purchased
                    actionText = "Marked as purchased";
                    iconClass = "purchased";
                    iconSymbol = "✓";
                    break;
                case 2: // Deleted
                    actionText = "Removed from list";
                    iconClass = "deleted";
                    iconSymbol = "✕";
                    break;
                default:
                    actionText = "Unknown action";
                    iconClass = "";
                    iconSymbol = "?";
            }
            
            li.innerHTML = `
                <div class="slw-history-icon ${iconClass}">${iconSymbol}</div>
                <div class="slw-history-details">
                    <div class="slw-history-item-name">${item.name}</div>
                    <div class="slw-history-item-action">${actionText}</div>
                </div>
                <div class="slw-history-item-time">${formatTime(item.timestamp)}</div>
            `;
            listEl.appendChild(li);
        });

        contentEl.innerHTML = '';
        contentEl.appendChild(listEl);
    } catch (error) {
        console.error('Error loading history:', error);
        showMessage('Error loading history', 'error');
        renderHistoryErrorState();
    } finally {
        isLoading = false;
    }
}

// New function to show history not supported state
function renderHistoryNotSupported() {
    const contentEl = document.querySelector('#slw-content');
    contentEl.innerHTML = `
        <div class="slw-empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>History tracking will be available soon</p>
        </div>
    `;
}

// New function to show history error state
function renderHistoryErrorState() {
    const contentEl = document.querySelector('#slw-content');
    contentEl.innerHTML = `
        <div class="slw-empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Failed to load history</p>
            <p>Please try again later</p>
        </div>
    `;
}


function formatTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

function renderEmptyState() {
    const contentEl = document.querySelector('#slw-content');
    contentEl.innerHTML = `
        <div class="slw-empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5H21L19 12H5L3 5ZM3 5L2.25 3M8 13H16M11 16H13M12 3V5M9 20C9 20.5523 9.44772 21 10 21H14C14.5523 21 15 20.5523 15 20V19H9V20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Your shopping list is empty</p>
            <p>Add your first item to get started</p>
        </div>
    `;
}

function renderEmptyHistoryState() {
    const contentEl = document.querySelector('#slw-content');
    contentEl.innerHTML = `
        <div class="slw-empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>No history available yet</p>
            <p>Your actions will appear here</p>
        </div>
    `;
}

async function addItem() {
    const container = document.getElementById('shopping-list-widget');
    const newItemEl = container.querySelector('#slw-new-item');
    const addBtn = container.querySelector('#slw-add-item');
    const itemName = newItemEl.value.trim();
    
    if (!itemName) return;

    try {
        showMessage('Adding item...', 'pending');
        addBtn.disabled = true;
        addBtn.innerHTML = '<span class="slw-loading-spinner"></span> Adding...';
        
        const tx = await contract.addItem(ethers.utils.formatBytes32String(itemName));
        await tx.wait();
        
        newItemEl.value = '';
        addBtn.disabled = true;
        addBtn.textContent = 'Add';
        showMessage('Item added successfully!', 'success');
    } catch (error) {
        // Handle user rejection
        if (error.code === 4001 || error.message?.includes('user rejected')) {
            showMessage('Transaction cancelled', 'error');
        } 
        // Handle insufficient funds
        else if (error.code === 'INSUFFICIENT_FUNDS') {
            showMessage('Insufficient funds for transaction', 'error');
        }
        // Handle other errors
        else {
            console.error('Add item error:', error);
            showMessage('Failed to add item', 'error');
        }
        addBtn.disabled = false;
        addBtn.textContent = 'Add';
    }
}

async function toggleItem(e) {
    const itemId = e.target.dataset.id;
    const checkbox = e.target;
    const originalState = checkbox.checked;
    
    try {
        showMessage('Updating item...', 'pending');
        checkbox.disabled = true;
        
        const tx = await contract.togglePurchased(itemId);
        await tx.wait();
        
        showMessage('Item updated!', 'success');
    } catch (error) {
        // Revert UI state
        checkbox.checked = !originalState;
        
        // Handle user rejection
        if (error.code === 4001 || error.message?.includes('user rejected')) {
            showMessage('Transaction cancelled', 'error');
        }
        // Handle insufficient funds
        else if (error.code === 'INSUFFICIENT_FUNDS') {
            showMessage('Insufficient funds for transaction', 'error');
        }
        // Handle other errors
        else {
            console.error('Toggle item error:', error);
            showMessage('Failed to update item', 'error');
        }
    } finally {
        checkbox.disabled = false;
    }
}

async function deleteItem(e) {
    const itemId = e.target.dataset.id;
    const deleteBtn = e.target;
    const originalContent = deleteBtn.innerHTML;
    
    try {
        showMessage('Deleting item...', 'pending');
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<span class="slw-loading-spinner"></span>';
        
        const tx = await contract.deleteItem(itemId);
        await tx.wait();
        
        showMessage('Item deleted!', 'success');
    } catch (error) {
        // Handle user rejection
        if (error.code === 4001 || error.message?.includes('user rejected')) {
            showMessage('Transaction cancelled', 'error');
        }
        // Handle insufficient funds
        else if (error.code === 'INSUFFICIENT_FUNDS') {
            showMessage('Insufficient funds for transaction', 'error');
        }
        // Handle other errors
        else {
            console.error('Delete item error:', error);
            showMessage('Failed to delete item', 'error');
        }
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalContent;
    }
}

function showMessage(text, type = '') {
    const msgEl = document.querySelector('#slw-msg');
    msgEl.textContent = text;
    msgEl.className = type ? ` ${type}` : '';
    // Only auto-clear for success or error, not pending
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            msgEl.textContent = '';
            msgEl.className = '';
        }, 3000);
    }
}

function showGlobalMessage(text, type = '') {
    const existingMsg = document.querySelector('.global-message');
    if (existingMsg) existingMsg.remove();

    const msgEl = document.createElement('div');
    msgEl.className = `global-message ${type}`;
    msgEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${text}
    `;
    document.body.appendChild(msgEl);

    setTimeout(() => {
        msgEl.remove();
    }, 5000);
}

// Export functions at the top level
export { createShoppingListWidget, openShoppingListWidget, closeShoppingListWidget, isShoppingListWidgetOpen };