import type { ReactNode } from "react";

export function AuthForm({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div>
      <div className="text-center">
        <h1 className="font-newsreader text-[28px] font-medium text-lc-ink">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-lc-slate">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>

      {footer ? (
        <div className="mt-8 text-center text-sm text-lc-slate">{footer}</div>
      ) : null}
    </div>
  );
}
