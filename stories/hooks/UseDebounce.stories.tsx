import React from 'react'
import { DebounceNormalFunction, DebounceAsyncFunction } from '../../src/components/UseDebounce'

export default {
	title: 'components/UseDebounce',

}

export const NormalFunction = (args) => <DebounceNormalFunction {...args} />
export const AsyncFunction = (args) => <DebounceAsyncFunction {...args} />