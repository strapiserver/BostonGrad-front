import Link from "next/link";
import { ReactNode } from "react";

export const LinkWrapper = ({
  url,
  children,
  _blank = false,
  exists = true,
  fullWidth = false,
}: {
  children: ReactNode;
  exists?: boolean;
  url: string;
  _blank?: boolean;
  fullWidth?: boolean;
}) => {
  const normalizeHref = (href: string) => {
    if (!href) return href;

    const trimmed = href.trim();
    const wwwMatch = /^www\./i.test(trimmed);
    if (wwwMatch) return `https://${trimmed}`;
    const protocolMatch = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
    const schemeMatch = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);

    if (schemeMatch && !protocolMatch) {
      return trimmed;
    }

    if (protocolMatch) {
      const [protocol, ...rest] = trimmed.split("://");
      const normalizedRest = rest.join("://").replace(/\/{2,}/g, "/");
      return `${protocol}://${normalizedRest}`;
    }

    const withoutProtocolRelative = trimmed.replace(/^\/{2,}/, "/");
    const collapsed = withoutProtocolRelative.replace(/\/{2,}/g, "/");
    return collapsed.startsWith("/") ? collapsed : `/${collapsed}`;
  };

  const href = normalizeHref(url);
  const isExternal =
    !!href && /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href) && !href.startsWith("/");

  const blockStyle = fullWidth ? { display: "block", width: "100%" } : undefined;

  if (exists) {
    if (_blank || isExternal) {
      return (
        <a
          href={href}
          target={_blank ? "_blank" : undefined}
          rel={_blank ? "nofollow noopener noreferrer" : undefined}
          style={blockStyle}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} style={blockStyle}>
        {children}
      </Link>
    );
  }
  return <>{children}</>;
};
