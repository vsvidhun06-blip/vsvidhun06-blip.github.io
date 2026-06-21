"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { fadeUp, reducedVariants, viewportOnce } from "@/lib/motion";
import { cn, isValidEmail, SOCIAL_LINKS } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  message: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: "", email: "", message: "" };

/**
 * Contact section. Glassmorphism card with a client-validated form. There is no
 * backend yet — a successful submit shows a success state only. Validation runs
 * on submit and clears per-field as the user corrects each input.
 */
export function Contact() {
  const reduce = useReducedMotion();
  const variants = reduce ? reducedVariants : fadeUp;

  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(state: FormState): FieldErrors {
    const next: FieldErrors = {};
    if (!state.name.trim()) next.name = "Please enter your name.";
    if (!state.email.trim()) next.email = "Please enter your email.";
    else if (!isValidEmail(state.email)) next.email = "Please enter a valid email address.";
    if (!state.message.trim()) next.message = "Please enter a message.";
    return next;
  }

  function handleChange(field: keyof FormState, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    // No backend yet — acknowledge success and reset.
    setSubmitted(true);
    setValues(EMPTY);
  }

  return (
    <Section id="contact" ariaLabel="Contact">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something"
        description="Open to roles and collaborations in LLM infrastructure, systems, and formal methods."
        centered
      />

      <motion.div
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto mt-12 max-w-xl"
      >
        {/* Glassmorphism card */}
        <div className="rounded-2xl border border-border bg-surface/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {submitted ? (
            <SuccessState onReset={() => setSubmitted(false)} />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field
                id="name"
                label="Name"
                value={values.name}
                error={errors.name}
                autoComplete="name"
                onChange={(v) => handleChange("name", v)}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={values.email}
                error={errors.email}
                autoComplete="email"
                onChange={(v) => handleChange("email", v)}
              />
              <Field
                id="message"
                label="Message"
                value={values.message}
                error={errors.message}
                multiline
                onChange={(v) => handleChange("message", v)}
              />
              <Button type="submit" className="w-full" suppressHydrationWarning>
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Social links */}
        <ul className="mt-8 flex items-center justify-center gap-6">
          <li>
            <SocialLink href={SOCIAL_LINKS.github} label="GitHub">
              GitHub
            </SocialLink>
          </li>
          <li>
            <SocialLink href={SOCIAL_LINKS.linkedin} label="LinkedIn">
              LinkedIn
            </SocialLink>
          </li>
          <li>
            <SocialLink href={`mailto:${SOCIAL_LINKS.email}`} label="Email" external={false}>
              Email
            </SocialLink>
          </li>
        </ul>
      </motion.div>
    </Section>
  );
}

interface FieldProps {
  id: keyof FormState;
  label: string;
  value: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
}

function Field({
  id,
  label,
  value,
  error,
  type = "text",
  multiline = false,
  autoComplete,
  onChange,
}: FieldProps) {
  const errorId = `${id}-error`;
  const base = cn(
    "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-text",
    "placeholder:text-muted/60 transition-colors duration-200",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-text/70",
    error ? "border-red-500/60" : "border-border focus:border-muted/60",
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(base, "resize-y")}
          // Some form-filler browser extensions inject an `fdprocessedid`
          // attribute after hydration, causing a harmless mismatch warning.
          suppressHydrationWarning
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={base}
          // Some form-filler browser extensions inject an `fdprocessedid`
          // attribute after hydration, causing a harmless mismatch warning.
          suppressHydrationWarning
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div>
        <p className="text-base font-medium text-text">Message sent</p>
        <p className="mt-1 text-sm text-muted">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={onReset}>
        Send another
      </Button>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
  external = true,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-sm text-muted transition-colors hover:text-text"
    >
      {children}
    </a>
  );
}
