"use client"
import Image from "next/image";
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';




export default function Home() {
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=42334ea9-9808-4b7a-b697-43e53515823e";
  return (
  <div>
      <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                  <TopBar/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    </div>
  );
}



function TopBar(){
  return(
    <div className="flex justify-end">
       <WalletMultiButton/>
     <WalletDisconnectButton/>

    </div>
  )
}