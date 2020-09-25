import { CancellableAsyncFn } from '../types'

const fakeAPI: CancellableAsyncFn<(str1: string, str2?: string) => Promise<string>> = (
	str1,
	str2 = ''
) => {
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
			resolve(str1 + str2)
		}, 1000)
	})
}

export default fakeAPI;