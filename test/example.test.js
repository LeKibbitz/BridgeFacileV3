import React from 'react';
import { render } from '@testing-library/react';
import App from '../src/App';

test('renders App component', () => {
  const { getByText } = render(<App />);
  expect(getByText('Bridge Facile')).toBeInTheDocument();
});
