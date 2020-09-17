import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NormalFunction } from '../src/components/UseDebounce';
import { renderHook, act } from '@testing-library/react-hooks'
import { useDebounce } from '../src/hooks'
import { waitForMs } from '../src/utils'

describe('COMPONENT/normal function', () => {

	function getTestElements() {
		return {
			incrementBtn: screen.getByTestId('incrementBtn'),
			countDisplay: screen.getByTestId('countDisplay'),
			promiseDisplay: screen.getByTestId('promiseDisplay'),
			cancelBtn: screen.getByTestId('cancelBtn'),
			timeoutDisplay: screen.getByTestId('timeoutDisplay'),
		}
	}

	test('initial data', async done => {
		render(<NormalFunction time={100} />)
		const { incrementBtn, countDisplay, promiseDisplay } = getTestElements()

		expect(incrementBtn).toHaveTextContent('0')
		expect(countDisplay).toHaveTextContent('0')
		expect(promiseDisplay).toHaveTextContent('0')

		done()
	})

	test('single click', async done => {
		render(<NormalFunction time={100} />)
		const { incrementBtn, countDisplay, promiseDisplay } = getTestElements()

		fireEvent.click(incrementBtn)

		expect(incrementBtn).toHaveTextContent('1')
		expect(countDisplay).toHaveTextContent('0')
		expect(promiseDisplay).toHaveTextContent('0')
		await waitFor(() => expect(countDisplay).toHaveTextContent('1'), { timeout: 200 })
		waitFor(() => expect(promiseDisplay).toHaveTextContent('1'))

		done()
	})

	test('cancel after click', async done => {
		render(<NormalFunction time={100} />)
		const { incrementBtn, countDisplay, promiseDisplay, cancelBtn, timeoutDisplay } = getTestElements()

		fireEvent.click(incrementBtn)

		expect(incrementBtn).toHaveTextContent('1')
		expect(countDisplay).toHaveTextContent('0')
		expect(promiseDisplay).toHaveTextContent('0')

		fireEvent.click(cancelBtn)

		await waitFor(() => expect(timeoutDisplay).toHaveTextContent('3'))
		expect(countDisplay).toHaveTextContent('0')
		expect(promiseDisplay).toHaveTextContent('0')

		done()
	})
})

describe('HOOK/normal function', () => {
	let count = 0

	function increment() {
		count++
	}

	beforeEach(() => {
		count = 0
	})

	test('gets called asynchronously', async done => {

		const { result } = renderHook(() => useDebounce(increment, 100))
		act(() => {
			result.current[ 0 ]()
		})
		expect(count).toBe(0)
		await waitFor(() => expect(count).toBe(1))
		expect(count).toBe(1)

		await waitForMs(150)
		expect(count).toBe(1)

		done()
	})

	test('gets called once', async done => {

		const { result } = renderHook(() => useDebounce(increment, 100))
		act(() => {
			result.current[ 0 ]()
			result.current[ 0 ]()
			result.current[ 0 ]()
		})
		expect(count).toBe(0)
		await waitFor(() => expect(count).toBe(1))
		expect(count).toBe(1)

		expect(count).toBe(1)
		await waitForMs(150)

		done()
	})

	test('gets cancelled', async done => {

		const { result } = renderHook(() => useDebounce(increment, 100))
		act(() => {
			result.current[ 0 ]()
			result.current[ 1 ]()
		})
		expect(count).toBe(0)
		await waitForMs(150)
		expect(count).toBe(0)

		done()
	})
})