import React, { useState, useEffect } from 'react';
import { useDebounce } from '../src/hooks';

interface Args {
	time: number,
	isAsync: boolean
}

export default {
	title: 'components/useDebounce',
	args: {
		time: 1000,
		isAsync: true
	}
}

export const Demo = ({ time, isAsync }: Args) => {

	const [ value, setValue ] = useState<string>('')
	const [ calledWithValue, setCalledWithValue ] = useState()
	const [ promiseReturn, setPromiseReturn ] = useState<any>()

	function callback(value): Promise<string> {
		setCalledWithValue(value)
		return isAsync ? Promise.resolve(value) : value
	}

	const [ debounced, cancel ] = useDebounce(callback, time)

	useEffect(() => {
		debounced(value).then((value: string) => setPromiseReturn(value))
	}, [ value, debounced ])

	return (
		<div>
			<input value={value} onChange={e => setValue(e.target.value)} />
			<h1>Last called with: {calledWithValue}</h1>
			<h1>Promise Returned: {promiseReturn}</h1>
			<button onClick={cancel}>Cancel</button>
		</div>
	)
}
