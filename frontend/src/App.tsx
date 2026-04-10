import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import Openings from './pages/learn/Openings'
import Puzzles from './pages/learn/Puzzles'
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
          <Route path="learn/openings" element={<Openings />} />
          <Route path="learn/puzzles" element={<Puzzles />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}
