"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { KudosPlaceholderDialog, type KudosPlaceholderCopy } from "./kudos-placeholder-dialog";

export interface KudosGatedDialogButtonProps {
  signedIn: boolean;
  className: string;
  dialog: KudosPlaceholderCopy;
  children: ReactNode;
}

/** Visitors get a login link (FR-019); signed-in users open the placeholder dialog. Never disabled. */
export function KudosGatedDialogButton({ signedIn, className, dialog, children }: KudosGatedDialogButtonProps) {
  const [open, setOpen] = useState(false);
  if (!signedIn) {
    return (
      <Link href={KUDOS_LOGIN_HREF} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <KudosPlaceholderDialog {...dialog} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
