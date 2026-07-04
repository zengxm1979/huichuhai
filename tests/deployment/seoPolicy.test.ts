import { describe, expect, it } from "vitest";
import { buildRobotsMetadata, buildRobotsTxt, buildSitemapEntries, isSiteIndexable } from "@/lib/deployment/seoPolicy";

describe("deployment SEO policy", () => {
  it("defaults review deployments to noindex and nofollow", () => {
    const env = {};

    expect(isSiteIndexable(env)).toBe(false);
    expect(buildRobotsMetadata(env)).toMatchObject({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
    expect(buildRobotsTxt(env)).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(buildSitemapEntries(env)).toEqual([]);
  });

  it("only enables sitemap and indexing when explicitly configured", () => {
    const env = {
      NEXT_PUBLIC_SITE_INDEXABLE: "true",
      NEXT_PUBLIC_SITE_URL: "https://review-hch.ideaegg.com.cn/",
    };

    expect(isSiteIndexable(env)).toBe(true);
    expect(buildRobotsTxt(env)).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://review-hch.ideaegg.com.cn/sitemap.xml",
    });
    expect(buildSitemapEntries(env).map((entry) => entry.url)).toContain("https://review-hch.ideaegg.com.cn/");
  });
});
