import { useAsyncFn, useDebounce, useCache, useThrottle } from './';
import { AsyncFunction } from '../types';

const noop = () => Promise.resolve()

const useAsync = <T extends AsyncFunction>(
	callback: T,
	options: {
		debounceTime?: number,
		throttleTime?: number,
		throttleLimit?: number
		staleTime?: number,
		disableCache?: boolean
	} = {}
) => {

	const [ debounced, cancelDebounce ] = useDebounce(callback, options.debounceTime || 0)
	const memoizedDebounced = useCache(debounced, {
		staleTime: options.staleTime || 0,
		disable: options.disableCache || false,
		caseSensitive: false
	})
	const [ state, execute, cancelPromise, setState ] = useAsyncFn(memoizedDebounced)
	const throttled = useThrottle(execute, options.throttleTime, options.throttleLimit)

	const cancel = (reset: boolean = false) => {
		cancelDebounce()
		cancelPromise(reset)
	}

	return [ state, throttled, cancel, setState ] as const
}

export default useAsync;