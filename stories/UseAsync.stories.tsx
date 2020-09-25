import React from 'react'
// import { UseAsync } from '../src/components/UseAsync'

export default {
	title: 'components/UseAsync',
	args: {
		withDataReset: false,
		defaultData: null,
		debounceTime: 0,
		throttleTime: 0,
		throttleLimit: 1,
		staleTime: 5000,
		disableCache: false,
		caseSensitiveCache: false,
		withTrailing: false
	}
}

export const Demo = () => null

// const Template = ({
// 	useAxios,
// 	withDataReset,
// 	fastAPI,
// 	...props
// }) => (
// 		<UseAsync
// 			useAxios={useAxios}
// 			fastAPI={fastAPI}
// 			withDataReset={withDataReset}
// 			options={{ ...props }}
// 		/>
// 	)

// export const SlowWithFetch = Template.bind({})
// SlowWithFetch.args = {
// 	fastAPI: false,
// 	useAxios: false,

// }

// export const SlowWithAxios = Template.bind({})
// SlowWithAxios.args = {
// 	fastAPI: false,
// 	useAxios: true,
// }

// export const FastAPI = Template.bind({})
// FastAPI.args = {
// 	fastAPI: true,
// 	useAxios: true,
// }
