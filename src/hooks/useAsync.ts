import { useAsyncFn, useDebounce, useCache, useThrottle } from './';
import { AsyncFunctionWithCancel, AsyncReturnType } from '../types';

export interface UseAsyncOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
	debounceTime?: number,
	throttleTime?: number,
	throttleLimit?: number
	staleTime?: number,
	disableCache?: boolean,
	caseSensitive?: boolean
}

const useAsync = <Cb extends AsyncFunctionWithCancel>(
	callback: Cb,
	{
		defaultData = null,
		debounceTime = 0,
		throttleTime = 0,
		throttleLimit = 1,
		staleTime = Number.MAX_VALUE,
		disableCache: disable = false,
		caseSensitive = false
	}: UseAsyncOptions<Cb> = {}
) => {
	const [ debounced, cancelDebounce ] = useDebounce(callback, debounceTime)
	const throttled = useThrottle(debounced, throttleTime, throttleLimit)
	const cached = useCache(throttled, { staleTime, disable, caseSensitive })
	const [ state, execute, cancelAsync, setState ] = useAsyncFn(cached, { defaultData })

	const cancel = (withDataReset: boolean = false) => {
		cancelDebounce();
		// cancelAsync(withDataReset)
		callback.cancel?.()
	}

	return [ state, execute, cancel, setState ] as const
}

export default useAsync;