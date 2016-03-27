const expect = require('chai').expect;
import {reduxAsyncMiddleware, asyncReducerCreator} from '../src';
import configureMockStore from 'redux-mock-store';
import MockDate from 'mockdate';

const client = {
    getData(success, result) {
        return new Promise((resolve, reject) => success ? resolve(result) : reject(result));
    }
};

const mockStore = configureMockStore([reduxAsyncMiddleware(client)]);

describe('middleware', () => {
    describe('when action is async', () => {
        it('should handle Promise success', (done) => {
            const store = mockStore({});
            MockDate.set('2016-03-27T23:00:00.000Z');
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
                    result: 'some example data',
                    timestamp: '2016-03-27T23:00:00.000Z'
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

describe('reducer', () => {
    describe('should return the initial state ', () => {
        it('with nested structure', () => {
            const reducer = asyncReducerCreator({test:{ sub: 'initial value'}});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    sub: {
                        data: 'initial value',
                        ready: false,
                        pending: false,
                        error: null
                    }
                }
            })
        });
        it('with not empty string', () => {
            const reducer = asyncReducerCreator({test: 'initial value'});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    data: 'initial value',
                    ready: false,
                    pending: false,
                    error: null
                }
            })
        });
        it('with nested structure and empty string', () => {
            const reducer = asyncReducerCreator({test:{ sub: ''}});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    sub: {
                        data: '',
                        ready: false,
                        pending: false,
                        error: null
                    }
                }
            })
        });
        it('with nested structure and empty array', () => {
            const reducer = asyncReducerCreator({test:{ sub: []}});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    sub: {
                        data: [],
                        ready: false,
                        pending: false,
                        error: null
                    }
                }
            })
        });
        it('with nested structure and empty object', () => {
            const reducer = asyncReducerCreator({test:{ sub: {}}});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    sub: {
                        data: {},
                        ready: false,
                        pending: false,
                        error: null
                    }
                }
            })
        });
        it('with nested structure and not empty array', () => {
            const reducer = asyncReducerCreator({test:{ sub: ['initial', 'value']}});
            expect(
                reducer(undefined, {})
            ).to.deep.equal({
                test: {
                    sub: {
                        data: ['initial', 'value'],
                        ready: false,
                        pending: false,
                        error: null
                    }
                }
            })
        });
    });
});
