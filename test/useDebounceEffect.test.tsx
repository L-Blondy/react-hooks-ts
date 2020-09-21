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
	delay: number,
	immediate: boolean = true
): [ jest.Mock, RenderHookResult<{ deps: React.DependencyList, delay: number }, any> ] {
	const spy = jest.fn()
	const hook = renderHook(({ deps, delay, immediate }) => useDebounceEffect(spy, deps, delay, immediate), {
		initialProps: {
			deps,
			delay,
			immediate
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

	it('Should not run on mount if "immediate===false"', () => {
		const [ spy, hook ] = getHook([ 1 ], 100, false)

		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(0);
	})

	it('Should return a tuple of 2 functions', () => {
		const [ , hook ] = getHook([ 1 ], 100, false)

		expect(typeof hook.result.current[ 0 ]).toBe('function')
		expect(typeof hook.result.current[ 1 ]).toBe('function')
	})

	it('Should reset timer with 1st function', () => {
		const [ spy, { result, } ] = getHook([ 1 ], 100, true)
		const [ reset ] = result.current
		jest.advanceTimersByTime(50)
		act(() => {
			reset()
		})
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(0);
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(1);
	})

	it('Should cancel execution with 2nd function', () => {
		const [ spy, { result, } ] = getHook([ 1 ], 100, true)
		const [ , cancel ] = result.current
		jest.advanceTimersByTime(50)
		act(() => {
			cancel()
		})
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(0);
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(0);
	})

})