// usdcStrategyWidget.js
import { 
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  IncentivesController,
  Pool
} from '@aave/contract-helpers';
import { 
  formatReserves,
  formatUserSummaryAndIncentives,
  normalize,
  calculateHealthFactorFromBalances
} from '@aave/math-utils';

// Constants
const AAVE_PET_SVG = `<svg width="143" height="200" viewBox="0 0 286 404" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.572 233.727s-1.29-15.288-1.405-25.084c-.146-12.402 1.405-31.665 1.405-31.665-5.366 4.941-11.053 9.536-15.83 15.144-4.778 5.618-8.661 12.452-9.526 20.037-.855 7.579 1.805 15.902 7.73 20.038 5.78 4.028 17.626 1.53 17.626 1.53Z" fill="#fff" fill-opacity="0.75" style="fill: rgb(255, 255, 255); fill-opacity: 0.75;"></path><path d="M262.12 239.381c.45 3.54 4.13 8.77 7.22 10.56 3.1 1.79 6.55 3.19 8.88 5.9 3.93 4.56 3.54 11.5 1.46 17.15-2.82 7.65-8.35 14.26-15.37 18.39-4.51 2.66-9.66 4.36-13.49 7.92-5.07 4.72-6.95 11.83-9.9 18.1-6.16 13.12-18.22 23.57-32.35 26.81-14.81 3.39-30.6-1.19-43.38-9.42-.89-.57-1.77-1.16-2.63-1.77h-.01c-4.68-3.2-12.08-.78-16.83 2.32-4.76 3.09-8.5 7.55-13.21 10.72-10.64 7.17-25.97 6.43-35.87-1.73-2.92-2.4-5.41-5.36-8.73-7.17-3.31-1.8-7.92-2.07-10.47.71-1.26 1.37-1.86 3.3-3.27 4.51-4.13 3.52-9.96-1.65-12.69-6.34-20.13-34.54-30.45-74.01-32.17-114.04-.99-23.23.91-46.64 5.47-69.38.78-3.91 1.64-7.81 2.6-11.69 5.76-23.49 14.78-46.29 29.11-65.68 16.71-22.6 41.26-40.24 69.02-44.63 27.76-4.39 58.37 6.1 74.51 29.1 11.68 16.66 15.01 38.04 13.25 58.3-1.36 15.73-5.53 31.01-10.31 46.1 3.28 9.68 11.95 17.27 20.44 22.97 8.49 5.7 17.71 10.61 24.68 18.09 6.97 7.48 11.36 18.5 7.74 28.06-.86 2.27-2.13 4.33-3.7 6.14Z" fill="#fff" fill-opacity="0.75" style="fill: rgb(255, 255, 255); fill-opacity: 0.75;"></path><path d="M274.009 252.812c-4.04-3.69-9.99-6.34-11.59-11.3-.04.02-.07.05-.1.08-3.27 2.28-4.9 3.19-8.48 4.89-3.92 1.86-7.88 3.22-12.26 3.4-.55.02-1.13.04-1.72.07 4.13 1.63 7.95 3.8 11 7.01 6.01 6.33 7.05 18.12-.19 22.99-5.04 3.39-12 2.3-17.35 5.18-6.38 3.44-8.67 11.37-9.71 18.55-1.04 7.17-1.67 14.98-6.48 20.4-5.91 6.66-16.28 7.34-24.84 4.86-8.56-2.48-16.15-7.48-24.44-10.72-8.3-3.23-18.24-4.48-25.71.37-7.99 5.19-11.63 16.34-20.74 19.13-7.18 2.2-14.67-1.82-20.97-5.93-6.29-4.1-13.25-8.65-20.68-7.54-5.84.87-11.15 5.21-17 4.4-4.05-.56-7.43-3.59-9.44-7.15-1.58-2.79-3.99-5.59-5.37-8.6 3.19 8.57 8.86 15.88 13.27 23.12 1.96 3.22 4.47 6.62 8.18 7.29 4.1.75 8.42-2.89 8.38-7.06 8.14 1.54 14.35 5.94 20.96 9.48 6.61 3.54 14.1 6.29 21.5 5.04 14.55-2.46 24.46-19.47 39.2-18.94 11.38 10.01 27.02 15.16 41.95 13.31 14.93-1.85 28.85-10.65 36.92-23.34 4.6-7.24 7.42-15.68 13.24-21.98 8.26-8.94 21.92-12.89 27.07-23.91 3.56-7.6 1.6-17.42-4.61-23.08l.01-.02Z" fill="#BCBBFF" fill-opacity="0.4" style="fill: color(display-p3 0.7373 0.7333 1); fill-opacity: 0.4;"></path><ellipse cx="70.187" cy="112.346" rx="7.915" ry="6.574" transform="rotate(11.24 70.187 112.346)" fill="#BCBBFF" fill-opacity="0.4" style="fill: color(display-p3 0.7373 0.7333 1); fill-opacity: 0.4;"></ellipse><ellipse cx="152.143" cy="116.98" rx="9.19" ry="7.633" transform="rotate(1.098 152.143 116.98)" fill="#BCBBFF" fill-opacity="0.4" style="fill: color(display-p3 0.7373 0.7333 1); fill-opacity: 0.4;"></ellipse><path d="M208.72 177.141c4.02-14.86 7.94-34.96 9.66-50.25 1.72-15.29 1.03-31.11-4.2-45.59-6.24-17.29-19.03-32.14-35.22-40.87-16.18-8.73-39.73-10.64-57.61-6.35m86.959 202.68c12.07 6.37 23.67 8.81 35.56 5.72 5.29-1.37 10.57-4.02 13.46-8.66 2.47-3.98 2.87-9.02 1.75-13.57-1.12-4.55-3.64-8.65-6.64-12.25-11.54-13.85-29.21-22.09-36.93-38.38" stroke="#BCBBFF" stroke-opacity="0.4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="stroke: color(display-p3 0.7373 0.7333 1); stroke-opacity: 0.4;"></path><path d="M128.044 98.917c1.663-1.687 3.888-2.718 6.262-2.337 2.381.377 4.174 2.054 5.226 4.177 1.053 2.126 1.438 4.814 1 7.57l-.001.002c-.443 2.762-1.649 5.196-3.314 6.887-1.663 1.689-3.888 2.722-6.261 2.347l-.004-.001c-2.378-.381-4.171-2.057-5.223-4.181-1.054-2.126-1.438-4.814-1-7.575v-.002c.444-2.762 1.65-5.196 3.315-6.887Zm-43.939-2.473c1.618-1.472 3.736-2.328 5.924-1.836 2.19.491 3.743 2.167 4.579 4.191.838 2.028 1.025 4.532.456 7.052-.564 2.523-1.805 4.708-3.428 6.186-1.618 1.474-3.737 2.33-5.924 1.838-2.192-.491-3.744-2.171-4.58-4.197-.837-2.03-1.025-4.536-.455-7.056.564-2.519 1.805-4.702 3.428-6.178Z" fill="#000" style="fill: rgb(0, 0, 0); fill-opacity: 1;"></path><path d="M29.994 233.892c-5.797 1.405-12.396 1.547-17.046-1.694-5.926-4.136-8.585-12.46-7.73-20.039.864-7.585 4.747-14.419 9.526-20.036 3.316-3.898 8.94-8.111 14.596-14.016" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M208.72 177.142c1.43-4.33 2.86-8.66 4.24-13.02 4.78-15.09 8.95-30.37 10.31-46.1 1.76-20.26-1.57-41.64-13.25-58.3-16.14-23-46.75-33.49-74.51-29.1-27.76 4.39-52.31 22.03-69.02 44.63-14.33 19.39-23.35 42.19-29.11 65.68-.96 3.88-1.82 7.78-2.6 11.69-4.56 22.74-6.46 46.15-5.47 69.38 1.72 40.03 12.04 79.5 32.17 114.04 2.73 4.69 8.56 9.86 12.69 6.34 1.41-1.21 2.01-3.14 3.27-4.51 2.55-2.78 7.16-2.51 10.47-.71 3.32 1.81 5.81 4.77 8.73 7.17 9.9 8.16 25.23 8.9 35.87 1.73 4.71-3.17 8.45-7.63 13.21-10.72 4.75-3.1 12.15-5.52 16.83-2.31m.009-.01c.86.61 1.74 1.2 2.63 1.77 12.78 8.23 28.57 12.81 43.38 9.42 14.13-3.24 26.19-13.69 32.35-26.81 2.95-6.27 4.83-13.38 9.9-18.1 3.83-3.56 8.98-5.26 13.49-7.92 7.02-4.13 12.55-10.74 15.37-18.39 2.08-5.65 2.47-12.59-1.46-17.15-2.33-2.71-5.78-4.11-8.88-5.9-3.09-1.79-6.77-7.02-7.22-10.56" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M134.609 303.172c9.252 11.319 19.096 22.442 31.133 30.743M75.3 323.082c-4.68-7.44-8.6-15.37-11.66-23.61m171.039-10.301a143.057 143.057 0 0 1-45.71-27.23" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M206.08 235.472c6.59 3.81 13.23 7.65 20.42 10.13 7.19 2.48 15.07 3.55 22.45 1.7 5.03-1.26 9.79-4.03 13.17-7.92 1.57-1.81 2.84-3.87 3.7-6.14 3.62-9.56-.77-20.58-7.74-28.06-6.97-7.48-16.19-12.39-24.68-18.09-8.49-5.7-17.16-13.29-20.44-22.97" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M229.359 15.129c.503 2.304-.021 4.96-1.811 6.495-1.792 1.542-5.452 1.585-6.699-.422l-.24.137c-2.147-3.595-4.546-6.894-7.154-9.667-.624-1.966-.317-4.14 1.052-5.689 1.489-1.69 4.132-1.966 6.245-1.175 2.106.788 3.765 2.445 5.208 4.175 1.516 1.816 2.891 3.831 3.399 6.146Z" fill="#E5E5FF" style="fill: color(display-p3 0.898 0.898 1); fill-opacity: 1;"></path><path d="M235.603 74.604c-.85 16.44-4.98 32.71-11.62 47.73-.56-.81-1.12-1.62-1.7-2.42a192.82 192.82 0 0 0-17.42-21.17l1.01-.95c6.03-11.77 10.79-23.12 12.89-37.37 0-9.92-1.21-16.53-4.3-25.43h.01c12.3 13.55 21.13 29.56 21.13 39.61Z" fill="#BCBBFF" style="fill: color(display-p3 0.7391 0.7337 1); fill-opacity: 1;"></path><path d="M204.864 98.743a192.83 192.83 0 0 1 17.42 21.17l-.3.21c-5.22-7.28-12.97-12.72-21.6-15.14-8.17-2.29-16.92-1.92-25.09-4.23-15.42-4.34-26.55-17.35-39.73-26.45-11.07-7.63-24.24-12.68-37.68-12.44-13.44.25-31.25 6.66-39.06 17.59-8.68-1.47-14.3-2.98-20.37-8.29-3.23-2.82-5.47-6.52-6.07-9.18-1.01-4.53 3.15-8.48 7.1-10.92 12.91-7.95 28.26-11.44 43.41-11.4h.7c14.92.13 29.68 3.52 43.74 8.5 29.36 10.4 56.12 27.96 77.53 50.57v.01Z" fill="#BCBBFF" style="fill: color(display-p3 0.7391 0.7337 1); fill-opacity: 1;"></path><path d="M214.464 34.994c3.09 8.9 4.3 15.51 4.3 25.43-2.1 14.25-6.86 25.6-12.89 37.37l-1.01.95c-21.41-22.61-48.17-40.17-77.53-50.57-14.06-4.98-28.82-8.37-43.74-8.5v-.23c8.31-8.18 15.61-18.6 27.91-25.04 23.82-11.57 52.93-11.62 76.73-.09 4.48 2.17 8.95 5.08 13.25 8.47 4.58 3.61 8.97 7.78 12.99 12.2h-.01v.01Z" fill="#E5E5FF" style="fill: color(display-p3 0.898 0.898 1); fill-opacity: 1;"></path><path d="M85.606 39.856c7.086-8.658 13.598-19.012 25.898-25.452 23.82-11.57 52.93-11.62 76.73-.09 4.48 2.17 8.95 5.08 13.25 8.47 4.58 3.61 8.97 7.78 12.99 12.2 12.3 13.56 18.411 30.382 18.411 43.661 0 16.462-2.261 28.669-8.901 43.689M85.606 39.856c14.92.13 27.668 3.338 41.728 8.318 29.36 10.4 56.12 27.96 77.53 50.57a192.84 192.84 0 0 1 17.42 21.17M85.606 39.856c-.23 0 .23 0 0 0Zm0 0c-15.15-.04-35.833 2.163-45.798 8.318-5.444 3.362-7.91 8.717-7.424 13.82.335 3.511 3.003 7.107 6.233 9.927 6.07 5.31 13.589 7.776 22.269 9.246 7.81-10.93 23.558-19.043 36.998-19.293 13.44-.24 26.61 4.81 37.68 12.44 13.18 9.1 24.31 22.11 39.73 26.45 8.17 2.31 16.92 1.94 25.09 4.23 8.63 2.42 16.68 7.64 21.9 14.92m1.7 2.42c-.56-.81-1.12-1.62-1.7-2.42m1.7 2.42c-.32-.5-1.35-1.93-1.7-2.42m-8.829-108.242c-.624-1.966-.317-4.14 1.052-5.689 1.489-1.69 4.132-1.966 6.245-1.175 2.106.788 3.765 2.445 5.208 4.175 1.516 1.816 2.891 3.831 3.399 6.146.503 2.304-.021 4.96-1.811 6.495-1.792 1.542-5.452 1.585-6.699-.422" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M209.552 31.294c5.173 6.143 7.99 13.733 8.627 18.746.873 6.873.258 13.871-1.467 20.582-2.507 9.754-6.315 18.345-10.837 27.172" stroke="#000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" style="stroke: rgb(0, 0, 0); stroke-opacity: 1;"></path><path d="M139.322 25.729a2.997 2.997 0 0 0 1.799 3.837 2.997 2.997 0 0 0 2.037-5.637 2.997 2.997 0 0 0-3.836 1.8Zm7.105 2.566a2.998 2.998 0 0 0 5.639 2.037 2.997 2.997 0 0 0-5.639-2.037Z" fill="#7B7BAC" style="fill: color(display-p3 0.4837 0.4809 0.6755); fill-opacity: 1;"></path><path d="M157.352 29.913c-.025-5.076-3.139-9.812-8.145-11.62-6.429-2.323-13.544 1.062-15.892 7.561-2.348 6.5.96 13.65 7.389 15.974 5.357 1.935 11.19-.092 14.345-4.581l-3.121 8.636" stroke="#7B7BAC" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="stroke: color(display-p3 0.4837 0.4809 0.6755); stroke-opacity: 1;"></path><ellipse cx="178.682" cy="394.431" rx="103.381" ry="9.191" fill="#000" fill-opacity="0.15" style="fill: rgb(0, 0, 0); fill-opacity: 0.15;"></ellipse></svg>`;

const CONTRACT_ADDRESSES = {
  POOL: '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac',
  POOL_DATA_PROVIDER: '0xf751969521E20A972A0776CDB0497Fad0F773F1F',
  POOL_ADDRESSES_PROVIDER: '0x89502c3731F69DDC95B65753708A07F8Cd0373F4',
  DEFAULT_INCENTIVES_CONTROLLER: '0xc67bb8F2314fA0df50cBa314c6509A7bdAD500C0',
  UI_INCENTIVE_DATA_PROVIDER: '0x117684358D990E42Eb1649E7e8C4691951dc1E71'
};

const TOKENS = {
  USDC: {
    address: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
    decimals: 6,
    symbol: 'USDC'
  },
  aUSDC: {
    address: '0x374d7860c4f2f604de0191298dd393703cce84f3',
    decimals: 6,
    symbol: 'aUSDC'
  }
};

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address recipient, uint256 amount) returns (bool)'
];

// State management
const state = {
  widgetVisible: false,
  ethersProvider: null,
  poolDataProvider: null,
  incentiveDataProvider: null,
  aavePool: null,
  isInitialized: false,
  currentUser: null,
  currentPosition: null,
  marketData: null,
  transactionInProgress: false
};

// Utility Functions
function validateAddress(address, name) {
  if (!address) throw new Error(`${name} address is undefined`);
  if (!window.ethers?.utils) throw new Error('Ethers.js not loaded');
  if (!window.ethers.utils.isAddress(address)) throw new Error(`Invalid ${name} address: ${address}`);
  if (!address.startsWith('0x') || address.length !== 42) throw new Error(`Malformed ${name} address: ${address}`);
  return true;
}

async function loadEthers() {
  if (window.ethers) return window.ethers;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.min.js';
    script.onload = () => resolve(window.ethers);
    script.onerror = () => reject(new Error('Failed to load Ethers.js'));
    document.head.appendChild(script);
  });
}

async function validateContractAddresses() {
  if (!window.ethers?.utils) throw new Error('Ethers.js not properly loaded');
  
  const requiredContracts = [
    'POOL', 'POOL_DATA_PROVIDER', 
    'POOL_ADDRESSES_PROVIDER', 'UI_INCENTIVE_DATA_PROVIDER'
  ];

  for (const contractName of requiredContracts) {
    const address = CONTRACT_ADDRESSES[contractName];
    if (!address) throw new Error(`Missing ${contractName} address in configuration`);
    validateAddress(address, contractName);
  }
}

function sanitizeUSDCAmount(inputValue) {
  if (inputValue === null || inputValue === undefined || inputValue === '') return '';
  
  // Convert to string and trim
  let value = inputValue.toString().trim();
  
  // Remove commas
  value = value.replace(/,/g, '');
  
  // Be very permissive - only remove characters that are definitely not allowed
  // Allow digits, decimal points, and common input characters
  value = value.replace(/[^\d.]/g, '');
  
  // Handle multiple decimal points by keeping only the first one
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Only limit decimal places if there are more than 6
  if (parts.length === 2 && parts[1].length > 6) {
    value = parts[0] + '.' + parts[1].substring(0, 6);
  }
  
  return value;
}

function sanitizeAmount(inputValue, decimals = 6) {
  if (inputValue === null || inputValue === undefined || inputValue === '') return '0';
  const standardized = inputValue
    .toString()
    .trim()
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '')
    .replace(/(\..*)\./g, '$1');
  const parts = standardized.split('.');
  let integer = parts[0].replace(/^0+/, '') || '0';
  let fraction = parts[1] ? parts[1].substring(0, decimals) : '';
  if (standardized.startsWith('-')) integer = '-' + integer;
  return fraction ? `${integer}.${fraction}` : integer;
}
const USDC_ADDRESS = '0x176211869ca2b568f2a7d4ee941e073a821ee1ff';
const POOL_ADDRESS = '0xc47b8C00b0f69a36fa203Ffeac0334874574a8Ac';

// Core Widget Functions
export async function createUSDCStrategyWidget() {
  try {
    // Initialize ethers
    const ethers = await loadEthers();
    
    if (!window.ethereum) throw new Error('MetaMask not detected');
    
    state.ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Verify network and switch to Linea if needed
    const network = await state.ethersProvider.getNetwork();
    if (network.chainId !== 59144) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xe708' }], // Linea Mainnet chainId in hex
        });
      } catch (switchError) {
        // If Linea is not added to MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xe708',
                chainName: 'Linea Mainnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.linea.build'],
                blockExplorerUrls: ['https://lineascan.build']
              }]
            });
          } catch (addError) {
            // Silently ignore if user rejects adding the network
            console.log('User rejected adding Linea network');
          }
        }
        // Silently ignore if user rejects switching networks
        console.log('User rejected switching to Linea network');
      }
    }

    // Create UI if needed
    if (!document.getElementById('usdc-strategy-widget')) {
      createWidgetUI();
    }

    // Initialize core components
    state.poolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: CONTRACT_ADDRESSES.POOL_DATA_PROVIDER,
      provider: state.ethersProvider,
      chainId: 59144
    });

    state.incentiveDataProvider = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: CONTRACT_ADDRESSES.UI_INCENTIVE_DATA_PROVIDER,
      provider: state.ethersProvider,
      chainId: 59144
    });

    state.aavePool = new Pool(state.ethersProvider, {
  POOL: ethers.utils.getAddress(CONTRACT_ADDRESSES.POOL),
  POOL_ADDRESSES_PROVIDER: ethers.utils.getAddress(CONTRACT_ADDRESSES.POOL_ADDRESSES_PROVIDER)
});

    state.isInitialized = true;
    setupWalletListeners();
    
    // Add USDC token to MetaMask for better transaction display
    //await addTokenToMetaMask(TOKENS.USDC);
    
    return {
      loadData: loadInitialData
    };
  } catch (error) {
    console.error('Initialization failed:', error);
    showMessage(`Initialization error: ${error.message}`, 'error');
    return false;
  }
}

// Wallet Event Handlers
function setupWalletListeners() {
  if (window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }
}

function handleChainChanged(chainId) {
  // Don't reload, just reinitialize if needed
  if (state.isInitialized && chainId === 59144) {
    // We're on Linea, refresh data
    loadInitialData();
  }
}

async function handleAccountsChanged(accounts) {
  if (accounts.length > 0) {
    try {
      const signer = state.ethersProvider.getSigner(accounts[0]);
      if (!signer) throw new Error('No signer available');
      state.currentUser = await signer.getAddress();
      await handleWalletConnect(state.currentUser);
    } catch (error) {
      console.error('Account change error:', error);
      showMessage('Please reconnect your wallet', 'error');
    }
  } else {
    handleWalletDisconnect();
  }
}

async function handleWalletConnect(address) {
  if (!ethers.utils.isAddress(address)) return;
  state.currentUser = address;
  await loadUserPosition(address);
}

function handleWalletDisconnect() {
  state.currentUser = null;
  updatePositionUI(null);
  showMessage('Wallet disconnected', 'info');
}

// UI Management
function createWidgetUI() {
  // Add Inter font
  if (!document.querySelector('#inter-font')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'inter-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(fontLink);
  }

  // Add styles
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
    #usdc-strategy-widget.entering {
      animation: butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards;
    }
    #usdc-strategy-widget.exiting {
      animation: butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    #usdc-strategy-widget {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      z-index: 9999;
      background: white;
      color: #333;
      border-radius: 14px;
      padding: 0;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.02);
      overflow: hidden;
      animation: slideUp 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards;
      will-change: transform, opacity;
    }

    #usdc-strategy-widget.visible {
      display: block;
    }

    #usw-header {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-text {
  display: flex;
  flex-direction: column;
  gap: 4px; /* This controls the space between title and subtitle */
}

    #usdc-strategy-widget h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  line-height: 1.3;
}

    #usdc-strategy-widget h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  color: #666;
  line-height: 1.3;
}
    
    #usw-status-text {
  display: block !important; /* Force display */
  min-height: 20px; /* Prevent collapse */
  transition: all 0.3s ease; /* Smooth transitions */
}

/* Hide when empty */
#usw-status-text:empty {
  display: none !important;
}

    #usw-close {
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
  align-self: flex-start; /* Aligns to top of header */
  margin-top: 0; /* Removes any default spacing */
    }

    #usw-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000;
    }

    #usw-content {
      padding: 16px 20px;
      max-height: 70vh;
      overflow-y: auto;
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

    .status-text {
  font-size: 14px;
  margin: 12px 0;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 102, 255, 0.05);
  color: #0066FF;
  display: block; /* Ensure it's always visible */
}

    .status-text.inactive {
      background: rgba(0, 0, 0, 0.05);
      color: #666;
    }

    .position-section {
      margin: 16px 0;
    }

    .position-header {
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 8px;
    }

    .position-card {
    position: relative;
      background: white;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .position-card.inactive {
  position: relative;
  opacity: 0.8;
}

.position-card.inactive .position-row {
  color: #999;
}

    .position-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .position-row:last-child {
      margin-bottom: 0;
    }

    .position-label {
      font-size: 13px;
      color: #666;
    }

    .position-value {
      font-size: 14px;
      font-weight: 500;
      color: #000;
    }

    .position-apy {
      font-size: 20px;
      font-weight: 600;
      color: #0066FF;
    }
    
    .position-return {
  color: #34C759; /* Green color for positive returns */
  font-weight: 500;
}

    .position-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
    }

.blur-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(2px);
  z-index: 1;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.aave-pet-container {
  text-align: center;
}

.mock-position-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  text-align: center;
}

.aave-pet-container svg {
  width: 80px;
  height: 80px;
  animation: petFloat 3s ease-in-out infinite;
}

@keyframes petFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
}

.aave-pet-container svg path {
  animation: petBreathe 4s ease-in-out infinite;
}

@keyframes petBreathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.95;
  }
}

.aave-pet-container svg ellipse {
  animation: petBlink 6s ease-in-out infinite;
}

@keyframes petBlink {
  0%, 90%, 100% {
    opacity: 0.5;
  }
  95% {
    opacity: 0.9;
  }
}

.aave-pet-container svg path[stroke] {
  animation: petStroke 5s ease-in-out infinite;
}

@keyframes petStroke {
  0%, 100% {
    stroke-opacity: 0.4;
  }
  50% {
    stroke-opacity: 0.6;
  }
}

#usw-header,
.radio-group,
.input-container,
#usw-action-button,
#usw-msg {
  filter: none !important;
}
#usw-action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

    .aave-pet {
  display: none; /* Hide the original pet container */
}
.blur-overlay .aave-pet-container {
  width: 100%;
  text-align: center;
  margin: 0 auto;
}
.blur-overlay .aave-pet-container svg {
  width: 80px;
  height: 80px;
}

    .toggle-container {
      display: flex;
      align-items: center;
      margin: 16px 0;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
      margin: 0 8px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #34C759;
      transition: .4s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: #FF3B30;
    }

    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    .toggle-label {
      font-size: 14px;
      font-weight: 500;
    }

    .toggle-label small {
      font-size: 12px;
      color: #999;
      font-weight: 400;
    }

    .input-container {
      margin-bottom: 16px;
    }

    .input-container label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 0px;
  font-weight: 500;
}

.wallet-balance {
  display: block;
  text-align: right;
  margin: -14px 0 6px 0; /* This positions it right below the label */
  font-size: 12px;
  color: #666;
}

    .input-row {
  position: relative;
  margin-top: 4px; /* Adds slight spacing between balance and input */
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

    #usw-action-button {
      width: 100%;
      padding: 12px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
    }

    #usw-action-button.deposit {
      background: #0066FF;
      color: white;
    }

    #usw-action-button.deposit:hover {
      background: #0052D9;
    }

    #usw-action-button.withdraw {
      background: #FF3B30;
      color: white;
    }

    #usw-action-button.withdraw:hover {
      background: #E0352B;
    }

    #usw-action-button:disabled {
      background: #e0e0e0;
      color: #999;
      cursor: not-allowed;
    }

    #usw-msg {
  margin-top: 12px;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.05);
  min-height: 24px; /* enough for one line of text */
  display: block;
  transition: background 0.2s, color 0.2s;
}

    #usw-msg:empty {
  display: block;
}

    #usw-msg.success {
  background: rgba(52, 199, 89, 0.08);
  color: #34C759;
  border-color: rgba(52, 199, 89, 0.15);
}
   #usw-msg.error {
  background: rgba(255, 59, 48, 0.08);
  color: #FF3B30;
  border-color: rgba(255, 59, 48, 0.15);
}

   #usw-msg.pending {
  background: rgba(0, 122, 255, 0.08);
  color: #0066FF;
  border-color: rgba(0, 122, 255, 0.15);
}
    #usw-msg.error {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.3);
  padding: 10px;
  border-radius: 8px;
  margin-top: 12px;
}

#usw-action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-text.inactive {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
}

    /* Market tab styles */
    .market-tab {
      display: none;
    }

    .market-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .market-stat {
      background: white;
      border-radius: 10px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .market-stat-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .market-stat-value {
      font-size: 16px;
      font-weight: 600;
    }

    .market-stat-apy {
      color: #0066FF;
    }

    .market-chart {
      height: 120px;
      background: rgba(0, 102, 255, 0.05);
      border-radius: 8px;
      margin: 16px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 13px;
    }

    .market-history {
      margin-top: 16px;
    }

    .market-history-title {
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 8px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      font-size: 13px;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-date {
      color: #666;
    }

    .history-value {
      font-weight: 500;
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Create widget container
  const container = document.createElement('div');
  container.id = 'usdc-strategy-widget';
  container.innerHTML = `
    <div id="usw-header">
    <div class="header-text">
      <h3>aUSDC Strategy on AAVE</h3>
      <h4>Spend smart — earn passive yield on your idle stablecoins all the way until the moment you make a purchase with your MetaMask Card.</h4>
    </div>
    <button id="usw-close">✕</button>
  </div>
    <div id="usw-content">
      <div class="radio-group">
        <input type="radio" name="usw-tab" id="usw-tab-strategy" value="strategy" checked />
        <label for="usw-tab-strategy">Strategy</label>
        <input type="radio" name="usw-tab" id="usw-tab-market" value="market" />
        <label for="usw-tab-market">Market</label>
      </div>
      
      <!-- Strategy Tab -->
      <div id="strategy-tab">
        <div class="status-text" id="usw-status-text">Connect your wallet to begin</div>
        
        <div class="position-section">
          <div class="position-header">My Position</div>
          <div class="position-card" id="usw-position-card">
            <div class="position-row">
              <span class="position-label">Amount</span>
              <span class="position-value" id="usw-position-amount">--</span>
            </div>
            <div class="position-row">
              <span class="position-label">APY</span>
              <span class="position-value position-apy" id="usw-position-apy">--</span>
            </div>
          </div>
        </div>
        
        <div class="aave-pet" id="usw-aave-pet"></div>
        
        <div class="toggle-container">
          <span class="toggle-label">Enter</span>
          <label class="toggle-switch">
            <input type="checkbox" id="usw-strategy-toggle">
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">Exit <small>strategy</small></span>
        </div>
        
        <div class="input-container">
          <label for="usw-amount">Enter Amount</label>
          <span id="usw-wallet-balance" class="wallet-balance">Balance: --</span>
          <div class="input-row">
            <input type="text" id="usw-amount" placeholder="0.00" />
          </div>
          <div class="slider-container">
            <input type="range" min="0" max="100" value="0" class="slider" id="usw-amount-slider">
            <div class="slider-labels">
              <span data-percent="0">0%</span>
              <span data-percent="25">25%</span>
              <span data-percent="50">50%</span>
              <span data-percent="75">75%</span>
              <span data-percent="100">100%</span>
            </div>
          </div>
        </div>
        
        <button id="usw-action-button" class="deposit" disabled>
          <span id="usw-button-text">Deposit</span>
        </button>
        
        <div id="usw-msg">&nbsp;</div>
      </div>
      
      <!-- Market Tab -->
      <div class="market-tab" id="market-tab">
        <div class="market-stats">
          <div class="market-stat">
            <div class="market-stat-label">Total Supplied</div>
            <div class="market-stat-value" id="market-total-supplied">--</div>
          </div>
          <div class="market-stat">
            <div class="market-stat-label">Current APY</div>
            <div class="market-stat-value market-stat-apy" id="market-current-apy">--</div>
          </div>
          <div class="market-stat">
            <div class="market-stat-label">7d Avg APY</div>
            <div class="market-stat-value" id="market-avg-apy">--</div>
          </div>
          <div class="market-stat">
            <div class="market-stat-label">Utilization</div>
            <div class="market-stat-value" id="market-utilization">--</div>
          </div>
        </div>
        
        <div class="market-chart">
          APY History Chart (Coming Soon)
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Initialize AAVE pet
  container.querySelector('#usw-aave-pet').innerHTML = AAVE_PET_SVG;
  setupEventListeners(container);
}

// Data Loading Functions
async function loadInitialData() {
  if (!state.isInitialized) {
    showMessage('Widget not initialized', 'error');
    return;
  }

  try {
    if (!state.currentUser) {
      state.currentUser = await getCurrentAccount();
      if (!state.currentUser) return;
    }

    setLoadingState(true);
    
    await Promise.all([
      loadUserPosition(state.currentUser),
      loadMarketData()
    ]);

  } catch (error) {
    console.error('Data load error:', error);
    showMessage(`Loading failed: ${error.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

async function getCurrentAccount() {
  try {
    if (!window.ethereum) throw new Error('No Ethereum provider detected');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0 && window.ethers.utils.isAddress(accounts[0])) {
      return accounts[0];
    }

    const requestedAccounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (requestedAccounts.length > 0 && window.ethers.utils.isAddress(requestedAccounts[0])) {
      return requestedAccounts[0];
    }

    throw new Error('No connected accounts found');
  } catch (error) {
    console.error('Account access error:', error);
    showMessage('Please connect your wallet', 'error');
    return null;
  }
}

async function loadUserPosition(userAddress) {
  if (!userAddress || !window.ethers.utils.isAddress(userAddress)) {
    updateStatusText('Please connect your wallet', 'inactive');
    return;
  }

  if (!state.isInitialized) {
    updateStatusText('Widget not initialized', 'inactive');
    return;
  }

  try {
    updateStatusText('Loading position data...', 'loading');
    
    const [reserves, userReserves] = await Promise.all([
      state.poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: CONTRACT_ADDRESSES.POOL_ADDRESSES_PROVIDER
      }),
      state.poolDataProvider.getUserReservesHumanized({
        lendingPoolAddressProvider: CONTRACT_ADDRESSES.POOL_ADDRESSES_PROVIDER,
        user: userAddress
      })
    ]);

    const formattedReserves = formatReserves({
      reserves: reserves.reservesData,
      currentTimestamp: Math.floor(Date.now() / 1000),
      marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd
    });

    const userSummary = formatUserSummaryAndIncentives({
      currentTimestamp: Math.floor(Date.now() / 1000),
      marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: userReserves.userReserves || [],
      formattedReserves,
      userEmodeCategoryId: userReserves.userEmodeCategoryId,
      reserveIncentives: [],
      userIncentives: []
    });

    const usdcPosition = userSummary.userReservesData.find(r => 
      r.underlyingAsset.toLowerCase() === TOKENS.USDC.address.toLowerCase()
    );

    // Get wallet balance
    let walletBalance = 0;
    try {
      const contract = new ethers.Contract(
        TOKENS.USDC.address,
        ['function balanceOf(address) view returns (uint256)'],
        state.ethersProvider
      );
      const balance = await contract.balanceOf(userAddress);
      walletBalance = parseFloat(ethers.utils.formatUnits(balance, TOKENS.USDC.decimals));
    } catch (e) {
      console.error('Error fetching wallet balance:', e);
    }

    state.currentPosition = {
      usdcPosition,
      walletBalance,
      formattedReserves,
      userSummary
    };

    updatePositionUI(state.currentPosition);

  } catch (error) {
    console.error('Position load error:', error);
    updateStatusText(`Error: ${error.message}`, 'error');
  }
}

function updatePositionUI(positionData) {
  const elements = {
    statusText: document.querySelector('#usw-status-text'),
    positionAmount: document.querySelector('#usw-position-amount'),
    positionApy: document.querySelector('#usw-position-apy'),
    positionCard: document.querySelector('#usw-position-card'),
    walletBalance: document.querySelector('#usw-wallet-balance'),
    inputAmount: document.querySelector('#usw-amount'),
    slider: document.querySelector('#usw-amount-slider'),
    actionButton: document.querySelector('#usw-action-button'),
    aavePet: document.querySelector('#usw-aave-pet')
  };

  // Create blur overlay if it doesn't exist
  let blurOverlay = document.getElementById('usw-blur-overlay');
  if (!blurOverlay) {
    blurOverlay = document.createElement('div');
    blurOverlay.id = 'usw-blur-overlay';
    blurOverlay.className = 'blur-overlay';
    elements.positionCard.appendChild(blurOverlay);
  }

  if (!positionData) {
    // No position data (wallet disconnected)
    showMockPosition(elements, true);
    return;
  }

  const { usdcPosition, walletBalance, formattedReserves } = positionData;
  const hasPosition = usdcPosition && usdcPosition.scaledATokenBalance !== '0';
  
  if (!hasPosition) {
    showMockPosition(elements, false);
    return;
  }

  // Normal position display
  blurOverlay.style.display = 'none';
  elements.positionCard.classList.remove('inactive');

  const normalizedBalance = parseFloat(normalize(usdcPosition.scaledATokenBalance, usdcPosition.reserve.decimals)) || 0;
  const isWithdrawMode = document.querySelector('#usw-strategy-toggle').checked;
  
  // Update wallet balance display
  const maxAmount = isWithdrawMode ? 
    (usdcPosition ? parseFloat(normalize(usdcPosition.scaledATokenBalance, usdcPosition.reserve.decimals)) : 0) : 
    walletBalance;

  const balanceText = isWithdrawMode ? 
    `Position: ${maxAmount.toFixed(2)} aUSDC` : 
    `Balance: ${maxAmount.toFixed(2)} USDC`;
  elements.walletBalance.textContent = balanceText;

  // Calculate APY
  let apy = 0;
  try {
    const usdcReserve = formattedReserves.find(r => 
      r.underlyingAsset.toLowerCase() === TOKENS.USDC.address.toLowerCase()
    );
    if (usdcReserve) apy = Number(usdcReserve.supplyAPY);
  } catch (e) {
    console.error('APY calculation error:', e);
  }

  elements.positionAmount.textContent = `${normalizedBalance.toFixed(2)} ${usdcPosition.reserve.symbol}`;
  elements.positionApy.textContent = `${(apy * 100).toFixed(2)}%`;
  updateStatusText('Great! Your strategy is active — enjoy earning yield on your USDC.', 'success');

  // Calculate and display annual return
  let annualReturn = 0;
  if (apy > 0) {
    annualReturn = apy * normalizedBalance;
    
    let annualReturnElement = document.getElementById('usw-position-annual-return');
    if (!annualReturnElement) {
      annualReturnElement = document.createElement('div');
      annualReturnElement.id = 'usw-position-annual-return';
      annualReturnElement.className = 'position-row';
      
      const apyRow = elements.positionCard.querySelector('.position-row:nth-child(2)');
      if (apyRow) {
        apyRow.after(annualReturnElement);
      } else {
        elements.positionCard.appendChild(annualReturnElement);
      }
    }
    
    annualReturnElement.innerHTML = `
      <span class="position-label">Estimated Annual Return</span>
      <span class="position-value position-return">${annualReturn.toFixed(2)} ${usdcPosition.reserve.symbol}</span>
    `;
  } else {
    elements.positionAmount.textContent = '--';
    elements.positionApy.textContent = '--';
    updateStatusText('No active position found', 'inactive');
    
    // Remove annual return display if no position
    const annualReturnElement = document.getElementById('usw-position-annual-return');
    if (annualReturnElement) {
      annualReturnElement.remove();
    }
  }

  // Update slider and input handlers
  elements.slider.addEventListener('input', function() {
    const percentage = this.value;
    const calculatedValue = (maxAmount * percentage) / 100;
    elements.inputAmount.value = calculatedValue.toFixed(2);
    elements.actionButton.disabled = !elements.inputAmount.value || Number(elements.inputAmount.value) <= 0;
  });

  elements.inputAmount.addEventListener('input', function() {
    const value = parseFloat(this.value) || 0;
    const percentage = Math.min(100, (value / maxAmount) * 100);
    elements.slider.value = percentage;
    elements.actionButton.disabled = value <= 0;
  });
}

// Updated market data formatter
function formatLargeCurrency(value, decimals = 2) {
  if (!value || isNaN(value)) return '$0.00';
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(decimals)} B`; // Billions
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(decimals)} M`; // Millions
  }
  return `$${value.toFixed(decimals)}`;
}

// Updated updateMarketUI function
function updateMarketUI({ totalLiquidity, currentAPY, utilization }) {
  const elements = {
    totalSupplied: document.querySelector('#market-total-supplied'),
    currentApy: document.querySelector('#market-current-apy'),
    utilization: document.querySelector('#market-utilization')
  };

  // Debug log to verify raw data
  console.log('Raw market data:', { 
    totalLiquidity, 
    currentAPY, 
    utilization 
  });

  // Format total supplied with proper units
  if (elements.totalSupplied) {
    elements.totalSupplied.textContent = formatLargeCurrency(totalLiquidity || 0);
  }

  // Format APY (ensure it's a number)
  if (elements.currentApy) {
    const apyValue = typeof currentAPY === 'number' ? currentAPY : 0;
    elements.currentApy.textContent = `${apyValue.toFixed(2)}%`;
  }

  // Format utilization
  if (elements.utilization) {
    elements.utilization.textContent = `${(utilization || 0).toFixed(2)}%`;
  }

  // Calculate 7d avg APY (demo only)
  const avgApyElement = document.querySelector('#market-avg-apy');
  if (avgApyElement) {
    const current = typeof currentAPY === 'number' ? currentAPY : 0;
    avgApyElement.textContent = `${(current * 0.98).toFixed(2)}%`;
  }
}

// Updated loadMarketData with better decimal handling
async function loadMarketData() {
  try {
    const reserves = await state.poolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: CONTRACT_ADDRESSES.POOL_ADDRESSES_PROVIDER
    });

    const formattedReserves = formatReserves({
      reserves: reserves.reservesData,
      currentTimestamp: Math.floor(Date.now() / 1000),
      marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd
    });

    const usdcReserve = formattedReserves.find(r => 
      r.symbol === 'USDC' && 
      r.underlyingAsset.toLowerCase() === TOKENS.USDC.address.toLowerCase()
    );

    if (usdcReserve) {
      // Convert all values to proper numbers first
      const totalLiquidity = parseFloat(usdcReserve.totalLiquidity);
      
      const supplyAPY = parseFloat(usdcReserve.supplyAPY) * 100;
      const utilization = parseFloat(usdcReserve.borrowUsageRatio) * 100;

      updateMarketUI({
        totalLiquidity: isNaN(totalLiquidity) ? 0 : totalLiquidity,
        currentAPY: isNaN(supplyAPY) ? 0 : supplyAPY,
        utilization: isNaN(utilization) ? 0 : utilization
      });
    }
  } catch (error) {
    console.error('Error loading market data:', error);
    showMessage('Failed to load market data', 'error');
  }
}

// Helper function to show mock position
function showMockPosition(elements, isWalletDisconnected) {
  // Create blur overlay for just the position card if it doesn't exist
  let blurOverlay = elements.positionCard.querySelector('.blur-overlay');
  if (!blurOverlay) {
    blurOverlay = document.createElement('div');
    blurOverlay.className = 'blur-overlay';
    elements.positionCard.appendChild(blurOverlay);
  }

  // Set mock values
  elements.positionAmount.textContent = '69420.00 USDC';
  elements.positionApy.textContent = '4.20%';
  
  // Update annual return mock
  let annualReturnElement = document.getElementById('usw-position-annual-return');
  if (!annualReturnElement) {
    annualReturnElement = document.createElement('div');
    annualReturnElement.id = 'usw-position-annual-return';
    annualReturnElement.className = 'position-row';
    elements.positionCard.appendChild(annualReturnElement);
  }
  annualReturnElement.innerHTML = `
    <span class="position-label">Estimated Annual Return</span>
    <span class="position-value position-return">0.00 USDC</span>
  `;

  // Show blur overlay with Aave pet
  blurOverlay.style.display = 'flex';
  blurOverlay.innerHTML = `
    <div class="aave-pet-container">
      ${AAVE_PET_SVG}
    </div>
  `;

  // Apply inactive styling only to position card
  elements.positionCard.classList.add('inactive');
  
  // Update status text
  updateStatusText(
    isWalletDisconnected ? 'Wallet not connected' : "You don't have an active strategy yet. Continue below to start earning yield.",
    'info'
  );
  
  // Ensure wallet balance is shown
  if (!isWalletDisconnected && state.currentUser) {
    elements.walletBalance.textContent = `Balance: ${state.currentPosition?.walletBalance.toFixed(2) || '0.00'} USDC`;
  } else {
    elements.walletBalance.textContent = 'Balance: --';
  }
}

async function checkWalletBalance(userAddress) {
  try {
    const usdcContract = new ethers.Contract(
      TOKENS.USDC.address,
      ERC20_ABI,
      state.ethersProvider
    );
    const balance = await usdcContract.balanceOf(userAddress);
    console.log(`Wallet ${userAddress} USDC balance: ${ethers.utils.formatUnits(balance, TOKENS.USDC.decimals)} USDC`);
    return balance;
  } catch (error) {
    console.error('Balance check error:', error);
    return ethers.BigNumber.from(0);
  }
}
// Transaction Functions
async function depositUSDC(amount, userAddress) {
  if (state.transactionInProgress) return;
  state.transactionInProgress = true;

  let amountWei = null; // Declare outside try block
  try {
    showMessage('Preparing deposit...', 'pending');
    //setButtonLoading(true);

    // Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    // Sanitize and validate amount as a string
    const amountStr = sanitizeUSDCAmount(amount.toString());
    const decimalParts = amountStr.split('.');
    if (decimalParts[1]?.length > TOKENS.USDC.decimals) {
      throw new Error(`Amount cannot have more than ${TOKENS.USDC.decimals} decimal places`);
    }

    // Convert to wei with proper decimals
    amountWei = ethers.utils.parseUnits(amountStr, TOKENS.USDC.decimals);
    console.log('Deposit amount:', { amount, amountStr, amountWei: amountWei.toString() });

    // Get checksummed addresses
    const usdcAddress = ethers.utils.getAddress(TOKENS.USDC.address);
    const poolAddress = ethers.utils.getAddress(CONTRACT_ADDRESSES.POOL);

    // Initialize USDC contract
    const usdcContract = new ethers.Contract(
      usdcAddress,
      ERC20_ABI,
      state.ethersProvider.getSigner()
    );

    // Check balance
    const balance = await usdcContract.balanceOf(userAddress);
    console.log('User balance:', ethers.utils.formatUnits(balance, TOKENS.USDC.decimals));
    if (balance.lt(amountWei)) {
      throw new Error(
        `Insufficient USDC balance. Required: ${ethers.utils.formatUnits(amountWei, TOKENS.USDC.decimals)} USDC, ` +
        `Available: ${ethers.utils.formatUnits(balance, TOKENS.USDC.decimals)} USDC`
      );
    }

    // Check allowance
    const allowance = await usdcContract.allowance(userAddress, poolAddress);
    if (allowance.lt(amountWei)) {
      showMessage('Approving USDC transfer...', 'pending');
      const gasEstimate = await usdcContract.estimateGas.approve(poolAddress, amountWei);
      const approveTx = await usdcContract.approve(poolAddress, amountWei, {
        gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
      });
      await approveTx.wait();
      showMessage('Approval confirmed. Depositing...', 'pending');
    }

    // Re-check balance before deposit
    const balanceAfterApproval = await usdcContract.balanceOf(userAddress);
    if (balanceAfterApproval.lt(amountWei)) {
      throw new Error(
        `Balance changed. Insufficient USDC: Required: ${ethers.utils.formatUnits(amountWei, TOKENS.USDC.decimals)} USDC, ` +
        `Available: ${ethers.utils.formatUnits(balanceAfterApproval, TOKENS.USDC.decimals)} USDC`
      );
    }

    // Execute deposit using raw contract call as fallback
    showMessage('Depositing USDC...', 'pending');
    
    // Add USDC token to MetaMask for better transaction display
    await addTokenToMetaMask(TOKENS.USDC);
    
    const poolContract = new ethers.Contract(
      poolAddress,
      ['function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'],
      state.ethersProvider.getSigner()
    );

    let txResponse;
    try {
      // First try with @aave/contract-helpers
      const txs = await state.aavePool.supply({
        user: userAddress,
        reserve: usdcAddress,
        amount: amountWei.toString(),
        onBehalfOf: userAddress,
        referralCode: '0'
      });

      for (const tx of txs) {
        const txData = await tx.tx();
        console.log('Transaction data:', txData); // Debug log
        let gasLimit;
        try {
          gasLimit = await state.ethersProvider.estimateGas({
            ...txData,
            from: userAddress
          });
          gasLimit = gasLimit.mul(120).div(100);
        } catch (e) {
          console.warn('Gas estimation failed, using fallback:', e);
          gasLimit = ethers.BigNumber.from('500000');
        }

        txResponse = await state.ethersProvider.getSigner().sendTransaction({
          ...txData,
          gasLimit,
          // Add metadata to help MetaMask parse the transaction
          customData: {
            tokenSymbol: 'USDC',
            amount: ethers.utils.formatUnits(amountWei, TOKENS.USDC.decimals),
            decimals: TOKENS.USDC.decimals,
            action: 'deposit'
          }
        });
        console.log('Transaction hash:', txResponse.hash);
        await txResponse.wait();
      }
    } catch (e) {
      console.warn('Aave contract helper failed, trying raw contract call:', e);
      // Fallback to raw contract call
      const gasLimit = await poolContract.estimateGas.supply(
        usdcAddress,
        amountWei,
        userAddress,
        0
      ).catch(() => ethers.BigNumber.from('500000'));
      
      txResponse = await poolContract.supply(
        usdcAddress,
        amountWei,
        userAddress,
        0,
        { gasLimit: gasLimit.mul(120).div(100) }
      );
      console.log('Raw transaction hash:', txResponse.hash);
      await txResponse.wait();
    }

    showMessage('Deposit successful!', 'success');
    await loadUserPosition(userAddress);

  } catch (error) {
    console.error('Deposit error:', error);
    let errorMsg = 'Deposit failed';
    if (error.message.includes('user rejected transaction')) {
      errorMsg = 'Transaction rejected';
    } else if (error.message.includes('insufficient funds')) {
      errorMsg = 'Insufficient ETH for gas';
    } else if (error.message.includes('Insufficient USDC balance') || 
               error.message.includes('ERC20: transfer amount exceeds balance')) {
      errorMsg = `Not enough USDC. Required: ${amountWei ? ethers.utils.formatUnits(amountWei, TOKENS.USDC.decimals) : amount} USDC`;
    } else {
      errorMsg = `Error: ${error.reason || error.message}`;
    }
    showMessage(errorMsg, 'error');
  } finally {
    //setButtonLoading(false);
    state.transactionInProgress = false;
  }
}

// Enhanced withdraw function
async function withdrawUSDC(amount, userAddress) {
  if (state.transactionInProgress) return;
  state.transactionInProgress = true;

  let amountWei = null; // Declare outside try block
  let isMaxWithdrawal = false; // Flag for max withdrawal
  try {
    showMessage('Preparing withdrawal...', 'pending');
    //setButtonLoading(true);

    // 1. Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid withdrawal amount');
    }

    // 2. Sanitize and validate amount as a string
    const amountStr = sanitizeUSDCAmount(amount.toString());
    const decimalParts = amountStr.split('.');
    if (decimalParts[1]?.length > TOKENS.aUSDC.decimals) {
      throw new Error(`Amount cannot have more than ${TOKENS.aUSDC.decimals} decimal places`);
    }

    // 3. Get aUSDC balance and check for max withdrawal
    const aUsdcAddress = ethers.utils.getAddress(TOKENS.aUSDC.address);
    const aUsdcContract = new ethers.Contract(
      aUsdcAddress,
      ERC20_ABI,
      state.ethersProvider.getSigner()
    );
    const balance = await aUsdcContract.balanceOf(userAddress);
    const balanceFormatted = ethers.utils.formatUnits(balance, TOKENS.aUSDC.decimals);
    console.log('User aUSDC balance:', balanceFormatted);

    // 4. Convert amount to Wei or use max
    const balanceNum = parseFloat(balanceFormatted);
    const inputAmount = parseFloat(amountStr);
    if (inputAmount >= balanceNum || Math.abs(inputAmount - balanceNum) < 0.000001) {
      // If amount is equal to or very close to balance, use max withdrawal
      isMaxWithdrawal = true;
      amountWei = balance; // Use exact balance instead of MaxUint256 for precision
      console.log('Max withdrawal detected, using exact balance:', amountWei.toString());
    } else {
      amountWei = ethers.utils.parseUnits(amountStr, TOKENS.aUSDC.decimals);
      console.log('Withdrawal amount:', { amount, amountStr, amountWei: amountWei.toString() });
    }

    // 5. Check balance (skip for max withdrawal)
    if (!isMaxWithdrawal && balance.lt(amountWei)) {
      throw new Error(
        `Insufficient aUSDC balance. Required: ${ethers.utils.formatUnits(amountWei, TOKENS.aUSDC.decimals)} aUSDC, ` +
        `Available: ${balanceFormatted} aUSDC`
      );
    }

    // 6. Verify position with pool data provider
    const usdcAddress = ethers.utils.getAddress(TOKENS.USDC.address);
    const userSummary = await state.poolDataProvider.getUserReservesHumanized({
      lendingPoolAddressProvider: CONTRACT_ADDRESSES.POOL_ADDRESSES_PROVIDER,
      user: userAddress
    });
    const usdcPosition = userSummary.userReserves.find(r =>
      r.underlyingAsset.toLowerCase() === usdcAddress.toLowerCase()
    );
    if (!usdcPosition || usdcPosition.scaledATokenBalance === '0') {
      throw new Error('No active USDC position found');
    }

    // 7. Execute withdrawal
    showMessage('Withdrawing USDC...', 'pending');
    
    // Add USDC token to MetaMask for better transaction display
    await addTokenToMetaMask(TOKENS.USDC);
    
    const poolAddress = ethers.utils.getAddress(CONTRACT_ADDRESSES.POOL);
    const poolContract = new ethers.Contract(
      poolAddress,
      ['function withdraw(address asset, uint256 amount, address to)'],
      state.ethersProvider.getSigner()
    );

    let txResponse;
    try {
      // Try with @aave/contract-helpers
      const txs = await state.aavePool.withdraw({
        user: userAddress,
        reserve: usdcAddress,
        amount: amountWei.toString(),
        aTokenAddress: aUsdcAddress,
        onBehalfOf: userAddress
      });

      for (const tx of txs) {
        const txData = await tx.tx();
        console.log('Withdrawal transaction data:', txData);
        // Decode transaction data for debugging
        const iface = new ethers.utils.Interface([
          'function withdraw(address asset, uint256 amount, address to)'
        ]);
        const decoded = iface.parseTransaction({ data: txData.data });
        console.log('Decoded withdraw transaction:', {
          asset: decoded.args.asset,
          amount: decoded.args.amount.toString(),
          to: decoded.args.to
        });

        let gasLimit;
        try {
          gasLimit = await state.ethersProvider.estimateGas({
            ...txData,
            from: userAddress
          });
          gasLimit = gasLimit.mul(120).div(100); // 20% buffer
        } catch (e) {
          console.warn('Gas estimation failed, using fallback:', e);
          gasLimit = ethers.BigNumber.from('500000');
        }

        txResponse = await state.ethersProvider.getSigner().sendTransaction({
          ...txData,
          gasLimit,
          // Add metadata to help MetaMask parse the transaction
          customData: {
            tokenSymbol: 'USDC',
            amount: ethers.utils.formatUnits(amountWei, TOKENS.USDC.decimals),
            decimals: TOKENS.USDC.decimals,
            action: 'withdraw'
          }
        });
        console.log('Withdrawal transaction hash:', txResponse.hash);
        await txResponse.wait();
      }
    } catch (e) {
      console.warn('Aave contract helper failed, trying raw contract call:', e);
      // Fallback to raw contract call
      let gasLimit;
      try {
        gasLimit = await poolContract.estimateGas.withdraw(
          usdcAddress,
          amountWei,
          userAddress
        );
        gasLimit = gasLimit.mul(120).div(100);
      } catch (e) {
        console.warn('Raw gas estimation failed, using fallback:', e);
        gasLimit = ethers.BigNumber.from('500000');
      }

      txResponse = await poolContract.withdraw(
        usdcAddress,
        amountWei,
        userAddress,
        { gasLimit }
      );
      console.log('Raw withdrawal transaction hash:', txResponse.hash);
      await txResponse.wait();
    }

    showMessage('Withdrawal successful!', 'success');
    await loadUserPosition(userAddress);

  } catch (error) {
    console.error('Withdrawal error:', error);
    let errorMsg = 'Withdrawal failed';
    if (error.message.includes('user rejected transaction')) {
      errorMsg = 'Transaction rejected';
    } else if (error.message.includes('insufficient funds')) {
      errorMsg = 'Insufficient ETH for gas';
    } else if (error.message.includes('Insufficient aUSDC balance') || 
               error.message.includes('ERC20: transfer amount exceeds balance')) {
      errorMsg = `Not enough USDC in your position. Required: ${amountWei && !isMaxWithdrawal ? ethers.utils.formatUnits(amountWei, TOKENS.aUSDC.decimals) : amount} USDC`;
    } else if (error.message.includes('No active USDC position')) {
      errorMsg = error.message;
    } else {
      errorMsg = `Error: ${error.reason || error.message}`;
    }
    showMessage(errorMsg, 'error');
  } finally {
    //setButtonLoading(false);
    state.transactionInProgress = false;
  }
}
// Helper function to submit transactions
async function submitTransaction({ provider, tx }) {
  const extendedTxData = await tx.tx();
  const { from, ...txData } = extendedTxData;
  const signer = provider.getSigner(from);

  return signer.sendTransaction({
    ...txData,
    value: txData.value ? ethers.BigNumber.from(txData.value) : undefined,
    gasLimit: ethers.BigNumber.from('500000') // Set safe gas limit
  });
}

// UI Helper Functions
function setupEventListeners(container) {
  // Tab switching
  container.querySelectorAll('input[name="usw-tab"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      if (e.target.value === 'strategy') {
        container.querySelector('#strategy-tab').style.display = 'block';
        container.querySelector('#market-tab').style.display = 'none';
      } else {
        container.querySelector('#strategy-tab').style.display = 'none';
        container.querySelector('#market-tab').style.display = 'block';
        await loadMarketData();
      }
    });
  });

  // Strategy toggle
  const strategyToggle = container.querySelector('#usw-strategy-toggle');
strategyToggle.addEventListener('change', async function() {
  try {
    const actionBtn = container.querySelector('#usw-action-button');
    const buttonText = container.querySelector('#usw-button-text');
    const hasPosition = state.currentPosition?.usdcPosition?.scaledATokenBalance !== '0';

    // Auto-revert if trying to withdraw with no position
    if (this.checked && !hasPosition) {
      this.checked = false;
      buttonText.textContent = 'Deposit';
      actionBtn.className = 'deposit';
      
      // Show temporary message
      const msgId = showMessage('No active position to withdraw', 'info');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        const msgElement = document.getElementById(msgId);
        if (msgElement) {
          msgElement.textContent = '';
          msgElement.className = '';
        }
      }, 3000);
      
      return;
    }

    // Normal mode switching
    if (!this.checked) {
      buttonText.textContent = 'Deposit';
      actionBtn.className = 'deposit';
    } else {
      buttonText.textContent = 'Withdraw';
      actionBtn.className = 'withdraw';
    }

    if (state.currentUser) {
      await loadUserPosition(state.currentUser);
    }
  } catch (error) {
    console.error('Toggle error:', error);
    showMessage(`Error: ${error.message}`, 'error');
  }
});

  // Slider interaction
  const slider = container.querySelector('#usw-amount-slider');
  const amountInput = container.querySelector('#usw-amount');
  const walletBalance = container.querySelector('#usw-wallet-balance');

  slider.addEventListener('input', function() {
  const percentage = parseFloat(this.value);
  const balanceText = walletBalance.textContent;
  const maxAmount = parseFloat(balanceText.replace(/Balance: |Position: /, '').replace(/ USDC| aUSDC/, '')) || 0;

  if (isNaN(maxAmount) || maxAmount <= 0) {
    amountInput.value = '0';
    container.querySelector('#usw-action-button').disabled = true;
    return;
  }

  const calculatedValue = (maxAmount * percentage) / 100;
  amountInput.value = calculatedValue.toFixed(6); // Ensure 6 decimal places
  container.querySelector('#usw-action-button').disabled = calculatedValue <= 0;
});

  // Percentage labels
  container.querySelectorAll('.slider-labels span').forEach(label => {
    label.addEventListener('click', () => {
      const percent = parseInt(label.dataset.percent);
      if (!isNaN(percent)) {
        slider.value = percent;
        slider.dispatchEvent(new Event('input'));
      }
    });
  });

  // Amount input
  amountInput.addEventListener('input', function() {
  // Prevent multiple decimal points - simplest approach
  const dotCount = (this.value.match(/\./g) || []).length;
  if (dotCount > 1) {
    // Keep only the first decimal point
    const parts = this.value.split('.');
    this.value = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 6 decimal places - simplest approach
  if (this.value.includes('.')) {
    const parts = this.value.split('.');
    if (parts[1] && parts[1].length > 6) {
      this.value = parts[0] + '.' + parts[1].substring(0, 6);
    }
  }
  
  const value = parseFloat(this.value) || 0;
  const balanceText = walletBalance.textContent;
  const maxAmount = parseFloat(balanceText.replace(/Balance: |Position: /, '').replace(/ USDC| aUSDC/, '')) || 0;

  // Cap input at wallet balance
  if (value > maxAmount) {
    this.value = maxAmount.toFixed(6);
    const strategyToggle = container.querySelector('#usw-strategy-toggle');
    const tokenType = strategyToggle.checked ? 'aUSDC' : 'USDC';
    showMessage(`Cannot exceed ${strategyToggle.checked ? 'position' : 'wallet'} balance: ${maxAmount.toFixed(2)} ${tokenType}`, 'error');
    
    // Auto-hide the error message after 3 seconds
    setTimeout(() => {
      const msgElement = document.getElementById('usw-msg');
      if (msgElement && msgElement.textContent.includes('Cannot exceed')) {
        msgElement.textContent = '';
        msgEl.className = '';
      }
    }, 3000);
  }

  // Update slider
  const percentage = maxAmount > 0 ? Math.min(100, (value / maxAmount) * 100) : 0;
  slider.value = percentage;

  // Enable/disable button
  container.querySelector('#usw-action-button').disabled = !this.value.trim() || value <= 0;
});

  // Action button
  container.querySelector('#usw-action-button').addEventListener('click', async () => {
  try {
    const amountInput = container.querySelector('#usw-amount');
    const amountStr = sanitizeUSDCAmount(amountInput.value);
    const amount = parseFloat(amountStr);
    const strategyToggle = container.querySelector('#usw-strategy-toggle');

    if (isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }

    // Verify amount against wallet balance
    const balanceText = container.querySelector('#usw-wallet-balance').textContent;
    const maxAmount = parseFloat(balanceText.replace(/Balance: |Position: /, '').replace(/ USDC| aUSDC/, '')) || 0;
    if (amount > maxAmount) {
      showMessage(`Cannot deposit more than available balance: ${maxAmount.toFixed(2)} USDC`, 'error');
      return;
    }

    if (!state.currentUser) {
      showMessage('Please connect your wallet', 'error');
      return;
    }

    if (strategyToggle.checked) {
      await withdrawUSDC(amount, state.currentUser);
    } else {
      console.log('Initiating deposit with amount:', amount); // Debug log
      await depositUSDC(amount, state.currentUser);
    }
  } catch (error) {
    console.error('Transaction error:', error);
    showMessage(`Transaction failed: ${error.message}`, 'error');
  }
});
container.querySelector('#usw-action-button').addEventListener('click', async () => {
  try {
    const amountInput = container.querySelector('#usw-amount');
    const amountStr = sanitizeUSDCAmount(amountInput.value);
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      showMessage('Please enter a valid amount', 'error');
      return;
    }

    // Verify amount against wallet/position balance
    const balanceText = container.querySelector('#usw-wallet-balance').textContent;
    const maxAmount = parseFloat(balanceText.replace(/Balance: |Position: /, '').replace(/ USDC| aUSDC/, '')) || 0;
    if (amount > maxAmount) {
      showMessage(`Cannot deposit/withdraw more than available: ${maxAmount.toString()} ${strategyToggle.checked ? 'aUSDC' : 'USDC'}`, 'error');
      return;
    }

    if (!state.currentUser) {
      showMessage('Please connect your wallet', 'error');
      return;
    }

    const strategyToggle = container.querySelector('#usw-strategy-toggle');
    if (strategyToggle.checked) {
      // For max withdrawal, fetch exact aUSDC balance
      let withdrawAmount = amountStr;
      if (amount >= maxAmount) {
        const aUsdcAddress = ethers.utils.getAddress(TOKENS.aUSDC.address);
        const aUsdcContract = new ethers.Contract(
          aUsdcAddress,
          ERC20_ABI,
          state.ethersProvider
        );
        const aUsdcBalance = await aUsdcContract.balanceOf(state.currentUser);
        withdrawAmount = ethers.utils.formatUnits(aUsdcBalance, TOKENS.aUSDC.decimals);
        console.log('Max withdrawal, using exact balance:', withdrawAmount);
      }
      console.log('Initiating withdrawal with amount:', withdrawAmount);
      await withdrawUSDC(withdrawAmount, state.currentUser);
    } else {
      console.log('Initiating deposit with amount:', amount);
      await depositUSDC(amount, state.currentUser);
    }
  } catch (error) {
    console.error('Transaction error:', error);
    showMessage(`Transaction failed: ${error.message}`, 'error');
  }
});

  // Close button
  container.querySelector('#usw-close').addEventListener('click', closeUSDCStrategyWidget);
}

function showMessage(text, type) {
  try {
    const msgEl = document.getElementById('usw-msg') || 
                 document.querySelector('#usdc-strategy-widget #usw-msg');
    
    if (msgEl) {
      msgEl.textContent = text;
      msgEl.className = type || '';
      
      // Auto-clear after 3 seconds for info messages
      if (type === 'info') {
        setTimeout(() => {
          if (msgEl.textContent === text) { // Only clear if same message
            msgEl.textContent = '';
            msgEl.className = '';
          }
        }, 2000);
      }
      
      // Return the message element for external control
      return msgEl.id || 'usw-msg';
    }
  } catch (error) {
    console.error('Error showing message:', error, text);
  }
  return null;
}

function updateStatusText(text, type = '') {
  const statusText = document.querySelector('#usw-status-text');
  if (statusText) {
    statusText.textContent = text;
    statusText.className = `status-text ${type}`;
  }
}

function setLoadingState(isLoading) {
  const container = document.getElementById('usdc-strategy-widget');
  if (container) {
    container.classList.toggle('loading', isLoading);
  }
  //setButtonLoading(isLoading);
}

let isUSDCStrategyWidgetOpen = false;

function openUSDCStrategyWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('usdc-strategy-widget');
        if (!container) return resolve();
        if (isUSDCStrategyWidgetOpen) return resolve();
        container.classList.remove('exiting');
        container.style.display = 'block';
        container.style.animation = 'none';
        void container.offsetWidth;
        container.classList.add('entering');
        container.style.animation = 'butterIn 320ms cubic-bezier(0.1, 0.8, 0.2, 1.05) forwards';
        isUSDCStrategyWidgetOpen = true;
        state.widgetVisible = true;
        container.removeEventListener('animationend', resolve);
        container.addEventListener('animationend', resolve, { once: true });
        // Ensure we're on Linea before loading data
        ensureLineaNetwork().then(() => {
            loadInitialData();
        }).catch((error) => {
            loadInitialData();
        });
    });
}

function closeUSDCStrategyWidget() {
    return new Promise((resolve) => {
        const container = document.getElementById('usdc-strategy-widget');
        if (!container) return resolve();
        if (!isUSDCStrategyWidgetOpen) return resolve();
        container.classList.remove('entering');
        container.classList.add('exiting');
        container.style.animation = 'butterOut 260ms cubic-bezier(0.4, 0, 0.2, 1) forwards';
        const onAnimationEnd = () => {
            container.style.display = 'none';
            container.classList.remove('exiting');
            isUSDCStrategyWidgetOpen = false;
            state.widgetVisible = false;
            container.removeEventListener('animationend', onAnimationEnd);
            resolve();
        };
        container.addEventListener('animationend', onAnimationEnd, { once: true });
    });
}

// Helper function to ensure we're on Linea network
async function ensureLineaNetwork() {
  try {
    const network = await state.ethersProvider.getNetwork();
    if (network.chainId !== 59144) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xe708' }], // Linea Mainnet chainId in hex
        });
      } catch (switchError) {
        // If Linea is not added to MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xe708',
                chainName: 'Linea Mainnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.linea.build'],
                blockExplorerUrls: ['https://lineascan.build']
              }]
            });
          } catch (addError) {
            // Silently ignore if user rejects adding the network
            console.log('User rejected adding Linea network');
          }
        }
        // Silently ignore if user rejects switching networks
        console.log('User rejected switching to Linea network');
      }
    }
  } catch (error) {
    console.log('Network check failed:', error);
  }
}

// Initialize when strategy trigger is clicked
document.getElementById('strategy-trigger')?.addEventListener('click', openUSDCStrategyWidget);

// Add token to MetaMask for better transaction display
async function addTokenToMetaMask(tokenConfig) {
  try {
    if (!window.ethereum) return;

    // Use localStorage to avoid repeated prompts
    const key = `tokenAdded_${tokenConfig.address}`;
    if (window.localStorage.getItem(key)) return;

    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenConfig.address,
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        }
      }
    });

    if (wasAdded) {
      window.localStorage.setItem(key, '1');
    }
  } catch (error) {
    // User rejected or already added
    // Optionally, we can still set the flag to avoid re-prompting
    // window.localStorage.setItem(key, '1');
    console.log('Token already added or user rejected:', error);
  }
}

// Enhanced transaction data formatting for better MetaMask display
function formatTransactionForMetaMask(txData, amount, tokenSymbol) {
  // Add metadata to help MetaMask parse the transaction
  return {
    ...txData,
    // Add custom data that MetaMask can use for display
    customData: {
      tokenSymbol: tokenSymbol,
      amount: amount,
      decimals: 6
    }
  };
}

export { openUSDCStrategyWidget, closeUSDCStrategyWidget, isUSDCStrategyWidgetOpen };
