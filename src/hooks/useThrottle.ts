import { useRef, useCallback, useEffect } from 'react';
import { isPromise } from '../utils'
import { Promisify } from '../types'

let id: NodeJS.Timeout
const garbageCollectedPromise = new Promise((resolve) => {
	clearTimeout(id)
	id = setTimeout(() => resolve(), 100)
})

const useThrottle = <T extends (...args: any) => any>(
	callback: T,
	throttleTime: number,
	{
		limit = 1,
		withTrailing = true
	}: {
		limit?: number,
		withTrailing?: boolean
	} = {}
): [ (...args: Parameters<T>) => Promisify<ReturnType<T>>, () => void ] => {

	const callbackRef = useRef(callback)
	const limitRef = useRef(limit)
	const throttleTimeRef = useRef(throttleTime)
	const callsWithinTime = useRef(0)
	const trailingTimeoutId = useRef<NodeJS.Timeout>()
	const dateMap = useRef<number[]>([])
	const withTrailingRef = useRef(withTrailing)

	useEffect(() => {
		callbackRef.current = callback
		limitRef.current = limit
		throttleTimeRef.current = throttleTime
		withTrailingRef.current = withTrailing
	})

	const cancel = useCallback(() => {
		trailingTimeoutId.current && clearTimeout(trailingTimeoutId.current)
	}, [])

	const execute = useCallback((...args: Parameters<T>) => {
		if (callsWithinTime.current === 0)
			dateMap.current = []

		if (callsWithinTime.current < limitRef.current) {
			dateMap.current.push(Date.now())
			callsWithinTime.current++
			setTimeout(() => {
				dateMap.current.shift()
				callsWithinTime.current--
			}, throttleTimeRef.current);
			let result: Promisify<ReturnType<T>> = callbackRef.current(...args)
			if (!isPromise(result)) {
				return Promise.resolve(result) as Promisify<ReturnType<T>>
			}
			return result
		}
		if (withTrailingRef.current) {
			const promise = new Promise<ReturnType<T>>(resolve => {
				cancel()
				const remainingTime = throttleTimeRef.current - (Date.now() - dateMap.current[ 0 ])
				trailingTimeoutId.current = setTimeout(() => {
					let result: Promisify<ReturnType<T>> = callbackRef.current(...args)
					resolve(result)
				}, remainingTime)
			})
			return promise as Promisify<ReturnType<T>>
		}
		return garbageCollectedPromise as Promisify<ReturnType<T>>
	}, [])

	return [ execute, cancel ]
}

export default useThrottle;