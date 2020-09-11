import { useRef } from 'react';

const useThrottle = <T extends (...args: any) => any>(
	callback: T,
	throttleTime: number = 0,
	throttleLimit: number = 1
): T | ((...args: Parameters<T>) => void) => {

	const lastCallDate = useRef(0)
	const callsWithinTime = useRef(0)

	const execute = (...args: Parameters<T>) => {
		const now = Date.now()

		if (callsWithinTime.current < throttleLimit) {
			lastCallDate.current = now
			callsWithinTime.current++
			setTimeout(() => callsWithinTime.current--, throttleTime)
			return callback(...args)
		}
	}
	return execute
}

export default useThrottle;