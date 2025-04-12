import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';

test('renders navigation links', () => {
  render(<Layout><div>Test</div></Layout>);
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Login')).toBeInTheDocument();
});
