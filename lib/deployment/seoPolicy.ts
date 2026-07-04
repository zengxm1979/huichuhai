import type { Metadata, MetadataRoute } from "next";

const publicRoutes = ["/", "/advisor", "/inquiry", "/inquiry/success"] as const;

export function isSiteIndexable(env: NodeJS.ProcessEnv = process.env) {
  return env.NEXT_PUBLIC_SITE_INDEXABLE === "true";
}

export function getPublicSiteUrl(env: NodeJS.ProcessEnv = process.env) {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}

export function buildRobotsMetadata(env: NodeJS.ProcessEnv = process.env): Metadata["robots"] {
  const indexable = isSiteIndexable(env);

  return {
    index: indexable,
    follow: indexable,
    googleBot: {
      index: indexable,
      follow: indexable,
    },
  };
}

export function buildRobotsTxt(env: NodeJS.ProcessEnv = process.env): MetadataRoute.Robots {
  const indexable = isSiteIndexable(env);
  const siteUrl = getPublicSiteUrl(env);

  if (!indexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}

export function buildSitemapEntries(env: NodeJS.ProcessEnv = process.env): MetadataRoute.Sitemap {
  if (!isSiteIndexable(env)) return [];

  const siteUrl = getPublicSiteUrl(env);
  if (!siteUrl) return [];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-07-05"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
