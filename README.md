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

### 3. Create some actions

```js
function loadHello() {
  return {
    key: 'hello', //points to the path in the store
    async: client => client.getHello()
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
        {hello.pending ? <div>Loading ...</div> : <div>{hello.data}</div>}
        /* ... at the end you can use 'pending' prop to track the loading state */
      </div>
      );
  }
}
```

### License

MIT
