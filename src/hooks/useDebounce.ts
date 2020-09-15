import { useEffect, useRef, useCallback } from 'react'
import { Promisify } from '../types'

type SomeFunction = (...args: any) => any

const useDebounce = <T extends SomeFunction>(
	callback: T,
	delay: number = 0
) => {

	const callbackRef = useRef(callback)
	const delayRef = useRef(delay)
	const token = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		callbackRef.current = callback
		delayRef.current = delay
	})

	const cancel = () => {
		token.current && clearTimeout(token.current)
	}

	const debouncedCallback: (...args: Parameters<T>) => Promisify<ReturnType<T>> = useCallback((...args: Parameters<T>) => {
		args.forEach((arg: any) => arg.target && arg.persist?.())

		const promise = new Promise<ReturnType<T>>(resolve => {
			cancel()
			token.current = setTimeout(() => {
				resolve(callbackRef.current(...args))
			}, delayRef.current)
		})

		return promise as Promisify<ReturnType<T>>
	}, [ callbackRef ])

	useEffect(() => () => {
		cancel()
	}, []);

	return [ debouncedCallback, cancel ] as const
}

export default useDebounce
