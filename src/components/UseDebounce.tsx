import React, { useState } from 'react';
import { useDebounce } from '../hooks'

export function DebounceNormalFunction() {
	const [ count, setCount ] = useState(0)
	const increment = (count: number) => {
		setCount(count + 1)
		return count
	}
	const [ incrementDebounced ] = useDebounce(increment, 1000)

	return (
		<button onClick={() => incrementDebounced(count)}>
			{count}
		</button>
	)
}

export function DebounceAsyncFunction() {
	const [ count, setCount ] = useState(0)

	const APIcall = () => new Promise<number>(resolve => {
		setTimeout(() => resolve(count + 1), 1000)
	}).then(count => {
		setCount(count)
		return count
	})

	const [ APIcallDebounced ] = useDebounce(APIcall, 1000)

	return (
		<button onClick={APIcallDebounced} >
			{count}
		</button>
	)
}
