import React, { useState, useEffect } from 'react';
import { useAsyncFn } from '../hooks'
import fetchDummy from '../API/fetchDummy'

export function UseAsyncFn() {
	const [id, setId] = useState(1)
	const [state, asyncFetchDummy, cancel, setState] = useAsyncFn(fetchDummy)

	useEffect(() => {
		asyncFetchDummy(id)
	}, [id, asyncFetchDummy])

	return (
		<>
			<button onClick={ () => setId(id => id + 1) }>Increment ID</button>
			{ id }
			<button onClick={ () => setId(id => id - 1) }>Decrement ID</button>
			<div>data: { JSON.stringify(state.data) }</div>
			<div>status: { state.status }</div>
			<div>isPending: { state.isPending }</div>
			<div>error: { JSON.stringify(state.error, null, 5) }</div>
			<button onClick={ () => cancel(true) }>Cancel</button>
		</>
	)
}
