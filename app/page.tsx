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
          <div className="min-h-screen bg-white text-gray-900">
            <TopBar />
            <main className="max-w-xl mx-auto px-6 py-16 space-y-6">
              <Portfolio />
              <Send />
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function TopBar() {
  const { publicKey } = useWallet();
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight text-gray-900">
          Solana
        </span>
        <div>
          {!publicKey ? <WalletMultiButton /> : <WalletDisconnectButton />}
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
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-1">No wallet connected</h2>
        <p className="text-gray-500 text-sm">Connect a wallet to get started.</p>
      </div>
    );
  }

  const solBalance = balance !== null ? balance / LAMPORTS_PER_SOL : null;

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 font-medium">Balance</span>
        <span className="text-xs text-gray-400 font-mono truncate max-w-48">
          {publicKey.toString()}
        </span>
      </div>
      {loading ? (
        <div className="h-9 w-28 rounded bg-gray-100 animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-gray-900">
            {solBalance !== null ? solBalance.toFixed(4) : "—"}
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
    <div className="rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-5">Send SOL</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Recipient</label>
          <input
            type="text"
            placeholder="Wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        {status === "success" && (
          <p className="text-green-600 text-sm">Transaction confirmed.</p>
        )}
        <button
          onClick={handleSend}
          disabled={status === "sending" || !recipient || !amount}
          className="w-full rounded-lg bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium transition cursor-pointer"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
