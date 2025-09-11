"use server"

import { sdk } from "../config"
import medusaError from "@/lib/helpers/medusa-error"
import { getAuthHeaders } from "./cookies"
import { getPublishableApiKey } from "../get-publishable-key"
import { revalidateTag } from "next/cache"

/**
 * Subscribes an email to the newsletter
 * @param email - The email address to subscribe
 * @param agreedToTerms - Whether the user has agreed to the terms
 * @returns The result of the subscription
 */
export async function subscribeToNewsletter({
  email,
  agreedToTerms,
}: {
  email: string
  agreedToTerms: boolean
}) {
  if (!email) {
    throw new Error("Email is required")
  }

  if (!agreedToTerms) {
    throw new Error("Musisz wyrazić zgodę na przetwarzanie danych osobowych")
  }

  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }

  try {
    const response = await sdk.client.fetch(
      '/store/newsletter',
      {
        method: "POST",
        headers,
        body: {
          email,
          agreed_to_terms: agreedToTerms
        }
      }
    )

    // Revalidate newsletter cache if such a tag exists
    try {
      revalidateTag("newsletter")
    } catch (error) {
      // Ignore if tag doesn't exist
    }

    return response
  } catch (error) {
    throw medusaError(error)
  }
}
