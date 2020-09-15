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
	throttleTime: number = 0,
	throttleLimit: number = 1
): (...args: Parameters<T>) => Promisify<ReturnType<T>> => {

	const callbackRef = useRef(callback)
	const throttleLimitRef = useRef(throttleLimit)
	const throttleTimeRef = useRef(throttleTime)
	const lastCallDate = useRef(0)
	const callsWithinTime = useRef(0)

	useEffect(() => {
		callbackRef.current = callback
		throttleLimitRef.current = throttleLimit
		throttleTimeRef.current = throttleTime
	})

	const execute = useCallback((...args: Parameters<T>) => {
		const now = Date.now()

		if (callsWithinTime.current < throttleLimitRef.current) {
			lastCallDate.current = now
			callsWithinTime.current++
			setTimeout(() => callsWithinTime.current--, throttleTimeRef.current);
			let result: Promisify<ReturnType<T>> = callbackRef.current(...args)
			if (!isPromise(result)) {
				return Promise.resolve(result)
			}
			return result
		}
		return garbageCollectedPromise
	}, [])

	return execute as (...args: Parameters<T>) => Promisify<ReturnType<T>>
}

export default useThrottle;