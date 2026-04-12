export async function GET() {
  const sources = [
    "https://token.jup.ag/all",
    "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json",
    "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json",
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const tokens = data.tokens ?? data;

      if (!Array.isArray(tokens) || tokens.length === 0) continue;

      return Response.json({ tokens });
    } catch {
      continue;
    }
  }

  return Response.json({ tokens: [] }, { status: 500 });
}