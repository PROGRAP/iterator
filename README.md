# @PROGRAP/iterator

Iterator library for ECMAScript to easily work with the same set of methods from arrays on any kind of iterable.

## Installation
```bash
npm i @prograp/iterator
```

## Usage
```js
import { Iterator } from '@prograp/iterator';

iterator.new(iterable)
    .map(...)
    .filter(...)
    .find(...)
    .reduce(...)
    .dedupe(...)
    .forEach(...)
    .flat(...)
    .flatMap(...)
    .find(...)
    .findIndex(...)
    .some(...)
    .intoArray()
    .intoSet()
    .intoMap()
```

## Contribution
Feel free to open a new issue if you encounter bugs or have suggestions for improvements,
but make sure to file one before submitting a Pull-Request, as every PR has to have an issue associated with it.
