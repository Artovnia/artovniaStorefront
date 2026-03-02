export function extractVendorPageSeoSummary(
  vendorPage: any,
  maxLength: number = 320
): string | undefined {
  const blocks = Array.isArray(vendorPage?.blocks) ? vendorPage.blocks : []
  if (!blocks.length) return undefined

  const preferredBlockTypes = new Set([
    "hero",
    "rich_text",
    "process",
    "timeline",
    "quote",
    "image_text",
  ])
  const texts: string[] = []

  const collectStrings = (value: unknown): void => {
    if (texts.join(" ").length >= maxLength) return

    if (typeof value === "string") {
      const normalized = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      if (normalized.length >= 20) {
        texts.push(normalized)
      }
      return
    }

    if (Array.isArray(value)) {
      value.forEach(collectStrings)
      return
    }

    if (value && typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(collectStrings)
    }
  }

  const sortedBlocks = [...blocks].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
  for (const block of sortedBlocks) {
    if (!preferredBlockTypes.has(block?.type)) continue
    collectStrings(block?.data)
    if (texts.join(" ").length >= maxLength) break
  }

  if (!texts.length) return undefined

  const summary = texts.join(" ").slice(0, maxLength)
  const trimmed = summary.slice(0, summary.lastIndexOf(" "))
  return trimmed.length > 80 ? `${trimmed}...` : summary
}

export function mergeSellerDescription(
  sellerDescription?: string,
  vendorStorySummary?: string
): string | undefined {
  const merged = [sellerDescription, vendorStorySummary].filter(Boolean).join(" ").trim()
  return merged || sellerDescription
}
