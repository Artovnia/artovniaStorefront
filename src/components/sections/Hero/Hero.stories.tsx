import type { Meta, StoryObj } from "@storybook/react"

import { Hero } from "./Hero"
import { NextIntlClientProvider } from "next-intl"
import defaultMessages from "../../../translations/pl.json"
import { HERO_BANNERS } from "@/config/hero-banners"

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

export const Default: Story = {
  args: {
    banners: HERO_BANNERS,
    pauseOnHover: true,
  },
}

export const SingleBanner: Story = {
  args: {
    banners: [HERO_BANNERS[0]],
    pauseOnHover: true,
  },
}

export const WithoutPauseOnHover: Story = {
  args: {
    banners: HERO_BANNERS,
    pauseOnHover: false,
  },
}
