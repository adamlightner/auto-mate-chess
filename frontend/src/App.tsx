import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import Learn from './pages/learn/Learn'
import Openings from './pages/learn/Openings'
import MiddleGame from './pages/learn/MiddleGame'
import EndGame from './pages/learn/EndGame'
import Puzzles from './pages/Puzzles'
import Profile from './pages/Profile'
import { SettingsProvider } from './contexts/SettingsContext'

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="play" element={<Play />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/openings" element={<Openings />} />
          <Route path="learn/middle-game" element={<MiddleGame />} />
          <Route path="learn/end-game" element={<EndGame />} />
          <Route path="puzzles" element={<Puzzles />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}
