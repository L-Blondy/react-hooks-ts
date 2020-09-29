import { CancellableAsyncFn } from '../types'

let count = 0

const fakeAPI: CancellableAsyncFn<(str1: string, str2?: string) => Promise<string>> = (
	str1,
	str2 = ''
) => {
	count++
	let cancelToken: { current?: NodeJS.Timeout } = {}

	fakeAPI.cancel = () => {
		cancelToken.current && clearTimeout(cancelToken.current)
	}

	return new Promise((resolve, reject) => {
		cancelToken.current = setTimeout(() => {
			console.log('resolved: ' + str1 + str2)
			count % 2
				? resolve(str1 + str2)
				: reject('rejecting....')
		}, 1000)
	})
}

export default fakeAPI;