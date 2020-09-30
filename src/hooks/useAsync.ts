import { useCallback, useRef, useEffect } from 'react'
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
	caseSensitiveCache?: boolean,
	resetDataOnError?: boolean
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
		caseSensitiveCache = false,
		resetDataOnError = true
	}: UseAsyncOptions<Cb> = {}
) => {
	const callbackRef = useRef(callback)

	useEffect(() => {
		callbackRef.current = callback
	})

	const [ debounced, cancelDebounce ] = useDebounce(callback, debounceTime);
	const [ cached ] = useCacheFn(debounced as CancellableAsyncFn<typeof debounced>, {
		staleTime,
		caseSensitive: caseSensitiveCache,
		disable: disableCache,
		isAsync: true
	});
	cached.cancel = callback.cancel
	const [ execute, state, cancelAsync, resetState, setState ] = useAsyncFn(cached, {
		defaultData,
		resetDataOnError
	})

	const [ throttled, cancelTrailingThrottle ] = useThrottle(execute, throttleTime, {
		trailing,
		limit: throttleLimit,
	});

	const cancel = useCallback((withDataReset: boolean = false) => {
		cancelDebounce();
		cached.cancel = callbackRef.current.cancel
		cancelAsync(withDataReset)
		cancelTrailingThrottle()
	}, [ cached, cancelAsync, cancelDebounce, cancelTrailingThrottle ])

	return [ throttled, state, cancel, resetState, setState ] as const
}

export default useAsync;