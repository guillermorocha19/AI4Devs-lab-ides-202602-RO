import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders recruiter dashboard heading', () => {
  render(<App />);
  const heading = screen.getByTestId('dashboard-title');
  expect(heading).toBeInTheDocument();
  expect(heading).toHaveTextContent('Recruiter Dashboard');
});
