import React from 'react'
import { ThrottleNormalFunction, ThrottleAsyncFunction } from '../../src/components/UseThrottle'

export default {
	title: 'components/UseThrottle',

}

export const NormalFunction = (args) => <ThrottleNormalFunction {...args} />
export const AsyncFunction = (args) => <ThrottleAsyncFunction {...args} />