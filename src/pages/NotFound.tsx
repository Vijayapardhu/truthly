import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6">
        <img
          src="/404.png"
          alt="Page not found"
          className="max-h-[240px] w-auto mx-auto"
        />
        <h1 className="text-2xl font-display font-bold text-text-primary">Page not found</h1>
        <p className="text-text-secondary max-w-sm mx-auto">
          Looks like this page doesn't exist. Let's get you back to playing.
        </p>
        <Link to="/">
          <Button size="lg" className="shadow-lg shadow-truth/20">Back Home</Button>
        </Link>
      </div>
    </div>
  )
}
