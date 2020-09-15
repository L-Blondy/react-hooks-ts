import { useAsyncFn, useDebounce, useCache, useThrottle } from './';
import { CancellableAsyncFn, AsyncReturnType } from '../types';

export interface UseAsyncOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
	debounceTime?: number,
	throttleTime?: number,
	throttleLimit?: number
	staleTime?: number,
	disableCache?: boolean,
	caseSensitiveCache?: boolean
}

const useAsync = <Cb extends CancellableAsyncFn>(
	callback: Cb,
	{
		defaultData = null,
		debounceTime = 0,
		throttleTime = 0,
		throttleLimit = 1,
		staleTime = Number.MAX_VALUE,
		disableCache: disable = false,
		caseSensitiveCache: caseSensitive = false
	}: UseAsyncOptions<Cb> = {}
) => {

	const [ debounced, cancelDebounce ] = useDebounce(callback, debounceTime);
	const cached = useCache(debounced as CancellableAsyncFn<typeof debounced>, { staleTime, disable, caseSensitive });
	cached.cancel = callback.cancel
	const [ state, execute, cancelAsync, setState ] = useAsyncFn(cached, { defaultData })
	const throttled = useThrottle(execute, throttleTime, throttleLimit);

	const cancel = (withDataReset: boolean = false) => {
		cancelDebounce();
		cached.cancel = callback.cancel
		cancelAsync(withDataReset)
	}

	return [ state, throttled, cancel, setState ] as const
}

export default useAsync;