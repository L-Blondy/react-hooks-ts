import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useAsyncFn from '../src/hooks/useAsyncFn'
import { waitForMs } from '../src/utils'

function getHook({ defaultData = null } = {}) {
	const spy = jest.fn((...x: any[]) => Promise.resolve(...x))
	return [
		spy,
		renderHook(({ defaultData = null }) => useAsyncFn(spy, { defaultData }), {
			initialProps: { defaultData }
		})
	] as const
}

describe('useAsyncFn', () => {

	it('Should return [state, execute, cancel, setState]', () => {
		const [ , hook ] = getHook()
		const [ state, execute, cancel, setState ] = hook.result.current

		//state
		expect(state.args).toBeDefined()
		expect(state.data).toBeDefined()
		expect(state.error).toBeDefined()
		expect(state.isPending).toBeDefined()
		expect(state.status).toBeDefined()

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
		const [ state ] = hook.result.current
		expect(state.data).toEqual([])
	})

	it('"execute" should call the callback', async done => {
		const [ spy, hook ] = getHook({ defaultData: [] })
		const [ , execute ] = hook.result.current

		await act(async () => {
			await execute()
		})
		expect(spy).toBeCalledTimes(1)
		done()
	})

	it('"state.args" should match the arguments passed in "execute"', async done => {
		const [ , hook ] = getHook()
		const [ , execute ] = hook.result.current

		await act(async () => {
			await execute(0, 1, 2)
		})
		expect(hook.result.current[ 0 ].args).toEqual([ 0, 1, 2 ])
		done()
	})

	it('chained execution should immediately "state.status":"pending" && "isPending":"true"', async done => {
		const originalError = console.error;
		console.error = () => { }

		const [ , { result } ] = getHook()
		const [ , execute ] = result.current

		act(async () => {
			await execute()
		})
		expect(result.current[ 0 ].isPending).toBe(true)
		expect(result.current[ 0 ].status).toBe('pending')

		act(async () => {
			await execute()
			console.error = originalError
		})
		expect(result.current[ 0 ].isPending).toBe(true)
		expect(result.current[ 0 ].status).toBe('pending')
		done()
	})

	it('callback rejection should set "state.status":"error", "state.isPending":"false", "state.error":"{...}"', async done => {

		done()
	})

	it('callback resolution should set "state.status":"success", "state.isPending":"false", "state.data":"..."', async done => {

		done()
	})

	it('callback rejection success should?????????? reset "state.data":"defaultData"', async done => { //????????

		done()
	})

	it('callback resolution success should reset "state.error":"null"', async done => {

		done()
	})

	it('"cancel(true)" should reset "state.data"', async done => {

		done()
	})

	it('"cancel(false)" should not change "state.data"', async done => {

		done()
	})
})