import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // OpenAI
      {
        userAgent: "GPTBot",
        disallow: "/",
      },

      // Google AI
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },

      // Anthropic Claude
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },

      // Common Crawl
      {
        userAgent: "CCBot",
        disallow: "/",
      },

      // Amazon
      {
        userAgent: "Amazonbot",
        disallow: "/",
      },

      // Meta AI
      {
        userAgent: "FacebookBot",
        disallow: "/",
      },

      // Apple
      {
        userAgent: "Applebot-Extended",
        disallow: "/",
      },

      // Perplexity
      {
        userAgent: "PerplexityBot",
        disallow: "/",
      },

      // Bytespider (ByteDance)
      {
        userAgent: "Bytespider",
        disallow: "/",
      },

      // Cohere
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },

      // Imagesift
      {
        userAgent: "ImagesiftBot",
        disallow: "/",
      },

      // Webz.io
      {
        userAgent: "omgili",
        disallow: "/",
      },

      // 일반 검색엔진은 허용
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  };
}