import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ChampSelect, ChampSelectAdmin, Settings, Overlay, Login, Signup } from './components/pages'
import ProtectedRoute from './components/routes/ProtectedRoute'
import './App.css'
import { useAuth } from './context/AuthContext'
import { AuthMenu } from './components/organisms'

const App = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isViewerRoute = /^\/champ-select(?:\/|$)/.test(location.pathname)

  return (
    <div className="app">
      {!isViewerRoute ? (
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-links">
              {user ? (
                <>
                  <NavLink
                    to="/champ-select-admin"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Champ Select Admin
                  </NavLink>
                  <NavLink
                    to="/overlay"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Overlay
                  </NavLink>
                </>
              ) : null}
            </div>
            <div className="nav-actions">
              <AuthMenu />
            </div>
          </div>
        </nav>
      ) : null}

      <main className="main">
        <Routes>
          <Route path="/champ-select/:ownerId?" element={<ChampSelect />} />
          <Route
            path="/champ-select-admin"
            element={
              <ProtectedRoute>
                <ChampSelectAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/overlay" element={<Overlay />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/champ-select" replace />} />
          <Route path="*" element={<Navigate to="/champ-select" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
