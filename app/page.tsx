"use client"
import { useEffect, useState } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';



export default function Home() {
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=42334ea9-9808-4b7a-b697-43e53515823e";
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


function TopBar() {
  const { publicKey } = useWallet();
  return (
    <nav className="border-b border-white/20 bg-white/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          Solana
        </span>
        <div className="flex items-center gap-2">
          {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
          <a
            href="https://github.com/yashsharma"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
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
      <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-1">No wallet connected</h2>
        <p className="text-sm text-gray-500">Connect a wallet to get started.</p>
      </div>
    );
  }

  const solBalance = balance !== null ? balance / LAMPORTS_PER_SOL : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">Balance</span>
        <span className="text-xs font-mono truncate max-w-48 text-gray-400">
          {publicKey.toString()}
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-28 rounded animate-pulse bg-gray-100" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-gray-900">
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
    <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-5">Send SOL</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Recipient</label>
          <input
            type="text"
            placeholder="Wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm font-mono placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Amount</label>
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {status === "success" && <p className="text-sm text-green-600">Transaction confirmed.</p>}
        <button
          onClick={handleSend}
          disabled={status === "sending" || !recipient || !amount}
          className="w-full rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium transition cursor-pointer"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
