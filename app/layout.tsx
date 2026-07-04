import type { Metadata } from "next";
import { AdvisorLightChat } from "@/components/advisor/AdvisorLightChat";
import { buildRobotsMetadata, getPublicSiteUrl } from "@/lib/deployment/seoPolicy";
import "./globals.css";

const publicSiteUrl = getPublicSiteUrl();

export const metadata: Metadata = {
  metadataBase: publicSiteUrl ? new URL(publicSiteUrl) : undefined,
  title: "会出海 | 东南亚企业办会服务",
  description:
    "帮中国企业在东南亚，把一场会办得更省心。首站马来西亚，提供精选场地、中文沟通和本地执行支持。",
  robots: buildRobotsMetadata(),
  icons: {
    icon: "/brand/hch-app-icon-approved.png",
    apple: "/brand/hch-app-icon-approved.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <AdvisorLightChat />
      </body>
    </html>
  );
}
