import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebounceNormalFunction } from '../src/components/UseDebounce';

test('sync function', async done => {
	render(<DebounceNormalFunction />)

	const input = screen.getByRole('')
})