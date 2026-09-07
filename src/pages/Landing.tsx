import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Logo from '../components/icons/Logo'
import {
  GamesRegular,
  ChatRegular,
  SparkleRegular,
  RocketRegular,
} from '@fluentui/react-icons'
import { signInWithGoogle, signInWithApple } from '../services/auth'
import { useIdentityStore } from '../stores/identity-store'

const features = [
  {
    title: 'Play together',
    description: 'Real-time multiplayer with video, voice, and chat.',
    icon: GamesRegular,
  },
  {
    title: 'Get closer',
    description: 'Thoughtful questions designed for real connection.',
    icon: ChatRegular,
  },
  {
    title: 'AI-powered',
    description: 'Dynamic questions that adapt to your vibe and intensity.',
    icon: SparkleRegular,
  },
  {
    title: 'No account needed',
    description: 'Jump right in. Create a room and start playing instantly.',
    icon: RocketRegular,
  },
]

const steps = [
  {
    title: 'Create a room',
    description: 'Pick topics, set the intensity, and invite your people.',
    number: '01',
  },
  {
    title: 'Set your vibe',
    description: 'Choose from Funny, Friendship, Memories, and more.',
    number: '02',
  },
  {
    title: 'Start playing',
    description: 'Take turns answering Truths and completing Dares.',
    number: '03',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const setIdentity = useIdentityStore((state) => state.setIdentity)
  const [signingIn, setSigningIn] = useState<'google' | 'apple' | null>(null)

  const handleGoogleSignIn = async () => {
    setSigningIn('google')
    const uid = await signInWithGoogle()
    if (uid) {
      setIdentity({ nickname: `User-${uid.slice(0, 5)}`, avatarId: 'Cat' })
      navigate('/discover')
    }
    setSigningIn(null)
  }

  const handleAppleSignIn = async () => {
    setSigningIn('apple')
    const uid = await signInWithApple()
    if (uid) {
      setIdentity({ nickname: `User-${uid.slice(0, 5)}`, avatarId: 'Cat' })
      navigate('/discover')
    }
    setSigningIn(null)
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-off-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">How it works</a>
            <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <Link to="/discover" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Discover</Link>
            <Button size="sm" onClick={handleGoogleSignIn} disabled={!!signingIn}>
              {signingIn === 'google' ? 'Signing in...' : 'Sign in with Google'}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleAppleSignIn} disabled={!!signingIn}>
              {signingIn === 'apple' ? 'Signing in...' : 'Sign in with Apple'}
            </Button>
            <Link to="/create"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="min-h-screen flex items-center px-6 pt-16 pb-20">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center w-full">
            <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary leading-tight tracking-tight">
                Truth gets real.<br />
                Dares get fun.
              </h1>
              <p className="text-lg text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
                A modern Truth or Dare game for your people.
                Create a room, pick your vibe, and let the game begin.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
                <Link to="/create">
                  <Button size="lg" className="shadow-lg shadow-truth/20">Create a Room →</Button>
                </Link>
                <Link to="/join">
                  <Button size="lg" variant="secondary">Join a Room</Button>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <img
                src="/mochi-social-gaming-night-with-group-of-friends-on-couch.png"
                alt="Friends playing together"
                className="h-[260px] sm:h-[340px] md:h-[520px] w-auto object-contain"
              />
            </div>
          </div>
        </section>

        <section id="features" className="min-h-screen flex items-center px-6 py-20 bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-text-primary mb-3">Why truthly?</h2>
              <p className="text-text-secondary max-w-md mx-auto">Everything you need for a fun, meaningful game night with friends.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="p-6 bg-off-white rounded-2xl border border-border hover:border-lavender/40 transition-all hover:shadow-md text-center">
                    <div className="mb-4 flex justify-center text-truth"><Icon className="w-8 h-8" /></div>
                    <h3 className="font-display font-semibold text-text-primary mb-1">{feature.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how" className="min-h-screen flex items-center px-6 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-text-primary mb-3">How it works</h2>
              <p className="text-text-secondary max-w-md mx-auto">Three simple steps to your next game night.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative p-8 bg-surface rounded-2xl border border-border hover:border-lavender/40 transition-all hover:shadow-md text-center">
                  <span className="text-4xl font-display font-bold text-truth/20 absolute top-4 right-6">{step.number}</span>
                  <h3 className="font-display font-semibold text-text-primary mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-h-screen flex items-center px-6 py-20">
          <div className="max-w-3xl mx-auto text-center w-full">
            <img
              src="/ready to play.png"
              alt="Ready to play"
              className="max-h-[320px] md:max-h-[460px] w-auto mx-auto mb-8"
            />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">Ready to play?</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">Create a room in seconds and invite your friends. No account required.</p>
            <Link to="/create">
              <Button size="lg" className="shadow-lg shadow-truth/20">Create a Room →</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
