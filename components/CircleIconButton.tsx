"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CircleIconButtonProps {
  href: string;
  Icon: LucideIcon;
  ariaLabel: string;
}

export default function CircleIconButton({ href, Icon, ariaLabel }: CircleIconButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="group flex-shrink-0"
    >
      <div className="flex items-center justify-center w-[130px] h-[130px] sm:w-[220px] sm:h-[220px] rounded-full bg-[#293681] shadow-[-10px_-10px_24px_rgba(255,255,255,0.05),10px_10px_24px_rgba(0,0,0,0.45)] transition-shadow duration-300 group-hover:shadow-[inset_-8px_-8px_16px_rgba(255,255,255,0.05),inset_8px_8px_16px_rgba(0,0,0,0.45)]">
        <Icon
          size={80}
          strokeWidth={1.5}
          className="text-[#FAFFC4] group-hover:text-[#FE7F2D] transition-all duration-[400ms] group-hover:scale-95 w-12 h-12 sm:w-20 sm:h-20"
        />
      </div>
    </Link>
  );
}
