import '@testing-library/jest-dom/extend-expect';
import { renderHook, act } from '@testing-library/react-hooks'
import useAsyncFn from '../src/hooks/useAsyncFn'
import { CancellableAsyncFn } from '../src/types'

interface GetHookOptions {
	defaultData?: any,
	resetDataOnError?: boolean
}

const cancellableFn: CancellableAsyncFn = (x) => {
	let cancelToken

	cancellableFn.cancel = () => {
		clearTimeout(cancelToken)
	}

	return new Promise((resolve, reject) => {
		cancelToken = setTimeout(() => resolve(x))
	})
}

function getHook(
	spyType: 'resolve' | 'reject' | 'cancel' = 'resolve',
	{
		defaultData = null,
		resetDataOnError = true
	}: GetHookOptions = {}) {
	const spy = spyType === 'resolve'
		? jest.fn((...x: any[]) => Promise.resolve(x))
		: spyType === 'reject'
			? jest.fn(() => Promise.reject('rejection'))
			: cancellableFn

	return [
		spy,
		renderHook(({
			defaultData = null,
			resetDataOnError = true
		}: GetHookOptions) => useAsyncFn(spy, { defaultData, resetDataOnError }), {
			initialProps: { defaultData, resetDataOnError }
		})
	] as const
}

describe('useAsyncFn', () => {

	it('Should return [execute, state, cancel,resetState, setState]', () => {
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

	it('"execute","cancel","resetState" and "setState" should return the same instance on rerender', () => {
		const [ , { result, rerender } ] = getHook()
		const [ execute, , cancel, resetState, setState ] = result.current
		rerender()
		expect(result.current[ 0 ]).toBe(execute)
		expect(result.current[ 2 ]).toBe(cancel)
		expect(result.current[ 3 ]).toBe(resetState)
		expect(result.current[ 4 ]).toBe(setState)
	})

	it('"resetState" should be aware of "defaultData" change', () => {
		const [ , { result, rerender } ] = getHook()
		rerender({ defaultData: 1 })
		const [ , , , resetState ] = result.current

		act(() => {
			resetState()
		})
		expect(result.current[ 1 ].data).toBe(1)
	})

	describe('options', () => {

		it('"state.data" should match option "defaultData" on mount', () => {
			const [ , hook ] = getHook('resolve', { defaultData: [] })
			const [ , state ] = hook.result.current
			expect(state.data).toEqual([])
		})

		it('"defaultData" change should reflect', () => {
			const [ , hook ] = getHook('resolve', { defaultData: null })
			const [ execute, , cancel ] = hook.result.current

			hook.rerender({ defaultData: [] })
			act(() => {
				execute()
				cancel(true)
			})
			expect(hook.result.current[ 1 ].data).toEqual([])
		})

		it('"resetDataOnError" change should reflect', async done => {
			const [ , hook ] = getHook('reject', { resetDataOnError: true })
			const [ execute, , , , setState ] = hook.result.current
			hook.rerender({ resetDataOnError: false })
			await act(async () => {
				setState({ data: 'some dummy data' })
				await execute()
			})
			expect(hook.result.current[ 1 ].data).toBe('some dummy data')
			done()
		})
	})

	describe('status:pending', () => {

		it('Execution should call the callback', async done => {
			const [ spy, hook ] = getHook('resolve', { defaultData: [] })
			const [ execute ] = hook.result.current

			await act(async () => {
				await execute()
			})
			expect(spy).toBeCalledTimes(1)
			done()
		})

		it('Execution should set "state.args":"(args passed in execute())"', async done => {
			const [ , hook ] = getHook()
			const [ execute ] = hook.result.current

			await act(async () => {
				await execute(0, 1, 2)
			})
			expect(hook.result.current[ 1 ].args).toEqual([ 0, 1, 2 ])
			done()
		})

		it('Execution should set "state.status":"pending"', async done => {
			const originalError = console.error;
			console.error = () => { }

			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			act(async () => {
				await execute()
				console.error = originalError
			})
			expect(result.current[ 1 ].status).toBe('pending')
			done()
		})

		it('Execution should set "state.isPending":"true"', async done => {
			const originalError = console.error;
			console.error = () => { }

			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			act(async () => {
				await execute()
				console.error = originalError
			})
			expect(result.current[ 1 ].isPending).toBe(true)
			done()
		})

		it('Chained execution should never set "state.status":"error"', async done => {
			//unreliable test
			const originalError = console.error;
			console.error = () => { }

			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].status).toBe('pending')

			act(async () => {
				await execute()
				console.error = originalError
			})
			expect(result.current[ 1 ].isPending).toBe(true)
			expect(result.current[ 1 ].status).toBe('pending')
			done()
		})
	})

	describe('status:success', () => {

		it('Resolution should set "state.status":"success"', async done => {
			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].status).toBe('success')
			done()
		})

		it('Resolution should set "state.data":"any"', async done => {
			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			await act(async () => {
				await execute('arg1', 'arg2')
			})
			expect(result.current[ 1 ].data).toEqual([ 'arg1', 'arg2' ])
			done()
		})

		it('Resolution should set "state.error":"null"', async done => {
			const [ , { result } ] = getHook()
			const [ execute, , , , setState ] = result.current

			act(() => {
				setState({
					status: 'error',
					error: { name: 'SomeError', message: 'some error message' }
				})
			})
			expect(result.current[ 1 ].status).toBe('error')
			expect(result.current[ 1 ].error).toEqual({ name: 'SomeError', message: 'some error message' })

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].error).toBeNull()
			done()
		})

		it('Resolution should set "state.isPending":"false"', async done => {
			const [ , { result } ] = getHook()
			const [ execute ] = result.current

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].isPending).toBe(false)
			done()
		})
	})

	describe('status:error', () => {
		it('Rejection should set "state.status":"error"', async done => {
			const [ , { result } ] = getHook('reject')
			const [ execute ] = result.current

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].status).toBe('error')
			done()
		})

		it('Rejection should set "state.error" to an object containing at least "name" and "message"', async done => {
			const [ , { result } ] = getHook('reject')
			const [ execute ] = result.current

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].error).toEqual({ name: 'Error', message: 'rejection' })
			done()
		})


		it('{resetDataOnError:true} should reset data on error', async done => {
			const [ , { result } ] = getHook('reject')
			const [ execute, , , , setState ] = result.current

			act(() => {
				setState({ data: [ 'someData' ] })
			})

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].data).toBeNull()
			done()
		})

		it('{resetDataOnError:false} should NOT reset data on error', async done => {
			const [ , { result } ] = getHook('reject', { resetDataOnError: false })
			const [ execute, , , , setState ] = result.current

			act(() => {
				setState({ data: [ 'someData' ] })
			})

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].data).toEqual([ 'someData' ])
			done()
		})

		it('Rejection should set "state.isPending":"false"', async done => {
			const [ , { result } ] = getHook('reject')
			const [ execute ] = result.current

			await act(async () => {
				await execute()
			})
			expect(result.current[ 1 ].isPending).toBe(false)
			done()
		})
	})

	describe('status:cancelled', () => {

		it('cancel(...) should do nothing if "state.status" is not "pending"', () => {
			const [ , { result } ] = getHook('cancel')
			const [ , , cancel ] = result.current

			act(() => {
				cancel(true)
			})
			expect(result.current[ 1 ].status).toBe('idle')
		})

		it('cancel(...) should set "state.status":"cancelled"', () => {
			const [ , { result } ] = getHook('cancel')
			const [ execute, , cancel ] = result.current

			act(() => {
				execute()
				cancel(true)
			})
			expect(result.current[ 1 ].status).toBe('cancelled')
		})

		it('cancel(...) should set "state.error":"null"', () => {
			const [ , { result } ] = getHook('cancel')
			const [ execute, , cancel, , setState ] = result.current

			act(() => {
				setState({ error: { name: 'SomeError', message: 'some error message' } })
			})

			act(() => {
				execute()
				cancel(true)
			})
			expect(result.current[ 1 ].error).toBeNull()
		})

		it('cancel(true) should reset "state.data"', () => {
			let [ , { result } ] = getHook('cancel')
			let [ execute, , cancel, , setState ] = result.current

			act(() => {
				setState({ data: 'someData' })
			})

			act(() => {
				execute()
				cancel(true)
			})
			expect(result.current[ 1 ].data).toBeNull()
		})

		it('cancel(false) should NOT reset "state.data"', () => {
			let [ , { result } ] = getHook('cancel')
			let [ execute, , cancel, , setState ] = result.current

			act(() => {
				setState({ data: 'someData' })
			})

			act(() => {
				execute()
				cancel(false)
			})
			expect(result.current[ 1 ].data).toBe('someData')
		})


		it('cancel(...) should set "state.isPending":"false"', () => {
			const [ , { result } ] = getHook('cancel')
			const [ execute, , cancel ] = result.current

			act(() => {
				execute()
				cancel(true)
			})
			expect(result.current[ 1 ].isPending).toBe(false)
		})
	})

})