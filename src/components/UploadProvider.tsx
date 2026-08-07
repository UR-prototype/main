"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { UploadModal } from "@/components/UploadModal";

type UploadCtx = {
  openUpload: () => void;
  closeUpload: () => void;
};

const Ctx = createContext<UploadCtx | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openUpload = useCallback(() => setOpen(true), []);
  const closeUpload = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ openUpload, closeUpload }),
    [openUpload, closeUpload],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <UploadModal open={open} onClose={closeUpload} />
    </Ctx.Provider>
  );
}

export function useUploadModal() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useUploadModal must be used within UploadProvider");
  }
  return ctx;
}
