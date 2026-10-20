import * as React from "react";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Button, ButtonIcon, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { RiLoader5Line } from "@remixicon/react";
//import { Spinner } from "./ui/Spinner";

export interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  /** Icon to display in the button */
  icon?: React.ReactNode;
  /** Position of the icon relative to the text */
  iconPosition?: "left" | "right";
  /** Shows a loading state and disables the button */
  loading?: boolean;
  /** Custom label shown while loading */
  loadingText?: string;
}

export function AppButton({
  iconPosition = "left",
  icon,
  children,
  className,
  loading = false,
  loadingText = "Submitting",
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isDisabled = Boolean(props.disabled || loading);
  const content = loading ? loadingText : children;

  if (!icon) {
    return (
      <Button className={className} {...props} disabled={isDisabled}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <RiLoader5Line className="animate-spin" />
            {content}
          </span>
        ) : (
          content
        )}
      </Button>
    );
  }

  return (
    <Button className={className} {...props} disabled={isDisabled}>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <RiLoader5Line className="animate-spin" />
          {content}
        </span>
      ) : iconPosition === "left" ? (
        <ButtonIcon variant={props.variant} size={props.size}>
          {icon}
        </ButtonIcon>
      ) : null}

      {!loading ? content : null}

      {!loading && iconPosition === "right" && (
        <ButtonIcon variant={props.variant} size={props.size}>
          {icon}
        </ButtonIcon>
      )}
    </Button>
  );
}
