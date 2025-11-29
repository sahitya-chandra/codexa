import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              height: 60,
              width: 60,
              backgroundColor: "white",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            {/* Simple Terminal Icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-0.05em" }}>
            AgentCLI
          </div>
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          The Ultimate CLI for Modern Developers
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
