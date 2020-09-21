import { useEffect, DependencyList } from 'react';
import { useRef } from 'react'
import useDebounce from './useDebounce';

function useDebounceEffect(
	callback: (...args: any) => any,
	deps: DependencyList,
	delay: number,
	immediate: boolean = true
) {

	const [ debouncedCallback, cancel ] = useDebounce(callback, delay)
	const isMounted = useRef(false)

	function effect() {
		if (!immediate && !isMounted.current) {
			isMounted.current = true
			return
		}
		debouncedCallback()
	}

	useEffect(effect, deps)

	return [ debouncedCallback, cancel ]
}

export default useDebounceEffect;