import { useRef, useCallback, useEffect } from 'react';
import { isPromise } from '../utils'
import { SomeFunction, AsyncReturnType } from './../types';
import useCache, { CacheResult } from './useCache'

function isCacheResult(cacheResult: CacheResult | undefined): cacheResult is CacheResult {
	return !!(cacheResult as CacheResult)?.updatedOn
}

export interface UseCacheFnOptions {
	staleTime?: number,
	caseSensitive?: boolean,
	isAsync?: boolean,
	disable?: boolean,
}

const useCacheFn = <T extends SomeFunction>(
	callback: T,
	{
		staleTime = Number.MAX_VALUE,
		caseSensitive = false,
		isAsync = false,
		disable = false,
	}: UseCacheFnOptions = {}
) => {

	const callbackRef = useRef(callback)
	const staleTimeRef = useRef(staleTime)
	const caseSensitiveRef = useRef(caseSensitive)
	const isAsyncRef = useRef(isAsync)
	const disableRef = useRef(disable)

	useEffect(() => {
		callbackRef.current = callback
		staleTimeRef.current = staleTime
		caseSensitiveRef.current = caseSensitive
		isAsyncRef.current = isAsync
		disableRef.current = disable
	})

	const cache = useCache({ staleTime, caseSensitive, isAsync })

	const execute = useCallback((...args: Parameters<T>) => {
		if (disableRef.current) return callbackRef.current(...args)
		const cacheContent = cache.get(...args)
		const now = Date.now()

		if (isCacheResult(cacheContent) && now - cacheContent.updatedOn < staleTimeRef.current) {
			// console.log('using cache')
			if (cacheContent.isAsync) {
				return Promise.resolve(cacheContent.value)
			}
			return cacheContent.value
		}

		const returnValue = callbackRef.current(...args)

		if (isPromise(returnValue)) {
			return returnValue
				.then((result: AsyncReturnType<T>) => {
					cache.set(...args).to(result)
					return result
				})
		}
		cache.set(...args).to(returnValue)
		return returnValue
	}, [ cache ])

	return [
		execute as T,
		cache
	] as const
}

export default useCacheFn;
