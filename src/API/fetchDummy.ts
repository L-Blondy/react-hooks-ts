import { AsyncFunctionWithCancel, PromiseWithCancel } from '../types'

export interface DummyData {
	userId: number,
	id: string,
	title: string,
	completed: boolean
}

const fetchDummy: AsyncFunctionWithCancel = (count: number): Promise<DummyData> => {

	const controller = new AbortController();
	const { signal } = controller;

	const promise: Promise<DummyData> = fetch('http://dummy.restapiexample.com/api/v1/employee/' + count, { signal })
		.then(res => res.json());

	fetchDummy.cancel = () => {
		console.log('cancelling request...')
		controller.abort();
	}
	return promise
}

export default fetchDummy 
