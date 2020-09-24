import { useEffect, DependencyList } from 'react';
import { useRef } from 'react'
import useThrottle from './useThrottle';

interface UseThrottleEffectOptions {
	limit?: number,
	trailing?: boolean,
	immediate?: boolean
}

function useThrottleEffect(
	callback: (...args: any) => any,
	deps: DependencyList,
	time: number,
	{
		limit = 1,
		trailing = true,
		immediate = true
	}: UseThrottleEffectOptions = {}
) {
	const [ throttled, cancel, hasPendingTailing ] = useThrottle(callback, time, {
		limit,
		trailing
	})
	const isFirstRender = useRef(true)

	function effect() {
		if (immediate || !isFirstRender.current)
			throttled()
		isFirstRender.current = false
	}

	function updatePendingTrailing() {
		hasPendingTailing() && throttled()
	}

	useEffect(updatePendingTrailing, [ time ])

	useEffect(effect, deps)

	return [ throttled, cancel, hasPendingTailing ]
}

export default useThrottleEffect;