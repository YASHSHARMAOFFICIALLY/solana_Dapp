"use client"
import { useEffect, useState } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { ThemeProvider, useTheme } from './ThemeProvider';

export default function Home() {
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=42334ea9-9808-4b7a-b697-43e53515823e";
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
              <TopBar />
              <main className="max-w-xl mx-auto px-6 py-16 space-y-6">
                <Portfolio />
                <Send />
              </main>
            </div>
          </ThemeProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function TopBar() {
  const { publicKey } = useWallet();
  const { dark, toggle } = useTheme();
  return (
    <nav className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 sticky top-0 z-50 transition-colors">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Solana
        </span>
        <div className="flex items-center gap-2">
          {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Portfolio() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      connection.getBalance(publicKey)
        .then(bal => setBalance(bal))
        .finally(() => setLoading(false));
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No wallet connected</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Connect a wallet to get started.</p>
      </div>
    );
  }

  const solBalance = balance !== null ? balance / LAMPORTS_PER_SOL : null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</span>
        <span className="text-xs font-mono truncate max-w-48 text-gray-400 dark:text-gray-500">
          {publicKey.toString()}
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-28 rounded animate-pulse bg-gray-100 dark:bg-white/10" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {solBalance !== null ? solBalance.toFixed(4) : "\u2014"}
          </span>
          <span className="text-sm text-gray-400 font-medium">SOL</span>
        </div>
      )}
    </div>
  );
}

function Send() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  if (!publicKey) return null;

  async function handleSend() {
    setError("");
    if (!publicKey) return;

    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      setError("Invalid wallet address.");
      return;
    }

    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (isNaN(lamports) || lamports <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    try {
      setStatus("sending");
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );
1

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setStatus("success");
      setRecipient("");
      setAmount("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 p-6">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-5">Send SOL</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Recipient</label>
          <input
            type="text"
            placeholder="Wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Amount</label>
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 transition"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {status === "success" && <p className="text-sm text-green-600 dark:text-green-400">Transaction confirmed.</p>}
        <button
          onClick={handleSend}
          disabled={status === "sending" || !recipient || !amount}
          className="w-full rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium transition cursor-pointer"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
