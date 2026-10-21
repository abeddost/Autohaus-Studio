"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/config/pricing";
import { getProject } from "@/config/projects";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import { calculatorHref, href } from "@/i18n/routes";
import { enquirySchema, fieldErrors, type EnquiryResponse, type FieldErrors } from "@/lib/enquiries/schema";
import { calculateQuote, type Quote } from "@/lib/pricing/engine";
import { decodeSelection, encodeSelection, type Selection } from "@/lib/pricing/selection";
import { storeSelection } from "../calculator/Calculator";
import { FullBreakdown, Notices, Totals } from "../calculator/Summary";
import { Alert, Check, Close, Info } from "../icons";
import { buttonClass, cx } from "../ui";

type T = Dictionary["contact"];

type Values = {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  message: string;
  contactMethod: "email" | "phone" | "";
  nextStep: "intro" | "discovery" | "none";
  fax: string;
};

const EMPTY: Values = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  message: "",
  contactMethod: "",
  nextStep: "none",
  fax: "",
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string; notification: "sent" | "queued" | "not_configured" };

const FIELD_ORDER: (keyof Values)[] = ["name", "company", "email", "phone", "website", "message", "contactMethod"];

export function EnquiryForm({ locale, t, calcT, common }: { locale: Locale; t: T; calcT: Dictionary["calculator"]; common: Dictionary["common"] }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [projectRef, setProjectRef] = useState("");
  const tokenRef = useRef<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formId = useId();
  const quote: Quote | null = selection ? calculateQuote(selection) : null;

  const loadToken = useCallback(async () => {
    try {
      const res = await fetch("/api/enquiries/token", { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; token?: string };
      tokenRef.current = data.ok && data.token ? data.token : null;
    } catch {
      tokenRef.current = null;
    }
  }, []);

  useEffect(() => {
    loadToken();
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeSelection(params.get("config"));
    // The transferred configuration lives in the URL, which is only readable after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (decoded && decoded.projectType) {
      setSelection(decoded);
      storeSelection(decoded);
    }
    const ref = params.get("projekt");
    if (ref && getProject(ref)) setProjectRef(ref);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [loadToken]);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof FieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const message = (code: string | undefined) => (code ? (t.errors as Record<string, string>)[code] ?? t.errors.generic : undefined);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status.kind === "submitting") return;

    const payload = {
      ...values,
      contactMethod: values.contactMethod || undefined,
      projectRef,
      locale,
      config: selection ? encodeSelection(selection) : "",
      token: tokenRef.current,
    };

    const check = enquirySchema.safeParse(payload);
    if (!check.success) {
      setErrors(fieldErrors(check.error));
      setStatus({ kind: "error", message: t.errors.summary });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as EnquiryResponse;
      if (data.ok) {
        setStatus({ kind: "success", reference: data.reference, notification: data.notification });
        return;
      }
      if (data.code === "validation") {
        setErrors(data.fields);
        setStatus({ kind: "error", message: t.errors.summary });
      } else {
        const map: Record<string, string> = {
          rate_limited: t.errors.rateLimited,
          unavailable: t.errors.unavailable,
          too_fast: t.errors.tooFast,
          expired: t.errors.expired,
          spam: t.errors.tooFast,
        };
        setStatus({ kind: "error", message: map[data.code] ?? t.errors.generic });
        if (data.code === "expired" || data.code === "too_fast" || data.code === "spam") await loadToken();
      }
    } catch {
      setStatus({ kind: "error", message: t.errors.network });
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus({ kind: "idle" });
    loadToken();
  };

  const project = projectRef ? getProject(projectRef) : undefined;

  if (status.kind === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-xl border border-success/30 bg-white p-8 outline-none sm:p-10">
        <span className="flex size-11 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="size-6" />
        </span>
        <h2 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{t.success.title}</h2>
        <p className="mt-3 text-muted">{t.success.text}</p>
        <p className="mt-6 inline-flex rounded-md bg-mist px-3 py-2 font-mono text-sm">{fill(t.success.reference, { reference: status.reference })}</p>
        {status.notification === "queued" ? <p className="mt-4 text-sm text-subtle">{t.success.queued}</p> : null}
        {status.notification === "not_configured" && process.env.NODE_ENV !== "production" ? (
          <p className="mt-6 rounded-md border border-dashed border-warning/60 bg-warning/10 p-4 font-mono text-[0.8rem] text-warning">
            {t.success.devNotConfigured}
          </p>
        ) : null}
        <button type="button" onClick={reset} className={buttonClass("secondary", "md", "mt-8")}>
          {t.success.again}
        </button>
      </div>
    );
  }

  const fieldProps = (key: keyof FieldErrors) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${formId}-${key}-error` : undefined,
  });
  const errorText = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p id={`${formId}-${key}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
        <Alert className="size-4 shrink-0" />
        {message(errors[key])}
      </p>
    ) : null;

  const inputClass = (key: keyof FieldErrors) =>
    cx(
      "mt-2 block w-full rounded-md border bg-white px-3.5 py-3 text-[1rem] transition-colors placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none",
      errors[key] ? "border-danger" : "border-line-strong",
    );
  const label = (text: string, required: boolean) => (
    <span className="flex items-baseline justify-between gap-3 text-[0.95rem] font-medium">
      {text}
      <span className="text-[0.78rem] font-normal text-subtle">{required ? t.form.required : t.form.optional}</span>
    </span>
  );
  const [privacyBefore, privacyAfter] = t.form.privacy.split("{link}");
  const errorKeys = FIELD_ORDER.filter((k) => errors[k as keyof FieldErrors]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <form noValidate onSubmit={onSubmit} className="lg:col-span-7" aria-describedby={status.kind === "error" ? `${formId}-summary` : undefined}>
        {status.kind === "error" ? (
          <div
            ref={summaryRef}
            id={`${formId}-summary`}
            tabIndex={-1}
            role="alert"
            className="mb-8 rounded-md border border-danger/30 bg-danger/5 p-4 text-sm outline-none"
          >
            <p className="flex items-center gap-2 font-medium text-danger">
              <Alert className="size-4" />
              {status.message}
            </p>
            {errorKeys.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink-soft">
                {errorKeys.map((key) => (
                  <li key={key}>
                    <a href={`#${formId}-${key}`} className="underline underline-offset-2">
                      {message(errors[key as keyof FieldErrors])}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <fieldset>
          <legend className="eyebrow mb-5 text-muted">{t.form.legendContact}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              {label(t.form.name, true)}
              <input id={`${formId}-name`} name="name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} className={inputClass("name")} {...fieldProps("name")} />
              {errorText("name")}
            </label>
            <label className="block">
              {label(t.form.company, true)}
              <input id={`${formId}-company`} name="company" autoComplete="organization" value={values.company} onChange={(e) => set("company", e.target.value)} className={inputClass("company")} {...fieldProps("company")} />
              {errorText("company")}
            </label>
            <label className="block">
              {label(t.form.email, true)}
              <input id={`${formId}-email`} type="email" name="email" autoComplete="email" inputMode="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={inputClass("email")} {...fieldProps("email")} />
              {errorText("email")}
            </label>
            <label className="block">
              {label(t.form.phone, values.contactMethod === "phone")}
              <input id={`${formId}-phone`} type="tel" name="phone" autoComplete="tel" inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass("phone")} {...fieldProps("phone")} />
              {errorText("phone")}
            </label>
            <label className="block sm:col-span-2">
              {label(t.form.website, false)}
              <input id={`${formId}-website`} name="website" autoComplete="url" inputMode="url" placeholder={t.form.websiteHint} value={values.website} onChange={(e) => set("website", e.target.value)} className={inputClass("website")} {...fieldProps("website")} />
              {errorText("website")}
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="eyebrow mb-5 text-muted">{t.form.legendProject}</legend>
          {project ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-1.5 pl-3 text-sm">
              {fill(t.projectRef, { name: project.name })}
              <button type="button" onClick={() => setProjectRef("")} className="rounded-full p-1 text-subtle hover:bg-mist hover:text-ink" aria-label={t.configRemove}>
                <Close className="size-3.5" />
              </button>
            </p>
          ) : null}
          <label className="block">
            {label(t.form.message, true)}
            <span id={`${formId}-message-hint`} className="mt-1 block text-sm text-muted">
              {t.form.messageHint}
            </span>
            <textarea
              id={`${formId}-message`}
              name="message"
              rows={6}
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              className={inputClass("message")}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={cx(`${formId}-message-hint`, errors.message && `${formId}-message-error`)}
            />
            {errorText("message")}
          </label>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <fieldset aria-describedby={errors.contactMethod ? `${formId}-contactMethod-error` : undefined}>
              <legend className="text-[0.95rem] font-medium">{t.form.contactMethod}</legend>
              <div id={`${formId}-contactMethod`} className="mt-2.5 flex gap-2">
                {(["email", "phone"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-line-strong bg-white px-3.5 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      checked={values.contactMethod === method}
                      onChange={() => set("contactMethod", method)}
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    {method === "email" ? t.form.contactEmail : t.form.contactPhone}
                  </label>
                ))}
              </div>
              {errorText("contactMethod")}
            </fieldset>
            <fieldset>
              <legend className="flex w-full items-baseline justify-between gap-3 text-[0.95rem] font-medium">
                {t.form.nextStep}
                <span className="text-[0.78rem] font-normal text-subtle">{t.form.optional}</span>
              </legend>
              <div className="mt-2.5 space-y-2">
                {(["intro", "discovery"] as const).map((step) => (
                  <label
                    key={step}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line-strong bg-white px-3.5 py-3 text-[0.95rem] has-[:checked]:border-accent has-[:checked]:bg-accent-soft/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
                  >
                    <input
                      type="radio"
                      name="nextStep"
                      value={step}
                      checked={values.nextStep === step}
                      onChange={() => set("nextStep", step)}
                      className="size-4 accent-[var(--color-accent)]"
                    />
                    {step === "intro" ? t.form.nextStepIntro : t.form.nextStepDiscovery}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {values.nextStep === "discovery" ? (
            <p className="mt-4 flex gap-2.5 rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              {t.form.nextStepDiscoveryNote}
            </p>
          ) : null}
        </fieldset>

        {/* Honeypot – hidden from people and assistive technology */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            {t.form.honeypot}
            <input type="text" name="fax" tabIndex={-1} autoComplete="off" value={values.fax} onChange={(e) => set("fax", e.target.value)} />
          </label>
        </div>

        <p className="mt-8 text-sm text-muted">
          {privacyBefore}
          <Link href={href("privacy", locale)} className="text-ink underline underline-offset-4 hover:text-accent">
            {t.form.privacyLink}
          </Link>
          {privacyAfter}
        </p>

        <button type="submit" disabled={status.kind === "submitting"} className={buttonClass("primary", "lg", "mt-6 w-full sm:w-auto")}>
          {status.kind === "submitting" ? t.form.submitting : t.form.submit}
        </button>
      </form>

      <aside className="space-y-6 lg:col-span-5" aria-label={t.configTitle}>
        <div className="rounded-xl border border-line bg-white p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-medium">{t.configTitle}</h2>
            {quote ? <span className="text-sm text-muted">{quote.packageName}</span> : null}
          </div>
          {quote ? (
            <div className="mt-5 space-y-6 border-t border-line pt-5">
              <Totals quote={quote} t={calcT.summary} locale={locale} />
              <FullBreakdown quote={quote} t={calcT.summary} locale={locale} showScope={false} />
              <Notices locale={locale} compact />
              <p className="text-[0.8rem] text-subtle">{t.configRecalc}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href={calculatorHref(locale)} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
                  {t.configEdit}
                </Link>
                <button type="button" onClick={() => setSelection(null)} className="text-muted underline underline-offset-4 hover:text-ink">
                  {t.configRemove}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted">
              <p>{t.configNone}</p>
              <p className="mt-2">{t.configNoneHint}</p>
              <Link href={calculatorHref(locale)} className={buttonClass("secondary", "sm", "mt-4")}>
                {common.ctaProjectPrice}
              </Link>
            </div>
          )}
        </div>
        <p className="flex gap-2.5 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0" />
          {t.freeIntro}
        </p>
      </aside>
    </div>
  );
}
