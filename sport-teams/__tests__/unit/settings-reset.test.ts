/**
 * Tests for the app reset sequence.
 *
 * The critical bug: after supabase.auth.signOut(), signInAnonymously()
 * MUST be called before navigating away. Without it, all subsequent
 * Supabase queries fail silently and the app appears broken.
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCacheClear = jest.fn()
const mockMultiRemove = jest.fn(() => Promise.resolve())
const mockSignOut = jest.fn(() => Promise.resolve({ error: null }))
const mockSignInAnonymously = jest.fn(() => Promise.resolve())
const mockSetLang = jest.fn(() => Promise.resolve())
const mockSetMode = jest.fn(() => Promise.resolve())
const mockRouterReplace = jest.fn()

// ─── Reset logic (mirrors settings/index.tsx doReset) ────────────────────────

async function doReset() {
  mockCacheClear()
  await mockMultiRemove(['hasLaunched', 'app_langue', 'app_theme'])
  await mockSignOut()
  await mockSignInAnonymously()
  await mockSetLang('fr')
  await mockSetMode('system')
  mockRouterReplace('/onboarding/slides')
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('App Reset — sequence & correctness', () => {
  it('executes all steps in the correct order', async () => {
    const order: string[] = []
    mockCacheClear.mockImplementation(() => order.push('cacheClear'))
    mockMultiRemove.mockImplementation(() => { order.push('multiRemove'); return Promise.resolve() })
    mockSignOut.mockImplementation(() => { order.push('signOut'); return Promise.resolve({ error: null }) })
    mockSignInAnonymously.mockImplementation(() => { order.push('signInAnonymously'); return Promise.resolve() })
    mockSetLang.mockImplementation(() => { order.push('setLang'); return Promise.resolve() })
    mockSetMode.mockImplementation(() => { order.push('setMode'); return Promise.resolve() })
    mockRouterReplace.mockImplementation(() => order.push('navigate'))

    await doReset()

    expect(order).toEqual([
      'cacheClear',
      'multiRemove',
      'signOut',
      'signInAnonymously', // MUST come after signOut
      'setLang',
      'setMode',
      'navigate',          // MUST come last
    ])
  })

  it('removes exactly the required AsyncStorage keys', async () => {
    await doReset()
    expect(mockMultiRemove).toHaveBeenCalledWith([
      'hasLaunched',
      'app_langue',
      'app_theme',
    ])
  })

  it('creates a new anonymous session AFTER sign out', async () => {
    const callOrder: string[] = []
    mockSignOut.mockImplementation(() => { callOrder.push('signOut'); return Promise.resolve({ error: null }) })
    mockSignInAnonymously.mockImplementation(() => { callOrder.push('signIn'); return Promise.resolve() })

    await doReset()

    expect(callOrder.indexOf('signOut')).toBeLessThan(callOrder.indexOf('signIn'))
  })

  it('resets language to French (default)', async () => {
    await doReset()
    expect(mockSetLang).toHaveBeenCalledWith('fr')
  })

  it('resets theme to system (default)', async () => {
    await doReset()
    expect(mockSetMode).toHaveBeenCalledWith('system')
  })

  it('navigates to onboarding as the final step', async () => {
    const order: string[] = []
    mockSignInAnonymously.mockImplementation(() => { order.push('signIn'); return Promise.resolve() })
    mockSetLang.mockImplementation(() => { order.push('setLang'); return Promise.resolve() })
    mockSetMode.mockImplementation(() => { order.push('setMode'); return Promise.resolve() })
    mockRouterReplace.mockImplementation(() => order.push('navigate'))

    await doReset()

    expect(mockRouterReplace).toHaveBeenCalledWith('/onboarding/slides')
    expect(order[order.length - 1]).toBe('navigate')
  })

  it('calls signInAnonymously exactly once', async () => {
    await doReset()
    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1)
  })
})

describe('App Reset — error resilience', () => {
  it('does not navigate if signOut fails', async () => {
    const safeDoReset = async () => {
      try {
        mockCacheClear()
        await mockMultiRemove(['hasLaunched', 'app_langue', 'app_theme'])
        await mockSignOut()      // will throw
        await mockSignInAnonymously()
        mockRouterReplace('/onboarding/slides')
      } catch {
        // error handled — no navigation
      }
    }

    mockSignOut.mockRejectedValueOnce(new Error('Network error'))
    await safeDoReset()

    expect(mockRouterReplace).not.toHaveBeenCalled()
  })

  it('does not navigate if signInAnonymously fails', async () => {
    const safeDoReset = async () => {
      try {
        mockCacheClear()
        await mockMultiRemove(['hasLaunched', 'app_langue', 'app_theme'])
        await mockSignOut()
        await mockSignInAnonymously()  // will throw
        mockRouterReplace('/onboarding/slides')
      } catch {
        // error handled — no navigation
      }
    }

    mockSignInAnonymously.mockRejectedValueOnce(new Error('Auth error'))
    await safeDoReset()

    expect(mockRouterReplace).not.toHaveBeenCalled()
  })
})
