import Image from "next/image";
import { brandAssets, brandLogoLabels } from "@/lib/brand/assets";

type BrandLogoTone = "light" | "dark";
type BrandLogoVariant = "lockup" | "mark";

export function BrandLogo({
  className,
  priority = false,
  tone = "dark",
  variant = "lockup",
}: {
  className?: string;
  priority?: boolean;
  tone?: BrandLogoTone;
  variant?: BrandLogoVariant;
}) {
  const src = variant === "mark" ? brandAssets.mark : tone === "light" ? brandAssets.footerLogo : brandAssets.headerLogo;
  const alt = variant === "mark" ? `${brandLogoLabels.primaryMark} ${brandLogoLabels.chineseName}` : `${brandLogoLabels.primaryMark} ${brandLogoLabels.chineseName} logo`;
  const width = variant === "mark" ? 44 : 164;
  const height = variant === "mark" ? 44 : 48;

  return <Image alt={alt} className={className} height={height} priority={priority} src={src} width={width} />;
}
