import { Routes, Route, Navigate } from 'react-router-dom'
import { useIdentityStore } from './stores/identity-store'
import Landing from './pages/Landing'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import IdentitySetup from './pages/IdentitySetup'
import HostIdentitySetup from './pages/HostIdentitySetup'
import Lobby from './pages/Lobby'
import Game from './pages/Game'
import Discover from './pages/Discover'
import PrivateRoomShare from './pages/PrivateRoomShare'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const identity = useIdentityStore((state) => state.identity)
  if (!identity) {
    return <Navigate to="/join" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/identity" element={<IdentitySetup />} />
      <Route path="/host-identity" element={<HostIdentitySetup />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/room/:roomId" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
      <Route path="/room/:roomId/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/room/:roomId/private" element={<ProtectedRoute><PrivateRoomShare /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
