import React from 'react'
import { ThrottleNormalFunction, ThrottleAsyncFunction } from '../../src/components/UseThrottle'

export default {
	title: 'components/UseThrottle',
	args: {
		limit: 1,
		throttleTime: 1000,
		withTrailing: true,
		fast: false
	}
}

export const NormalFunction = (args) => <ThrottleNormalFunction {...args} />
export const AsyncFunction = (args) => <ThrottleAsyncFunction {...args} />