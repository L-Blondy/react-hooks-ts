import React, { useState } from 'react'
import { fakeAPI } from '../src/API'
import { useAsyncFn } from '../src/hooks'

export default {
	title: 'components/useAsyncFn',
	args: {
		withDataReset: false
	}
}

export const Demo = ({ withDataReset }) => {

	const [ inputVal, setinputVal ] = useState('')
	const [ state, execute, cancel ] = useAsyncFn(fakeAPI(1000))

	const handleSubmit = (e) => {
		e.preventDefault()
		execute(inputVal)
	}

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input value={inputVal} onChange={e => setinputVal(e.target.value)} />
				<button type='submit'>Fetch</button>
				<button type='button' onClick={() => cancel(withDataReset)}>Cancel</button>
			</form>
			<div>
				<h1>Data: {String(state.data)}</h1>
				<h1>Error: {JSON.stringify(state.error)}</h1>
				<h1>Status: {state.status}</h1>
				<h1>isPending: {String(state.isPending)}</h1>
			</div>
		</div>
	)
}
