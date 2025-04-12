import { render, screen } from '@testing-library/react';
import Login from '../pages/login';

test('renders login input and button', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  expect(screen.getByText('Send Magic Link')).toBeInTheDocument();
});
