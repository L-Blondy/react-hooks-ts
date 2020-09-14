import { useEffect, useRef, useCallback } from 'react'
import { Promisify, PromiseWithCancel } from '../types'

const noop = () => { }

type SomeFunction = (...args: any) => any

interface DebouncedFn<T extends SomeFunction> {
	(...args: Parameters<T>): Promisify<PromiseWithCancel<ReturnType<T>>>
}

const useDebounce = <T extends SomeFunction>(
	callback: T,
	delay: number = 0
): [ DebouncedFn<T>, () => void ] => {

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

	const debouncedCallback = useCallback((...args: Parameters<T>) => {
		args.forEach((arg: any) => arg.target && arg.persist?.())

		const promise = new Promise<ReturnType<T>>(resolve => {
			cancel()
			token.current = setTimeout(() => {
				resolve(callbackRef.current(...args))
			}, delayRef.current)
		})

		return promise as Promisify<ReturnType<T>>
	}, [])

	useEffect(() => () => {
		cancel()
	}, []);

	return [ debouncedCallback, cancel ]
}

export default useDebounce
