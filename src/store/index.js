import { configureStore } from '@reduxjs/toolkit';
import web3Reducer from './reducers/web3Reducer';

export const createStore = () => {
    const store = configureStore({
        reducer: {
            web3: web3Reducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
    return store;
};

const store = createStore();

export default store;
