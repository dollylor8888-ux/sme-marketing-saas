"use client";

interface JsonLdProps {
  jsonLd: unknown;
}

export function JsonLd({ jsonLd }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
