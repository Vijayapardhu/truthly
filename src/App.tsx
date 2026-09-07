import { Routes, Route } from 'react-router-dom'
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
import SessionHydrator from './components/SessionHydrator'

export default function App() {
  return (
    <>
      <SessionHydrator />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/identity" element={<IdentitySetup />} />
        <Route path="/host-identity" element={<HostIdentitySetup />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/room/:roomId" element={<Lobby />} />
        <Route path="/room/:roomId/game" element={<Game />} />
        <Route path="/room/:roomId/private" element={<PrivateRoomShare />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
