import React, { useState, useEffect } from 'react';
import { useAsyncFn } from '../hooks'

interface PromiseWithCancel<T> extends Promise<T> {
	cancel?: () => void
}

const AsyncFn = (count: number) => {
	let cancelToken: NodeJS.Timeout;
	const promise: PromiseWithCancel<string> = new Promise((resolve, reject) => {
		cancelToken = setTimeout(() => {
			count % 3 === 0
				? reject('multiple of 3')
				: resolve('resolved ' + count)
		}, 1000)
	})

	promise.cancel = () => clearTimeout(cancelToken)

	return promise
}

export function UseAsyncFn() {

	const [ state, call, cancel, setState ] = useAsyncFn(AsyncFn)
	const [ callCount, setCallCount ] = useState(0)

	useEffect(() => {
		setCallCount(callCount => callCount + 1)
	}, [ state.data ])

	return (
		<>
			<button onClick={() => call(callCount)}>Call</button>
			<h1>Status: {state.status}</h1>
			<h1>Data: {state.data || 'null'}</h1>
			<h1>Error: {state.error || 'null'}</h1>
			<button onClick={() => cancel()}>Cancel</button>
		</>
	)
}
