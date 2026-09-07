import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface OpenRouterConfig {
  apiKey: string
  model?: string
  baseUrl?: string
}

async function getOpenRouterConfig(): Promise<OpenRouterConfig | null> {
  try {
    const docRef = doc(db, 'config', 'openrouter')
    const snap = await getDoc(docRef)
    if (!snap.exists()) return null
    const data = snap.data() as Record<string, unknown>
    const apiKey = (data.apiKey as string) || ''
    if (!apiKey) return null
    return {
      apiKey,
      model: (data.model as string) || 'mistralai/mistral-7b-instruct',
      baseUrl: (data.baseUrl as string) || 'https://openrouter.ai/api/v1',
    }
  } catch {
    return null
  }
}

export async function generateOpenAIQuestion(topics: string[], intensity: string): Promise<string | null> {
  const config = await getOpenRouterConfig()
  if (!config) return null

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are a fun game show host for a social truth or dare game called Truthly. Generate one short, engaging ${intensity} question from these topics: ${topics.join(', ')}. Keep it under 20 words. Return ONLY the question text, nothing else.`,
          },
          { role: 'user', content: 'Generate a question.' },
        ],
        max_tokens: 60,
        temperature: 0.9,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}
