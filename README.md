# redux-async-toolkit

Library that helps you write async code in redux style without need to write a lot of reducers. Simply use the one included in this library.

If you are curious about **usage** scroll down to **4th point**.

[![build status](https://img.shields.io/travis/krzysztofpniak/redux-async-toolkit/master.svg?style=flat-square)](https://travis-ci.org/krzysztofpniak/redux-async-toolkit)
[![npm version](https://img.shields.io/npm/v/redux-async-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/redux-async-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/redux-async-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/redux-async-toolkit)

### Installation
To install the current version:

```
npm install --save redux-async-toolkit
```

### 1. Attach reducer

```js
import { combineReducers } from 'redux';
import { asyncReducerCreator } from 'redux-async-toolkit';

const reducer = combineReducers({
  data: asyncReducerCreator({
    hello: "some initial value"
  })
});
```

### 2. Attach middleware to your store

```js
import { createStore, applyMiddleware } from 'redux';
import { reduxAsyncMiddleware } from 'redux-async-toolkit';

const client = {
    getHello: new Promise(resolve => setTimeout(() => resolve('hello world')));
};

const finalCreateStore = applyMiddleware(reduxAsyncMiddleware(client))(createStore);

const store finalCreateStore(reducer);
```

### 3a. Create some actions

```js
function loadHello() {
  return {
    key: 'hello', //points to the path in the store
    async: client => client.getHello()
  };
}
```

### 3b. Cache your results if needed

```js
function loadHello(forceReload) {
  return {
    key: 'hello', //points to the path in the store
    async: client => client.getHello(),
    cache: forceReload ? false : 10 // cache duration in seconds
  };
}
```

### 4. Connect as usual

```js
@connect(
  state => ({
    hello: state.data.hello // your promise result is available at 'data' prop ...
  }),
  {loadHello})
export default class HelloComponent extends Component {
  static propTypes = {
    hello: PropTypes.object, // ... so you have to define its type as object here ...
    loadHello: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.loadHello(); // ... call your action on after component mount or whenever you want ...
  }

  render() {
    const {hello} = this.props;

    return (
      <div>
        {hello.pending ? // 'pending' prop is set to true at each action start
            <div>Loading ...</div> :
            <div>
                {hello.ready && <div>{hello.data}</div>} // 'ready' means that at least one Promise was resolved
                {hello.error && <div>{hello.error}</div>} // 'error' contains data passed to Promise reject
            </div>
        }
      </div>
      );
  }
}
```

### License

MIT
