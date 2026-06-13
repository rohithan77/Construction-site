"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 8, suffix: "+", label: "Years Building in Sydney" },
  { value: 500, suffix: "+", label: "Homes Delivered" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 2, prefix: "$", suffix: "B+", label: "Completed Projects" },
];

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}

export default function StatsBand() {
  return (
    <section className="bg-surface py-16 border-y border-text/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ value, prefix, suffix, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.09 }}
              className={`text-center py-10 px-6 ${i < STATS.length - 1 ? "border-r border-text/[0.07]" : ""}`}
            >
              <div className="font-display font-black text-[clamp(2.4rem,4.5vw,3.6rem)] text-accent-primary leading-none mb-2 tracking-[-0.03em]">
                <Counter value={value} prefix={prefix} suffix={suffix} />
              </div>
              <div className="text-text/42 text-[0.8rem] font-medium tracking-wide">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
