import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useDebounce, { UseDebounceReturn } from '../src/hooks/useDebounce'

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
	delay: number
): [ jest.Mock, RenderHookResult<{ delay: number }, any> ] {
	const spy = jest.fn(x => x)
	const hook = renderHook(({ delay }) => useDebounce(spy, delay), {
		initialProps: {
			delay
		}
	})
	return [ spy, hook ]
}

describe('useDebounce', () => {

	it('should be defined', () => {
		expect(useDebounce).toBeDefined()
	})

	it('should return 2 functions', () => {
		const spy = jest.fn()
		const { result } = renderHook(() => useDebounce(spy))
		const [ debouncedSpy, cancel ] = result.current

		expect(typeof debouncedSpy).toBe('function')
		expect(typeof cancel).toBe('function')
	})

	it('should return a promise', async done => {
		const [ , { result } ] = getHook(100)
		const [ debouncedSpy ] = result.current

		act(() => {
			let promise = debouncedSpy(1)
			jest.advanceTimersByTime(100)
			promise.then(val => {
				expect(val).toBe(1)
				done()
			})
		})
	})

	it('should return 2 memoized functions', () => {
		const [ , { result, rerender } ] = getHook(100)
		const [ debounced1, cancel1 ] = result.current
		rerender()
		const [ debounced2, cancel2 ] = result.current
		expect(debounced1).toBe(debounced2)
		expect(cancel1).toBe(cancel2)
	})

	it('should not be called on render', () => {
		const [ spy ] = getHook(100)
		expect(spy).not.toHaveBeenCalled()
	})

	it('should be called after X delay', () => {
		const [ spy, { result } ] = getHook(100)
		const [ debouncedSpy ] = result.current

		act(() => {
			debouncedSpy()
		})
		expect(spy).not.toHaveBeenCalled()
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('should call spy only once after X delay', () => {
		const [ spy, { result } ] = getHook(100)
		const [ debouncedSpy ] = result.current

		act(() => {
			debouncedSpy()
			debouncedSpy()
			debouncedSpy()
		})
		expect(spy).not.toHaveBeenCalled()
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('should change timeout on delay change', () => {
		const [ spy, { result, rerender } ] = getHook(100)
		let [ debouncedSpy, cancel ] = result.current

		act(() => {
			debouncedSpy()
		})
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1)

		rerender({ delay: 200 })

		act(() => {
			debouncedSpy()
		})
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(1)
		jest.advanceTimersByTime(200)
		expect(spy).toHaveBeenCalledTimes(2)
	})

	it('should cancel when calling cancel()', () => {
		const [ spy, { result } ] = getHook(100)
		let [ debouncedSpy, cancel ] = result.current

		act(() => {
			debouncedSpy()
			cancel()
		})
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(0)
	})

	it('should cancel when unmounting component', () => {
		const [ spy, { result, unmount } ] = getHook(100)
		let [ debouncedSpy ] = result.current

		act(() => {
			debouncedSpy()
			unmount()
		})
		jest.advanceTimersByTime(100)
		expect(spy).toHaveBeenCalledTimes(0)
	})

	it('should cancel when calling the debounced function again before timeout', () => {
		const [ spy, { result } ] = getHook(100)
		let [ debouncedSpy ] = result.current

		act(() => {
			debouncedSpy()
			jest.advanceTimersByTime(50)
			debouncedSpy()
			jest.advanceTimersByTime(50)
		})
		expect(spy).toHaveBeenCalledTimes(0)
		jest.advanceTimersByTime(50)
		expect(spy).toHaveBeenCalledTimes(1)
	})
})