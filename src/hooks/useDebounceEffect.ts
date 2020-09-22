import { useEffect, DependencyList } from 'react';
import { useRef } from 'react'
import useDebounce from './useDebounce';
import { FunctionWithNoParameter, Promisify } from '../types'

interface UseDebounceEffectOptions {
	immediate?: boolean
}

function useDebounceEffect<Cb extends FunctionWithNoParameter>(
	callback: Cb,
	deps: DependencyList,
	time: number,
	{ immediate = true }: UseDebounceEffectOptions = {}
) {

	const [ debouncedCallback, cancel ]: [ () => Promisify<ReturnType<Cb>>, () => void ] = useDebounce(callback, time)
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

type e = Function