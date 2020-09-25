import { CancellableAsyncFn } from '../types'

type FakeAPI = (timeout: number) => (CancellableAsyncFn<(str1: string, str2?: string) => Promise<string>>)

const fakeAPI: FakeAPI = (
	timeout: number = 10
) => function returnedFn(
	str1,
	str2 = ''
) {
		let cancelToken: NodeJS.Timeout;
		let rejectToken: (reason?: any) => void;

		(returnedFn as any).cancel = () => {
			clearTimeout(cancelToken)
			console.log(`cancelled execution: ${str1 + str2}`)
			rejectToken(`cancelled execution: ${str1 + str2}`)
		}

		return new Promise((resolve, reject) => {
			rejectToken = reject
			cancelToken = setTimeout(() => {
				console.log('resolved: ' + str1 + str2)
				resolve(str1 + str2)
			}, timeout)
		})
	}

export default fakeAPI;