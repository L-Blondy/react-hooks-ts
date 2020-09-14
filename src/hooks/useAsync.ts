import { useAsyncFn, useDebounce, useCache, useThrottle } from './';
import { AsyncFunction, AsyncReturnType } from '../types';

const useAsync = <Cb extends AsyncFunction>(
	callback: Cb,
	options: {
		defaultData?: AsyncReturnType<Cb> | null,
		debounceTime?: number,
		throttleTime?: number,
		throttleLimit?: number
		staleTime?: number,
		disableCache?: boolean,
		caseSensitive?: boolean
	} = {}
) => {
	const {
		defaultData = null,
		debounceTime = 0,
		throttleTime = 0,
		throttleLimit = 1,
		staleTime = 10000,
		disableCache: disable = false,
		caseSensitive = false
	} = options

	const cached = useCache(callback, { staleTime, disable, caseSensitive })
	const debounced = useDebounce(cached, debounceTime)
	const throttled = useThrottle(debounced, throttleTime, throttleLimit)
	const [state, execute, cancelAsyncCall, setState] = useAsyncFn(throttled, defaultData)

	const cancel = (reset: boolean = false) => {
		debounced.cancel()
		cancelAsyncCall(reset)
	}

	return [state, execute, cancel, setState] as const
}

export default useAsync;