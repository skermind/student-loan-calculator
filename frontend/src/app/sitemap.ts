import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://studentloancalculator.danielskerman.com",
      lastModified: new Date(),
    },
  ];
}