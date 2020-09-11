import React from 'react'
import { NormalDebounceEffect } from '../../src/components/UseDebounceEffect'

export default {
	title: 'components/UseDebounceEffect',
	args: {
		delay: 1000
	}
}

export const NormalFunction = (args) => <NormalDebounceEffect {...args} />