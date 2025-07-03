// Country data
const EU_COUNTRIES = ["AUT", "BEL", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX", "MLT", "NLD", "POL", "PRT", "ROU", "SVK", "SVN", "ESP", "SWE"];
const OTHER_COUNTRIES = ["USA", "GBR", "CHE", "BRA", "MEX", "COL", "ARG"];
const ALL_COUNTRIES = [...EU_COUNTRIES, ...OTHER_COUNTRIES];
const WORLD_POPULATION = 8000000000;
const CONTRACT_ADDRESSES = [
    '0x9647c7B2F286b241769d17D7edC989149aB0636d',
    '0x9089a6fcf12b645e6d7f8879db96e0dfec9bea9b'
];

// Engraved text styling
const MESSAGE_STYLE = {
    position: 'relative',
    color: '#fefefe', // Matches background for engraved look
    padding: '20px',
    fontFamily: '"Euclid Circular B", sans-serif',
    fontSize: '1.2em',
    textShadow: `
        -1px -1px 2px rgba(230, 110, 15, 0.8), /* Darker orange for inset depth */
      1px 1px 2px rgba(255, 180, 100, 0.9) /* Lighter orange for outer highlight */
    `,
    maxWidth: '400px',
    textAlign: 'center',
    fontWeight: "bold",
    marginBottom: '20px',
    minHeight: '60px',
    overflow: 'hidden',
    background: 'transparent',
    textStroke: '0.5px rgba(0,0,0,0.5)' // Creates engraved outline
};

const PARENT_STYLE = {
    position: 'fixed',
    top: '30%',
    left: '20px',
    width: '400px',
    zIndex: '1000'
};

// Cache DOM elements and styles
let highlightStyleAdded = false;

const addHighlightStyles = () => {
    if (!highlightStyleAdded) {
        const style = document.createElement("style");
        style.id = 'highlight-style';
        style.textContent = `
            .highlight {
                color: #FFFFFF !important;
                font-weight: bold;
                text-shadow: 
                    0 0 2px rgba(255, 255, 255, 0.7),
                    0 0 1px rgba(255, 255, 255, 0.5) !important;
                position: relative;
                display: inline-block;
            }
            .highlight::after {
                content: '';
                position: absolute;
                left: 0;
                bottom: -2px;
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
            }
            @keyframes blink {
                50% { opacity: 0; }
            }
            .cursor {
                animation: blink 500ms step-start infinite;
                color: #FFFFFF;
                text-shadow: none !important;
            }
            .engraved-text {
                color: #fff;
                text-shadow: 
                    1px 1px 0 rgba(0,0,0,0.3),
                    -1px -1px 0 rgba(255,255,255,0.2);
                text-stroke: 0.5px rgba(0,0,0,0.5);
                -webkit-text-stroke: 0.5px rgba(0,0,0,0.5);
            }
        `;
        document.head.appendChild(style);
        highlightStyleAdded = true;
    }
};

const createStyledElement = (tag, style) => {
    const element = document.createElement(tag);
    Object.assign(element.style, style);
    element.classList.add('engraved-text');
    return element;
};

const fetchPopulationData = async () => {
    try {
        const apiUrl = `https://restcountries.com/v3.1/alpha?codes=${ALL_COUNTRIES.join(",")}&fields=name,population`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const countryData = await response.json();
        const totalPopulation = countryData.reduce((sum, country) => sum + (country.population || 0), 0);
        
        return { supportedCountries: countryData, totalPopulation };
    } catch (error) {
        console.error("Error fetching population data:", error);
        return { supportedCountries: [], totalPopulation: 0 };
    }
};

const highlightNumbers = container => {
    container.innerHTML = container.textContent.replace(
        /(\d[\d,.]*%?)/g, 
        '<span class="highlight">$1</span>'
    );
};

const typeText = (container, text, typingSpeed = 100) => {
    return new Promise(resolve => {
        let index = 0;
        const cursor = createStyledElement("span", {});
        cursor.className = 'cursor';
        cursor.textContent = "_";
        
        container.textContent = "";
        container.appendChild(cursor);

        const addLetter = () => {
            if (index < text.length) {
                cursor.insertAdjacentText('beforebegin', text[index++]);
                setTimeout(addLetter, typingSpeed);
            } else {
                cursor.remove();
                highlightNumbers(container);
                resolve();
            }
        };

        addLetter();
    });
};

const countLineaTransactions = async () => {
    if (!window.ethereum) return 0;
    
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const txCounts = await Promise.all(
            CONTRACT_ADDRESSES.map(addr => provider.getTransactionCount(addr))
        );
        return txCounts.reduce((sum, count) => sum + parseInt(count), 0);
    } catch (error) {
        console.error("Error counting transactions:", error);
        return 0;
    }
};

const renderCardAvailability = async () => {
    addHighlightStyles();
    
    try {
        const parentContainer = createStyledElement("div", PARENT_STYLE);
        document.body.appendChild(parentContainer);

        const { totalPopulation } = await fetchPopulationData();
        const percentage = ((totalPopulation / WORLD_POPULATION) * 100).toFixed(2);

        // First message
        const mainContainer = createStyledElement("div", MESSAGE_STYLE);
        parentContainer.appendChild(mainContainer);
        await typeText(mainContainer, 
            `The Metamask Card is now available in ${ALL_COUNTRIES.length} countries, 
            unlocking access for ${totalPopulation.toLocaleString()} individuals —
            an impressive ${percentage}% of the world's population.`);

        // Transaction count
        const txCount = await countLineaTransactions();
        if (txCount > 0) {
            const txContainer = createStyledElement("div", MESSAGE_STYLE);
            parentContainer.appendChild(txContainer);
            await typeText(txContainer, 
                `It has already processed over ${txCount.toLocaleString()} payments around the globe.`);
        }
    } catch (error) {
        console.error("Error in renderCardAvailability:", error);
    }
};

export { renderCardAvailability };

