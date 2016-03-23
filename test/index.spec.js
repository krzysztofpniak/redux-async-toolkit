const expect = require('chai').expect;
import {reduxAsyncMiddleware} from '../src';

const createFakeStore = fakeData => ({
    getState() {
        return fakeData
    }
});

const dispatchWithStoreOf = (storeData, action) => {
    let dispatched = null;
    const dispatch = reduxAsyncMiddleware(createFakeStore(storeData))(actionAttempt => dispatched = actionAttempt);
    dispatch(action);
    return dispatched;
};

describe('actions', () => {
    it('should create an action to add a todo', () => {
        const text = 'Finish docs';
        expect('asd').to.equal('asdas a');
    })
});
