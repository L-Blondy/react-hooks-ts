import { useState, useCallback } from 'react';

function useRerender() {

	const [ , setState ] = useState({})

	const reRender = useCallback(() => setState({}), [])

	return reRender
}

export default useRerender;