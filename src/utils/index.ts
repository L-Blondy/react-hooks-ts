export function isPromise(variable: any): variable is Promise<any> {
	return !!variable && typeof variable.then === 'function'
}