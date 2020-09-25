import React, { useState, useEffect } from 'react'
import { useCacheFn } from '../src/hooks'
import { fakeAPI } from '../src/API'

export default {
	title: 'components/useCacheFn',
	args: {
		staleTime: Number.MAX_VALUE,
		disable: false,
		caseSensitive: false,
		isAsync: false
	}
}

interface Options {
	staleTime?: number,
	disable?: boolean,
	isAsync?: boolean,
	caseSensitive?: boolean
}

function syncFn(str1: string, str2: string): string {
	return str1 + str2
}

export const Demo = (options: Options) => {
	const [ fakeAPIwithCache, cache ] = useCacheFn(options.isAsync ? fakeAPI : syncFn, options)
	const [ value, setValue ] = useState<string>()
	const [ age, setAge ] = useState<number>()
	const [ arg1, setArg1 ] = useState('')
	const [ arg2, setArg2 ] = useState('')

	function effect() {
		if (!options.isAsync) {
			fakeAPIwithCache(arg1, arg2)
			const cacheContent = cache.get(arg1, arg2)
			if (!cacheContent) return
			setValue(cacheContent.value)
			setAge(cacheContent.age)
		}
		else {
			(fakeAPIwithCache(arg1, arg2) as any)
				.then(() => {
					const cacheContent = cache.get(arg1, arg2)
					setValue(cacheContent.value)
					setAge(cacheContent.age)
				})
		}
	}

	useEffect(effect, [ arg1, arg2 ])

	return (
		<div>
			<input
				value={arg1}
				onChange={e => setArg1(e.target.value)}
				placeholder='arg1'
			/>
			<br />
			<br />
			<input
				value={arg2}
				onChange={e => setArg2(e.target.value)}
				placeholder='arg2'
			/>
			<br />
			<br />
			<h1>Value: {value}</h1>
			<h1>Age: {age}</h1>
		</div>
	)
}