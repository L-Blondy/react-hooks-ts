import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useSetState, { SetState } from '../src/hooks/useSetState'

function getHook<State extends {}>(initialState?: State) {
	return renderHook(() => useSetState(initialState))
}

describe('useSetState', () => {

	it('shoud return [state={},setState]', () => {
		const { result } = getHook()
		const [ state, setState ] = result.current
		expect(state).toEqual({})
		expect(typeof setState).toBe('function')
	})

	it('should return a memoized setState callback', () => {
		const { result, rerender } = getHook({ ok: false });
		const setState1 = result.current[ 1 ];

		act(() => {
			setState1({ ok: true });
		});
		rerender();
		const setState2 = result.current[ 1 ];
		expect(setState1).toBe(setState2);
	});

	it('should merge changes into current state when providing Partial<State>', () => {
		const { result } = getHook({ value: '', label: '' })
		const setState = result.current[ 1 ]

		act(() => {
			setState({ value: '1' })
		})
		expect(result.current[ 0 ]).toEqual({ value: '1', label: '' })
	})

	it('should merge changes into current state when providing (state:State)=>Partial<State>', () => {
		const { result } = getHook({ c1: 0, c2: 0 })
		const setState = result.current[ 1 ]

		act(() => {
			setState(state => ({ c1: state.c1 + 1 }))
		})
		expect(result.current[ 0 ]).toEqual({ c1: 1, c2: 0 })
	})

	it('should handle concurent updates', () => {
		const { result } = getHook({ count: 0 })
		const setState = result.current[ 1 ]

		act(() => {
			setState(state => ({ count: state.count + 1 }))
			setState(state => ({ count: state.count + 1 }))
		})
		expect(result.current[ 0 ]).toEqual({ count: 2 })
	})
})