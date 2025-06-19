import { expenseApi } from "@/service/query/endpoints/ExpenseApi";
import appSlice from "@/slice/appSlice";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  application: appSlice,
  [expenseApi.reducerPath]: expenseApi.reducer,
});

export default rootReducer;
