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
    autoSwitchInterval: 8000,
    pauseOnHover: true,
  },
}

export const SingleBanner: Story = {
  args: {
    banners: [HERO_BANNERS[0]],
    autoSwitchInterval: 8000,
    pauseOnHover: true,
  },
}

export const FastSwitching: Story = {
  args: {
    banners: HERO_BANNERS,
    autoSwitchInterval: 2000,
    pauseOnHover: false,
  },
}
