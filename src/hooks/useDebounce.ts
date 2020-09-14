import { useEffect, useRef, useCallback } from 'react'
import { Promisify } from '../types'

const noop = () => { }

type SomeFunction = (...args: any) => any

interface DebouncedFn<T extends SomeFunction> {
	(...args: Parameters<T>): Promisify<ReturnType<T>>
}
interface DebouncedFnWithCancel<T extends SomeFunction> extends DebouncedFn<T> {
	cancel: () => void
}

const useDebounce = <T extends SomeFunction>(
	callback: T,
	delay: number = 0
): DebouncedFnWithCancel<T> => {

	const callbackRef = useRef(callback)
	const delayRef = useRef(delay)
	const token = useRef<NodeJS.Timeout | null>(null)
	const cancelPromiseRef = useRef(noop)

	useEffect(() => {
		callbackRef.current = callback
		delayRef.current = delay
	})

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

	useEffect(() => () => {
		cancel()
	}, []);

	(debouncedCallback as DebouncedFnWithCancel<T>).cancel = cancel

	return debouncedCallback as DebouncedFnWithCancel<T>
}

export default useDebounce
