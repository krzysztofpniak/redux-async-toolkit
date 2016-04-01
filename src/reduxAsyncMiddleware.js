import set from 'lodash/fp/setWith';
import get from 'lodash/get';
import setMutable from 'lodash/set';

const setImmutable = (path, data, obj) => set(Object, path, data, obj);
const REQUEST = 'redux-async-toolkit/REQUEST';
const SUCCESS = 'redux-async-toolkit/SUCCESS';
const FAILURE = 'redux-async-toolkit/FAILURE';

function walkObj(obj, cb, path = '') {
    Object.keys(obj).forEach(key => {
        const keyPath = path + '.' + key;
        const keyValue = obj[key];
        if (typeof keyValue === "object" && !Array.isArray(keyValue) && Object.keys(keyValue).length > 0) {
            walkObj(keyValue, cb, keyPath);
        } else {
            cb(keyPath, keyValue);
        }
    });
}

function prepareDefaults(definitions) {
    const result = {};

    walkObj(definitions, (path, value) =>
        setMutable(result, path, {
            pending: false,
            ready: false,
            error: null,
            data: value
        })
    );

    return result;
}

export function asyncReducerCreator(definitions) {
    const defaults = prepareDefaults(definitions);

    return function asyncReducer(state = defaults, action = {}) {
        const stateSlice = get(state, action.key) || {};

        switch (action.type) {
            case REQUEST:
                return setImmutable(action.key, {
                    pending: true,
                    ready: false,
                    error: null,
                    data: stateSlice.data,
                    timestamp: stateSlice.timestamp
                }, state);
            case SUCCESS:
                return setImmutable(action.key, {
                    pending: false,
                    ready: true,
                    error: null,
                    data: action.result,
                    timestamp: action.timestamp
                }, state);
            case FAILURE:
                return setImmutable(action.key, {
                    pending: false,
                    ready: false,
                    error: action.error,
                    data: stateSlice.data,
                    timestamp: stateSlice.timestamp
                }, state);
            default:
                return state;
        }
    };
}

export function reduxAsyncMiddleware(client, path = 'data') {
    return ({dispatch, getState}) => {
        return next => action => {
            const { async, ...rest } = action; // eslint-disable-line no-redeclare
            if (!async || !action.key) {
                return next(action);
            }

            const stateSlice = get(getState(), path + '.' + action.key) || {};
            const timeElapsed = (new Date().getTime() - new Date(stateSlice.timestamp).getTime())/1000;

            if (!action.cache || !stateSlice.ready || (timeElapsed > action.cache)) {
                next({...rest, type: REQUEST});
                return async(client, dispatch).then(
                    (result) => next({...rest, result, timestamp: new Date().toISOString(), type: SUCCESS}),
                    (error) => next({...rest, error, type: FAILURE})
                ).catch((error)=> {
                    console.error('MIDDLEWARE ERROR:', error);
                    next({...rest, error, type: FAILURE});
                });
            }

            return Promise.resolve(next({...rest, result: stateSlice.data, type: SUCCESS, timestamp: stateSlice.timestamp}));
        };
    };
}
