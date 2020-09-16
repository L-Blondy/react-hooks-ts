import { useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { useSetState, useMountedState } from './';
import { AsyncReturnType, AsyncFunction, PromiseWithCancel, CancellableAsyncFn } from '../types';
import { SetState } from './useSetState'

export interface UseAsyncFnOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
}

const useAsyncFn = function <Cb extends CancellableAsyncFn>(
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

	const [ state, setState ] = useSetState<ReturnTuple[ 0 ]>({
		isPending: false,
		status: 'idle',
		error: null,
		data: defaultData,
		args: null
	})

	useEffect(() => {
		callbackRef.current = callback
	})

	const cancel: ReturnTuple[ 2 ] = useCallback((withDataReset: boolean) => {
		withDataResetRef.current = withDataReset
		callbackRef.current.cancel?.()
	}, [ callbackRef, callbackRef.current ])

	const execute: ReturnTuple[ 1 ] = useCallback((...args: Parameters<Cb>) => {
		callbackRef.current.cancel?.()
		const callID = ++lastCallID.current

		setState({
			args,
			isPending: true,
			status: 'pending',
		})

		callbackRef.current(...args)
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



	return [ state, execute, cancel, setState ] as ReturnTuple
}

export default useAsyncFn;

