import React, { useState, useCallback, useEffect } from 'react'
import { useMountedState, useReRender } from '../src/hooks'

export default {
	title: 'components/UseMountedState',
}

export function Demo(Story) {
	const [ count, setCount ] = useState(0)
	const [ isChildMounted, setIsChildMounted ] = useState(count % 2 === 0)
	const reRender = useReRender()

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>Count: {count}</button>
			<h1>Is Child mounted: {JSON.stringify(isChildMounted)}</h1>
			<button onClick={reRender}>re-render</button>
			{count % 2 === 0 && <Child getIsChildMounted={setIsChildMounted} />}
		</div>
	)
}

function Child({ getIsChildMounted }) {
	const isMounted = useMountedState()

	function effect() {
		getIsChildMounted(isMounted())

		return () => { getIsChildMounted(isMounted()) }
	}

	useEffect(effect, [])

	return <h1 style={{ position: 'absolute' }}>I am mounted !</h1>
}

