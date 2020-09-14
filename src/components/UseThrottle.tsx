import React, { useState } from 'react';
import { useThrottle } from '../hooks'
import fetchDummy, { DummyData } from '../API/fetchDummy'

export interface Args {
	limit: number
}

export function ThrottleNormalFunction({ limit }: Args) {
	const [count, setCount] = useState(0)
	const increment = (count: number) => {
		setCount(count + 1)
		return count + 1
	}
	const incrementThrottled = useThrottle(increment, 1000, limit)

	const handleClick = () => {
		incrementThrottled(count).then(count => console.log(count))
	}

	return (
		<button onClick={ handleClick }>
			{ count }
		</button>
	)
}

export function ThrottleAsyncFunction({ limit }: Args) {
	const [data, setData] = useState<DummyData>()
	const [count, setCount] = useState(1)

	const fetchDummyThrottled = useThrottle(fetchDummy, 1000, limit)

	const handleClick = () => {
		fetchDummyThrottled(count).then(data => {
			setCount(count => count + 1)
			setData(data)
		})
	}

	return (
		<button onClick={ handleClick } >
			{ JSON.stringify(data) || 'undefined' }
		</button>
	)
}
