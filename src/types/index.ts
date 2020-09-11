export type NormalFunction = (...args: any) => any
export type AsyncFunction = (...args: any) => Promise<any>

export type PromiseReturnType<T> = T extends Promise<infer R>
	? R
	: T

export type AsyncReturnType<T> = T extends (...args: any) => Promise<any>
	? PromiseReturnType<ReturnType<T>>
	: PromiseReturnType<T>

export type Promisify<T> = T extends Promise<any>
	? T
	: Promise<T>