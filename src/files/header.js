export default function createHeader() {
  // Create the header container
  const header = document.createElement('header');
  header.style.display = 'inline-flex'; // Shrink-to-fit content
  header.style.justifyContent = 'start';
  header.style.alignItems = 'center';
  header.style.gap = '4rem';
  header.style.position = 'fixed';
  header.style.top = '1.6rem'; // Positioned below the logo
  header.style.left = '30%'; // Positioned after "CARDBOARD"
  header.style.fontFamily = "'Euclid Circular B', sans-serif";
  header.style.color = '#fff';
  header.style.padding = '0.5rem 0';
  header.style.zIndex = '1000';
  header.style.boxSizing = 'border-box';
  header.style.letterSpacing = '0.1em';
  header.style.pointerEvents = 'auto'; // Ensure the header itself is interactive
  header.style.background = 'transparent'; // Avoid any accidental blocking background

  // Prevent blocking overflow with limited body scroll
  document.body.style.margin = '0';
  document.body.style.boxSizing = 'border-box';

  // List of header items and their default texts
  const items = [
    { text: 'TopUp', link: '#', id: 'topup-widget',  id: 'topup-trigger' }, // Added ID for the TopUp item
    { text: 'Allowance', link: '#', id: 'allowance-trigger' },
    { text: 'Coinback', link: '#', id: 'coinback-trigger' },
    { text: 'aUSDC', link: '#', id: 'strategy-trigger' },
    { text: 'ShoppingList', link: '#', id: 'shoppinglist-trigger' },
  ];

  // Helper function to create a header item
  const createHeaderItem = ({ text, link, id }) => {
    const item = document.createElement('a');
    item.href = link;
    if (id) item.id = id; // Add ID if provided
    item.textContent = text;
    item.style.textDecoration = 'none';
    item.style.color = 'inherit';
    item.style.cursor = 'pointer';
    item.style.fontSize = '1rem';
    item.style.transition = 'color 0.3s ease';
    item.style.textShadow = `
      -1px -1px 2px rgba(230, 110, 15, 0.8), /* Darker orange for inset depth */
      1px 1px 2px rgba(255, 180, 100, 0.9) /* Lighter orange for outer highlight */
    `;

    // Hover effect: Scramble text
    const scrambleEffect = () => {
      const originalText = text;
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let iterations = 0;

      const interval = setInterval(() => {
        item.textContent = originalText
          .split('')
          .map((char, idx) => {
            if (idx < iterations) return char; // Reveal correct characters progressively
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2; // Speed of character reveal
      }, 80); // Interval speed in milliseconds
    };

    // Add hover listener
    item.addEventListener('mouseenter', scrambleEffect);
    item.addEventListener('mouseleave', () => (item.textContent = text)); // Restore original text

    return item;
  };

  // Add header items to the header
  items.forEach((item) => header.appendChild(createHeaderItem(item)));

  // Append the header to the document body
  document.body.prepend(header);
}
