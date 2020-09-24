import React, { useState } from 'react'
import useCache, { UseCacheOptions } from '../src/hooks/useCache'
import { useRerender } from '../src/hooks'

export default {
	title: 'components/useCache',
	args: {
		staleTime: Number.MAX_VALUE,
		caseSensitive: false,
	}
}

export const Demo = (options: UseCacheOptions) => {
	const [ val1, setVal1 ] = useState('val1')
	const [ val2, setVal2 ] = useState('val2')
	const cache = useCache(options)
	const [ cachedResult, setCachedResult ] = useState(cache.get(val1, val2))
	const rerender = useRerender()

	const set = () => {
		cache.set(val1, val2).to(val1 + val2)
	}

	const get = () => {
		rerender()
		const val = cache.get(val1, val2)
		console.log('get ', val)
		setCachedResult(val)
	}

	return (
		<div>
			<input value={val1} onChange={e => setVal1(e.target.value)} />
			<br />
			<br />
			<input value={val2} onChange={e => setVal2(e.target.value)} />
			<br />
			<br />
			<button onClick={set}>Set</button>
			<br />
			<button onClick={get}>Get</button>
			<br />
			<h1>Value: {cachedResult?.value}</h1>
			<h1>Expire date: {cachedResult?.expireDate}</h1>
			<h1>Updated on: {cachedResult?.updatedOn}</h1>
			<h1>Age: {cachedResult?.age}</h1>
			<h1>Is Stale: {String(cachedResult?.isStale)}</h1>
		</div>
	)
}