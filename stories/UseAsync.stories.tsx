import React, { useState } from 'react'
import { fakeAPI } from '../src/API'
import { useAsync } from '../src/hooks'

export default {
	title: 'components/useAsync',
	args: {
		defaultData: 'this is my default data',
		debounceTime: 0,
		throttleTime: 0,
		throttleLimit: 1,
		withTrailing: false,
		staleTime: Number.MAX_VALUE,
		disableCache: false,
		caseSensitiveCache: false,
		resetDataOnError: true,
		resetDataOnCancel: false
	}
}

export const Demo = ({ resetDataOnCancel, ...options }) => {
	const [ inputVal, setInputVal ] = useState('default')
	const [ execute, state, cancel ] = useAsync(fakeAPI, options)

	const handleSubmit = (e) => {
		e.preventDefault()
		execute(inputVal)
	}

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input value={inputVal} onChange={e => setInputVal(e.target.value)} />
				<button type='submit'>Fetch</button>
				<button type='button' onClick={() => cancel(resetDataOnCancel)}>Cancel</button>
			</form>
			<div>
				<h1>Data: {String(state.data)}</h1>
				<h1>Error: {JSON.stringify(state.error)}</h1>
				<h1>Status: {state.status}</h1>
				<h1>isPending: {String(state.isPending)}</h1>
				<h1>Args: {String(state.args)}</h1>
			</div>
		</div>
	)
}