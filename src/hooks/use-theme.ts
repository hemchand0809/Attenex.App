import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("attenex-theme");
    if (stored === "light") setDark(false);
    else setDark(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("attenex-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);

  return { dark, toggle };
}
