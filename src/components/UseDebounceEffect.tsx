import React, { useState } from 'react';
import { useDebounceEffect } from '../hooks'

interface Args {
	delay: number
}

export function NormalDebounceEffect({
	...args
}: Args) {

	const [ count, setCount ] = useState(0)
	const [ afterDb, setAfterDb ] = useState(count)

	useDebounceEffect(() => {
		setAfterDb(count)
	}, [ count ], args.delay)


	return (
		<>
			<button onClick={() => setCount(count + 1)}>Count: {count}</button>
			<h1>{afterDb}</h1>
		</>
	)
}