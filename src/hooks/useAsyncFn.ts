import { useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { useSetState, useMountedState } from './';
import { AsyncReturnType, AsyncFunction, PromiseWithCancel, CancellableAsyncFn } from '../types';
import { SetState } from './useSetState'

export interface UseAsyncFnOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
	resetDataOnError?: boolean
}

const useAsyncFn = function <Cb extends CancellableAsyncFn>(
	callback: Cb,
	{
		defaultData = null,
		resetDataOnError = true
	}: UseAsyncFnOptions<Cb> = {}
) {

	type ReturnTuple = [
		(...args: Parameters<Cb>) => Promise<void>,
		{
			isPending: boolean,
			status: 'idle' | 'pending' | 'success' | 'error' | 'cancelled',
			error: null | Error,
			data: null | AsyncReturnType<Cb>,
			args: null | Parameters<Cb>
		},
		(withDataReset: boolean) => void,
		SetState<{
			isPending: boolean,
			status: 'idle' | 'pending' | 'success' | 'error' | 'cancelled',
			error: null | Error,
			data: null | AsyncReturnType<Cb>,
			args: null | Parameters<Cb>
		}>
	]

	const resetDataOnCancelRef = useRef(false)
	const callbackRef = useRef(callback)
	const lastCallID = useRef(0)
	const resetDataOnErrorRef = useRef(resetDataOnError)
	const isMounted = useMountedState()
	const hasBeenCancelledRef = useRef(false)

	const [ state, setState ] = useSetState<ReturnTuple[ 1 ]>({
		isPending: false,
		status: 'idle',
		error: null,
		data: defaultData,
		args: null
	})

	useEffect(() => {
		callbackRef.current = callback
		resetDataOnErrorRef.current = resetDataOnError
	})

	const cancel: ReturnTuple[ 2 ] = useCallback((withDataReset: boolean) => {
		resetDataOnCancelRef.current = withDataReset
		callbackRef.current.cancel?.()
		hasBeenCancelledRef.current = true
	}, [ callbackRef, callbackRef.current ])

	const execute: ReturnTuple[ 0 ] = useCallback((...args: Parameters<Cb>) => {
		callbackRef.current.cancel?.()
		const callID = ++lastCallID.current
		hasBeenCancelledRef.current = false

		setState({
			args,
			isPending: true,
			status: 'pending',
		})

		return new Promise(resolve => callbackRef.current(...args)
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

				if (hasBeenCancelledRef.current) {
					setState(state => ({
						isPending: false,
						status: 'cancelled',
						error: null,
						data: resetDataOnCancelRef.current ? defaultData : state.data,
						args
					}))
					return
				}

				error = typeof error === 'string'
					? { name: 'Error', message: error }
					: { ...error, name: error.name, message: error.message }

				setState(state => ({
					error,
					args,
					data: resetDataOnErrorRef.current ? defaultData : state.data,
					isPending: false,
					status: 'error',
				}))
			})
			.finally(resolve)
		)
	}, [ setState, isMounted, defaultData ])

	return [ execute, state, cancel, setState ] as ReturnTuple
}

export default useAsyncFn;

