import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ExpenseItem {
  category: string;
  amount: number;
  note?: string;
}
export interface DayExpense {
  date: string;
  items: ExpenseItem[];
}

export interface CustomExpense {
  _id: string;
  title: string;
  target: number;
}

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Expenses", "CustomExpenses"],
  endpoints: (builder) => ({
    // GET: fetch expenses
    getExpenses: builder.query<DayExpense[], void>({
      query: () => "expenses",
      providesTags: ["Expenses"],
    }),
    // GET: fetch expenses by month
    getExpensesByMonth: builder.query<
      { items: DayExpense[]; target?: number },
      { monthName: string; yearNum: number }
    >({
      query: ({ monthName, yearNum }) => {
        const monthNames = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];
        const monthIdx = monthNames.findIndex(
          m => m.toLowerCase() === monthName.toLowerCase()
        );
        const monthParam = `${yearNum}-${String(monthIdx + 1).padStart(2, "0")}`;
        return `expenses?month=${monthParam}`;
      },
      providesTags: ["Expenses"],
    }),
    // POST: add expense
    update: builder.mutation<void, { date: string; newItem: ExpenseItem }>({
      query: (body) => ({
        url: "expenses",
        method: "POST",
        body: { type: "update", ...body },
      }),
      invalidatesTags: ["Expenses"],
    }),
  updateTarget: builder.mutation<
    { ok: boolean },
    { month: string; target: number }
  >({
    query: (body) => ({
      url: "expenses",
      method: "POST",
      body: { type: "target", ...body },
      headers: { "Content-Type": "application/json" },
    }),
    invalidatesTags: ["Expenses"],
  }),
  // Dashboard: Get all custom projects
  getCustomExpenses: builder.query<{ items: CustomExpense[] }, void>({
    query: () => ({ url: "custom_expenses", method: "GET" }),
    providesTags: ["CustomExpenses"],
  }),

  // Dashboard: Add a custom project
  addCustomExpense: builder.mutation<
    { ok: boolean; id: string },
    { title: string; target: number; description?: string }
  >({
    query: (body) => ({
      url: "custom_expenses",
      method: "POST",
      body: { type: "create", ...body },
    }),
    invalidatesTags: ["CustomExpenses"],
  }),
  // Dashboard: Delete a custom project
  deleteCustomExpense: builder.mutation<{ ok: boolean }, { id: string }>(
    {
      query: ({ id }) => ({
        url: `custom_expenses?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomExpenses"],
    }
  ),
}),
});

export const {
  useGetExpensesQuery,
  useGetExpensesByMonthQuery,
  useUpdateMutation,
  useUpdateTargetMutation,
  useGetCustomExpensesQuery,
  useAddCustomExpenseMutation,
  useDeleteCustomExpenseMutation,
} = expenseApi;
