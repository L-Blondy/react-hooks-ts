import { useEffect, useRef, useCallback } from 'react'
import { Promisify } from '../types'

const noop = () => { }

const useDebounce = <T extends ((...args: any) => any)>(
	callback: T,
	delay: number = 0
): [ ((...args: Parameters<T>) => Promisify<ReturnType<T>>), () => void ] => {

	const callbackRef = useRef(callback)
	const delayRef = useRef(delay)
	const token = useRef<NodeJS.Timeout | null>(null)
	const cancelPromiseRef = useRef(noop)

	const cancel = () => {
		token.current && clearTimeout(token.current)
		cancelPromiseRef.current()
	}

	const debouncedCallback = useCallback((...args: Parameters<T>) => {
		args.forEach((arg: any) => arg.target && arg.persist?.())

		const promise = new Promise(resolve => {
			cancel()
			token.current = setTimeout(() => {
				const returnedPromise = callbackRef.current(...args)
				cancelPromiseRef.current = returnedPromise?.cancel || noop
				resolve(returnedPromise)
			}, delayRef.current)
		})

		return promise as Promisify<ReturnType<T>>
	}, [])

	useEffect(() => {
		callbackRef.current = callback
		delayRef.current = delay
	}, [ callback, delay ])

	useEffect(() => () => {
		cancel()
	}, [])

	return [ debouncedCallback, cancel ]
}

export default useDebounce
