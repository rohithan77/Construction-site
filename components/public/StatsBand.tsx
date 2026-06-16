"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

/* Honest, verifiable stats for a boutique builder founded 2016 */
const STATS = [
  { value: 2016, suffix: "", label: "Founded in\nGreater Sydney" },
  { value: 150, suffix: "+", label: "Homes\nDelivered" },
  { value: 100, suffix: "%", label: "Fixed Price\nEvery Build" },
  { value: 5, suffix: "-Year", label: "Structural\nWarranty" },
];

function Counter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsBand() {
  return (
    <section className="bg-[#1C1B19]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#F7F4ED]/[0.07]">
          {STATS.map(({ value, suffix, label }) => (
            <div
              key={label}
              className="py-12 px-8 first:pl-0 last-of-type:lg:pr-0"
            >
              <div className="font-display font-black text-[clamp(2rem,3.5vw,2.8rem)] text-accent-primary leading-none tracking-[-0.03em] mb-3">
                <Counter value={value} suffix={suffix} />
              </div>
              <div className="text-[#F7F4ED]/30 text-[0.72rem] font-medium tracking-[0.06em] leading-[1.6] whitespace-pre-line">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
