import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "CRAWLFAST — Everyday Essentials, Made to Last";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f6f4ef",
          color: "#1d1e1a",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              backgroundColor: "#5b6650",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#5b6650",
            }}
          >
            Everyday Edit — 001
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 124,
              fontWeight: 800,
              letterSpacing: -7,
              lineHeight: 1,
            }}
          >
            CRAWLFAST.
          </div>
          <div
            style={{
              fontSize: 44,
              letterSpacing: -1.5,
              color: "#5d5f56",
            }}
          >
            Less, but better. Made for every day.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(29,30,26,0.18)",
            paddingTop: 26,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#5d5f56",
          }}
        >
          <span>T-Shirts · Outerwear · Accessories</span>
          <span>crawlfast.store</span>
        </div>
      </div>
    ),
    size,
  );
}
