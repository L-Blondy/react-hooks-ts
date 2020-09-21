import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useThrottle from '../src/hooks/useThrottle'

beforeAll(() => jest.useFakeTimers())
afterEach(() => jest.clearAllTimers())
afterAll(() => jest.useRealTimers())

const getHook = (
	throttleTime: number = 1000,
	limit: number = 1,
	withTrailing: boolean = true
): [ jest.Mock, RenderHookResult<{ throttleTime?: number, limit?: number, withTrailing?: boolean }, any> ] => {
	const spy = jest.fn(x => x)

	const hook = renderHook(({ throttleTime, limit, withTrailing }) => useThrottle(spy, throttleTime, { limit, withTrailing }), {
		initialProps: { throttleTime, limit, withTrailing }
	})

	return [ spy, hook ]
}

describe('useThrottle', () => {

	it('Should return 2 functions', () => {
		const [ , hook ] = getHook()

		expect(typeof hook.result.current[ 0 ]).toBe('function')
		expect(typeof hook.result.current[ 1 ]).toBe('function')
	})
})