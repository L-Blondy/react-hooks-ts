import React, { useEffect, useCallback } from 'react';
import { useMountedState } from '../hooks'

function UseMountedState() {
	const isMounted = useMountedState()

	const logIsMounted = useCallback(() => {
		setTimeout(() => console.log(isMounted()), 100)
	}, [ isMounted ])

	useEffect(() => {
		logIsMounted()

		return () => { logIsMounted() }
	}, [ logIsMounted ])

	return <h1>I am mounted !</h1>
}

export default UseMountedState;