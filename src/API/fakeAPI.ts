import { CancellableAsyncFn } from '../types'

let count = 0

const fakeAPI: CancellableAsyncFn<(str1: string, str2?: string) => Promise<string>> = (
	str1,
	str2 = ''
) => {
	count++
	let cancelToken: NodeJS.Timeout;
	let rejectToken: (reason?: any) => void;

	fakeAPI.cancel = () => {
		clearTimeout(cancelToken)
		console.log(`cancelled execution: ${str1 + str2}`)
		rejectToken(`cancelled execution: ${str1 + str2}`)
	}

	return new Promise((resolve, reject) => {
		rejectToken = reject
		cancelToken = setTimeout(() => {
			console.log('resolved: ' + str1 + str2)
			count % 2
				? resolve(str1 + str2)
				: reject('rejecting....')
		}, 1000)
	})
}

export default fakeAPI;