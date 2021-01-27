/**
 * @param  {object} value
 *
 * @return {boolean}
 */
const isIterator = function(value) {
    return (Symbol.iterator in value);
};

/**
 * @callback MapCallback
 *
 * @param {object} item
 * @param {number} index
 *
 * @return {object}
 */

/**
 * @callback ForEachCallback
 *
 * @param {object} item
 * @param {number} index
 *
 * @return {undefined}
 */

/**
 * @callback FilterCallback
 *
 * @param {object} item
 * @param {number} index
 *
 * @return {boolean}
 */

/**
 * @callback ReduceCallback
 *
 * @param {object} initial
 * @param {object} item
 * @param {number} index
 *
 * @return {object}
 */

/**
 * Wrapper Object for iterable objects that provides well known array methods
 * for any kind of iterable value. This object itself implements the iterator
 * protocol and is therefore more or less invisible.
 *
 * @example
 * for (let a of x) {}
 * // behaves equal to:
 * for (let a of Iterator.new(x)) {}
 */
export const Iterator = {
    ref: null,

    get [Symbol.iterator]() {
        return this.ref[Symbol.iterator].bind(this.ref);
    },

    /**
     * Maps all values of the iterable via the lambda function
     * and returns a new iterator.
     *
     * @param  {MapCallback} lambda
     *
     * @return {Iterator}
     */
    map(lambda) {
        return Iterator.new(this.rawMap(lambda));
    },

    /**
     * @param  {MapCallback} lambda
     */
    *rawMap(lambda) {
        let index = 0;

        for (const item of this.ref) {
            yield lambda(item, index);

            index += 1;
        }
    },

    /**
     * Applies the lambda function to each item of the iterable.
     *
     * @param  {ForEachCallback} lambda
     */
    forEach(lambda) {
        let index = 0;

        for (const item of this.ref) {
            lambda(item, index);

            index += 1;
        }
    },

    /**
     * Filters the values of the iterable by applying the lambda function to
     * each of them.
     *
     * @param  {FilterCallback} lambda
     *
     * @return {Iterator}
     */
    filter(lambda) {
        return Iterator.new(this.rawFilter(lambda));
    },

    /**
     * @param  {FilterCallback} lambda
     */
    *rawFilter(lambda) {
        let index = 0;

        for (const item of this.ref) {
            const keep = lambda(item, index);

            index += 1;

            if (!keep) {
                continue;
            }

            yield item;
        }
    },

    /**
     * Reduces the iterable into a single value by applying the lambda function
     * to each item.
     *
     * @param  {ReduceCallback} lambda
     * @param  {object} initial
     *
     * @return {object}
     */
    reduce(lambda, initial) {
        let index = 0;

        for (const item of this.ref) {
            initial = lambda(initial, item, index);

            index += 1;
        }

        return initial;
    },

    /**
     * Locates a value inside the iterable by applying the lambda function
     * to each element until it returns true.
     *
     * @param  {FilterCallback} lambda
     *
     * @return {object}
     */
    find(lambda) {
        let index = -1;

        for (const item of this.ref) {
            index += 1;

            if (!lambda(item, index)) {
                continue;
            }

            return item;
        }
    },

    /**
     * Behaves like .find() but returns an index instead of a value.
     *
     * @param  {FilterCallback} lambda
     *
     * @return {number}
     */
    findIndex(lambda) {
        let index = -1;

        for (const item of this.ref) {
            index += 1;

            if (!lambda(item, index)) {
                continue;
            }

            return index;
        }
    },

    /**
     * Determine if the given value is included in the iterable.
     * Optionally specify a position at which to begin searching.
     *
     * @param {*} value
     * @param {number} [fromIndex=0]
     *
     * @return {boolean}
     */
    includes(value, fromIndex = 0) {
        return !!this.find((item, index) => {
            return item === value && index >= fromIndex;
        });
    },

    /**
     * Flattens a nested iterable structure for n depth.
     *
     * @param  {number} [depth=1]
     *
     * @return {Iterator}
     */
    flat(depth = 1) {
        return Iterator.new(this.rawFlat(depth));
    },

    /**
     * Applies both .map() and .flat()
     *
     * @param  {MapCallback} lambda
     * @param  {number} [depth=1]
     *
     * @return {Iterator}
     */
    flatMap(lambda, depth = 1) {
        return this.map(lambda).flat(depth);
    },

    /**
     * @param  {number} [depth=1]
     */
    *rawFlat(depth = 1) {
        for (const item of this.ref) {

            if (depth === 0) {
                yield item;

                continue;
            }

            if (!isIterator(item)) {
                yield item;

                continue;
            }

            const innerIter = Iterator.new(item);

            for (const inner of innerIter.rawFlat(depth - 1)) {
                yield inner;
            }
        }
    },

    /**
     * Applies the lambda function to each item until it returns true.
     * If the iterable is completely consumed {false} is returned.
     *
     * @param  {FilterCallback} lambda
     *
     * @return {boolean}
     */
    some(lambda) {
        return !!this.find(lambda);
    },

    /**
     * Removes duplicate entries from the iterable
     *
     * @param  {Function} [identify=item=>item]
     * @param  {Function} [merge=existing=>existing]
     *
     * @return {Iterator}
     */
    dedupe(identify = item => item, merge = existing => existing) {
        const map = this.reduce((map, next) => {
            const id = identify(next);
            const existing = map.get(id);

            if (existing ?? true) {
                map.set(id, next);

                return map;
            }

            map.set(id, merge(existing, next) ?? existing);

            return map;
        }, new Map());

        return Iterator.new(map.values());
    },

    /**
     * @param  {{ '[Symbol.iterator]': Function }} value
     * @return {Iterator}
     */
    new(value) {
        if (!isIterator(value)) {
            throw new TypeError('value is does not implement iterator!');
        }

        return { ref: value, __proto__: this };
    },

    /**
     * collects the iterator into an array.
     *
     * @return {Array}
     */
    intoArray() {
        return Array.from(this.ref);
    },

    /**
     * collects the iterator into a set.
     *
     * @return {Set}
     */
    intoSet() {
        return new Set(this.ref);
    },

    /**
     * collects the iterator into a map.
     *
     * @return {Map}
     */
    intoMap() {
        return new Map(this.ref);
    },

    /**
     * collects the iterator into an object.
     *
     * @return {object}
     */
    intoObject() {
        return Object.fromEntries(this.ref);
    }
};

export default Iterator;
