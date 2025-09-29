import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const navigateMock = vi.fn()

// Mock useNavigate to avoid actual navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

// Mock the auth context used by AuthMenu
vi.mock('../../../context/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  }
})

import { useAuth } from '../../../context/AuthContext'
import AuthMenu from './AuthMenu'

const mockedUseAuth = vi.mocked(useAuth)

type AuthContextValue = ReturnType<typeof useAuth>

const createAuthValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: null,
  loading: false,
  login: vi.fn().mockResolvedValue(undefined),
  signup: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

describe('AuthMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigateMock.mockClear()
  })

  it('shows Login and Sign Up when user is not authenticated', async () => {
    mockedUseAuth.mockReturnValue(createAuthValue())
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AuthMenu />
      </MemoryRouter>,
    )

    // open menu via icon button
    const button = screen.getByRole('button', { name: /account menu/i })
    await user.click(button)

    expect(screen.getByRole('menuitem', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows Logout when user is authenticated and triggers logout', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    mockedUseAuth.mockReturnValue(
      createAuthValue({ user: { id: 1, email: 'a@b.com' }, logout })
    )
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AuthMenu />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /account menu/i })
    await user.click(button)

    const logoutBtn = screen.getByRole('menuitem', { name: /logout/i })
    await user.click(logoutBtn)
    expect(logout).toHaveBeenCalled()
  })
})
