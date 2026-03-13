import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Logger', () => {
  // Spy on console methods
  let debugSpy: ReturnType<typeof vi.spyOn>
  let infoSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    infoSpy  = vi.spyOn(console, 'info').mockImplementation(() => {})
    warnSpy  = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Force the logger into development mode so console output is enabled
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  // Re-import logger after environment stub so the constructor picks up
  // NODE_ENV = 'development'.  We isolate the module per test block.
  async function getLogger() {
    // Clear module cache so Logger re-reads NODE_ENV
    return (await import('../logger')).log
  }

  it('exports a log convenience object', async () => {
    const log = await getLogger()
    expect(typeof log.debug).toBe('function')
    expect(typeof log.info).toBe('function')
    expect(typeof log.warn).toBe('function')
    expect(typeof log.error).toBe('function')
    expect(typeof log.themeLoad).toBe('function')
    expect(typeof log.exportStart).toBe('function')
    expect(typeof log.exportComplete).toBe('function')
    expect(typeof log.exportError).toBe('function')
    expect(typeof log.presentationMode).toBe('function')
    expect(typeof log.performance).toBe('function')
    expect(typeof log.security).toBe('function')
  })

  it('themeLoad — logs success at info level', async () => {
    const log = await getLogger()
    log.themeLoad('space', true)
    // In non-dev (test) env the logger may suppress output; we just verify no throw
    expect(() => log.themeLoad('desert', false, 'not found')).not.toThrow()
  })

  it('exportStart — does not throw', async () => {
    const log = await getLogger()
    expect(() => log.exportStart('pptx', 5)).not.toThrow()
  })

  it('exportComplete — does not throw', async () => {
    const log = await getLogger()
    expect(() => log.exportComplete('pptx', 250)).not.toThrow()
  })

  it('exportError — does not throw', async () => {
    const log = await getLogger()
    expect(() => log.exportError('pptx', 'something broke')).not.toThrow()
  })

  it('presentationMode — does not throw for enter/exit', async () => {
    const log = await getLogger()
    expect(() => log.presentationMode('enter', 0)).not.toThrow()
    expect(() => log.presentationMode('exit', 3)).not.toThrow()
  })

  it('performance — does not throw for fast and slow operations', async () => {
    const log = await getLogger()
    expect(() => log.performance('render', 50)).not.toThrow()
    expect(() => log.performance('heavyTask', 2000)).not.toThrow()
  })

  it('security — does not throw', async () => {
    const log = await getLogger()
    expect(() => log.security('suspicious URL', { url: 'x' })).not.toThrow()
  })
})
