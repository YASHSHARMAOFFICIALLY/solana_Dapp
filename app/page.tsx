"use client"
import { useEffect, useState } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
   
} from '@solana/wallet-adapter-react-ui';

import Portfolio from '@/Comnponent/portfolio';
import TopBar from '@/Comnponent/Topbar';
import Send from '@/Comnponent/send';



export default function Home() {
  const endpoint = "https://api.devnet.solana.com";
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
  <div className="min-h-screen w-full relative text-gray-900">

    {/* Radial Gradient Background */}
    <div className="fixed inset-0 z-0 bg-[radial-gradient(125%_125%_at_50%_90%,_#fff_40%,_#7c3aed_100%)]" />

    {/* Content Layer */}
    <div className="relative z-10">
      <TopBar />

      <main className="max-w-xl mx-auto px-6 py-16 space-y-6">
        <Portfolio />
        <Send />
      </main>
    </div>

  </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}



