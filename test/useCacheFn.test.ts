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
		initialProps: {
			staleTime,
			caseSensitive,
			isAsync,
			disable
		}
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

	describe('Test options', () => {

		describe('disabled', () => {

			it('{disabled:false} Should cache results', () => {
				const [ , hook ] = getHook({ disable: false })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0).value).toBe(0)
			})

			it('{disabled:true} Should not cache results', () => {
				const [ , hook ] = getHook({ disable: true })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0)).toBeUndefined()
			})

			it('{disable} change should apply', () => {
				const [ , hook ] = getHook({ disable: true })
				hook.rerender({ disable: false })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0).value).toBe(0)
			})
		})

		describe('staleTime', () => {

			it('{staleTime:10} cached data should become stale after 10ms', async done => {
				const [ , hook ] = getHook({ staleTime: 10 })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0).isStale).toBeFalsy()
				await waitForMs(11)
				expect(cache.get(0).isStale).toBeTruthy()
				done()
			})

			it('{staleTime} change should apply', () => {
				const [ , hook ] = getHook({ staleTime: 100 })

				hook.rerender({ staleTime: 10 })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0).expireDate).toBe(cache.get(0).updatedOn + 10)
			})
		})

		describe('caseSensitive', () => {

			it('{caseSensitive:false} uppercase/lowercase keys should not create different records', () => {
				const [ , hook ] = getHook({ caseSensitive: false, staleTime: 0 })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute('a')
				})
				expect(cache.get('a')).toBe(cache.get('A'))
				act(() => {
					execute('A')
				})
				expect(cache.get('a').value).toBe('A')

				act(() => {
					execute('B')
				})
				expect(cache.get('B')).toBe(cache.get('b'))
				act(() => {
					execute('b')
				})
				expect(cache.get('B').value).toBe('b')
			})

			it('{caseSensitive:true} uppercase/lowercase keys should create different records', () => {
				const [ , hook ] = getHook({ caseSensitive: true })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute('a')
					execute('A')
				})
				expect(cache.get('a')).not.toBe(cache.get('A'))
				expect(cache.get('a').value).toBe('a')
				expect(cache.get('A').value).toBe('A')
			})

			it('{caseSensitive} change should apply', () => {
				const [ , hook ] = getHook({ caseSensitive: false })
				hook.rerender({ caseSensitive: true })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute('a')
					execute('A')
				})
				expect(cache.get('a')).not.toBe(cache.get('A'))
				expect(cache.get('a').value).toBe('a')
				expect(cache.get('A').value).toBe('A')
			})
		})

		describe('isAsync', () => {

			it('{isAsync:true} should cache records with prop {isAsync:true}', async done => {
				const [ , hook ] = getHook({ isAsync: true })
				const [ execute, cache ] = hook.result.current
				await act(async () => {
					await execute(0)
				})
				expect(cache.get(0).isAsync).toBeTruthy()
				done()
			})

			it('{isAsync:false} should cache records with prop {isAsync:false}', () => {
				const [ , hook ] = getHook({ isAsync: false })
				const [ execute, cache ] = hook.result.current
				act(() => {
					execute(0)
				})
				expect(cache.get(0).isAsync).toBeFalsy()
			})

			it('{isAsync} change should apply', async done => {
				const [ , hook ] = getHook({ isAsync: false })
				hook.rerender({ isAsync: true })
				const [ execute, cache ] = hook.result.current
				await act(async () => {
					await execute(0)
				})
				expect(cache.get(0).isAsync).toBeTruthy()
				done()
			})
		})
	})

	describe('Test Synchronous Function', () => {

		it('Execute should not return a Promise', () => {
			const [ , hook ] = getHook()
			const [ execute ] = hook.result.current
			expect(execute(0).then).toBeUndefined()
		})

		it('Execution should set "isStale" => "false"', async done => {
			const [ , hook ] = getHook({ staleTime: 10 })
			const [ execute, cache ] = hook.result.current

			//first execution
			act(() => {
				execute(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			await waitForMs(12)

			//execution when isStale===true
			expect(cache.get(0).isStale).toBeTruthy()
			act(() => {
				execute(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			done()
		})

		it('if(isStale===false) Should return the cached value and not execute the callback', () => {
			const [ spy, hook ] = getHook({ staleTime: 10 })
			const [ execute, cache ] = hook.result.current

			act(() => {
				execute(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			expect(spy).toBeCalledTimes(1)
			act(() => {
				expect(execute(0)).toBe(0)
				expect(execute(0)).toBe(0)
				expect(execute(0)).toBe(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			expect(spy).toBeCalledTimes(1)
		})

		it('{disable:true} Spy should always execute', () => {
			const [ spy, hook ] = getHook({ disable: true })
			const [ execute ] = hook.result.current

			act(() => {
				execute(0)
				execute(0)
				execute(0)
			})
			expect(spy).toBeCalledTimes(3)
		})

		it('{disable:false => true} Cache should remain as is', () => {
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

	describe('Test Asynchronous Function', () => {

		it('Execute should return a Promise', () => {
			const [ , hook ] = getHook({ isAsync: true })
			const [ execute ] = hook.result.current
			expect(execute(0).then).toBeDefined()
		})

		it('Execution should set "isStale" => "false" on Promise resolution (not immediately)', async done => {
			const [ , hook ] = getHook({ isAsync: true, staleTime: 10 })
			const [ execute, cache ] = hook.result.current

			//first execution
			await act(async () => {
				const promise = execute(0)
				expect(cache.get(0)).toBeUndefined()
				await promise
			})
			expect(cache.get(0).isStale).toBeFalsy()
			await waitForMs(12)

			//execution when isStale===true
			expect(cache.get(0).isStale).toBeTruthy()
			await act(async () => {
				const promise = execute(0)
				expect(cache.get(0).age).toBeGreaterThanOrEqual(12)
				await promise
			})
			expect(cache.get(0).isStale).toBeFalsy()
			done()
		})

		it('if(isStale===false) Should return the cached value and not execute the callback', async done => {
			const [ spy, hook ] = getHook()
			const [ execute, cache ] = hook.result.current

			await act(async () => {
				await execute(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			expect(spy).toBeCalledTimes(1)
			await act(async () => {
				expect(await execute(0)).toBe(0)
				expect(await execute(0)).toBe(0)
				expect(await execute(0)).toBe(0)
			})
			expect(cache.get(0).isStale).toBeFalsy()
			expect(spy).toBeCalledTimes(1)
			done()
		})

		it('{disable:true} Spy should always execute', async done => {
			const [ spy, hook ] = getHook({ disable: true })
			const [ execute ] = hook.result.current

			await act(async () => {
				await execute(0)
				await execute(0)
				await execute(0)
			})
			expect(spy).toBeCalledTimes(3)
			done()
		})

		it('{disable:false => true} Cache should remain as is', async done => {
			const [ , hook ] = getHook({ disable: false })
			const [ execute, cache ] = hook.result.current

			await act(async () => {
				await execute(0)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()

			hook.rerender({ disable: true })

			await act(async () => {
				await execute(1)
			})
			expect(cache.get(0).value).toBe(0)
			expect(cache.get(1)).toBeUndefined()
			done()
		})
	})
})