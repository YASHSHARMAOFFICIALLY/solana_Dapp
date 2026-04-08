"use client"
import Image from "next/image";
import React, { FC, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
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
                  <Portfolio/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    </div>
  );
}



function TopBar(){
const { publicKey } = useWallet();
  return(
    <div className="flex justify-end gap-2 p-4 bg-red-600">
      {!publicKey && <WalletMultiButton/>}
      {publicKey && <WalletDisconnectButton/>}
    </div>
  )
}

function Portfolio(){
const {connection} = useConnection();
const { publicKey } = useWallet();
const [balance,setbalance] = useState<null | number>(null)
useEffect(()=>{
  if(publicKey){
     connection.getBalance(publicKey)
        .then(balance =>setbalance(balance))
  } 
},[publicKey])
return(
  <div>
    {publicKey?.toString()}<br/>
    Balance = {balance /1000_000_000}
  </div>
)

}