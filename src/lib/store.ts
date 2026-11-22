"use client";

import { useSyncExternalStore } from "react";

/**
 * Pequeño almacén guardado en localStorage.
 * Sirve para recordar el idioma y lo que busca cada persona
 * sin problemas entre lo que pinta el servidor y el navegador.
 */
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // El navegador puede bloquear localStorage: seguimos sin guardar.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStored<T extends string>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => (read(key) as T | null) ?? fallback,
    () => fallback,
  );
}
