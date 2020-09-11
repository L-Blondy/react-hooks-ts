import { useState, useCallback } from 'react';

type Patch<T> = Partial<T> | ((prevState: T) => (Partial<T>))
export type SetState<T> = (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void

const useSetState = <T extends object>(
	initialState: T = {} as T
): [ T, SetState<T> ] => {
	const [ state, set ] = useState<T>(initialState);
	const setState = useCallback((patch: Patch<T>) => {
		set(prevState => ({
			...prevState,
			...(typeof patch === 'function' ? patch(prevState) : patch)
		}))
	}, [ set ])

	return [ state, setState ];
};

export default useSetState;
