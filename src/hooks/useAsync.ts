import { useAsyncFn, useDebounce, useCacheFn, useThrottle } from './';
import { CancellableAsyncFn, AsyncReturnType } from '../types';

export interface UseAsyncOptions<Cb> {
	defaultData?: AsyncReturnType<Cb> | null,
	debounceTime?: number,
	throttleTime?: number,
	throttleLimit?: number
	withTrailing?: boolean,
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
		withTrailing: trailing = false,
		staleTime = Number.MAX_VALUE,
		disableCache = false,
		caseSensitiveCache = false
	}: UseAsyncOptions<Cb> = {}
) => {

	const [ debounced, cancelDebounce ] = useDebounce(callback, debounceTime);
	const [ cached ] = useCacheFn(debounced as CancellableAsyncFn<typeof debounced>, {
		staleTime,
		caseSensitive: caseSensitiveCache,
		disable: disableCache,
		isAsync: true
	});
	cached.cancel = callback.cancel
	const [ state, execute, cancelAsync, setState ] = useAsyncFn(cached, {
		defaultData
	})
	const [ throttled, cancelTrailingThrottle ] = useThrottle(execute, throttleTime, {
		trailing,
		limit: throttleLimit,
	});

	const cancel = (withDataReset: boolean = false) => {
		cancelDebounce();
		cached.cancel = callback.cancel
		cancelAsync(withDataReset)
		cancelTrailingThrottle()
	}

	return [ state, throttled, cancel, setState ] as const
}

export default useAsync;