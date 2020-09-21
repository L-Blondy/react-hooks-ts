import React from 'react'
import { useSetState } from '../src/hooks'

export default {
	title: 'components/useSetState'
}

export const Demo = () => {

	const [ state, setState ] = useSetState({
		c1: 0,
		c2: 0,
	})

	const incrementC1 = () => setState(state => ({ c1: state.c1 + 1 }))
	const incrementTwiceC1 = () => { incrementC1(); incrementC1() }
	const incrementC2 = () => setState(state => ({ c2: state.c2 + 1 }))
	const incrementTwiceC2 = () => { incrementC2(); incrementC2() }

	return (
		<div>
			<div className='flex'>
				<button onClick={incrementC1}>Increment</button>
				<button onClick={incrementTwiceC1}>Increment twice</button>
				<h1>Count 1: {state.c1}</h1>
			</div>
			<div className='flex'>
				<button onClick={incrementC2}>Increment</button>
				<button onClick={incrementTwiceC2}>Increment twice</button>
				<h1>Count 2: {state.c2}</h1>
			</div>
		</div>
	)
}