import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useCacheFn, { UseCacheFnOptions } from '../src/hooks/useCacheFn'
import { waitForMs } from '../src/utils'

function getHook({
	staleTime = 100,
	caseSensitive = false,
	isAsync = false,
	disable = false,
}: UseCacheFnOptions = {}) {

	const spy = jest.fn(x => isAsync
		? Promise.resolve(x)
		: x
	)

	const hook = renderHook(({
		staleTime = 100,
		caseSensitive = false,
		isAsync = false,
		disable = false
	}: UseCacheFnOptions) => useCacheFn(spy, {
		staleTime,
		caseSensitive,
		isAsync,
		disable,
	}), {
		initialProps: { staleTime, caseSensitive, isAsync, disable }
	})

	return [ spy, hook ] as const
}

describe('useCacheFn', () => {

	it('Should return [fn,cache]', () => {
		const [ , hook ] = getHook()
		expect(typeof hook.result.current[ 0 ]).toBe('function')
		expect(typeof hook.result.current[ 1 ].get).toBeDefined()
		expect(typeof hook.result.current[ 1 ].set).toBeDefined()
	})

	describe('isAsync===false', () => {

		it('Result should be cached after execution', () => {
			const [ , hook ] = getHook()
			const [ execute, cache ] = hook.result.current
			const arg = 'a'
			expect(cache.get(arg)).toBeUndefined()
			act(() => {
				execute(arg)
			})
			expect(cache.get(arg)).toBeDefined()
			expect(cache.get(arg).value).toBe(arg)
		})

		it('Spy should execute once until isStale===true', async done => {
			const [ spy, hook ] = getHook()
			const [ execute ] = hook.result.current

			act(() => {
				execute(0)
				execute(0)
				execute(0)
			})
			expect(spy).toBeCalledTimes(1)

			await waitForMs(101)

			act(() => {
				execute(0)
				execute(0)
				execute(0)
			})
			expect(spy).toBeCalledTimes(2)
			done()
		})

		it('(disable===true) Spy should always execute', () => {
			const [ spy, hook ] = getHook({ disable: true })
			const [ execute ] = hook.result.current

			act(() => {
				execute(0)
				execute(0)
				execute(0)
			})
			expect(spy).toBeCalledTimes(3)
		})

		it('(disable===true) Cache should remain as is', () => {
			const [ , hook ] = getHook({ disable: false })
			const [ execute, cache ] = hook.result.current

			act(() => {
				execute(0)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()

			hook.rerender({ disable: true })

			act(() => {
				execute(1)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()
		})
	})


	describe('isAsync===true', () => {

		it('Result should be cached after execution', async done => {
			const [ , hook ] = getHook({ isAsync: true })
			const [ execute, cache ] = hook.result.current
			const arg = 'a'
			expect(cache.get(arg)).toBeUndefined()

			await act(async () => {
				await execute(arg)
			})
			expect(cache.get(arg)).toBeDefined()
			expect(cache.get(arg).value).toBe(arg)
			done()
		})

		it('Spy should execute once until isStale===true', async done => {
			const [ spy, hook ] = getHook({ isAsync: true })
			const [ execute ] = hook.result.current

			await act(async () => {
				await execute(0)
				await execute(0)
				await execute(0)
			})
			expect(spy).toBeCalledTimes(1)

			await waitForMs(101)

			await act(async () => {
				await execute(0)
				await execute(0)
				await execute(0)
			})
			expect(spy).toBeCalledTimes(2)
			done()
		})

		it('(disable===true) Spy should always execute', async done => {
			const [ spy, hook ] = getHook({ isAsync: true, disable: true })
			const [ execute ] = hook.result.current

			await act(async () => {
				await execute(0)
				await execute(0)
				await execute(0)
			})
			expect(spy).toBeCalledTimes(3)
			done()
		})

		it('(disable===true) Cache should remain as is', async done => {
			const [ , hook ] = getHook({ isAsync: true, disable: false })
			const [ execute, cache ] = hook.result.current

			await act(async () => {
				await execute(0)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()

			hook.rerender({ isAsync: true, disable: true })

			await act(async () => {
				await execute(1)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()
			done()
		})
	})
})