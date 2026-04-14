# <img src="./app/favicon.ico" width="28" alt="Solana DApp icon" /> Solana DApp

A professional Solana wallet dashboard built with Next.js, TypeScript, and Solana wallet adapters. The app connects to Solana Devnet, displays wallet balances and SPL token holdings, and supports sending SOL or SPL tokens from a connected wallet.

This project is designed as a portfolio and resume contribution project, with a clean foundation for adding production-grade Web3 features over time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111111)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=ffffff)
![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana&logoColor=111111)

## Screenshot

Add your project screenshot here:

```md
![Solana DApp Screenshot](./public/screenshot.png)
```

<!-- Replace this placeholder after adding your screenshot to public/screenshot.png -->

## Features

- Connect and disconnect a Solana wallet with `@solana/wallet-adapter-react`
- Read SOL balance from Solana Devnet
- Fetch SPL token accounts for the connected wallet
- Display token balances with metadata and logo fallback support
- Send SOL to another wallet address
- Send SPL tokens and create the recipient associated token account when needed
- Proxy token metadata through a Next.js API route with fallback token-list sources
- Responsive interface built with Tailwind CSS

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** React, Tailwind CSS
- **Blockchain:** Solana Web3.js, SPL Token
- **Wallets:** Solana Wallet Adapter
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Solana wallet configured for Devnet

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local development URL shown in your terminal, usually:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```text
app/
  api/token/route.ts      Token metadata proxy route
  layout.tsx              Root layout and analytics
  page.tsx                Solana providers and page shell
Comnponent/
  Topbar.tsx              Wallet connect/disconnect navigation
  portfolio.tsx           SOL and SPL token portfolio view
  send.tsx                SOL and SPL token transfer form
public/
  *.svg                   Static assets
```

## How It Works

1. The app connects to Solana Devnet through `ConnectionProvider`.
2. The user connects a wallet through the Solana Wallet Adapter modal.
3. The portfolio component reads the wallet SOL balance and parsed SPL token accounts.
4. Token metadata is loaded through the `/api/token` proxy route.
5. The send form builds and submits either a native SOL transfer or an SPL token transfer transaction.

## Security Notes

- The app never asks for private keys or seed phrases.
- Transactions are signed only through the connected wallet.
- Test transfers on Devnet before adapting the project for Mainnet.
- Review wallet prompts carefully before confirming any transaction.
- Move configurable RPC endpoints into environment variables before production deployment.

## Resume Highlights

- Built a client-side Solana wallet dashboard using Next.js and TypeScript.
- Integrated wallet connection, balance fetching, SPL token discovery, and transaction submission.
- Implemented SPL token transfer support with associated token account creation.
- Added a resilient token metadata proxy with multiple fallback sources.
- Structured the project for future production improvements and portfolio presentation.

## Future Plans

- Add transaction history with Solana explorer links
- Add better wallet and transaction error handling
- Add mainnet/devnet network switching
- Add token search and filtering
- Improve token metadata caching
- Add unit and integration tests for wallet and transaction flows
- Add a polished screenshot and project demo GIF
- Rename component folders and files for consistent casing
- Add deployment instructions for Vercel

## Contributing

Contributions are welcome. Good first improvements include UI cleanup, error handling, test coverage, token metadata reliability, and documentation updates.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and build checks
5. Open a pull request with a clear summary

```bash
npm run lint
npm run build
```

## License

This project is available for learning, portfolio, and contribution purposes. Add a license file before using it in a production or commercial setting.
