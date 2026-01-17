import { Link } from "@/i18n/routing"
import { ArrowUpIcon } from "@/icons"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Strona nie istnieje",
  description: "Strona, którą próbujesz odwiedzić nie istnieje.",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-24">
      <h1 className="text-2xl-semi text-ui-fg-base">Strona nie istnieje</h1>
      <p className="text-small-regular text-ui-fg-base">
        Strona, którą próbujesz odwiedzić nie istnieje.
      </p>
      <Link className="flex gap-x-1 items-center group" href="/">
        Powrót do strony głównej
        <ArrowUpIcon
          className="group-hover:rotate-45 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
