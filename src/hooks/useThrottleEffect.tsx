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
	const [ throttled, cancel ] = useThrottle(callback, time, {
		limit,
		trailing
	})
	const isMounted = useRef(false)

	function effect() {
		if (!immediate && !isMounted.current) {
			isMounted.current = true
			return
		}
		throttled()
	}

	useEffect(effect, deps)

	return [ throttled, cancel ]
}

export default useThrottleEffect;