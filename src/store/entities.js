import { combineReducers } from "redux";
import menuReducer from "./menu"
export default combineReducers({
    menubars: menuReducer
})

