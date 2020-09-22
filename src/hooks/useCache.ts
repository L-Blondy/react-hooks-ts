import { useRef, useCallback, useEffect } from 'react';
import { isPromise } from '../utils'
import { SomeFunction, AsyncReturnType } from './../types';



const useCache = <T extends SomeFunction>(
	callback: T,
	{
		staleTime = Number.MAX_VALUE,
		caseSensitive = false,
		disable = false,
	} = {}
): T => {

	const callbackRef = useRef(callback)
	const staleTimeRef = useRef(staleTime)
	const caseSensitiveRef = useRef(caseSensitive)
	const cache = useRef<{ [ args: string ]: { result: any, updatedOn: number, isAsync: boolean } }>({})

	useEffect(() => {
		callbackRef.current = callback
		staleTimeRef.current = staleTime
		caseSensitiveRef.current = caseSensitive
	})

	const execute = useCallback((...args: Parameters<T>) => {
		let key = args.toString()

		if (!caseSensitiveRef.current) key = key.toLowerCase()
		const cacheContent = cache.current[ key ]
		const now = Date.now()

		if (cacheContent && now - cacheContent.updatedOn < staleTimeRef.current) {
			console.log('using cache')
			if (cacheContent.isAsync)
				return Promise.resolve(cacheContent.result)
			return cacheContent.result
		}

		const returnValue = callbackRef.current(...args)

		if (isPromise(returnValue)) {
			return returnValue
				.then((result: AsyncReturnType<T>) => {
					cache.current[ key ] = {
						result,
						updatedOn: now,
						isAsync: true
					}
					return result
				})
		}

		cache.current[ key ] = {
			result: returnValue,
			updatedOn: now,
			isAsync: false
		}
		return returnValue
	}, [])

	return disable
		? callback
		: execute as T
}

export default useCache;
