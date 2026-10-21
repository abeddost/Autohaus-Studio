"use client";

import { useId, type ReactNode } from "react";
import { Check, Minus, Plus } from "../icons";
import { cx } from "../ui";

const focusRing = "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-champagne-deep";
const surface =
  "border bg-white transition-[border-color,box-shadow,background-color] duration-200 border-line hover:border-line-strong has-[:checked]:border-ink has-[:checked]:shadow-[0_0_0_1px_var(--color-ink),0_18px_40px_-26px_rgb(0_0_0/0.45)]";

export function PriceTag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "quote" | "included" }) {
  return (
    <span
      className={cx(
        "shrink-0 font-mono text-[0.82rem] whitespace-nowrap tabular",
        tone === "default" && "text-ink",
        tone === "quote" && "text-warning",
        tone === "included" && "text-success",
      )}
    >
      {children}
    </span>
  );
}

function Tick({ on, shape = "circle" }: { on: boolean; shape?: "circle" | "square" }) {
  return (
    <span
      aria-hidden
      className={cx(
        "flex size-[20px] shrink-0 items-center justify-center border transition-colors duration-200",
        shape === "circle" ? "rounded-full" : "rounded-[6px]",
        on ? "border-ink bg-ink text-champagne" : "border-line-strong bg-white",
      )}
    >
      {on ? <Check className="size-3" strokeWidth={2.6} /> : null}
    </span>
  );
}

/** Large selectable option backed by a native radio (arrow-key navigation for free). */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  kicker,
  description,
  price,
  icon,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  kicker?: string;
  description?: string;
  price?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const descId = useId();
  return (
    <label className={cx("group relative flex cursor-pointer items-start gap-4 rounded-[12px] p-4 sm:p-5", surface, focusRing, className)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-describedby={description ? descId : undefined}
        className="sr-only"
      />
      {icon ? (
        <span
          aria-hidden
          className={cx(
            "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
            checked ? "border-ink bg-ink text-champagne" : "border-line bg-paper text-ink",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        {kicker ? <span className="eyebrow block text-subtle">{kicker}</span> : null}
        <span className="mt-1 block text-[1.05rem] font-medium tracking-[-0.01em]">{title}</span>
        {description ? (
          <span id={descId} className="mt-1 block text-[0.88rem] leading-relaxed text-muted">
            {description}
          </span>
        ) : null}
        {price ? <span className="mt-3 block">{price}</span> : null}
      </span>
      <Tick on={checked} />
    </label>
  );
}

/** Compact radio row for secondary choices. */
export function RadioRow({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  price,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  price?: ReactNode;
}) {
  const descId = useId();
  return (
    <label className={cx("flex cursor-pointer items-start gap-3.5 rounded-[10px] px-4 py-3.5", surface, focusRing)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-describedby={description ? descId : undefined}
        className="sr-only"
      />
      <span className="mt-0.5">
        <Tick on={checked} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-medium">{label}</span>
          {price ? <span>{price}</span> : null}
        </span>
        {description ? (
          <span id={descId} className="mt-1 block text-[0.86rem] text-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function OptionCheckbox({
  checked,
  onChange,
  label,
  description,
  price,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  price?: ReactNode;
  disabled?: boolean;
}) {
  const descId = useId();
  return (
    <label className={cx("flex items-start gap-3.5 rounded-[10px] px-4 py-3.5", surface, focusRing, disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? descId : undefined}
        className="sr-only"
      />
      <span className="mt-0.5">
        <Tick on={checked} shape="square" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-medium">{label}</span>
          {price ? <span>{price}</span> : null}
        </span>
        {description ? (
          <span id={descId} className="mt-1 block text-[0.86rem] text-muted">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function Counter({
  label,
  description,
  value,
  min = 0,
  max,
  onChange,
  price,
  decreaseLabel,
  increaseLabel,
  disabled,
}: {
  label: string;
  description?: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  price?: ReactNode;
  decreaseLabel: string;
  increaseLabel: string;
  disabled?: boolean;
}) {
  const id = useId();
  const clamp = (n: number) => Math.min(Math.max(Number.isFinite(n) ? Math.round(n) : min, min), max);
  const isDisabled = disabled || max <= min;
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[10px] border bg-white px-4 py-3.5 transition-[border-color,box-shadow] duration-200",
        value > 0 ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : "border-line",
        isDisabled && "opacity-55",
      )}
    >
      <div className="min-w-0 flex-1 basis-52">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <label htmlFor={id} className="font-medium">
            {label}
          </label>
          {price ? <span>{price}</span> : null}
        </div>
        {description ? (
          <p id={`${id}-desc`} className="mt-1 text-[0.86rem] text-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center rounded-full border border-line-strong bg-paper">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={isDisabled || value <= min}
          aria-label={decreaseLabel}
          className="flex size-10 items-center justify-center rounded-l-full text-ink transition-colors hover:bg-white disabled:text-subtle disabled:hover:bg-transparent"
        >
          <Minus className="size-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          disabled={isDisabled}
          aria-describedby={description ? `${id}-desc` : undefined}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
          className="no-spin h-10 w-11 bg-transparent text-center font-mono font-medium tabular focus:outline-none focus-visible:bg-white"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={isDisabled || value >= max}
          aria-label={increaseLabel}
          className="flex size-10 items-center justify-center rounded-r-full text-ink transition-colors hover:bg-white disabled:text-subtle disabled:hover:bg-transparent"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Semantic option group: fieldset + legend, with an optional note. */
export function Group({ title, note, children, className }: { title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  const noteId = useId();
  return (
    <fieldset className={cx("min-w-0", className)} aria-describedby={note ? noteId : undefined}>
      <legend className="eyebrow mb-3 text-muted">{title}</legend>
      {note ? (
        <p id={noteId} className="-mt-1.5 mb-3 text-[0.86rem] text-subtle">
          {note}
        </p>
      ) : null}
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}
