import { useEffect, useRef, useMemo } from 'react'

export type CacheResult = {
	value: any,
	updatedOn: number,
	expireDate: number,
	isStale: boolean,
	age: number,
	isAsync: boolean
}

export interface CacheStructure {
	[ args: string ]: CacheResult
}

export interface UseCacheOptions {
	staleTime?: number,
	caseSensitive?: boolean,
	isAsync?: boolean
}

function useCache({
	staleTime = Number.MAX_VALUE,
	caseSensitive = false,
	isAsync = false
}: UseCacheOptions = {}) {

	const memoryRef = useRef<CacheStructure>({})
	const staleTimeRef = useRef(staleTime)
	const caseSensitiveRef = useRef(caseSensitive)
	const isAsyncRef = useRef(isAsync)

	useEffect(() => {
		staleTimeRef.current = staleTime
		caseSensitiveRef.current = caseSensitive
		isAsyncRef.current = isAsync
	})

	const cache = useMemo(() => ({
		get(...keys: any[]): CacheResult | undefined {
			const key = [ ...keys, isAsyncRef.current ].toString()
			return memoryRef.current[ caseSensitiveRef.current ? key : key.toLowerCase() ] || undefined
		},
		set(...keys: any[]) {
			let key = [ ...keys, isAsyncRef.current ].toString()
			key = caseSensitiveRef.current ? key : key.toLowerCase()

			return {
				to(value: any) {
					const newCacheResult: CacheResult = {
						value,
						updatedOn: Date.now(),
						expireDate: Date.now() + staleTimeRef.current,
						isAsync: isAsyncRef.current,
						get isStale() {
							return Date.now() - (this as any).expireDate > 0
						},
						get age() {
							return Date.now() - (this as any).updatedOn
						}
					}
					memoryRef.current[ key ] = newCacheResult
				}
			}
		}
	}), [])

	return cache
}

export default useCache;