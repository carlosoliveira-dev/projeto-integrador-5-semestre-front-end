import type { ComponentProps } from "react";

type StaticLinkProps = ComponentProps<"a">;

export default function StaticLink({ href, ...props }: StaticLinkProps) {
  return <a href={href} {...props} />;
}

export function navigateToStaticRoute(path: string) {
  window.location.assign(new URL(path, window.location.origin).href);
}
