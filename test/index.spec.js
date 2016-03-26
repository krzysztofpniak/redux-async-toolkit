const expect = require('chai').expect;
import {reduxAsyncMiddleware} from '../src';
import configureMockStore from 'redux-mock-store';

const client = {
    getData(success, result) {
        return new Promise((resolve, reject) => success ? resolve(result) : reject(result));
    }
}

const mockStore = configureMockStore([reduxAsyncMiddleware(client)]);

describe('middleware', () => {
    describe('when action is async', () => {
        it('should handle Promise success', (done) => {
            const store = mockStore({});
            store.dispatch({
                async: client => client.getData(true, 'some example data'),
                key: 'test'
            })
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).to.equal(2);
                expect(actions[0]).to.deep.equal({
                    key: 'test',
                    type: 'redux-async-toolkit/REQUEST'
                });
                expect(actions[1]).to.deep.equal({
                    key: 'test',
                    type: 'redux-async-toolkit/SUCCESS',
                    result: 'some example data'
                });
            }).then(done).catch(done);
        });

        it('should handle Promise fail', (done) => {
            const store = mockStore({});
            store.dispatch({
                async: client => client.getData(false, 'error happened'),
                key: 'test'
            })
            .then(() => {
                const actions = store.getActions();
                expect(actions.length).to.equal(2);
                expect(actions[0]).to.deep.equal({
                    key: 'test',
                    type: 'redux-async-toolkit/REQUEST'
                });
                expect(actions[1]).to.deep.equal({
                    key: 'test',
                    type: 'redux-async-toolkit/FAILURE',
                    error: 'error happened'
                });

            }).then(done).catch(done);
        });
    });
    describe('when action is normal', () => {
        it('should bypass normal action', () => {
            const store = mockStore({});
            store.dispatch({
                type: 'normal action',
                data: 'some param'
            });
            const actions = store.getActions();
            expect(actions.length).to.equal(1);
            expect(actions[0]).to.deep.equal({
                type: 'normal action',
                data: 'some param'
            });
        });
    });
});
