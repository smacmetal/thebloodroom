'use client';
import { useEffect } from "react";

export default function BootLoader({ mode = "Braided" as "Kat"|"Lyra"|"Braided" }) {
  useEffect(() => {
    fetch("/api/persona/boot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    }).catch(()=>{});
  }, [mode]);

  return null;
}
