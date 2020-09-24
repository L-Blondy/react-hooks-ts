import { CancellableAsyncFn } from '../types'

const fakeAPI: CancellableAsyncFn<(str1: string, str2?: string) => Promise<string>> = (
	str1,
	str2
) => {
	let token: NodeJS.Timeout;

	fakeAPI.cancel = () => clearTimeout(token)

	return new Promise(resolve => {
		token = setTimeout(() => {
			resolve(str1 + str2)
		}, 500)
	})
}

export default fakeAPI;