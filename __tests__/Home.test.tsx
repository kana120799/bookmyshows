
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

// Mock the child component to avoid transform issues and complex dependencies
jest.mock('../components/Home', () => ({
    __esModule: true,
    default: () => <h1>Mocked Home Page Logic</h1>,
}))

describe('Home Page', () => {
    it('renders the Home component', () => {
        render(<Page />)

        const heading = screen.getByRole('heading', { level: 1, name: 'Mocked Home Page Logic' })

        expect(heading).toBeInTheDocument()
    })
})
