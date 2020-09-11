import { useDebounce, useThrottle, useSetState, useMemoAsyncFn, useAsyncFn, useAsync } from '../src/hooks'

const simpleFunction = (n: number): number => 2
const promiseFunction = (n: number): Promise<number> => Promise.resolve(2)

function Inference() {

	//useDebounce
	const [ simpleFunctionDB, cancelSimpleFunctionDB ] = useDebounce(simpleFunction)
	const [ promiseFunctionDB, cancelPromiseFunctionDB ] = useDebounce(promiseFunction)

	//useThrottle
	const simpleFunctionTh = useThrottle(simpleFunction)
	const promiseFunctionTh = useThrottle(promiseFunction)

	//useMemoizeAsyncFn
	const memoized = useMemoAsyncFn(promiseFunction)

	//useAsync(Fn)
	const [ request1, execute1, cancel1, setRequestState1, ] = useAsyncFn(promiseFunction)
	const [ request2, execute2, cancel2, setRequestState2, ] = useAsync(promiseFunction)
	const { args, data, error, isPending, status } = request2

	//useSetState
	const [ state, setState ] = useSetState({
		n: 1,
		s: '1'
	})

	return (
		null
	)
}

export default Inference