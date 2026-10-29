"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import { openSecretBoxAction } from "@/lib/secret-box/secret-box-actions";
import { badgeFor } from "@/lib/secret-box/secret-box-badge-catalog";
import { SECRET_BOX_COPY_VI, type SecretBoxCopy } from "./secret-box-copy";
import { SecretBoxModal, type SecretBoxBadge } from "./secret-box-modal";

export interface SecretBoxOpenerProps {
  unopenedCount: number;
  className: string;
  copy?: SecretBoxCopy;
  children: ReactNode;
}

/**
 * Shared "Mở Secret Box" entry (kudos sidebar + profile): button + modal. The client never decrements the
 * count itself; it only displays what the server action returns.
 */
export function SecretBoxOpener({ unopenedCount, className, copy = SECRET_BOX_COPY_VI, children }: SecretBoxOpenerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState<SecretBoxBadge | undefined>();
  const [count, setCount] = useState(unopenedCount);
  const [error, setError] = useState<string | undefined>();
  const [changed, setChanged] = useState(false);
  const [busy, startTransition] = useTransition();

  const show = () => {
    setBadge(undefined);
    setCount(unopenedCount);
    setError(undefined);
    setChanged(false);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    if (changed) router.refresh();
  };

  const openBox = () => {
    if (busy || count <= 0) return;
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await openSecretBoxAction();
        if (result.status === "ok") {
          setBadge(badgeFor(result.badgeKey));
          setCount(result.remaining);
          setChanged(true);
        } else if (result.status === "empty") {
          setCount(0);
          setChanged(true);
          setError(copy.errorEmpty);
        } else {
          setError(result.status === "unauthenticated" ? copy.errorSession : copy.errorGeneric);
        }
      } catch {
        setError(copy.errorGeneric);
      }
    });
  };

  return (
    <>
      <button type="button" className={className} disabled={unopenedCount <= 0} onClick={show}>
        {children}
      </button>
      {open && (
        <SecretBoxModal
          phase={badge ? "opened" : "idle"}
          badge={badge}
          unopenedCount={count}
          onOpenBox={openBox}
          onClose={close}
          busy={busy}
          error={error}
          copy={copy}
        />
      )}
    </>
  );
}
