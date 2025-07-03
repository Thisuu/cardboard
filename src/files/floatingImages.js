export function initializeFloatingImages() {
  // Inject CSS for floating animation, tooltip, and pang animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-1rem);
      }
    }

    @keyframes tooltipSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pang-animation {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(1.1);
        opacity: 0;
      }
    }

    .floating-image {
      position: absolute;
      width: 8rem; /* Scalable size */
      height: auto;
      animation: float 6s ease-in-out infinite;
      transform: translate(-50%, -50%);
      pointer-events: auto;
      cursor: default;
      transition: transform 0.3s ease, filter 0.3s ease;
      filter: drop-shadow(0 0.5rem 0.7rem rgba(0, 0, 0, 0.3));
      z-index: 2;
    }

    .floating-image:hover {
      transform: translate(-50%, -50%) scale(1.1);
      filter: drop-shadow(0 1rem 1.5rem rgba(0, 0, 0, 0.4));
    }

    .tooltip {
      position: absolute;
      padding: 0.75rem 1.25rem;
      background-color: #eedcce;
      color: #6b482b;
      border-radius: 1.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      pointer-events: none;
      font-family: 'Euclid Circular B', sans-serif;
      font-size: 0.9rem;
      text-align: center;
      max-width: 15rem;
      line-height: 1.4;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 1001;
      text-shadow: none;
    }

    .tooltip.visible {
      animation: tooltipSlide 0.3s forwards;
    }

    .shape-container {
      position: absolute;
      width: 12rem; /* Adjust this based on image size */
      height: 12rem;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1;
    }

    .shape-container svg {
      width: 100%;
      height: 100%;
      display: block;
      position: absolute;
      transform-origin: 40% 30%; 
      visibility: hidden;
    }

    .shape-container:hover > svg {
      animation: pang-animation 1.2s ease-out forwards;
      visibility: visible;
    }

    .shape-container svg .shape {
      fill: none;
      stroke: none;
      stroke-width: 1px; 
      stroke-linecap: round;
      stroke-linejoin: round;
      transform-origin: 40% 30%;
    }

    .shape-container svg .shape-01 { stroke: #FDD053; }
    .shape-container svg .shape-02 { stroke: #7691E8; }
    .shape-container svg .shape-03 { stroke: #B8CBEE; }
    .shape-container svg .shape-04 { fill: #B8CBEE; }
    .shape-container svg .shape-05 { stroke: #FDD053; }
    .shape-container svg .shape-06 { stroke: #7691E8; }
    .shape-container svg .shape-07 { stroke: #FDD053; }
    .shape-container svg .shape-08 { fill: #B8CBEE; }
    .shape-container svg .shape-09 { stroke: #B8CBEE; }

    body {
      overflow: hidden;
      font-family: 'Euclid Circular B', sans-serif;
    }
  `;
  document.head.appendChild(style);

  // Inject SVG definitions into the document
  const svgDefs = document.createElement('div');
  svgDefs.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
      <symbol id="shape-01" viewBox="0 0 300 300">
        <polygon stroke="#FDD053" points="155.77 140.06 141.08 152.42 159.12 158.96 155.77 140.06"/>
      </symbol>
      <symbol id="shape-02" viewBox="0 0 300 300">
        <g stroke="#7691E8">
          <line x1="158.66" y1="146.73" x2="141.54" y2="152.29"/>
          <line x1="147.32" y1="140.95" x2="152.88" y2="158.07"/>
        </g>
      </symbol>
      <symbol id="shape-03" viewBox="0 0 300 300">
        <circle stroke="#B8CBEE" cx="150.1" cy="149.51" r="13"/>
      </symbol>
      <symbol id="shape-04" viewBox="0 0 300 300">
        <circle fill="#B8CBEE" cx="150.1" cy="149.51" r="4"/>
      </symbol>
      <symbol id="shape-05" viewBox="0 0 300 300">
        <rect stroke="#FDD053" x="141.1" y="140.51" width="18" height="18" transform="translate(40.44 -31.76) rotate(13.94)"/>
      </symbol>
      <symbol id="shape-06" viewBox="0 0 300 300">
        <g stroke="#7691E8">
          <line x1="158.48" y1="152.78" x2="141.72" y2="146.24"/>
          <line x1="153.37" y1="141.13" x2="146.83" y2="157.89"/>
        </g>
      </symbol>
      <symbol id="shape-07" viewBox="0 0 300 300">
        <rect stroke="#FDD053" x="138.1" y="137.51" width="24" height="24" transform="translate(-42.94 62.23) rotate(-20.56)"/>
      </symbol>
      <symbol id="shape-08" viewBox="0 0 300 300">
        <circle fill="#B8CBEE" cx="150.1" cy="149.51" r="4"/>
      </symbol>
      <symbol id="shape-09" viewBox="0 0 300 300">
        <circle stroke="#B8CBEE" cx="150.1" cy="149.51" r="8"/>
      </symbol>
    </svg>
  `;
  document.body.appendChild(svgDefs);

  // Image data (URLs + tooltips)
  const imageData = [
    { src: "https://i.imgur.com/8FwJJqB.png", tooltip: "Shop effortlessly! The Metamask Card brings the power of crypto to your local stores. Say hello to groceries paid in style!", x: "50%", y: "90%" },
    { src: "https://i.imgur.com/S3UBTKZ.png", tooltip: "Craving your favorite meal? The Metamask Card makes dining out easier than ever. Bon appétit, powered by crypto!", x: "75%", y: "83%" },
    { src: "https://i.imgur.com/R2ENPn6.png", tooltip: "Pay at your convenience with USDC, USDT, EURe, GBPe or WETH on Linea. Your assets, your rules!", x: "95%", y: "70%" },
    { src: "https://i.imgur.com/mb6qfls.png", tooltip: "Buy your favorite games with ease! The Metamask Card supports Google Wallet and Apple Pay for seamless transactions.", x: "25%", y: "80%" },
    { src: "https://i.imgur.com/qrt9Jne.png", tooltip: "Introducing the **Metamask Metal Card** – elegance meets crypto! Enjoy premium perks and seamless transactions with this sleek, cutting-edge card.", x: "100%", y: "40%" }
    // Add more images here as needed
  ];

  // Create a container for floating images
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.zIndex = "1000";
  document.body.appendChild(container);

  function convertPercentToPixels(percent, dimension) {
    return (parseFloat(percent) / 100) * dimension;
  }

  imageData.forEach(({ src, tooltip, x, y }, index) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("shape-container");
    imgWrapper.style.left = x;
    imgWrapper.style.top = y;

    // Add SVG for shapes around each image
    const shapesSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (let i = 1; i <= 9; i++) {
      const shape = document.createElementNS("http://www.w3.org/2000/svg", "use");
      shape.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#shape-0${i}`);
      shape.classList.add(`shape`, `shape-0${i}`);
      shape.style.transform = `translate(${Math.random() * 3 - 1.5}rem, ${Math.random() * 3}rem) rotate(${40 * i}deg)`;
      shapesSvg.appendChild(shape);
    }
    imgWrapper.appendChild(shapesSvg);

    const img = document.createElement("img");
    img.src = src;
    img.alt = tooltip;
    img.classList.add("floating-image");

    // Add unique animation delay and duration
    const delay = Math.random() * 2; // Random delay between 0-2s
    const duration = 5 + Math.random() * 2; // Random duration between 5-7s
    img.style.animationDelay = `${delay}s`;
    img.style.animationDuration = `${duration}s`;

    imgWrapper.appendChild(img);

    // Tooltip logic
    const tooltipDiv = document.createElement("div");
    tooltipDiv.textContent = tooltip;
    tooltipDiv.classList.add("tooltip");
    document.body.appendChild(tooltipDiv);

    img.addEventListener("mouseenter", () => {
      const imgRect = img.getBoundingClientRect();
      const tooltipRect = tooltipDiv.getBoundingClientRect();
      
      tooltipDiv.style.left = `calc(${imgRect.left + imgRect.width / 2}px - ${tooltipRect.width / 2}px)`;
      tooltipDiv.style.top = `calc(${imgRect.top}px - ${tooltipRect.height}px - 0.5rem)`;
      
      const viewportWidth = window.innerWidth;
      
      if (tooltipDiv.offsetLeft < 0) {
        tooltipDiv.style.left = '0.5rem';
      } else if (tooltipDiv.offsetLeft + tooltipRect.width > viewportWidth) {
        tooltipDiv.style.left = `calc(100% - ${tooltipRect.width}px - 0.5rem)`;
      }
      
      if (tooltipDiv.offsetTop < 0) {
        tooltipDiv.style.top = `calc(${imgRect.bottom}px + 0.5rem)`;
      }

      tooltipDiv.classList.add("visible");
    });

    img.addEventListener("mouseleave", () => {
      tooltipDiv.classList.remove("visible");
    });

    container.appendChild(imgWrapper);
  });

  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
}
