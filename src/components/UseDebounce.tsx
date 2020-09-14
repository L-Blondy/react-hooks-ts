import React, { useState } from 'react';
import { useDebounce } from '../hooks'
import fetchDummy, { DummyData } from '../API/fetchDummy'

export function DebounceNormalFunction() {
	const [count, setCount] = useState(0)
	const increment = (count: number) => {
		setCount(count + 1)
		return count
	}
	const incrementDebounced = useDebounce(increment, 1000)

	const handleClick = () => {
		incrementDebounced(count).then(() => console.log('resolve'))
	}

	return (
		<>
			<button onClick={ handleClick }>
				{ count }
			</button>
			<br />
			<br />
			<button onClick={ incrementDebounced.cancel }>
				Cancel
			</button>
		</>
	)
}

export function DebounceAsyncFunction() {
	const [data, setData] = useState<DummyData>()
	const [count, setCount] = useState(1)

	const fetchDummyDebounced = useDebounce(fetchDummy, 1000)

	const handleClick = () => {
		fetchDummyDebounced(count).then(data => {
			setCount(count => count + 1)
			setData(data)
		})
	}

	return (
		<>
			<button onClick={ handleClick } >
				Call Debouced Function
			</button>
			<br />
			<h4>{ JSON.stringify(data) || 'undefined' }</h4>
			<br />
			<button onClick={ fetchDummyDebounced.cancel }>
				Cancel
			</button>
		</>
	)
}
