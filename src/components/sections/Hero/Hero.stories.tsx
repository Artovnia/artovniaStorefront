import type { Meta, StoryObj } from "@storybook/react"

import { Hero } from "./Hero"
import { NextIntlClientProvider } from "next-intl"
import defaultMessages from "../../../translations/pl.json"

const meta: Meta<typeof Hero> = {
  component: Hero,
  decorators: (Story) => (
    <NextIntlClientProvider locale="pl" messages={defaultMessages}>
      <Story />
    </NextIntlClientProvider>
  ),
}

export default meta
type Story = StoryObj<typeof Hero>

export const FirstStory: Story = {
  args: {
    heading: "Snagaj się za stylem w chwilę",
    paragraph: "Kup, sprzedaj i odkryj pre-loved z trendowych marek.",
    image: "/images/hero/Image.jpg",
    buttons: [
      { label: "Kup teraz", path: "#" },
      { label: "Sprzedaj teraz", path: "3" },
    ],
  },
}
