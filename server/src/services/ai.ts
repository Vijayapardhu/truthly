export class AIService {
  private static instance: AIService
  private apiKey: string
  private model: string

  private constructor() {
    this.apiKey = process.env.AI_API_KEY || ''
    this.model = process.env.AI_MODEL || 'gpt-4o-mini'
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateQuestions(topics: string[], intensity: string, type: 'truth' | 'dare', count: number = 10): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackQuestions(topics, intensity, type, count)
    }

    try {
      const prompt = this.buildPrompt(topics, intensity, type, count)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a fun, friendly Truth or Dare question generator. Generate natural, conversational questions that are appropriate for the given topics and intensity level. Never generate dangerous, unsafe, or overly sensitive content. Return only the questions, one per line, without numbering or quotes.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.9,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.choices[0]?.message?.content || ''
      const questions = text.split('\n').filter((q: string) => q.trim().length > 0).map((q: string) => q.trim())
      
      return questions.slice(0, count)
    } catch (error) {
      console.error('AI generation failed:', error)
      return this.getFallbackQuestions(topics, intensity, type, count)
    }
  }

  private buildPrompt(topics: string[], intensity: string, type: 'truth' | 'dare', count: number): string {
    const topicStr = topics.join(', ')
    const intensityDesc = {
      general: 'light and fun, suitable for casual groups',
      close: 'personal and bonding, for close friends',
      deep: 'meaningful and introspective, for deep conversations'
    }[intensity] || 'light and fun'

    if (type === 'truth') {
      return `Generate ${count} Truth questions about ${topicStr}. Intensity: ${intensityDesc}. Make them natural, conversational, and engaging.`
    } else {
      return `Generate ${count} Dare challenges about ${topicStr}. Intensity: ${intensityDesc}. Make them fun, safe, and doable.`
    }
  }

  private getFallbackQuestions(topics: string[], intensity: string, type: 'truth' | 'dare', count: number): string[] {
    const fallback: Record<string, Record<string, string[]>> = {
      truth: {
        general: [
          "What's the most embarrassing thing you've done at a party?",
          "What's a secret talent no one knows about?",
          "What's the weirdest food combination you secretly enjoy?",
          "What's the best compliment you've ever received?",
          "What's a habit you're secretly proud of?",
        ],
        close: [
          "What's something you've always wanted to tell your closest friend?",
          "Who here do you think will still be in your life in 10 years?",
          "What's the best gift you've ever received?",
          "What's a memory that always makes you smile?",
          "What's something you're grateful for today?",
        ],
        deep: [
          "What's a fear you're working to overcome?",
          "What's a lesson you learned the hard way?",
          "What's something you wish you could tell your younger self?",
          "What's a dream you haven't told anyone about?",
          "What does success mean to you?",
        ],
      },
      dare: {
        general: [
          "Do your best celebrity impression for 20 seconds.",
          "Sing the chorus of your favorite song in a funny voice.",
          "Dance for 15 seconds without music.",
          "Do 10 jumping jacks.",
          "Make the funniest face you can and hold it for 10 seconds.",
        ],
        close: [
          "Give the person to your left a genuine compliment.",
          "Share a funny memory with the group.",
          "Do an impression of someone in the room.",
          "Show your most recent photo album for 30 seconds.",
          "Call a friend and say 'I love you' out of the blue.",
        ],
        deep: [
          "Write a short poem about the person to your left.",
          "Share something you've never told anyone in this room.",
          "Call someone you miss and tell them why.",
          "Make a toast to the group with a heartfelt message.",
          "Write down your biggest hope for this group and share it.",
        ],
      },
    }

    const questions = fallback[type]?.[intensity] || fallback[type]?.general || []
    const result: string[] = []
    for (let i = 0; i < count; i++) {
      result.push(questions[i % questions.length])
    }
    return result
  }
}

export const aiService = AIService.getInstance()
