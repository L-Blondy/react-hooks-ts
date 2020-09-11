import { useEffect, DependencyList } from 'react';
import useDebounce from './useDebounce';

function useDebounceEffect(
	callback: (...args: any) => any,
	deps: DependencyList,
	delay: number = 0,
) {

	const [ debouncedCallback ] = useDebounce(callback, delay)

	useEffect(() => {
		debouncedCallback()
	}, deps) // eslint-disable-line
}

export default useDebounceEffect;