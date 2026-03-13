import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  ErrorBoundary,
  AppErrorBoundary,
  EditorErrorBoundary,
  PreviewErrorBoundary,
} from '../ErrorBoundary'

// A component that throws on demand
function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Boom!')
  return <div>Safe content</div>
}

describe('ErrorBoundary', () => {
  // Suppress React's own console.error for expected error-boundary output
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('renders the default error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Boom!')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('calls the onError prop when a child throws', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Boom!' }),
      expect.any(Object)
    )
  })

  it('resets and re-renders children after clicking "Try Again"', async () => {
    const user = userEvent.setup()

    // We need a stateful wrapper to flip shouldThrow after reset
    function TestWrapper() {
      const [broken, setBroken] = React.useState(true)
      return (
        <ErrorBoundary
          onError={() => {
            // flip after boundary catches the error
            setTimeout(() => setBroken(false), 0)
          }}
        >
          <BombComponent shouldThrow={broken} />
        </ErrorBoundary>
      )
    }

    render(<TestWrapper />)
    // Error UI is visible
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click "Try Again"
    await user.click(screen.getByRole('button', { name: /try again/i }))

    // After reset the broken state is false → children render successfully
    expect(await screen.findByText('Safe content')).toBeInTheDocument()
  })
})

describe('AppErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <AppErrorBoundary>
        <BombComponent shouldThrow={false} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('shows error UI on thrown error', () => {
    render(
      <AppErrorBoundary>
        <BombComponent shouldThrow={true} />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})

describe('EditorErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows editor-specific fallback on error', () => {
    render(
      <EditorErrorBoundary>
        <BombComponent shouldThrow={true} />
      </EditorErrorBoundary>
    )
    expect(screen.getByText('Editor Error')).toBeInTheDocument()
  })
})

describe('PreviewErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows preview-specific fallback on error', () => {
    render(
      <PreviewErrorBoundary>
        <BombComponent shouldThrow={true} />
      </PreviewErrorBoundary>
    )
    expect(screen.getByText('Preview Error')).toBeInTheDocument()
  })
})
