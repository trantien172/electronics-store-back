"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fixpro:favorites:v1";

export function useFavorites() {
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setFavoriteKeys(JSON.parse(saved) as string[]);
    } catch {
      setFavoriteKeys([]);
    }
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        setFavoriteKeys(event.newValue ? JSON.parse(event.newValue) as string[] : []);
      } catch {
        setFavoriteKeys([]);
      }
    };
    window.addEventListener("storage", sync);
    const syncLocal = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        setFavoriteKeys(saved ? JSON.parse(saved) as string[] : []);
      } catch {
        setFavoriteKeys([]);
      }
    };
    window.addEventListener("fixpro:favorites-change", syncLocal);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("fixpro:favorites-change", syncLocal);
    };
  }, []);

  const toggleFavorite = useCallback((key: string) => {
    setFavoriteKeys((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("fixpro:favorites-change"));
      return next;
    });
  }, []);

  return { favoriteKeys, toggleFavorite, isFavorite: (key: string) => favoriteKeys.includes(key) };
}

export const productFavoriteKey = (kind: "part" | "used", id: number | string) => `${kind}:${id}`;
