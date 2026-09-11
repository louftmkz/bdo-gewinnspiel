"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const SPIN_DURATION_MS = 5600;
const WHEEL_SIZE = 320;

function buildGradient(n) {
  const per = 360 / n;
  const stops = [];
  for (let i = 0; i < n; i++) {
    const start = ((i * per) / 360) * 100;
    const end = (((i + 1) * per) / 360) * 100;
    const color = i % 2 === 0 ? "#FF532C" : "#FAFAFA";
    stops.push(`${color} ${start.toFixed(4)}% ${end.toFixed(4)}%`);
  }
  return `conic-gradient(from 0deg, ${stops.join(", ")})`;
}

function labelFontSize(n) {
  if (n <= 4) return "1rem";
  if (n <= 6) return "0.82rem";
  if (n <= 8) return "0.7rem";
  return "0.6rem";
}

export default function Wheel({ raffle }) {
  const participants = raffle.participants || [];
  const n = participants.length;
  const per = 360 / Math.max(n, 1);

  const initialRotation = raffle.result
    ? -(raffle.result.winnerIndex * per + per / 2)
    : 0;

  const [rotation, setRotation] = useState(initialRotation);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(raffle.result || null);
  const [error, setError] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const fireConfetti = useCallback(() => {
    const colors = ["#FF532C", "#FAFAFA", "#D02802"];
    const end = Date.now() + 1600;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors, startVelocity: 45 });
  }, []);

  const spin = useCallback(async () => {
    if (spinning || result) return;
    setSpinning(true);
    setError("");
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: raffle.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Fehler beim Ziehen.");

      const winnerIndex = data.result.winnerIndex;
      const sliceMid = winnerIndex * per + per / 2;
      const spins = 6 + Math.floor(Math.random() * 3); // 6-8 full turns
      const jitter = (Math.random() - 0.5) * (per * 0.5);
      const target = 360 * spins - sliceMid + jitter;

      setRotation(target);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setResult(data.result);
        setSpinning(false);
        fireConfetti();
      }, SPIN_DURATION_MS);
    } catch (err) {
      setSpinning(false);
      setError(err.message || "Etwas ist schiefgelaufen. Bitte nochmal versuchen.");
    }
  }, [spinning, result, per, raffle.slug, fireConfetti]);

  if (n < 2) {
    return (
      <p className="text-paper/70">
        Für die Ziehung werden mindestens zwei Teilnehmer:innen benötigt.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div
        className="relative w-full"
        style={{
          width: `min(${WHEEL_SIZE}px, calc(100vw - 3rem))`,
          aspectRatio: "1 / 1",
          maxWidth: WHEEL_SIZE,
        }}
      >
        <div
          className="absolute left-1/2 -top-3 -translate-x-1/2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderTop: "26px solid #FAFAFA",
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))",
          }}
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-paper"
          style={{
            background: buildGradient(n),
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12,0.67,0.1,1)`
              : "none",
            boxShadow: "0 0 0 6px #1A1A1A, 0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          {participants.map((p, i) => {
            const mid = i * per + per / 2;
            return (
              <div
                key={i}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${mid}deg)` }}
              >
                <span
                  className="text-ink font-body font-semibold text-center leading-tight px-1"
                  style={{
                    marginTop: "12%",
                    width: "42%",
                    fontSize: labelFontSize(n),
                  }}
                >
                  {p}
                </span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={spin}
          disabled={spinning || !!result}
          aria-label="Rad drehen"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-ink border-4 border-flame flex items-center justify-center font-heading text-paper text-sm tracking-wide disabled:cursor-not-allowed ${
            !spinning && !result ? "animate-pulse-glow" : ""
          }`}
        >
          {result ? "🎉" : spinning ? "…" : "SPIN"}
        </button>
      </div>

      {!result && (
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="px-8 py-3 rounded-full bg-flame text-paper font-heading text-xl tracking-wide disabled:opacity-50 hover:brightness-110 transition"
        >
          {spinning ? "Das Rad dreht sich…" : "🎲 Rad drehen"}
        </button>
      )}

      {error && <p className="text-flame text-sm">{error}</p>}

      {result && (
        <div className="animate-pop-in text-center bg-paper text-ink rounded-2xl px-8 py-6 shadow-2xl max-w-md">
          <p className="uppercase tracking-widest text-xs text-ember font-semibold">
            Gewinner:in
          </p>
          <p className="font-heading text-3xl sm:text-4xl mt-1 break-words">{result.winner}</p>
          {raffle.prizeText && (
            <p className="mt-2 text-lg">
              gewinnt <span className="font-semibold text-ember">{raffle.prizeText}</span> 🎉
            </p>
          )}
        </div>
      )}

      <div className="w-full max-w-md">
        <p className="text-paper/50 text-xs uppercase tracking-widest text-center mb-2">
          Teilnehmer:innen
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {participants.map((p, i) => (
            <li
              key={i}
              className={`text-sm px-3 py-1 rounded-full border ${
                result && result.winnerIndex === i
                  ? "border-flame text-flame font-semibold"
                  : "border-paper/20 text-paper/70"
              }`}
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
