import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks'
import useMountedState from '../src/hooks/useMountedState'

describe('useMountedState', () => {

	it('Should return a function', () => {
		const { result } = renderHook(() => useMountedState())
		expect(typeof result.current).toBe('function')
	})

	it('Should return true on render', () => {
		const { result } = renderHook(() => useMountedState())
		expect(result.current()).toBeTruthy()
	})

	it('Should return false on unmount', () => {
		const { result, unmount } = renderHook(() => useMountedState())
		const isMounted = result.current
		unmount()
		expect(isMounted()).toBeFalsy()
	})
})