import { useRef, useCallback, useEffect } from 'react';
import { Promisify, SomeFunction } from '../types'

let id: NodeJS.Timeout
const garbageCollectedPromise = new Promise((resolve) => {
	clearTimeout(id)
	id = setTimeout(() => resolve(), 100)
})

interface UseThrottleOptions {
	limit: number,
	trailing: boolean
}

const useThrottle = <T extends SomeFunction>(
	callback: T,
	time: number,
	{
		limit = 1,
		trailing = true
	}: UseThrottleOptions
): [ (...args: Parameters<T>) => Promisify<ReturnType<T>>, () => void, number ] => {

	const callbackRef = useRef(callback)
	const limitRef = useRef(limit)
	const timeRef = useRef(time)
	const callsWithinTime = useRef(0)
	const trailingTimeoutId = useRef<NodeJS.Timeout>()
	const dateMap = useRef<number[]>([])
	const trailingRef = useRef(trailing)

	useEffect(() => {
		if (trailingRef.current !== trailing) cancel()
		callbackRef.current = callback
		limitRef.current = limit
		timeRef.current = time
		trailingRef.current = trailing
	})

	function setupTimeout() {
		dateMap.current.push(Date.now())
		callsWithinTime.current++
		setTimeout(() => {
			dateMap.current.shift()
			callsWithinTime.current--
		}, timeRef.current);
	}

	const cancel = useCallback(() => {
		trailingTimeoutId.current && clearTimeout(trailingTimeoutId.current)
	}, [])

	const execute = useCallback((...args: Parameters<T>) => {
		cancel()

		if (callsWithinTime.current === 0)
			dateMap.current = []

		//execute without timeout
		if (callsWithinTime.current < limitRef.current) {
			setupTimeout()
			return Promise.resolve(callbackRef.current(...args)) as Promisify<ReturnType<T>>
		}
		//execute with timeout
		if (trailingRef.current) {
			const remainingTime = timeRef.current - (Date.now() - (dateMap.current[ 0 ] || 0))
			const promise = new Promise<ReturnType<T>>(resolve => {
				trailingTimeoutId.current = setTimeout(() => {
					setupTimeout()
					resolve(callbackRef.current(...args))
				}, remainingTime)
			})
			return promise as Promisify<ReturnType<T>>
		}
		//do not execute
		return garbageCollectedPromise as Promisify<ReturnType<T>>
	}, [])

	useEffect(() => () => cancel())

	return [ execute, cancel, callsWithinTime.current ]
}

export default useThrottle;