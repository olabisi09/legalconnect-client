import { Metadata } from "next";

export { cn } from "cn";

export function generateMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: `${title} - LegalConnect`,
    description: description,
    openGraph: {
      images: [`/seo.jpg`],
    },
  };
}

export function getInitials(str: string) {
  if (!str) return "";
  const names = str.split(" ");
  const initials = names.map((name) => name.charAt(0).toUpperCase());
  return initials.join("");
}

export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
