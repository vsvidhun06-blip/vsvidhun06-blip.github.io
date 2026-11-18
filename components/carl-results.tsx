"use client";

import { useState } from "react";
import { Forest } from "./charts";
import { Evidence, Segmented } from "./ui";
import { carlSaturated, carlSubcritical } from "@/content/results";

type Point = "saturated" | "subcritical";
type Metric = "throughput" | "utility";

export default function CarlResults() {
  const [point, setPoint] = useState<Point>("saturated");
  const [metric, setMetric] = useState<Metric>("throughput");
  const data = point === "saturated" ? carlSaturated : carlSubcritical;
  const rows = data[metric];
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Segmented
            label="Operating point"
            value={point}
            onChange={setPoint}
            options={[
              { value: "saturated", label: "Saturated burst" },
              { value: "subcritical", label: "Sub-critical Poisson" },
            ]}
          />
          <Segmented
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "throughput", label: "Throughput (tok/s)" },
              { value: "utility", label: "End-of-run utility_v2" },
            ]}
          />
        </div>
        <Evidence kind="measured">Tesla T4, 10 paired seeds</Evidence>
      </div>
      <p className="mt-5 text-[13px] leading-relaxed text-[var(--fg-3)]">{data.setting}.</p>
      <div className="mt-6">
        <Forest rows={rows} unit={metric === "throughput" ? "tok/s" : "utility_v2"} digits={metric === "throughput" ? 2 : 3} />
      </div>
      <p className="mt-6 border-t border-[var(--line)] pt-4 text-[13px] leading-relaxed text-[var(--fg-2)]">
        {point === "saturated" ? (
          <>
            Each row is the first system minus the second, paired by seed, with a 95% interval. Learning beats a fixed
            rule, but the controller stays below static configurations picked offline for the same objective, and a wider
            action space makes things worse. Source: the frozen section of the project&apos;s claim ledger.
          </>
        ) : (
          <>
            Campaign O, one of three complete campaigns on the same seeds and arrivals (S1, S2, O). Throughput here is
            limited by arrivals, so differences under 0.1 tok/s mean slightly later completions, not lost capacity. In
            all three campaigns the controller&apos;s utility was below both the utility-selected configuration and the
            rule on every seed. Whether throughput intervals excluded zero differed between campaigns.
          </>
        )}
      </p>
    </div>
  );
}
