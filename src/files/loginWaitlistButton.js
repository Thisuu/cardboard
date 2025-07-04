export function createLoginWaitlistButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const loginButton = document.createElement('a');
    loginButton.className = 'button-section login-button';

    const loginContent = document.createElement('div');
    loginContent.className = 'login-content';
    loginButton.appendChild(loginContent);

    const nameContainer = document.createElement('span');
    nameContainer.className = 'name-container';
    nameContainer.textContent = 'Login';
    loginContent.appendChild(nameContainer);

    const nftImage = document.createElement('img');
    nftImage.className = 'nft-avatar';
    nftImage.style.display = 'none';
    loginContent.appendChild(nftImage);

    const waitlistButton = document.createElement('a');
    waitlistButton.href = 'https://consensys-software.typeform.com/to/jj3MGjae';
    waitlistButton.className = 'button-section waitlist-button';
    waitlistButton.textContent = 'Waitlist';

    const separator = document.createElement("div");
    separator.className = "button-separator";

    buttonContainer.append(loginButton, separator, waitlistButton);
    document.body.appendChild(buttonContainer);

    let isLogoutModalOpen = false;
    let isLoginModalOpen = false;
    let cachedDisplayName = null;
    let metamaskSDKInstance = null;

    const ENS_CONFIG = {
    reverseRegistrar: {
        address: '0x08D3fF6E65f680844fd2465393ff6f0d742b67D5',
        abi: [
            "function node(address addr) view returns (bytes32)"
        ]
    },
    publicResolver: {
        address: '0x86c5AED9F27837074612288610fB98ccC1733126',
        abi: [
            "function name(bytes32 node) view returns (string)"
        ]
    }
};

    const formatEnsName = (fullName) => fullName?.match(/^([^\.]+)\.linea\.eth$/)?.pop(); //We'll format Linea ENS and extract name

    const getDisplayName = async (address) => {
        if (cachedDisplayName) return cachedDisplayName;
        try {
            const ensName = await getLineaEnsName(address);
            const displayName = formatEnsName(ensName) || `${address.slice(0, 6)}...`;
            cachedDisplayName = displayName;
            return displayName;
        } catch {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        }
    };

    const getLineaEnsName = async (address) => {
        if (!window.ethereum) return null;
        try {
            // Initialize ethers provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Check if connected to Linea (chainId 59144)
            const network = await provider.getNetwork();
            if (network.chainId !== 59144) {
                console.warn('Not connected to Linea network');
                return null;
            }

            // Initialize contracts with ethers
            const reverseRegistrar = new ethers.Contract(
                ENS_CONFIG.reverseRegistrar.address,
                ENS_CONFIG.reverseRegistrar.abi,
                provider
            );
            
            const node = await reverseRegistrar.node(address);
            if (node === '0x'.padEnd(66, '0')) return null;
            
            const publicResolver = new ethers.Contract(
                ENS_CONFIG.publicResolver.address,
                ENS_CONFIG.publicResolver.abi,
                provider
            );
            
            return await publicResolver.name(node);
        } catch (error) {
            console.error('ENS lookup error:', error);
            return null;
        }
    };

    const fetchNftImage = async (address) => {
        const CONTRACTS = [
            '0x194395587d7b169e63eaf251e86b1892fa8f1960', //Efrogs
            '0xa9651e1f89535d5b6ede0b818d07712d826e5dc8', //Efroglets
            '0xe46c02315c4a991d061a06f165028f8c9167249b', //Foxy
            '0x34fb60d16d485cf35637041bef106a7b1eefab55'  //Lpuss
        ];
        const API_KEY = 'HiGdQzc70y_Hknsz-zMnZvLfPY2qI3Td';

        for (const contract of CONTRACTS) {
            try {
                const url = `https://linea-mainnet.g.alchemy.com/nft/v2/${API_KEY}/getNFTs?owner=${address}&contractAddresses[]=${contract}`;
                const res = await fetch(url);
                const { ownedNfts } = await res.json();
                const nft = ownedNfts?.[0];
                if (nft?.media?.[0]?.gateway) return nft.media[0].gateway;
            } catch {}
        }
        return null;
    };

    const updateLoginButtonLabel = async () => {
        if (window.metamaskAccount) {
            const displayName = await getDisplayName(window.metamaskAccount);
            nameContainer.textContent = displayName;
            nameContainer.classList.add('ens-name');

            const img = await fetchNftImage(window.metamaskAccount);
            if (img) {
                nftImage.src = img;
                nftImage.style.display = 'block';
                nameContainer.style.paddingLeft = '2.5rem';
            } else {
                nftImage.style.display = 'none';
                nameContainer.style.paddingLeft = '0';
            }
        } else {
            nameContainer.textContent = 'Login';
            nameContainer.classList.remove('ens-name');
            nameContainer.style.paddingLeft = '0';
            nftImage.style.display = 'none';
        }
    };

    const showLogoutModal = async (account, onConfirmLogout) => {
        if (isLogoutModalOpen) return;
        isLogoutModalOpen = true;

        const displayName = await getDisplayName(account);
        const overlay = document.createElement('div');
        overlay.className = 'logout-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'logout-modal';

        const title = document.createElement('h2');
        title.textContent = 'Disconnect Wallet?';
        title.className = 'logout-modal-title';

        const subtitle = document.createElement('p');
        subtitle.innerHTML = `You're logged in as: <span class="ens-name">${displayName}</span>`;
        subtitle.className = 'logout-modal-subtitle';

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'logout-modal-buttons';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'logout-cancel';

        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'logout-confirm';

        buttonGroup.append(cancelBtn, logoutBtn);
        modal.append(title, subtitle, buttonGroup);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const removeModal = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                isLogoutModalOpen = false;
            }, 300);
        };

        overlay.classList.add('show');
        cancelBtn.onclick = removeModal;
        logoutBtn.onclick = () => {
            removeModal();
            onConfirmLogout();
        };
    };

    const setupWalletEvents = () => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                handleDisconnect();
            } else if (accounts[0] !== window.metamaskAccount) {
                handleConnect(accounts[0]);
            }
        };

        const handleConnect = async (account) => {
            window.metamaskAccount = account;
            cachedDisplayName = await getDisplayName(account);
            await updateLoginButtonLabel();
            const img = await fetchNftImage(account);
            nftImage.style.display = img ? 'block' : 'none';
            if (img) nftImage.src = img;
        };

        const handleDisconnect = () => {
            window.metamaskAccount = null;
            cachedDisplayName = null;
            updateLoginButtonLabel();
            nftImage.style.display = 'none';
            window.dispatchEvent(new CustomEvent('metamask-logout'));
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleDisconnect);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleDisconnect);
        };
    };

    const showConnectModal = async () => {
        if (isLoginModalOpen) return;
        isLoginModalOpen = true;

        try {
            if (!metamaskSDKInstance) {
                metamaskSDKInstance = new window.MetaMaskSDK.MetaMaskSDK({
                    dappMetadata: { name: 'Cardboard', url: location.href }
                });
                await metamaskSDKInstance.init();
            }

            const accounts = await metamaskSDKInstance.connect();
            if (accounts?.length) {
                window.metamaskAccount = accounts[0];
                // Clear cache to force fresh ENS lookup on first login
                cachedDisplayName = null;
                cachedDisplayName = await getDisplayName(accounts[0]);
                await updateLoginButtonLabel();
                const img = await fetchNftImage(accounts[0]);
                nftImage.style.display = img ? 'block' : 'none';
                if (img) nftImage.src = img;
            }
        } catch {
            console.log('User dismissed MetaMask modal');
        } finally {
            isLoginModalOpen = false;
        }
    };

    const reconnectOrShowLogin = async () => {
        try {
            if (!metamaskSDKInstance) {
                metamaskSDKInstance = new window.MetaMaskSDK.MetaMaskSDK({
                    dappMetadata: { name: 'Cardboard', url: location.href }
                });
                await metamaskSDKInstance.init();
            }

            const provider = metamaskSDKInstance.getProvider();
            const accounts = await provider.request({ method: 'eth_accounts' });

            if (accounts?.length > 0) {
                window.metamaskAccount = accounts[0];
                // Clear cache to force fresh ENS lookup
                cachedDisplayName = null;
                cachedDisplayName = await getDisplayName(accounts[0]);
                await updateLoginButtonLabel();
                const img = await fetchNftImage(accounts[0]);
                nftImage.style.display = img ? 'block' : 'none';
                if (img) nftImage.src = img;
            } else {
                // Auto-show login modal when no wallet is connected
                await showConnectModal();
            }
        } catch (err) {
            console.warn('Silent reconnect failed:', err);
            // Auto-show login modal on any error
            await showConnectModal();
        }
    };

    const initializeMetaMaskSDK = () => {
        if (window.MetaMaskSDK) {
            reconnectOrShowLogin();
            return setupWalletEvents();
        }

        if (!document.querySelector('script[src*="metamask-sdk.js"]')) {
            const sdkScript = document.createElement('script');
            sdkScript.src = 'https://c0f4f41c-2f55-4863-921b-sdk-docs.github.io/cdn/metamask-sdk.js';
            sdkScript.async = true;
            sdkScript.onload = () => {
                setupWalletEvents();
                reconnectOrShowLogin();
            };
            document.head.appendChild(sdkScript);
        }
    };

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.metamaskAccount) {
            showLogoutModal(window.metamaskAccount, () => {
                window.metamaskAccount = null;
                cachedDisplayName = null;
                window.dispatchEvent(new CustomEvent('metamask-logout'));
                updateLoginButtonLabel();
            });
        } else {
            await showConnectModal();
        }
    });

    nftImage.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.metamaskAccount) {
            showLogoutModal(window.metamaskAccount, () => {
                window.metamaskAccount = null;
                cachedDisplayName = null;
                window.dispatchEvent(new CustomEvent('metamask-logout'));
                updateLoginButtonLabel();
            });
        }
    });

    // Inject SDK and auto-login or prompt
    initializeMetaMaskSDK();

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        
        .button-container {
            position: fixed;
            top: 1.2rem;
            right: 1.2rem;
            display: flex;
            align-items: center;
            width: 12.5rem;
            height: 3.125rem;
            background: #007BFF;
            border-radius: 1.5625rem;
            box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .button-section {
            flex: 1;
            text-align: center;
            line-height: 3.125rem;
            color: white;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        .login-button {
            font-family: 'Euclid Circular B', sans-serif;
            position: relative;
        }

        .login-content {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .name-container {
            font-weight: normal;
            font-size: 1em;
            transition: padding-left 0.3s;
        }

        .ens-name {
            font-family: 'Caveat', cursive;
            font-weight: 700;
            cursor: pointer;
            font-size: 1.2em;
        }

        .nft-avatar {
            width: 2.2rem;
            height: 2.2rem;
            border-radius: 50%;
            position: absolute;
            left: 0.4rem;
            top: 50%;
            transform: translateY(-50%);
            border: 2px solid #fff;
            box-shadow: 0 0 0.25rem rgba(0,0,0,0.3);
            cursor: pointer;
        }

        .button-separator {
            width: 1px;
            height: 40%;
            background: white;
            z-index: 3;
        }

        .login-button:hover {
            background: #0056b3;
            border-top-left-radius: 1.5625rem;
            border-bottom-left-radius: 1.5625rem;
        }

        .waitlist-button:hover {
            background: #004494;
            border-top-right-radius: 1.5625rem;
            border-bottom-right-radius: 1.5625rem;
        }

        .button-container:hover .button-separator {
            opacity: 1 !important;
        }

        .logout-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transform: scale(0.95);
            transition: all 0.3s ease;
            z-index: 9999;
        }

        .logout-modal-overlay.show {
            opacity: 1;
            transform: scale(1);
        }

        .logout-modal {
            background: #eedcce;
            border-radius: 1rem;
            padding: 2rem;
            width: min(90%, 24vw);
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            text-align: center;
        }

        .logout-modal-title {
            font-size: 1.5rem;
            color: #9a3828;
            margin-bottom: 0.5rem;
            font-family: 'Euclid Circular B', sans-serif;
        }

        .logout-modal-subtitle {
            font-size: 1rem;
            color: #4a2a1e;
            margin-bottom: 1.5rem;
            font-family: 'Euclid Circular B', sans-serif;
        }

        .logout-modal-buttons {
            display: flex;
            gap: 1rem;
            justify-content: space-between;
        }

        .logout-confirm, .logout-cancel {
            flex: 1;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .logout-confirm {
            background: #c24753;
            color: white;
            border: none;
        }

        .logout-confirm:hover { background: #9a3828; }

        .logout-cancel {
            background: #fff;
            color: #c24753;
            border: 2px solid #c24753;
        }

        .logout-cancel:hover { background: #f5cfcf; }
    `;
    document.head.appendChild(style);
}
