import axios from 'axios'
import { CancellableAsyncFn } from '../types'

export interface DummyData {
	userId: number,
	id: string,
	title: string,
	completed: boolean
}

let cancelToken: any;

const fetchDummyAxios: CancellableAsyncFn<(count: number) => Promise<DummyData>> = (count: number): Promise<DummyData> => {

	cancelToken = axios.CancelToken.source();

	const promise: Promise<DummyData> = axios
		.get('https://jsonplaceholder.typicode.com/todos/' + count, { cancelToken: cancelToken.token })
		.then(res => res.data)

	fetchDummyAxios.cancel = () => {
		cancelToken.cancel("Request cancelled");
	}

	return promise
}

export default fetchDummyAxios
