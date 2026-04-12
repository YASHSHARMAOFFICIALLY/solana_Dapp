'use client'
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

type TokenOption = {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  logo?: string;
};

function Send() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [selectedMint, setSelectedMint] = useState<string>("SOL");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [solBalance, setSolBalance] = useState<number>(0);

  // ✅ Fetch wallet tokens + SOL balance
  useEffect(() => {
    if (!publicKey) return;

    const fetchTokens = async () => {
      try {
        // SOL balance
        const bal = await connection.getBalance(publicKey);
        setSolBalance(bal / LAMPORTS_PER_SOL);

        // SPL token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const parsed: TokenOption[] = tokenAccounts.value
          .map((acc) => {
            const info = acc.account.data.parsed.info;
            return {
              mint: info.mint,
              symbol: info.mint.slice(0, 4) + "...",
              name: "Unknown",
              amount: info.tokenAmount.uiAmount,
              decimals: info.tokenAmount.decimals,
            };
          })
          .filter((t) => t.amount > 0);

        // Enrich with token metadata from your proxy
        try {
          const res = await fetch("/api/tokens");
          const data = await res.json();
          const map: Record<string, { name: string; symbol: string; logoURI?: string }> = {};
          (data.tokens ?? []).forEach((t: any) => {
            map[t.address] = { name: t.name, symbol: t.symbol, logoURI: t.logoURI };
          });

          const enriched = parsed.map((t) => ({
            ...t,
            symbol: map[t.mint]?.symbol ?? t.symbol,
            name: map[t.mint]?.name ?? t.name,
            logo: map[t.mint]?.logoURI,
          }));

          setTokens(enriched);
        } catch {
          setTokens(parsed); // fallback without names
        }
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  if (!publicKey) return null;

  const selectedToken = tokens.find((t) => t.mint === selectedMint);
  const maxAmount = selectedMint === "SOL" ? solBalance : selectedToken?.amount ?? 0;

  async function handleSend() {
    setError("");
    if (!publicKey) return;

    // Validate recipient
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch {
      setError("Invalid wallet address.");
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (parsedAmount > maxAmount) {
      setError("Amount exceeds your balance.");
      return;
    }

    try {
      setStatus("sending");
      const transaction = new Transaction();

      if (selectedMint === "SOL") {
        // ── SOL transfer ──────────────────────────────────────
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports: Math.floor(parsedAmount * LAMPORTS_PER_SOL),
          })
        );
      } else {
        // ── SPL Token transfer ────────────────────────────────
        const mintPubkey = new PublicKey(selectedMint);
        const decimals = selectedToken!.decimals;
        const transferAmount = Math.floor(parsedAmount * 10 ** decimals);

        // Get sender's ATA
        const senderATA = await getAssociatedTokenAddress(mintPubkey, publicKey);

        // Get or create recipient's ATA
        const recipientATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);
        const recipientATAInfo = await connection.getAccountInfo(recipientATA);

        // If recipient has no ATA for this token, create it
        if (!recipientATAInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,       // payer
              recipientATA,    // new ATA address
              recipientPubkey, // owner
              mintPubkey       // token mint
            )
          );
        }

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            senderATA,    // from
            recipientATA, // to
            publicKey,    // owner
            transferAmount
          )
        );
      }

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
      <h3 className="text-sm font-medium text-gray-900 mb-5">Send</h3>

      <div className="space-y-4">

        {/* Token selector */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Token</label>
          <select
            value={selectedMint}
            onChange={(e) => { setSelectedMint(e.target.value); setAmount(""); }}
            className="w-full rounded-lg border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          >
            {/* SOL option */}
            <option value="SOL">SOL — {solBalance.toFixed(4)}</option>

            {/* SPL token options */}
            {tokens.map((t) => (
              <option key={t.mint} value={t.mint}>
                {t.symbol} — {t.amount}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient */}
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

        {/* Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-gray-500">Amount</label>
            <button
              onClick={() => setAmount(String(maxAmount))}
              className="text-xs text-violet-500 hover:text-violet-700 font-medium transition"
            >
              Max: {maxAmount}
            </button>
          </div>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white/70 px-3.5 py-2.5 text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {status === "success" && (
          <p className="text-sm text-green-600">Transaction confirmed ✓</p>
        )}

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

export default Send;