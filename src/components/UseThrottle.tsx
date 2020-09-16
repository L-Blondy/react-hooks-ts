import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThrottle } from '../hooks'
import fetchDummyFast from '../API/fetchDummyFast'
import fetchDummy from '../API/fetchDummy'

export interface Args {
	limit: number,
	throttleTime: number,
	withTrailing: boolean,
	fast?: boolean
}

export function ThrottleNormalFunction({ limit, throttleTime, withTrailing }: Args) {
	const [ count, setCount ] = useState(0)
	const titleRef = useRef<HTMLHeadingElement>(null!)

	const incrementCount = () => {
		setCount(count => count + 1)
	}

	const updateTitle = (count: number) => {
		titleRef.current.textContent = count.toString()
		return count
	}

	const [ updateTitleThrottled, cancel ] = useThrottle(updateTitle, throttleTime, { limit, withTrailing })

	useEffect(() => {
		updateTitleThrottled(count)
			.then(() => console.log('returns a Promise'))
	}, [ count, updateTitleThrottled ])

	return (
		<>
			<button onClick={incrementCount}>
				{count}
			</button>
			<br />
			<h4 ref={titleRef}>null</h4>
			<br />
			<button onClick={cancel}>
				Cancel
			</button>
		</>
	)
}

export function ThrottleAsyncFunction({ limit, throttleTime, withTrailing, fast }: Args) {

	const [ count, setCount ] = useState(0)
	const dataRef = useRef<HTMLHeadingElement>(null!)

	const incrementCount = () => {
		setCount(count => count + 1)
	}

	const fetchData = useCallback((count) => {
		return (fast ? fetchDummyFast(count) : fetchDummy(count))
			.then(data => {
				dataRef.current.textContent = JSON.stringify(data)
				return data
			})
	}, [])

	const [ fetchDataThrottled, cancelThrottle ] = useThrottle(fetchData, throttleTime, { limit, withTrailing })

	const cancel = useCallback(() => {
		cancelThrottle();
		(fast ? fetchDummyFast : fetchDummy).cancel?.()
	}, [ cancelThrottle, fast ])

	useEffect(() => {
		fetchDataThrottled(count)
			.then(() => console.log('returns a Promise'))
	}, [ count, fetchDataThrottled ])

	return (
		<>
			<button onClick={incrementCount}>
				{count}
			</button>
			<br />
			<h4 ref={dataRef}>null</h4>
			<br />
			<button onClick={cancel}>
				Cancel
			</button>
		</>
	)
}
