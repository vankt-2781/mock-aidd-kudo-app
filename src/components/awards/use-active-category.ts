"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { SPY_LINE_RATIO, selectActiveSection } from "./select-active-section";

/** Fallback release for the click lock when `scrollend` is unsupported. */
const SCROLL_SETTLE_FALLBACK_MS = 1000;

/** Tiny external store: spy/click/hash all write here, React reads via useSyncExternalStore. */
function createActiveStore() {
  let active: string | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => active,
    set(next: string | null) {
      if (next === active) return;
      active = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function focusHeading(section: HTMLElement) {
  section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
}

/**
 * Active category for the awards nav (US003): follows scroll (IntersectionObserver
 * as trigger, ALG-001 as decision), honours deep-link/back-forward hashes, and
 * lets a click win while its smooth scroll settles. Scrolling never writes the hash.
 */
export function useActiveCategory(slugs: readonly string[]) {
  const [store] = useState(createActiveStore);
  const lockRef = useRef({ locked: false, release: null as null | (() => void) });
  const stored = useSyncExternalStore(store.subscribe, store.get, () => null);
  const key = slugs.join("|");

  useEffect(() => {
    const lock = lockRef.current;
    const order = key ? key.split("|") : [];
    const validSlug = (value: string) => (order.includes(value) ? value : null);
    const fromHash = () => validSlug(window.location.hash.slice(1));

    // Deep link on load (unknown/empty hash -> stays null -> first item, TC ID-13).
    store.set(fromHash());
    const onHashChange = () => {
      const slug = fromHash();
      if (slug) store.set(slug);
    };
    window.addEventListener("hashchange", onHashChange);

    const recompute = () => {
      if (lock.locked) return;
      const bands = order.flatMap((slug) => {
        const el = document.getElementById(slug);
        if (!el) return [];
        const { top, bottom } = el.getBoundingClientRect();
        return [{ slug, top, bottom }];
      });
      store.set(selectActiveSection(bands, window.innerHeight, store.get()));
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      // Band = top 34% of the viewport, matching SPY_LINE_RATIO; callbacks are only a trigger.
      const bottomMargin = Math.round((1 - SPY_LINE_RATIO) * 100);
      observer = new IntersectionObserver(recompute, { rootMargin: `0px 0px -${bottomMargin}% 0px`, threshold: 0 });
      for (const slug of order) {
        const el = document.getElementById(slug);
        if (el) observer.observe(el);
      }
    }

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      observer?.disconnect();
      lock.release?.();
    };
  }, [key, store]);

  const activate = useCallback(
    (slug: string): boolean => {
      const target = document.getElementById(slug);
      if (!target) return false; // missing section: caller lets the browser handle the link
      const lock = lockRef.current;
      lock.release?.();

      const reduce = prefersReducedMotion();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${slug}`);
      store.set(slug);

      if (reduce) {
        focusHeading(target);
        return true;
      }
      lock.locked = true;
      const done = () => {
        window.clearTimeout(timer);
        window.removeEventListener("scrollend", done);
        lock.locked = false;
        lock.release = null;
        focusHeading(target);
      };
      const timer = window.setTimeout(done, SCROLL_SETTLE_FALLBACK_MS);
      window.addEventListener("scrollend", done, { once: true });
      lock.release = () => {
        window.clearTimeout(timer);
        window.removeEventListener("scrollend", done);
        lock.locked = false;
        lock.release = null;
      };
      return true;
    },
    [store],
  );

  return { activeSlug: stored ?? slugs[0], activate };
}
