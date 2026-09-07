const questionBank: Record<string, Record<string, string[]>> = {
  funny: {
    general: [
      "What's the most embarrassing thing you've done at a party?",
      "What's a secret talent no one knows about?",
      "What's the weirdest food combination you secretly enjoy?",
    ],
    close: [
      "What's the funniest thing that happened on a date?",
      "What's the silliest thing you've done while sleep-deprived?",
      "What's the most ridiculous rumor you've ever heard about yourself?",
    ],
    deep: [
      "What's a mistake that actually changed your life for the better?",
      "What's something you were afraid of that turned out to be amazing?",
      "What's the funniest way you've ever been humbled?",
    ],
  },
  friendship: {
    general: [
      "What's something you've always wanted to tell your closest friend?",
      "Who here do you think will still be in your life in 10 years?",
      "What's the best gift you've ever received?",
    ],
    close: [
      "What's a friendship you let go of that you still think about?",
      "What's the most selfless thing a friend has done for you?",
      "What's something you admire about the person next to you?",
    ],
    deep: [
      "What's a lesson about friendship you learned the hard way?",
      "What's the deepest connection you've ever felt with someone?",
      "What friendship changed your life without you noticing?",
    ],
  },
  memories: {
    general: [
      "What's a childhood memory that still makes you smile?",
      "What's the most trouble you ever got in as a kid?",
      "What's a place you'd love to revisit?",
    ],
    close: [
      "What's a memory you keep coming back to?",
      "What's a moment you wish you could relive?",
      "What's the most nostalgic smell or sound for you?",
    ],
    deep: [
      "What's a memory that shaped who you are today?",
      "What's a moment from your past you finally understand now?",
      "What's a memory you've never told anyone?",
    ],
  },
}

export function getRandomQuestion(topics: string[], intensity: string): string {
  const normalizedIntensity = intensity === 'general' || intensity === 'close' || intensity === 'deep' ? intensity : 'general'
  const pool = topics.flatMap((topic) => questionBank[topic]?.[normalizedIntensity] || [])
  const fallback = topics.flatMap((topic) => questionBank[topic]?.general || [])
  const source = pool.length > 0 ? pool : fallback
  if (source.length === 0) return "What's something you've always wanted to tell your closest friend?"
  return source[Math.floor(Math.random() * source.length)]
}
