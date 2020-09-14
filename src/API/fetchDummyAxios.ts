import axios from 'axios'
import { PromiseWithCancel } from '../types'

export interface DummyData {
	userId: number,
	id: string,
	title: string,
	completed: boolean
}

let cancelToken: any;

export default (count: number): PromiseWithCancel<DummyData> => {

	cancelToken = axios.CancelToken.source();

	const promise: PromiseWithCancel<DummyData> = axios
		.get('http://dummy.restapiexample.com/api/v1/employee/' + count, { cancelToken: cancelToken.token })
		.then(res => res.data)

	promise.cancel = () => {
		cancelToken.cancel("Request cancelled");
	}

	return promise
}
