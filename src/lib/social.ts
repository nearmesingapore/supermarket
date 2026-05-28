type SocialInput = {
  facebookUrl: string;
  instagramUrl: string;
};

type SocialLink = {
  label: "Facebook" | "Instagram";
  url: string;
};

const SOCIAL_HOSTS = {
  Facebook: ["facebook.com", "fb.com"],
  Instagram: ["instagram.com"]
} as const;

const detectLabel = (url: string, fallback: SocialLink["label"]) => {
  let host = "";

  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return fallback;
  }

  if (SOCIAL_HOSTS.Facebook.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return "Facebook";
  }

  if (SOCIAL_HOSTS.Instagram.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return "Instagram";
  }

  return fallback;
};

export const getOutletSocialLinks = ({ facebookUrl, instagramUrl }: SocialInput): SocialLink[] => {
  const links = [
    { label: detectLabel(facebookUrl, "Facebook"), url: facebookUrl.trim() },
    { label: detectLabel(instagramUrl, "Instagram"), url: instagramUrl.trim() }
  ].filter((link) => link.url);

  return links.sort((a, b) => {
    const order = { Facebook: 0, Instagram: 1 };
    return order[a.label] - order[b.label];
  });
};
