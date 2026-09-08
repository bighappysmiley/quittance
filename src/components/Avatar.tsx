"use client";

import { initials } from "@/lib/format";

export function Avatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.32,
        letterSpacing: "0.02em",
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
