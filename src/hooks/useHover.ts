import { useState, useEffect } from 'react';

function useHover(elRef: React.MutableRefObject<HTMLDivElement | null> | null): boolean {

	const [ isHovered, setIsHovered ] = useState(false)

	const setTruthy = () => setIsHovered(true)
	const setFalsy = () => setIsHovered(false)

	useEffect(() => {
		if (!elRef) return
		if (!elRef.current) return
		const el = elRef.current
		el.addEventListener('mouseenter', setTruthy)
		el.addEventListener('mouseleave', setFalsy)

		return () => {
			el.removeEventListener('mouseenter', setTruthy)
			el.removeEventListener('mouseleave', setFalsy)
		}
	}, [ elRef ])

	return isHovered
}

export default useHover;