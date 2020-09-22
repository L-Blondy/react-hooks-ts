import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useThrottle from '../src/hooks/useThrottle'

beforeAll(() => jest.useFakeTimers())
afterEach(() => jest.clearAllTimers())
afterAll(() => jest.useRealTimers())

const getHook = (
	throttleTime: number = 100,
	limit: number = 1,
	trailing: boolean = true
): [ jest.Mock, RenderHookResult<{ throttleTime?: number, limit?: number, trailing?: boolean }, any> ] => {
	const spy = jest.fn(x => x)

	const hook = renderHook(({ throttleTime, limit, trailing }) => useThrottle(spy, throttleTime, { limit, trailing }), {
		initialProps: { throttleTime, limit, trailing }
	})

	return [ spy, hook ]
}

describe('useThrottle', () => {

	it('Should return 2 functions', () => {
		const [ , hook ] = getHook()

		expect(typeof hook.result.current[ 0 ]).toBe('function')
		expect(typeof hook.result.current[ 1 ]).toBe('function')
	})

	it('Should not execute onmount', () => {
		const [ spy ] = getHook()
		expect(spy).not.toBeCalled()
	})

	it('Should execute immediately if called', () => {
		const [ spy, hook ] = getHook(100, 1, false)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
		})
		expect(spy).toBeCalledTimes(1)
	})

	it('Should execute immediately after timeout ends', () => {
		const [ spy, hook ] = getHook(100, 1, false)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
		})
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(100)
		act(() => {
			execute()
		})
		expect(spy).toBeCalledTimes(2)
	})

	it('(trailing===false) Should execute once within Time, immediately', () => {
		const [ spy, hook ] = getHook(100, 1, false)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(1)
	})

	it('(trailing===true) Should execute twice within Time, once immediately, once after Time', () => {
		const [ spy, hook ] = getHook(100, 1, true)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(2)
	})

	it('(trailing===true) if called after the trailing function, should become the trailing function and be called on timeout', () => {
		const [ spy, hook ] = getHook(100, 1, true)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(2)

		act(() => {
			execute()
		})
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(3)
	})

	it('(limit===2, trailing===false) Should execute twice immediately, without trailing', () => {
		const [ spy, hook ] = getHook(100, 2, false)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(2)
	})

	it('(limit===2, trailing===true) Should execute twice immediately, with trailing', () => {
		const [ spy, hook ] = getHook(100, 2, true)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(3)
	})

	it('Timeout change should reflect', () => {
		const [ spy, hook ] = getHook(100, 1, false)
		const execute = hook.result.current[ 0 ]
		hook.rerender({
			throttleTime: 50,
			limit: 1,
			trailing: false
		})

		act(() => { execute() })
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(50)
		act(() => { execute() })
		expect(spy).toBeCalledTimes(2)
	})

	it('Limit change should reflect', () => {
		const [ spy, hook ] = getHook(100, 1, false)
		const execute = hook.result.current[ 0 ]
		hook.rerender({
			throttleTime: 100,
			limit: 2,
			trailing: false
		})

		act(() => {
			execute()
			execute()
		})
		expect(spy).toBeCalledTimes(2)
	})

	it('trailing change should cancel trailing execution', () => {
		const [ spy, hook ] = getHook(100, 1, true)
		const execute = hook.result.current[ 0 ]

		act(() => {
			execute()
			execute()
		})
		hook.rerender({
			throttleTime: 100,
			limit: 1,
			trailing: false
		})
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(100)
		expect(spy).toBeCalledTimes(1)
	})

	it('(limit===2, trailing===true) Timeout test', () => {
		const [ spy, hook ] = getHook(100, 2, true)
		const execute = hook.result.current[ 0 ]

		act(() => { execute(1).then(res => expect(res).toBe(1)) })
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(50)
		act(() => { execute(2).then(res => expect(res).toBe(2)) })
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(49)
		act(() => { execute(3).then(res => expect(res).toBe(35)) }) //should throw but never occurs 
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(1)
		act(() => { execute(3).then(res => expect(res).toBe(3)) })
		expect(spy).toBeCalledTimes(3)
		jest.advanceTimersByTime(49)
		act(() => { execute(3).then(res => expect(res).toBe(35)) }) //should throw but never occurs
		jest.advanceTimersByTime(1)
		act(() => { execute(4).then(res => expect(res).toBe(4)) })
		expect(spy).toBeCalledTimes(4)
	})

	it('(limit===2, trailing===true) Timeout test', () => {
		const [ spy, hook ] = getHook(100, 2, true)
		const execute = hook.result.current[ 0 ]

		act(() => { execute(1).then(res => expect(res).toBe(1)) })
		expect(spy).toBeCalledTimes(1)
		jest.advanceTimersByTime(50)
		act(() => { execute(2).then(res => expect(res).toBe(2)) })
		act(() => { execute(3).then(res => expect(res).toBe(35)) })//should throw but never occurs 
		expect(spy).toBeCalledTimes(2)
		jest.advanceTimersByTime(50)
		act(() => { execute(4).then(res => expect(res).toBe(4)) })
		jest.advanceTimersByTime(50)
	})
})