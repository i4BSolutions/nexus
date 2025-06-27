"use client";

import { ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-[4px] p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="rounded-t-2xl bg-gradient-to-r from-[#f3e9ff] to-[#faf7fd] px-6 pt-6 pb-4 flex gap-4 items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#a084fa]">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" stroke="none" fill="none" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[#a09bb7]">{description}</p>
            )}
          </div>
        </div>
        <div className="px-6 py-2">{children}</div>
      </div>
    </div>
  );
}
