import '@testing-library/jest-dom/extend-expect';
import { renderHook, act, RenderHookResult } from '@testing-library/react-hooks'
import useCache, { UseCacheOptions, CacheResult } from '../src/hooks/useCache'
import { waitForMs } from '../src/utils'


function getHook({
	staleTime = 100,
	caseSensitive = false,
	isAsync = false
}: UseCacheOptions = {}) {
	return renderHook(({ staleTime = 100, caseSensitive = false, isAsync = false }: UseCacheOptions) => useCache({ staleTime, caseSensitive }), {
		initialProps: { staleTime, caseSensitive, isAsync }
	})
}

describe('useCache', () => {

	it('should return an object with 2 methods: "get" and "set ', () => {
		const cache = getHook().result.current

		expect(typeof cache.get).toBe('function')
		expect(typeof cache.set).toBe('function')
	})

	it('"get" should return "undefined" for a non set value', () => {
		const cache = getHook().result.current

		const cacheResult = cache.get('keypart1', 'keypart2')
		expect(cacheResult).toBeUndefined()
	})

	it('"set" should create a record of shape "CacheResult", retrievable with "get"', () => {
		const cache = getHook().result.current

		cache.set('keypart1', 'keypart2').to('myTestValue')
		const updatedOn = Date.now()
		const cacheResult = cache.get('keypart1', 'keypart2')


		expect(cacheResult.value).toBeDefined()
		expect(cacheResult.value).toBe('myTestValue')
		expect(cacheResult.updatedOn).toBe(updatedOn)
		expect(cacheResult.expireDate).toBe(updatedOn + 100)
		expect(cacheResult.isStale).toBeFalsy()
		expect(cacheResult.isAsync).toBeFalsy()
		expect(cacheResult.age).toBe(Date.now() - updatedOn)
	})

	it('(staleTime===100) isStale should be true after 100ms', async done => {
		const { result } = getHook()
		const cache = result.current
		cache.set('A').to(0)
		expect(cache.get('A').isStale).toBeFalsy()
		await waitForMs(101)
		expect(cache.get('A').isStale).toBeTruthy()
		done()
	})

	it('"age" should be dynamic', async done => {
		const { result } = getHook()
		const cache = result.current
		cache.set('A').to(0)
		const cacheResult = cache.get('A')
		const age1 = cacheResult.age
		await waitForMs(101)
		const age2 = cacheResult.age
		expect(age2).toBeGreaterThan(age1)
		done()
	})

	it('(caseSensitive===false) Should return the result same with lowerCase|upperCase arguments', () => {
		const { result } = getHook()
		const cache = result.current
		cache.set('A').to(0)
		cache.set('a').to(1)
		expect(cache.get('a')).toBe(cache.get('A'))
	})

	it('"staleTime" change should reflect', () => {
		const { result, rerender } = getHook()
		result.current.set('').to(0)
		rerender({ staleTime: 200 })
		result.current.set('').to(0)
		const cacheResult = result.current.get('')

		expect(cacheResult.expireDate).toBe(cacheResult.updatedOn + 200)
	})

	it('"isAsync" change should reflect', () => {
		const { result, rerender } = getHook({ isAsync: false })
		result.current.set('').to(0)
		rerender({ isAsync: true })
		result.current.set('').to(0)

		expect(result.current.get('')).toBeTruthy()
	})

	it('"caseSensitive" change should reflect', () => {
		const { result, rerender } = getHook({ caseSensitive: false })
		const cache = result.current
		cache.set('A').to(0)
		rerender({ caseSensitive: true })
		cache.set('a').to(1)
		expect(cache.get('a')).not.toBe(cache.get('A'))
	})

	it('Should always return the same instance', () => {
		const { result, rerender } = getHook()
		const instance1 = result.current
		rerender()
		const instance2 = result.current
		expect(instance1).toBe(instance2)
	})
})