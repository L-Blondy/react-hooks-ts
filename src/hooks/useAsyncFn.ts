
import { useCallback, useRef, useEffect } from 'react';
import { useSetState, useMountedState } from './';
import { AsyncReturnType, AsyncFunction, PromiseWithCancel } from '../types';
import { SetState } from './useSetState'

export interface UseAsyncFnOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
}

const useAsyncFn = function <Cb extends AsyncFunction>(
	callback: Cb,
	{
		defaultData = null,
	}: UseAsyncFnOptions<Cb> = {}
) {

	type ReturnTuple = [
		{
			isPending: boolean,
			status: 'idle' | 'pending' | 'success' | 'error' | 'cancelled',
			error: null | Error,
			data: null | AsyncReturnType<Cb>,
			args: null | Parameters<Cb>
		},
		(...args: Parameters<Cb>) => void,
		(withDataReset: boolean) => void,
		SetState<{
			isPending: boolean,
			status: 'idle' | 'pending' | 'success' | 'error' | 'cancelled',
			error: null | Error,
			data: null | AsyncReturnType<Cb>,
			args: null | Parameters<Cb>
		}>
	]

	const withDataResetRef = useRef(false)
	const callbackRef = useRef(callback)
	const lastCallID = useRef(0)
	const isMounted = useMountedState()
	const cancelRequest = useRef(() => { })

	useEffect(() => {
		callbackRef.current = callback
	})

	const [ state, setState ] = useSetState<ReturnTuple[ 0 ]>({
		isPending: false,
		status: 'idle',
		error: null,
		data: defaultData,
		args: null
	})

	const execute: ReturnTuple[ 1 ] = useCallback((...args: Parameters<Cb>) => {
		const callID = ++lastCallID.current

		cancelRequest.current()

		setState({
			args,
			isPending: true,
			status: 'pending',
		})

		const promise: PromiseWithCancel<any> = callbackRef.current(...args)
		cancelRequest.current = promise.cancel || (() => { })

		promise
			.then((data: AsyncReturnType<Cb>) => {
				if (!isMounted() || callID !== lastCallID.current) return
				setState({
					data,
					args,
					isPending: false,
					error: null,
					status: 'success',
				})
			})
			.catch(error => {

				if (!isMounted() || callID !== lastCallID.current) return
				setState(state => {
					return ({
						error: { ...error, name: error.name, message: error.message },
						args,
						data: withDataResetRef.current ? defaultData : state.data,
						isPending: false,
						status: 'error',
					})
				})
			})
	}, [ setState, isMounted, defaultData ])

	const cancel: ReturnTuple[ 2 ] = useCallback((withDataReset: boolean) => {
		withDataResetRef.current = withDataReset
		cancelRequest.current() //should create an error
	}, [ setState, state ])

	return [ state, execute, cancel, setState ] as ReturnTuple
}

export default useAsyncFn;

