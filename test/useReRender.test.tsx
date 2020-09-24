import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useRerender from '../src/hooks/useRerender'

describe('useRerender', () => {

	it('Should return 1 function', () => {
		const { result } = renderHook(() => useRerender())
		expect(typeof result.current).toBe('function')
	})

	it('Should rerender the hook when the returned function is called', () => {
		let renderCount = 0
		const { result } = renderHook(() => {
			renderCount++
			return useRerender()
		})
		expect(renderCount).toBe(1)
		act(() => { result.current() })
		expect(renderCount).toBe(2)
		act(() => { result.current() })
		expect(renderCount).toBe(3)
	})

	it('Should always return the same function instance', () => {
		const { result, rerender } = renderHook(() => useRerender())
		const reRender = result.current
		act(() => { reRender() })
		rerender()
		expect(result.current).toBe(reRender)
	})
})