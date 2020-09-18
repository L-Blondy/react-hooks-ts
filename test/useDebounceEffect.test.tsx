import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useDebounceEffect from '../src/hooks/useDebounceEffect'

beforeEach(() => {
	jest.useFakeTimers()
})
afterEach(() => {
	jest.clearAllTimers()
})
afterAll(() => {
	jest.useRealTimers()
})

function getHook(
	deps: React.DependencyList,
	delay: number
): [ jest.Mock, RenderHookResult<{ deps: React.DependencyList, delay: number }, any> ] {
	const spy = jest.fn()
	const hook = renderHook(({ deps, delay }) => useDebounceEffect(spy, deps, delay), {
		initialProps: {
			deps,
			delay
		}
	})

	return [ spy, hook ]
}

describe('useDebounceEffect', () => {

	it('should be defined', () => {
		expect(useDebounceEffect).toBeDefined()
	})

	it('should execute on mount', () => {
		const [ spy ] = getHook([], 100)

		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('should execute after dep change', () => {
		const [ spy, hook ] = getHook([ 1 ], 100)

		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1);

		hook.rerender({ deps: [ 2 ], delay: 100 })
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(2)
	})

	it('should reset timeout on deps change', () => {
		const [ spy, { rerender } ] = getHook([ 1 ], 100)

		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(0);

		rerender({ deps: [ 2 ], delay: 100 })
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(0)
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('cancel() should cancel', () => {
		const [ spy, { result, rerender, } ] = getHook([ 1 ], 100)
		const cancel = result.current
		act(() => {
			cancel()
		})
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(0);
	})

})