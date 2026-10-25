/**
 * Debounce an async function; every caller within the window shares the result
 * of the single trailing invocation (so no promise is left pending).
 */
export function debounceShared<A, R>(fn: (arg: A) => Promise<R>, waitMs: number): (arg: A) => Promise<R> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let waiters: { resolve: (v: R) => void; reject: (e: unknown) => void }[] = [];
  return (arg) =>
    new Promise<R>((resolve, reject) => {
      waiters.push({ resolve, reject });
      clearTimeout(timer);
      timer = setTimeout(() => {
        const batch = waiters;
        waiters = [];
        fn(arg).then(
          (value) => batch.forEach((w) => w.resolve(value)),
          (error: unknown) => batch.forEach((w) => w.reject(error)),
        );
      }, waitMs);
    });
}
