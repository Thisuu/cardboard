document.addEventListener("DOMContentLoaded", function () {
  const coffeeContainer = document.createElement('div');
  coffeeContainer.style.cssText = `
    position: fixed;
    bottom: 1.2rem;
    left: 1.2rem;
    text-align: center;
    z-index: 1000;
  `;

  const coffeeCup = document.createElement('div');
  coffeeCup.style.cssText = `
    position: relative;
    width: 3rem; /* Scales with root font size */
    height: 4.5rem;
    cursor: pointer;
    transition: transform 0.5s ease;
    transform-origin: bottom center;
  `;

  const coffeeImage = document.createElement('img');
  coffeeImage.src = 'https://i.imgur.com/CrUni5N.png';
  coffeeImage.alt = 'Buy me a coffee';
  coffeeImage.style.cssText = `width: 100%; height: 100%;`;
  coffeeCup.appendChild(coffeeImage);

  const lineShapes = ['left', 'center', 'right'];
  const lines = lineShapes.map((pos, index) => {
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      width: 0.3rem; /* Scales with font size */
      height: 1rem;
      background-color: orange;
      border-radius: 0.15rem;
      top: -1.2rem;
      left: ${pos === 'left' ? '35%' : pos === 'right' ? '65%' : '50%'};
      transform: translateX(-50%) scale(0);
      opacity: 0;
      transition: transform 0.5s ease, opacity 0.5s ease;
    `;
    coffeeCup.appendChild(line);
    return line;
  });

  const textBubble = document.createElement('div');
  textBubble.textContent = 'Buy me a coffee';
  textBubble.style.cssText = `
    background-color: #5c64ec;
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 1rem;
    font-size: 0.875rem; /* Scales with font size */
    position: absolute;
    top: -3.2rem;
    right: -6.8rem;
    white-space: nowrap;
    display: none;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.2);
  `;

  const bubbleTail = document.createElement('div');
  bubbleTail.style.cssText = `
    position: absolute;
    bottom: -0.5rem;
    left: 30%;
    width: 1.2rem;
    height: 1.2rem;
    transform: translate(-50%, 50%) rotate(45deg);
  `;

  // Curved line 1
  const tailCurve1 = document.createElement('div');
  tailCurve1.style.cssText = `
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    border: 0.12rem solid #5c64ec;
    border-bottom: none;
    border-right: none;
    top: 100%;
    left: 10%;
    background: #5c64ec;
  `;

  // Curved line 2
  const tailCurve2 = document.createElement('div');
  tailCurve2.style.cssText = `
    position: absolute;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    border: 0.12rem solid #5c64ec;
    border-bottom: none;
    border-left: none;
    top: 20%;
    right: 40%;
    background: #5c64ec;
  `;

  bubbleTail.appendChild(tailCurve1);
  bubbleTail.appendChild(tailCurve2);
  textBubble.appendChild(bubbleTail);

  coffeeCup.addEventListener('mouseenter', () => {
    textBubble.style.display = 'block';
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.transform = 'translateX(-50%) scale(1)';
        line.style.opacity = '1';
      }, index * 100);
    });
    coffeeCup.style.animation = 'tilt 1s ease-in-out 1 forwards'; //loop once
  });

  coffeeCup.addEventListener('mouseleave', () => {
    textBubble.style.display = 'none';
    lines.forEach(line => {
      line.style.transform = 'translateX(-50%) scale(0)';
      line.style.opacity = '0';
    });
    coffeeCup.style.animation = 'none';
    coffeeCup.style.transform = 'rotate(0deg)';
  });

  coffeeContainer.appendChild(coffeeCup);
  coffeeContainer.appendChild(textBubble);
  document.body.appendChild(coffeeContainer);

  // ETH Sending Functionality using Linea
coffeeCup.addEventListener('click', async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const sender = accounts[0];

      // Switch to Linea network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xE708' }], // Linea's chain ID in hexadecimal, which is 59144 in decimal
      });

      // Initialize transaction on Linea
      const transactionParameters = {
        to: '0x2C21DC4fe422fBAdd7DC1edA8AC4D10a8D9fFa2e', // Replace with ur Linea address
        from: sender,
        value: '0xAA87BEE538000', // 0.003 ETH in wei
      };

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      alert('Transaction initiated on Linea. Transaction Hash: ' + txHash);

    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add Linea network to MetaMask if not found
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xE708',
                chainName: 'Linea Mainnet',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.linea.build'], // Linea RPC URL
                blockExplorerUrls: ['https://lineascan.build/'],
              },
            ],
          });
          // After adding the network, attempt to switch again
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xE708' }],
          });
          // Now attempt to send the transaction
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
          });
          alert('Transaction initiated on Linea after adding the network. Transaction Hash: ' + txHash);
        } catch (addError) {
          console.error('Failed to add Linea network or switch', addError);
          alert('Failed to add Linea network or switch to it. Please add Linea manually in MetaMask settings.');
        }
      } else {
        console.error('Failed to switch network', switchError);
        alert('Failed to switch to Linea network. Please ensure Linea is added to MetaMask and try again.');
      }
    }
  } else {
    alert('MetaMask is not installed. Please install it to proceed with sending ETH to Linea.');
  }
});

  // Add keyframes for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tilt {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(-10deg); }
      40% { transform: rotate(10deg); }
      60% { transform: rotate(-8deg); }
      80% { transform: rotate(8deg); }
      87% { transform: rotate(2deg); }
      97% { transform: rotate(-2deg); }
      100% { transform: rotate(0deg); }
    }
  `;
  document.head.appendChild(style);
});
