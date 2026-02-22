"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HIDE_HEADER_ROUTES = ["/login"];

export default function HeaderWrapper() {
  const pathname = usePathname();

  if (HIDE_HEADER_ROUTES.includes(pathname) || pathname.startsWith("/admin")) {
    return null;
  }

  return <Header />;
}
