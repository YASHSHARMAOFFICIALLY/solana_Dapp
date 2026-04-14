import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// ✅ Types
type Token = {
  mint: string;
  amount: number;
  decimals: number;
};

type TokenInfo = {
  name: string;
  symbol: string;
  logoURI?: string;
};

function Portfolio() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenMap, setTokenMap] = useState<Record<string, TokenInfo>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch token list with fallback sources
  useEffect(() => {
    const fetchTokenList = async () => {
      const sources = [
        {
          url: "https://token.jup.ag/all",
          parse: (data: any) => data.tokens ?? data,
        },
        {
          url: "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json",
          parse: (data: any) => data.tokens ?? data,
        },
        {
          url: "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json",
          parse: (data: any) => data.tokens ?? data,
        },
      ];
        for (const source of sources) {
        try {
          const res = await fetch("/api/token");
          if (!res.ok) continue;

          const data = await res.json();
          const tokenList = source.parse(data);

          if (!Array.isArray(tokenList) || tokenList.length === 0) continue;

          const map: Record<string, TokenInfo> = {};
          tokenList.forEach((token: any) => {
            map[token.address] = {
              name: token.name,
              symbol: token.symbol,
              logoURI: token.logoURI,
            };
          });

          setTokenMap(map);
          return; // ✅ success — stop trying
        } catch {
          // try next source
          continue;
        }
      }

      console.error("All token list sources failed.");
    };

    fetchTokenList();
  }, []);

  // ✅ Fetch wallet data
  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      setTokens([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // SOL balance
        const bal = await connection.getBalance(publicKey);
        setBalance(bal);

        // Token accounts
        const tokenAccounts =
          await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: TOKEN_PROGRAM_ID,
          });

        const parsedTokens: Token[] = tokenAccounts.value
          .map((acc) => {
            const info = acc.account.data.parsed.info;
            return {
              mint: info.mint,
              amount: info.tokenAmount.uiAmount,
              decimals: info.tokenAmount.decimals,
            };
          })
          .filter((t) => t.amount > 0); // remove empty tokens

        setTokens(parsedTokens);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey, connection]);

  const solBalance = balance !== null ? balance / LAMPORTS_PER_SOL : null;

  // ✅ Enrich tokens using Jupiter map
  const enrichedTokens = tokens.map((token) => {
    const info = tokenMap[token.mint];

    return {
      ...token,
      name: info?.name || "Unknown",
      symbol: info?.symbol || token.mint.slice(0, 4) + "...",
      logo: info?.logoURI,
    };
  });

  // ❌ No wallet
  if (!publicKey) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-1">
          No wallet connected
        </h2>
        <p className="text-sm text-gray-500">
          Connect a wallet to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">Balance</span>
        <span className="text-xs font-mono truncate max-w-48 text-gray-400">
          {publicKey.toString()}
        </span>
      </div>

      {/* SOL Balance */}
      {loading ? (
        <div className="h-9 w-28 rounded animate-pulse bg-gray-100" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-gray-900">
            {solBalance !== null ? solBalance.toFixed(4) : "—"}
          </span>
          <span className="text-sm text-gray-400 font-medium">SOL</span>
        </div>
      )}

      {/* Tokens */}
      {enrichedTokens.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <span className="text-sm font-medium text-gray-500">Tokens</span>

          <div className="mt-3 space-y-3">
            {enrichedTokens.map((token) => (
              <div
                key={token.mint}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {token.logo ? (
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    // Fallback placeholder when no logo
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                      {token.symbol.slice(0, 1)}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {token.symbol}
                    </span>
                    <span className="text-xs text-gray-400">{token.name}</span>
                  </div>
                </div>

                <span className="text-sm font-semibold text-gray-900">
                  {token.amount ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;