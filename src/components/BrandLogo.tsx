import type { ImgHTMLAttributes } from "react";

export type LogoVariant =
  | "primary"
  | "horizontal"
  | "symbol"
  | "app-icon"
  | "wordmark"
  | "monochrome";

interface BrandLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  variant?: LogoVariant;
  creamBg?: boolean;
}

export default function BrandLogo({
  variant = "horizontal",
  creamBg = false,
  className = "",
  alt = "PlantCare AI Logo",
  ...props
}: BrandLogoProps) {
  let src = "/assets/logo_horizontal.png";

  if (variant === "primary") {
    src = creamBg ? "/assets/logo_primary_cream.png" : "/assets/logo_primary.png";
  } else if (variant === "symbol") {
    src = creamBg ? "/assets/logo_symbol_cream.png" : "/assets/logo_leaf_primary.png";
  } else if (variant === "app-icon") {
    src = "/assets/app_icon.png";
  } else if (variant === "wordmark") {
    src = "/assets/logo_wordmark.png";
  } else if (variant === "monochrome") {
    src = creamBg ? "/assets/logo_monochrome_cream.png" : "/assets/logo_monochrome.png";
  } else {
    src = creamBg ? "/assets/logo_horizontal_cream.png" : "/assets/logo_horizontal.png";
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain select-none pointer-events-none ${className}`}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
}
