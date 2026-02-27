import { BreadcrumbItem } from "./BreadcrumbsView/Breadcrumbs";
import { registry } from "./registry";

// ---------------------------------------------------------------------------
// Segment builder
// ---------------------------------------------------------------------------
/**
 * Splits a pathname into all ancestor path prefixes, from root to leaf.
 *
 * Example:
 *   buildSegments('/series/24/episodes/7')
 *   → ['/', '/series', '/series/24', '/series/24/episodes', '/series/24/episodes/7']
 */
function buildSegments(pathname: string): string[] {
  const clean = pathname.replace(/\/$/, "") || "/";

  if (clean === "/")
    return ["/"];

  const parts = clean.split("/").filter(Boolean);
  const segments: string[] = ["/"];

  for (let i = 0; i < parts.length; i++)
    segments.push("/" + parts.slice(0, i + 1).join("/"));

  return segments;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
/**
 * Resolves the complete breadcrumb chain for the given pathname.
 *
 * Walk order: leaf → root (segments are reversed before iteration).
 * Each segment is matched against the registry; unmatched segments are
 * silently skipped.
 *
 * If a handler returns `stopChain: true` the walk is aborted immediately —
 * the handler takes full responsibility for the ancestor chain.
 *
 * Items returned by handlers closer to the root are prepended, so the final
 * array is always ordered root → leaf.
 *
 * Errors thrown by handlers propagate to the caller and should be handled by
 * the page's error boundary.
 */
export async function resolveBreadcrumbs(
  pathname: string,
): Promise<BreadcrumbItem[]> {
  const segments = buildSegments(pathname);
  const result: BreadcrumbItem[] = [];

  console.log(registry);

  for (const segment of [...segments].reverse()) {
    const entry = registry.find((e) => e.matcher( {
      pathname,
      segment,
    } ));

    if (!entry)
      continue;

    const { items, stopChain } = await entry.handler({pathname, segment});

    result.unshift(...items);

    if (stopChain)
      break;
  }

  return result;
}
