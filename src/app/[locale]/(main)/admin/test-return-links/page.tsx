"use client"

import { useState } from "react"

export default function TestReturnLinksPage() {
  const [orderId, setOrderId] = useState("")
  const [email, setEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")

  const generateLink = () => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/returns/guest?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
    setGeneratedLink(link)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Return Link Generator</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Order ID</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="order_01XXXXX"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          onClick={generateLink}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Generate Link
        </button>

        {generatedLink && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm font-medium mb-2">Generated Link:</p>
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {generatedLink}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(generatedLink)}
              className="ml-4 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded p-4">
        <h2 className="font-bold mb-2">Quick Test Orders:</h2>
        <p className="text-sm text-gray-600 mb-4">
          Run this SQL to find delivered guest orders:
        </p>
        <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`SELECT 
  o.id, 
  o.display_id, 
  o.email, 
  f.delivered_at
FROM "order" o
JOIN fulfillment f ON f.order_id = o.id
WHERE f.delivered_at IS NOT NULL
AND o.customer_id IS NULL
ORDER BY f.delivered_at DESC
LIMIT 5;`}
        </pre>
      </div>
    </div>
  )
}
