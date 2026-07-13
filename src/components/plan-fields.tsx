"use client";

import { useState } from "react";

const FREQUENCIES = [
  { value: "WEEKLY", label: "Every week" },
  { value: "BIWEEKLY", label: "Every two weeks" },
  { value: "MONTHLY", label: "Once a month" },
] as const;

export function PlanFields({
  defaultPostingCadence,
  defaultCheckInFrequency,
  defaultPlanWeeks,
  inputClass,
  labelClass,
  hintClass,
}: {
  defaultPostingCadence: number;
  defaultCheckInFrequency: string;
  defaultPlanWeeks: number | null;
  inputClass: string;
  labelClass: string;
  hintClass: string;
}) {
  const [postingCadence, setPostingCadence] = useState(defaultPostingCadence);
  const [planWeeks, setPlanWeeks] = useState<number | "">(defaultPlanWeeks ?? "");

  const total = typeof planWeeks === "number" && planWeeks > 0 ? postingCadence * planWeeks : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Posts per check-in</span>
          <input
            type="number"
            name="postingCadence"
            min={1}
            max={14}
            value={postingCadence}
            onChange={(e) => setPostingCadence(Number(e.target.value) || 1)}
            className={`h-11 ${inputClass}`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>How often you&apos;ll check in</span>
          <select
            name="checkInFrequency"
            defaultValue={defaultCheckInFrequency}
            className={`h-11 ${inputClass}`}
          >
            {FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Plan length (in check-ins)</span>
        <span className={hintClass}>
          Total number of check-ins the plan covers. Leave blank to keep
          going indefinitely.
        </span>
        <input
          type="number"
          name="planWeeks"
          min={1}
          max={104}
          placeholder="Ongoing"
          value={planWeeks}
          onChange={(e) =>
            setPlanWeeks(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={`h-11 w-32 ${inputClass}`}
        />
        <span className={`${hintClass} font-medium text-zinc-700 dark:text-zinc-300`}>
          {total
            ? `= ${total} posts in total over this plan.`
            : `= ${postingCadence} post${postingCadence === 1 ? "" : "s"} every check-in, ongoing.`}
        </span>
      </label>
    </>
  );
}
