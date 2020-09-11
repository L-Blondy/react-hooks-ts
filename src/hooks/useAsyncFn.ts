import { useCallback, useRef } from 'react';
import { useSetState, useMountedState } from './';
import { AsyncReturnType, AsyncFunction } from '../types';
import { SetState } from './useSetState'

interface PromiseWithCancelFn<T extends unknown> extends Promise<T> {
	cancel?: () => void
}

type State<T extends AsyncFunction> = {
	isPending: boolean,
	status: 'idle' | 'pending' | 'success' | 'error' | 'cancelled',
	error: null | Error,
	data: null | AsyncReturnType<T>,
	args: null | Parameters<T>
}

const useAsyncFn = function <Cb extends AsyncFunction>(
	callback: Cb,
): [ State<Cb>, (...args: Parameters<Cb>) => void, (reset?: boolean) => void, SetState<State<Cb>> ] {

	const callbackRef = useRef(callback)
	const lastCallID = useRef(0)
	const isMounted = useMountedState()
	const cancelRequest = useRef(() => { })

	const [ state, setState ] = useSetState<State<Cb>>({
		isPending: false,
		status: 'idle',
		error: null,
		data: null,
		args: null
	})

	const execute = useCallback((...args: Parameters<Cb>) => {
		const callID = ++lastCallID.current

		cancelRequest.current()

		setState({
			args,
			isPending: true,
			status: 'pending',
		})

		const promise: PromiseWithCancelFn<any> = callbackRef.current(...args)
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
				setState({
					error,
					args,
					data: null,
					isPending: false,
					status: 'error',
				})
			})
	}, [ setState, isMounted ])

	const cancel = useCallback((reset: boolean = false) => {
		cancelRequest.current()
		setState(() => {
			return reset
				? ({
					data: null,
					args: null,
					isPending: false,
					status: 'cancelled',
				}) : ({
					isPending: false,
					status: 'cancelled',
				})

		})
	}, [ setState ])

	return [ state, execute, cancel, setState ]
}

export default useAsyncFn;

