import { configureStore, createSlice } from "@reduxjs/toolkit";

let testSlice = createSlice({
    name: "test",
    initialState: {
        value: 0
    },
    reducers: {
        test(state,action){
            state.value += action.payload
        }
    }
})

export let {test} = testSlice.actions
export let store = configureStore({
    reducer: {
        test:testSlice.reducer
    }
})