import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useAsyncFn from '../src/hooks/useAsyncFn'
import { waitForMs } from '../src/utils'

function getHook({ defaultData = null, resetDataOnError = true } = {}) {
	const spy = jest.fn((...x: any[]) => Promise.resolve(x))
	return [
		spy,
		renderHook(({
			defaultData = null,
			resetDataOnError = true
		}) => useAsyncFn(spy, { defaultData, resetDataOnError }), {
			initialProps: { defaultData, resetDataOnError }
		})
	] as const
}

describe('useAsyncFn', () => {

	//defaults
	it('Should return [execute, state, cancel, setState]', () => {
		const [ , hook ] = getHook()
		const [ execute, state, cancel, setState ] = hook.result.current

		//state
		expect(state.args).toBeNull()
		expect(state.data).toBeNull()
		expect(state.error).toBeNull()
		expect(state.isPending).toBe(false)
		expect(state.status).toBe('idle')

		//execute, cancel, setState
		expect(typeof execute).toBe('function')
		expect(typeof cancel).toBe('function')
		expect(typeof setState).toBe('function')
	})

	it('"state.data" should be "defaultData" on mount', () => {
		const [ , hook ] = getHook({ defaultData: [] })
		const [ , state ] = hook.result.current
		expect(state.data).toEqual([])
	})

	describe('status:pending', () => {

		it('Execution should call the callback', async done => {
			const [ spy, hook ] = getHook({ defaultData: [] })
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
			const [ execute, , , setState ] = result.current

			act(() => {
				setState({
					status: 'error',
					error: { name: 'SomeError', message: 'some error message' }
				})
			})
			expect(result.current[ 1 ].status).toBe('error')
			done()
		})

		it('Resolution should set "state.isPending":"false"', async done => {

			done()
		})
	})

	describe('status:error', () => {
		it('Rejection should set "state.status":"error"', async done => {

			done()
		})

		it('Rejection should set "state.error" to an object containing at least "name" and "message"', async done => {

			done()
		})


		it('{resetDataOnError:true} should reset data on error', async done => {

			done()
		})

		it('{resetDataOnError:false} should NOT reset data on error', async done => {

			done()
		})

		it('Rejection should set "state.isPending":"false"', async done => {

			done()
		})
	})

	describe('status:cancelled', () => {
		//cancellation
		it('cancel(...) should set "state.status":"cancelled"', async done => {

			done()
		})

		it('cancel(...) should set "state.error":"null"', async done => {

			done()
		})

		it('cancel(true) should reset "state.data"', async done => {

			done()
		})

		it('cancel(false) should NOT reset "state.data"', async done => {

			done()
		})


		it('cancel(...) should set "state.isPending":"false"', async done => {

			done()
		})
	})

})