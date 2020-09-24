import React, { useState, useRef, useEffect } from 'react'
import { useThrottle } from '../src/hooks'

export default {
	title: 'components/useThrottle',
	args: {
		limit: 1,
		throttleTime: 1000,
		trailing: true,
		isAsync: true
	}
}

interface Args {
	limit: number,
	throttleTime: number,
	trailing: boolean,
	isAsync: boolean
}

export function Demo({ limit, throttleTime, trailing, isAsync }: Args) {
	const [ count, setCount ] = useState(0)
	const titleRef = useRef<HTMLHeadingElement>(null!)
	const [ runningTimeouts, setRunningTimeouts ] = useState(0)

	const incrementCount = () => {
		setCount(count => count + 1)
	}

	const updateTitle = (count: number) => {
		titleRef.current.textContent = count.toString()
		setRunningTimeouts(runningTimeouts => runningTimeouts + 1)
		setTimeout(() => setRunningTimeouts(runningTimeouts => runningTimeouts - 1), throttleTime)
		return isAsync ? Promise.resolve(count) : count
	}

	const [ updateTitleThrottled, cancel ] = useThrottle(updateTitle, throttleTime, { limit, trailing })

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
			<br />
			<h1>Running timeouts: {runningTimeouts}</h1>
		</>
	)
}