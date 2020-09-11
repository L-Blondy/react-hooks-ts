import React, { useState } from 'react';
import { useCache } from '../hooks'

interface Options {
	staleTime?: number,
	disable?: boolean,
	caseSensitive?: boolean
}

export function CacheNormalFunction(args: Options) {

	const API = (n: number) => {
		console.log('calling Function')
		return n
	}

	const cachedAPI = useCache(API, args)

	return (
		<button onClick={() => cachedAPI(2)}>
			call API
		</button>
	)
}

export function CacheAsyncFunction(args: Options) {

	const API = (n: number) => {
		console.log('calling API')
		return Promise.resolve(n)
	}

	const cachedAPI = useCache(API, args)

	return (
		<button onClick={() => cachedAPI(2)}>
			call API
		</button>
	)
}

export function CaseSensitive(args: Options) {

	const [ keyword, setKeyword ] = useState('a')

	const API = (s: string) => {
		console.log('calling API')
		return s
	}

	const cachedAPI = useCache(API, args)

	const handleClick = () => {
		setKeyword(keyword => keyword === 'a' ? 'A' : 'a')
		cachedAPI(keyword)
	}

	return (
		<button onClick={handleClick}>
			call API
		</button>
	)
}