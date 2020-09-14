import React, { useState, useEffect } from 'react';
import useAsyncFn, { UseAsyncFnOptions } from '../hooks/useAsyncFn'
import fetchDummy, { DummyData } from '../API/fetchDummy'
import fetchDummyAxios from '../API/fetchDummyAxios'

export function UseAsyncFn({ useAxios, withDataReset }: { useAxios: boolean, withDataReset: boolean }) {
	const [ id, setId ] = useState(1)
	const [ state, asyncFetchDummy, cancel, setState ] = useAsyncFn(useAxios ? fetchDummyAxios : fetchDummy)

	useEffect(() => {
		asyncFetchDummy(id)
	}, [ id, asyncFetchDummy ])

	return (
		<>
			<button onClick={() => setId(id => id + 1)}>Increment ID</button>
			{ id}
			<button onClick={() => setId(id => id - 1)}>Decrement ID</button>
			<div>data: {JSON.stringify(state.data)}</div>
			<div>status: {state.status}</div>
			<div>isPending: {JSON.stringify(state.isPending)}</div>
			<div>error: {JSON.stringify(state.error, null, 5)}</div>
			<button onClick={() => cancel(withDataReset)}>Cancel</button>
		</>
	)
}
