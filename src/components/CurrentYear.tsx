"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Client-only year, so the prerendered shell contains no build-time date. */
export function CurrentYear() {
  const year = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => null,
  );
  return year ? <span>{year}</span> : null;
}
