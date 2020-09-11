import React, { useState } from 'react'
import UseMountedState from '../../src/components/UseMountedState'

function ToggleMountedState(args) {
	const [ count, setCount ] = useState(0)
	return (
		<>
			<button onClick={() => setCount(count + 1)}>Count: {count}</button>
			{count % 2 === 0 && args.children}
		</>
	)
}

export default {
	title: 'components/UseMountedState',
	decorators: [ story => <ToggleMountedState>{story()}</ToggleMountedState> ]
}

export const Test = () => <UseMountedState />


