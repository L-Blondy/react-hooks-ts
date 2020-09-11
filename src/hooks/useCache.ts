import { useRef } from 'react';
import { isPromise } from '../utils'
import { AsyncFunction, NormalFunction, AsyncReturnType } from './../types';

type AnyFunction = AsyncFunction | NormalFunction

const useCache = <T extends AnyFunction>(
	callback: T,
	{
		staleTime = Number.MAX_VALUE,
		caseSensitive = false,
		disable = false,
	} = {}
): T => {
	if (disable) return callback

	const cache = useRef<{ [ args: string ]: { result: any, updatedOn: number, isAsync: boolean } }>({})

	const execute = (...args: Parameters<T>) => {
		let key = args.toString()
		if (!caseSensitive) key = key.toLowerCase()
		const cacheContent = cache.current[ key ]
		const now = Date.now()

		console.log(now - cacheContent?.updatedOn, staleTime)

		if (cacheContent && now - cacheContent.updatedOn < staleTime) {
			console.log('using cache')
			if (cacheContent.isAsync)
				return Promise.resolve(cacheContent.result)
			return cacheContent.result
		}

		const returnValue = callback(...args)

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
	}
	return execute as T
}

export default useCache;
