import axios from 'axios'
import { PromiseWithCancel, AsyncFunctionWithCancel } from '../types'

export interface DummyData {
	userId: number,
	id: string,
	title: string,
	completed: boolean
}

let cancelToken: any;

const fetchDummyAxios: AsyncFunctionWithCancel = (count: number): Promise<DummyData> => {

	cancelToken = axios.CancelToken.source();

	const promise: Promise<DummyData> = axios
		.get('http://dummy.restapiexample.com/api/v1/employee/' + count, { cancelToken: cancelToken.token })
		.then(res => res.data)

	fetchDummyAxios.cancel = () => {
		cancelToken.cancel("Request cancelled");
	}

	return promise
}

export default fetchDummyAxios
