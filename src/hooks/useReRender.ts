import { useState, useEffect } from 'react';

function useReRender() {

	const [ state, setState ] = useState({})

	const reRender = () => setState({})
	useEffect(() => console.log(state), [ state ])

	return reRender
}

export default useReRender;