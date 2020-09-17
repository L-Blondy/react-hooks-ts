import React from 'react'
import { NormalFunction, CancelAsyncFunction } from '../../src/components/UseDebounce'

export default {
	title: 'components/UseDebounce',

}

export const Normal_Function = () => <NormalFunction time={500} />
export const Cancel_Async_Function = (args) => <CancelAsyncFunction {...args} />