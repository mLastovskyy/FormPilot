"use client";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It must
 * render its own <html>/<body> and can't rely on the app's providers or theme,
 * so styling is inlined and text is localized from the language cookie.
 */

const T = {
  en: {
    title: "Something went wrong",
    body: "A critical error occurred while loading FormPilot. Please try again.",
    tryAgain: "Try again",
    home: "Back home",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "При загрузке FormPilot произошла критическая ошибка. Попробуйте снова.",
    tryAgain: "Попробовать снова",
    home: "На главную",
  },
};

function detectLocale(): "en" | "ru" {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)fp-lang=(\w+)/);
    if (m && m[1].startsWith("ru")) return "ru";
  }
  return "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = T[detectLocale()];

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070d",
          color: "#e9eaf2",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 20px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #6d5efc, #a855f7)",
            }}
          />
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1,
              background: "linear-gradient(120deg, #8b7bff, #c084fc)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            500
          </div>
          <h1 style={{ margin: "12px 0 8px", fontSize: 22 }}>{t.title}</h1>
          <p style={{ margin: 0, color: "#9aa0b5", fontSize: 14 }}>{t.body}</p>
          {error.digest && (
            <p style={{ marginTop: 8, color: "#6b7280", fontSize: 11, fontFamily: "monospace" }}>
              ref: {error.digest}
            </p>
          )}
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                cursor: "pointer",
                border: "none",
                borderRadius: 12,
                padding: "11px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(120deg, #6d5efc, #a855f7)",
              }}
            >
              {t.tryAgain}
            </button>
            {/* Full reload is intentional here: it resets the crashed React tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: 12,
                padding: "11px 20px",
                fontSize: 14,
                fontWeight: 600,
                color: "#e9eaf2",
                textDecoration: "none",
                border: "1px solid #24242f",
              }}
            >
              {t.home}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
