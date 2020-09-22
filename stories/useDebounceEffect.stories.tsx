import React, { useState } from 'react'
import { useDebounceEffect } from '../src/hooks'

export default {
	title: 'components/useDebounceEffect',
	decorators: [ (Story) => <Story /> ],
	args: {
		time: 1000,
		immediate: true
	}
}

interface Args {
	time: number,
	immediate: boolean
}

export const Demo = ({ time, immediate }: Args) => {

	const [ value, setValue ] = useState('initialValue')
	const [ calledWithValue, setCalledWithValue ] = useState<string>()

	const [ , cancel ] = useDebounceEffect(() => {
		setCalledWithValue(value)
	}, [ value ], time, { immediate })

	return (
		<div>
			<input value={value} onChange={e => setValue(e.target.value)} />
			<h1>Last called with: {calledWithValue}</h1>
			<button onClick={cancel}>Cancel</button>
		</div>
	)
}


