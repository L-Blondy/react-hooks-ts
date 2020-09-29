import { useEffect, useRef, useCallback } from 'react'
import { Promisify, SomeFunction } from '../types'

export type UseDebounceReturn<T extends SomeFunction> = [
	(...args: Parameters<T>) => Promisify<ReturnType<T>>,
	() => void
]

const useDebounce = <T extends SomeFunction>(
	callback: T,
	time: number
): UseDebounceReturn<T> => {

	const callbackRef = useRef(callback)
	const timeRef = useRef(time)
	const token = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		callbackRef.current = callback
		timeRef.current = time
	})

	const debouncedCallback: UseDebounceReturn<T>[ 0 ] = useCallback((...args: Parameters<T>) => {
		args.forEach((arg: any) => arg.target && arg.persist?.())

		const promise = new Promise<ReturnType<T>>(resolve => {
			cancel()
			if (!time)
				return resolve(callbackRef.current(...args))

			token.current = setTimeout(() => {
				resolve(callbackRef.current(...args))
			}, timeRef.current)
		})

		return promise as Promisify<ReturnType<T>>
	}, [ callbackRef ])

	const cancel: UseDebounceReturn<T>[ 1 ] = useCallback(() => {
		token.current && clearTimeout(token.current)
	}, [])

	useEffect(() => () => {
		cancel()
	}, []);

	return [ debouncedCallback, cancel ]
}

export default useDebounce
