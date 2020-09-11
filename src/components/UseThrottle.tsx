import React, { useState } from 'react';
import { useThrottle } from '../hooks'

export function ThrottleNormalFunction() {
	const [ count, setCount ] = useState(0)
	const increment = (count: number) => {
		setCount(count + 1)
		return count
	}
	const incrementThrottled = useThrottle(increment, 1000, 3)

	return (
		<button onClick={() => incrementThrottled(count)}>
			{count}
		</button>
	)
}

export function ThrottleAsyncFunction() {
	const [ count, setCount ] = useState(0)

	const APIcall = () => new Promise<number>(resolve => resolve(count + 1))
		.then(count => {
			setCount(count)
			return count
		})

	const APIcallThrottled = useThrottle(APIcall, 1000, 3)

	return (
		<button onClick={APIcallThrottled} >
			{count}
		</button>
	)
}
