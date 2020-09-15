import React from 'react'
import { DebounceNormalFunction, CancelAsyncFunction } from '../../src/components/UseDebounce'

export default {
	title: 'components/UseDebounce',

}

export const NormalFunction = (args) => <DebounceNormalFunction {...args} />
export const Cancel_Async_Function = (args) => <CancelAsyncFunction {...args} />