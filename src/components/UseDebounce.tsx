import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks'
import fetchDummy, { DummyData } from '../API/fetchDummy'

export function NormalFunction({ time = 1000 }: { time?: number }) {
	const [ count, setCount ] = useState(0)
	const countDisplay = useRef<HTMLHeadingElement>(null!)
	const promiseDisplay = useRef<HTMLHeadingElement>(null!)
	const timeoutDisplay = useRef<HTMLHeadingElement>(null!)

	const handleClick = () => {
		setCount(count => count + 1)
	}

	const updateTitle = useCallback((newCount: number) => {
		countDisplay.current.textContent = newCount.toString()
		return newCount
	}, [])

	const [ updateTitleDebounced, cancel ] = useDebounce(updateTitle, time)

	useEffect(() => {
		updateTitleDebounced(count)
			.then(newCount => {
				promiseDisplay.current.textContent = newCount.toString()
			})
	}, [ count, updateTitleDebounced ])

	useEffect(() => {
		const id = setInterval(() => {
			timeoutDisplay.current.textContent = (Number(timeoutDisplay.current.textContent) + 1) + ''
		}, time)

		return () => clearInterval(id)
	}, [ time ])

	return (
		<>
			<button onClick={handleClick} data-testid='incrementBtn'>
				{count}
			</button>
			<br />
			<h1 ref={countDisplay} data-testid='countDisplay'>0</h1>
			<h1 ref={promiseDisplay} data-testid='promiseDisplay'>0</h1>
			<br />
			<button onClick={cancel} data-testid='cancelBtn'>
				Cancel
			</button>
			<br />
			<h1 ref={timeoutDisplay} data-testid='timeoutDisplay'>0</h1>
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
