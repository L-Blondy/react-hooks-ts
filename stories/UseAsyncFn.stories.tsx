import React from 'react'
import { UseAsyncFn } from '../src/components/UseAsyncFn'

export default {
	title: 'components/UseAsyncFn',
}

export const AsyncFunction = (args) => <UseAsyncFn {...args} />
AsyncFunction.args = {
	useAxios: false,
	withDataReset: false
}