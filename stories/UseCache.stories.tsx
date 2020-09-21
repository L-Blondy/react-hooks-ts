import React from 'react'
import { CacheAsyncFunction, CacheNormalFunction, CaseSensitive } from '../src/components/UseCache'

export default {
	title: 'components/UseCache',
	args: {
		staleTime: 5000,
		disable: false
	}
}

export const AsyncFunction = (args) => <CacheAsyncFunction {...args} />
export const NormalFunction = (args) => <CacheNormalFunction {...args} />
export const Case_Sensitive = (args) => <CaseSensitive {...args} />
Case_Sensitive.args = {
	caseSensitive: false
}