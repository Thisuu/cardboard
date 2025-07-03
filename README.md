# Cardboard

Cardboard is a modern, user centric dashboard for the MetaMask Debit Card, built on Linea network. It provides a seamless, interactive experience for managing your on-chain finances, rewards, and card controls—all in one place.

---

## Features & Widgets

### 🛒 Shopping List Widget
- **On-chain shopping management**: Add, check off, and delete items from your personal shopping list, stored on-chain.
- **History tracking**: View a history of your actions (add, purchase, delete) for full transparency.
- **Smooth UI**: Animated transitions, empty states, and robust event handling.

### 💵 USDC Strategy Widget
- **AAVE integration**: Deposit and withdraw USDC to earn passive yield on idle stablecoins.
- **Live APY & position**: See your current aUSDC balance, APY, and estimated annual return.
- **Animated, user-friendly and straightforward interface**.

### 💳 Card Limits Widget
- **Spending control**: Set, update, or revoke spending limits for your MetaMask Card on supported tokens.
- **Multi-token support**: USDC, USDT, aUSDC, WETH, EURe, GBPe.
- **One-click revoke all**: Instantly remove all allowances for security.

### 🪙 Coinback Widget
- **Rewards dashboard**: Track and claim Coinback rewards earned from card purchases.
- **Reward history**: See detailed breakdowns by merchant and date.

### 🔄 Topup Widget
- **Bridge funds**: Use Jumper Exchange to bridge your USDC to Linea directly from the dashboard.

---

## Project Structure & Usage

This project is bundled with [Webpack](https://webpack.js.org/):

```
"build": "webpack --config=webpack.prod.js",
"build-dev": "webpack --config=webpack.dev.js",
"start": "webpack serve webpack-dev-server --open --config=webpack.dev.js"
```

**Commands:**

```
npm install      # install dependencies
npm start        # development build in ./dist
npm run build    # static production build in ./
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
