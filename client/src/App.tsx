import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { ChampSelect, ChampSelectAdmin, Overlay } from './components/pages'
import './App.css'

const App = () => {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/champ-select" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Champ Select
        </NavLink>
        <NavLink
          to="/champ-select-admin"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Champ Select Admin
        </NavLink>
        <NavLink to="/overlay" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Overlay
        </NavLink>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/champ-select" element={<ChampSelect />} />
          <Route path="/champ-select-admin" element={<ChampSelectAdmin />} />
          <Route path="/overlay" element={<Overlay />} />
          <Route path="/" element={<Navigate to="/champ-select" replace />} />
          <Route path="*" element={<Navigate to="/champ-select" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
