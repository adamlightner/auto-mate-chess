import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Play from './pages/Play'
import Study from './pages/study/Study'
import Openings from './pages/study/Openings'
import MiddleGame from './pages/study/MiddleGame'
import EndGame from './pages/study/EndGame'
import Practice from './pages/practice/Practice'
import PracticeOpenings from './pages/practice/Openings'
import PracticeEndgames from './pages/practice/Endgames'
import PracticePatterns from './pages/practice/Patterns'
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

          {/* Study */}
          <Route path="study" element={<Study />} />
          <Route path="study/openings" element={<Openings />} />
          <Route path="study/middlegame" element={<MiddleGame />} />
          <Route path="study/endgame" element={<EndGame />} />

          {/* Practice */}
          <Route path="practice" element={<Practice />} />
          <Route path="practice/openings" element={<PracticeOpenings />} />
          <Route path="practice/endgames" element={<PracticeEndgames />} />
          <Route path="practice/patterns" element={<PracticePatterns />} />

          {/* Puzzles + Profile */}
          <Route path="puzzles" element={<Puzzles />} />
          <Route path="profile" element={<Profile />} />

          {/* Redirects for old /learn/* routes */}
          <Route path="learn" element={<Navigate to="/study" replace />} />
          <Route path="learn/openings" element={<Navigate to="/study/openings" replace />} />
          <Route path="learn/middle-game" element={<Navigate to="/study/middlegame" replace />} />
          <Route path="learn/end-game" element={<Navigate to="/study/endgame" replace />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}
