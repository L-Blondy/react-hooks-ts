import { useEffect, useRef, useCallback } from 'react'
import { Promisify } from '../types'

type SomeFunction = (...args: any) => any

export type UseDebounceReturn<T extends SomeFunction> = [
	(...args: Parameters<T>) => Promisify<ReturnType<T>>,
	() => void
]

const useDebounce = <T extends SomeFunction>(
	callback: T,
	delay: number = 0
): UseDebounceReturn<T> => {

	const callbackRef = useRef(callback)
	const delayRef = useRef(delay)
	const token = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		callbackRef.current = callback
		delayRef.current = delay
	})

	const debouncedCallback: UseDebounceReturn<T>[ 0 ] = useCallback((...args: Parameters<T>) => {
		args.forEach((arg: any) => arg.target && arg.persist?.())

		const promise = new Promise<ReturnType<T>>(resolve => {
			cancel()
			token.current = setTimeout(() => {
				resolve(callbackRef.current(...args))
			}, delayRef.current)
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
