import React from 'react'
import { UseAsync } from '../../src/components/UseAsync'

export default {
	title: 'components/UseAsync',
}

export const Async = (args) => <UseAsync {...args} />
Async.args = {
	useAxios: false,
	withDataReset: false
}