import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useThrottleEffect from '../src/hooks/useThrottleEffect'

beforeAll(() => jest.useFakeTimers())
afterEach(() => jest.clearAllTimers())
afterAll(() => jest.useRealTimers())

const getHook = (
	deps: React.DependencyList,
	{
		time = 100,
		limit = 1,
		trailing = true,
		immediate = true
	}: {
		time?: number,
		limit?: number,
		trailing?: boolean,
		immediate?: boolean
	} = {}
): [ jest.Mock, RenderHookResult<{ deps?: React.DependencyList, time?: number, limit?: number, trailing?: boolean, immediate?: boolean }, any> ] => {
	const spy = jest.fn(x => x)
	const hook = renderHook(({ deps, time, limit, trailing, immediate }) => useThrottleEffect(spy, deps, time, { limit, trailing, immediate }), {
		initialProps: { deps, time, limit, trailing, immediate }
	})

	return [ spy, hook ]
}

describe('useThrottleEffect', () => {

	it('Should return 2 functions', () => {
		const [ , hook ] = getHook([])
		const [ reset, cancel ] = hook.result.current

		expect(typeof reset).toBe('function')
		expect(typeof cancel).toBe('function')
	})

	it('Options should be optional', () => {
		renderHook(() => useThrottleEffect(jest.fn(), [], 100))
	})

	it('(immediate===true) Should execute onmount', () => {
		const [ spy ] = getHook([])
		expect(spy).toBeCalled()
	})

	it('(immediate===false) Should not execute onmount', () => {
		const [ spy ] = getHook([], { immediate: false })
		expect(spy).not.toBeCalled()
	})

	it('(trailing===true) Should execute trailing after timeout', () => {
		const [ spy, { rerender } ] = getHook([ 0 ], { trailing: true })
		rerender({ deps: [ 1 ], trailing: true })
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(2)
	})

	it('(trailing===false) Should not execute trailing after timeout', () => {
		const [ spy, { rerender } ] = getHook([ 0 ], { trailing: false })
		rerender({ deps: [ 1 ], trailing: false })
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(1)
	})
})