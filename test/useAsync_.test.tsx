import '@testing-library/jest-dom/extend-expect';
import { renderHook, act } from '@testing-library/react-hooks'
import useAsync, { UseAsyncOptions } from '../src/hooks/useAsync'
import { CancellableAsyncFn } from '../src/types'
import { waitForMs } from '../src/utils';
const noop = () => { }

function getHook(
	options: UseAsyncOptions<(...x: any[]) => Promise<any[]>> = {
		defaultData: null,
		debounceTime: 0,
		throttleTime: 0,
		throttleLimit: 1,
		withTrailing: false,
		staleTime: Number.MAX_VALUE,
		disableCache: false,
		caseSensitiveCache: false,
		resetDataOnError: true
	}) {
	const spy = jest.fn((...x: any[]) => Promise.resolve(x))

	return [
		spy,
		renderHook((options: UseAsyncOptions<(...x: any[]) => Promise<any[]>> = {
			defaultData: null,
			debounceTime: 0,
			throttleTime: 0,
			throttleLimit: 1,
			withTrailing: false,
			staleTime: Number.MAX_VALUE,
			disableCache: false,
			caseSensitiveCache: false,
			resetDataOnError: true
		}) => useAsync(spy, options), {
			initialProps: options
		})
	] as const
}

let cancellableFnCallCount

const cancellableFn: CancellableAsyncFn = () => {
	let cancelToken, rejectToken

	cancellableFn.cancel = () => {
		clearTimeout(cancelToken)
		rejectToken('cancelled')
	}

	return new Promise((resolve, reject) => {
		rejectToken = reject
		cancelToken = setTimeout(() => resolve(++cancellableFnCallCount))
	})
}

beforeEach(() => {
	cancellableFnCallCount = 0
})

describe('useAsync', () => {

	it('Should return [execute, state, cancel, setState]', () => {
		const [ , hook ] = getHook()
		const [ execute, state, cancel, resetState, setState ] = hook.result.current

		//state
		expect(Object.keys(state).length).toBe(5)
		expect(state.args).toBeNull()
		expect(state.data).toBeNull()
		expect(state.error).toBeNull()
		expect(state.isPending).toBe(false)
		expect(state.status).toBe('idle')

		//execute, cancel, setState
		expect(typeof execute).toBe('function')
		expect(typeof cancel).toBe('function')
		expect(typeof resetState).toBe('function')
		expect(typeof setState).toBe('function')
	})

	it('"execute","cancel" and "setState" should return the same instance on rerender', () => {
		const [ , { result, rerender } ] = getHook()
		const [ execute, , cancel, resetState, setState ] = result.current
		rerender()
		expect(result.current[ 0 ]).toBe(execute)
		expect(result.current[ 2 ]).toBe(cancel)
		expect(result.current[ 3 ]).toBe(resetState)
		expect(result.current[ 4 ]).toBe(setState)
	})

	describe('options', () => {

		describe('defaultData', () => {

			it('Should set initial "state.data"', () => {
				const [ , hook ] = getHook({ defaultData: [ 0 ] })
				expect(hook.result.current[ 1 ].data).toEqual([ 0 ])
			})

			it('change should reflect', () => {
				const [ , hook ] = getHook({ defaultData: [ 0 ] })
				hook.rerender({ defaultData: [ 1 ] })
				const [ , , , resetState ] = hook.result.current

				act(() => {
					resetState()
				})
				expect(hook.result.current[ 1 ].data).toEqual([ 1 ])
			})
		})

		describe('debounceTime', () => {

			it('Should execute only once after X time', async done => {
				const [ spy, hook ] = getHook({ debounceTime: 20 })
				const [ execute ] = hook.result.current

				await act(async () => {
					execute()
					execute()
					execute()
					expect(spy).toBeCalledTimes(0)
					await waitForMs(25)
					expect(spy).toBeCalledTimes(1)
				})
				done()
			})

			it('change should reflect', async done => {
				const [ spy, hook ] = getHook({ debounceTime: 20 })
				hook.rerender({ debounceTime: 10 })
				const [ execute ] = hook.result.current

				await act(async () => {
					execute()
					expect(spy).toBeCalledTimes(0)
					await waitForMs(15)
					expect(spy).toBeCalledTimes(1)
				})
				done()
			})
		})

		describe('throttleTime', () => {

			it('Should execute only once within X time', async done => {
				const [ spy, hook ] = getHook({ throttleTime: 50 })
				const [ execute ] = hook.result.current

				await act(async () => {
					await execute(0)
					await execute(1)
					await execute(2)
				})
				expect(spy).toBeCalledTimes(1)
				expect(hook.result.current[ 1 ].data).toEqual([ 0 ])
				await waitForMs(50)

				await act(async () => {
					await execute(3)
					await execute(4)
					await execute(5)
				})
				expect(spy).toBeCalledTimes(2)
				expect(hook.result.current[ 1 ].data).toEqual([ 3 ])
				done()
			})

			it('change should reflect', async done => {
				const [ spy, hook ] = getHook({ throttleTime: 50 })
				hook.rerender({ throttleTime: 25 })
				const [ execute ] = hook.result.current

				await act(async () => {
					await execute(0)
					await execute(1)
					await execute(2)
				})
				expect(spy).toBeCalledTimes(1)
				expect(hook.result.current[ 1 ].data).toEqual([ 0 ])
				await waitForMs(25)

				await act(async () => {
					await execute(3)
					await execute(4)
					await execute(5)
				})
				expect(spy).toBeCalledTimes(2)
				expect(hook.result.current[ 1 ].data).toEqual([ 3 ])
				done()
			})
		})

		describe('withTrailing', () => {

			it('Should call the trailing call after X time', async done => {
				const [ spy, hook ] = getHook({ throttleTime: 20, withTrailing: true })
				const [ execute ] = hook.result.current

				const consoleError = console.error
				console.error = noop

				await act(async () => {
					await execute(0)
					execute(1)
					execute(2)
				})
				expect(spy).toBeCalledTimes(1)
				expect(hook.result.current[ 1 ].data).toEqual([ 0 ])
				await waitForMs(25)
				expect(spy).toBeCalledTimes(2)
				expect(hook.result.current[ 1 ].data).toEqual([ 2 ])

				console.error = consoleError
				done()
			})

			it('change should refect', async done => {
				const [ spy, hook ] = getHook({ throttleTime: 20, withTrailing: true })
				hook.rerender({ throttleTime: 20, withTrailing: false })
				const [ execute ] = hook.result.current

				await act(async () => {
					await execute(0)
					await execute(1)
					await execute(2)
				})
				expect(spy).toBeCalledTimes(1)
				await waitForMs(25)
				expect(spy).toBeCalledTimes(1)
				done()
			})
		})

		describe('throttleLimit', () => {

		})
		describe('staleTime', () => {

		})

		describe('caseSensitiveCache', () => {

		})

		describe('resetDataOnError', () => {

		})

		describe('disableCache', () => {

			it('{disabledCache:false} Should execute(args) if no cache.get(...args) or cache.get(...args).isStale', async done => {
				const [ spy, { result } ] = getHook({ staleTime: 10 })
				const [ execute ] = result.current

				//no cache
				await act(async () => {
					await execute(0)
				})
				expect(spy).toBeCalledTimes(1)

				//isStale === false
				await act(async () => {
					await execute(0)
				})
				expect(spy).toBeCalledTimes(1)

				//isStale === true
				await waitForMs(10)

				await act(async () => {
					await execute(0)
				})
				expect(spy).toBeCalledTimes(2)
				done()
			})

			it('{disabledCache:false} execute(arg) first call should execute normally, second call should return the cached value', async done => {
				const [ spy, { result } ] = getHook({ staleTime: 20 })
				const [ execute ] = result.current

				//create cache for 0
				await act(async () => {
					await execute(0)
				})
				await waitForMs(1)
				expect(spy).toBeCalledTimes(1)
				expect(result.current[ 1 ].data).toEqual([ 0 ])

				//change state.data to 1
				await act(async () => {
					await execute(1)
				})
				await waitForMs(1)
				expect(spy).toBeCalledTimes(2)
				expect(result.current[ 1 ].data).toEqual([ 1 ])

				//use cache for 0 => should not execute spy but should update the data
				await act(async () => {
					await execute(0)
				})
				await waitForMs(1)
				expect(spy).toBeCalledTimes(2)
				expect(result.current[ 1 ].data).toEqual([ 0 ])
				done()
			})

			it('{disableCache:true} every call should execute', noop)

			it('change should reflect', noop)
		})
	})

	describe('cancel', () => {

		it('"state.status" should be "cancelled" when cancelling during debouncing fase, should not execute', async done => {
			const [ spy, hook ] = getHook({ debounceTime: 10 })
			const [ execute, , cancel ] = hook.result.current

			act(() => {
				execute()
				cancel()
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(spy).toBeCalledTimes(0)
			done()
		})

		it('"state.status" should be "cancelled" when cancelling during promise execution fase, should not execute', async done => {
			const hook = renderHook(() => useAsync(cancellableFn))
			const [ execute, , cancel ] = hook.result.current

			await act(async () => {
				await execute()
				// cancel()
			})
			expect(hook.result.current[ 1 ].status).not.toBe('cancelled')
			expect(cancellableFnCallCount).toBe(1)

			await act(async () => {
				const promise = execute()
				cancel()
				await promise
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(cancellableFnCallCount).toBe(1)
			done()
		})

		it('cancel(...) when there is a trailing call should cancel the trailing call but not change the state', async done => {
			const hook = renderHook(() => useAsync(cancellableFn, { throttleTime: 10, withTrailing: true }))
			const [ execute, , cancel ] = hook.result.current

			let state;

			await act(async () => {
				await execute(0)
				state = hook.result.current[ 1 ]
				execute(1)
				cancel()
			})
			await waitForMs(20)

			expect(cancellableFnCallCount).toBe(1)
			expect(state).toEqual(hook.result.current[ 1 ])
			done()
		})

		it('While executing cancel(true) should reset "state.data"', () => {
			const hook = renderHook(() => useAsync(cancellableFn, { debounceTime: 0, withTrailing: true }))
			let [ execute, , cancel, , setState ] = hook.result.current

			act(() => {
				setState({ data: 'someData' })
				execute(0)
				cancel(true)
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(hook.result.current[ 1 ].data).toBeNull()
		})

		it('While debouncing cancel(true) should reset "state.data"', () => {
			const hook = renderHook(() => useAsync(cancellableFn, { debounceTime: 10, withTrailing: true }))
			let [ execute, , cancel, , setState ] = hook.result.current

			act(() => {
				setState({ data: 'someData' })
				execute(0)
				cancel(true)
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(hook.result.current[ 1 ].data).toBeNull()
		})

		it('While executing cancel(false) should NOT reset "state.data"', () => {
			const hook = renderHook(() => useAsync(cancellableFn, { debounceTime: 0, withTrailing: false }))
			const [ execute, , cancel, , setState ] = hook.result.current

			act(() => {
				setState({ data: 'someData' })
				execute(0)
				cancel(false)
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(hook.result.current[ 1 ].data).toBe('someData')
		})

		it('While debouncing cancel(false) should NOT reset "state.data"', () => {
			const hook = renderHook(() => useAsync(cancellableFn, { debounceTime: 10, withTrailing: false }))
			const [ execute, , cancel, , setState ] = hook.result.current

			act(() => {
				setState({ data: 'someData' })
				execute(0)
				cancel(false)
			})
			expect(hook.result.current[ 1 ].status).toBe('cancelled')
			expect(hook.result.current[ 1 ].data).toBe('someData')
		})
	})
})