export function isPromise(variable: any): variable is Promise<any> {
	return !!variable && typeof variable.then === 'function'
}

export function waitForMs(ms: number) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}