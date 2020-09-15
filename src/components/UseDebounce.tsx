import React, { useState } from 'react';
import { useDebounce } from '../hooks'
import fetchDummy, { DummyData } from '../API/fetchDummy'
import { AsyncFunction } from '../types'

export function DebounceNormalFunction() {
	const [ count, setCount ] = useState(0)
	const increment = (count: number) => {
		setCount(count + 1)
		return count
	}
	const [ incrementDebounced, cancel ] = useDebounce(increment, 1000)

	const handleClick = () => {
		incrementDebounced(count).then(() => console.log('resolve'))
	}

	return (
		<>
			<button onClick={handleClick}>
				{count}
			</button>
			<br />
			<br />
			<button onClick={cancel}>
				Cancel
			</button>
		</>
	)
}

export function CancelAsyncFunction() {
	const [ data, setData ] = useState<DummyData>()
	const [ count, setCount ] = useState(1)
	const [ fetchDummyDebounced, cancelDebounce ] = useDebounce(fetchDummy, 0)

	const cancel = () => {
		cancelDebounce()
		fetchDummy.cancel?.()
	}

	const handleClick = () => {
		cancel()
		fetchDummyDebounced(count).then(data => {
			setCount(count => count + 1)
			setData(data)
		})
	}

	return (
		<>
			<button onClick={handleClick} >
				Call Debounced Function
			</button>
			<br />
			<h4>{JSON.stringify(data) || 'undefined'}</h4>
			<br />
			<button onClick={cancel}>
				Cancel
			</button>
		</>
	)
}
