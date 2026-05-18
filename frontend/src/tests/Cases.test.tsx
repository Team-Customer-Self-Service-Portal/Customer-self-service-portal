import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Cases from '@/pages/cases/Cases';

const navMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navMock };
});

vi.mock('@/hooks/useCases', () => ({
  useGetCases: () => ({ isLoading: false, data: { data: [], pagination: { total: 0, page: 1, pages: 1, limit: 10 } } })
}));

describe('Cases', () => {
  it('renders cases page and empty state', () => {
    render(<MemoryRouter><Cases /></MemoryRouter>);
    expect(screen.getByText('My Cases')).toBeInTheDocument();
    expect(screen.getByText('No cases found')).toBeInTheDocument();
  });

  it('navigates to create case', () => {
    render(<MemoryRouter><Cases /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Create New Case' }));
    expect(navMock).toHaveBeenCalledWith('/cases/new');
  });

  it('shows filters', () => {
    render(<MemoryRouter><Cases /></MemoryRouter>);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
  });
});
