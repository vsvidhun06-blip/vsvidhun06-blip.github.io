import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight " +
  "transition-colors duration-200 outline-none " +
  "focus-visible:ring-2 focus-visible:ring-text/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-text text-background hover:bg-text/90",
  secondary: "border border-border bg-surface text-text hover:bg-border/40",
  ghost: "text-muted hover:text-text",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: "button";
  };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: "a";
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * Polymorphic button. Renders a `<button>` by default, or an `<a>` when
 * `as="a"` — so CTAs (View Projects, Download Resume) and form actions share
 * one consistent style and focus treatment.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.as === "a") {
    const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    void _as;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  void _as;
  void _v;
  void _s;
  void _c;
  void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
