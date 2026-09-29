import type { ComponentProps } from "react";
import Link from "next/link";

type StaticLinkProps = ComponentProps<typeof Link>;

export default function StaticLink({ href, ...props }: StaticLinkProps) {
  return <Link href={href} prefetch={false} {...props} />;
}
