import React, { useState, useRef, useEffect } from 'react'
import { useThrottle } from '../src/hooks'

export default {
	title: 'components/UseThrottle',
	args: {
		limit: 1,
		throttleTime: 1000,
		withTrailing: true,
		fast: false
	}
}

interface Args {
	limit: number,
	throttleTime: number,
	withTrailing: boolean
}

export function Demo({ limit, throttleTime, withTrailing }: Args) {
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
			<br />
			<h1>Running timeouts: {runningTimeouts}</h1>
		</>
	)
}