import { Provider, TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { store, test } from 'src/store'

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
type AppDispatch = typeof store.dispatch

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

function InnerApp(){
    let testState = useAppSelector(state=>state)
    let dispatch = useAppDispatch()
    return <>
        <div>hello {testState.test.value}</div>
        <button onClick={()=>dispatch(test(90))}>test</button>
    </>
}
export default function MeetingIndex(){
    return <Provider store={store} >
        <InnerApp />
    </Provider>
}