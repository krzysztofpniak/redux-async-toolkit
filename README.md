# redux-async-toolkit

Library that helps you write async code in redux style without need to write a lot of reducers. Simply use this one.

### Installation
To install the current version:

```
npm install --save redux-async-toolkit
```

### Attach reducer

```js
import { combineReducers } from 'redux';
import {asyncReducerCreator} from 'redux-async-toolkit';

const reducer = combineReducers({
  data: asyncReducerCreator({
    user: {
      list: [],
      create: {},
      current: [],
      update: {},
      delete: {}
    }
  })
});
```

### Attach middleware to your store

```js
import { createStore, applyMiddleware } from 'redux';
import { reduxAsyncMiddleware } from 'redux-async-toolkit';

const client = {
    hello: new Promise(resolve => setTimeout(() => resolve('some data')));
};

const finalCreateStore = applyMiddleware(reduxAsyncMiddleware(client))(createStore);

const store finalCreateStore(reducer);
```

### License

MIT
