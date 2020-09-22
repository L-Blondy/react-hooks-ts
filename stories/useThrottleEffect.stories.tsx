import React, { useState, useRef, useEffect } from 'react'
import { useThrottleEffect } from '../src/hooks'

export default {
	title: 'components/UseThrottleEffect',
	decorators: [ (Story) => <Story /> ],
	args: {
		limit: 1,
		time: 1000,
		trailing: true,
		isAsync: true,
		immediate: true
	}
}

interface Args {
	limit: number,
	time: number,
	trailing: boolean,
	isAsync: boolean,
	immediate: boolean
}

export function Demo({ limit, time, trailing, immediate, isAsync }: Args) {
	const [ count, setCount ] = useState(0)
	const titleRef = useRef<HTMLHeadingElement>(null!)
	const [ runningTimeouts, setRunningTimeouts ] = useState(0)

	const incrementCount = () => {
		setCount(count => count + 1)
	}

	const setupTimeout = () => {
		setRunningTimeouts(runningTimeouts => runningTimeouts + 1)
		setTimeout(() => setRunningTimeouts(runningTimeouts => runningTimeouts - 1), time)
	}

	const [ throttled, cancel ] = useThrottleEffect(() => {
		titleRef.current.textContent = count.toString()
		setupTimeout()
		return isAsync ? Promise.resolve(count) : count
	}, [ count ], time, { limit, trailing, immediate })

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