import React, { useState, useEffect } from 'react'
import useAsync, { UseAsyncOptions } from '../hooks/useAsync'
import fetchDummy, { DummyData } from '../API/fetchDummy'
import fetchDummyAxios from '../API/fetchDummyAxios'
import fetchDummyFast from '../API/fetchDummyFast'

interface Args<Cb> {
	withDataReset: boolean,
	useAxios: boolean,
	fastAPI: boolean,
	options: UseAsyncOptions<Cb>,
}

export function UseAsync({ options, useAxios, withDataReset, fastAPI }: Args<typeof fetchDummy>) {
	const [ id, setId ] = useState(1)
	const [ state, asyncFetchDummy, cancel, setState ] = useAsync(
		fastAPI ? fetchDummyFast : useAxios ? fetchDummyAxios : fetchDummy,
		options
	)
	const test = useAsync(fetchDummyFast, {})
	useEffect(() => {
		asyncFetchDummy(id)
	}, [ id, asyncFetchDummy ])

	return (
		<>
			<button onClick={() => cancel(withDataReset)}>Cancel</button>
			<br />
			<button onClick={() => setId(id => id + 1)}>Increment ID</button>
			{ id}
			<button onClick={() => setId(id => id - 1)}>Decrement ID</button>
			<div>data: {JSON.stringify(state.data)}</div>
			<div>status: {state.status}</div>
			<div>isPending: {JSON.stringify(state.isPending)}</div>
			<div>error: {JSON.stringify(state.error, null, 5)}</div>
		</>
	)
}

export default UseAsync
