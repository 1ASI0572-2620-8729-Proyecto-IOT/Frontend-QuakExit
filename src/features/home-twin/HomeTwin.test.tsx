import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HomeTwin } from './HomeTwin'

describe('HomeTwin', () => {
  it('renders the house illustration with an accessible label', () => {
    render(<HomeTwin />)

    expect(screen.getByRole('img', { name: /casa/i })).toBeInTheDocument()
  })
})
