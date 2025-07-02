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
  description?: string;
  slug?: string;
  createdAt?: string;
}

export interface CustomExpenseTransaction {
  _id: string;
  customExpenseId: string;
  category: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Expenses", "CustomExpenses", "CustomExpenseTransactions"],
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

    // POST: bulk update all items for a date
    bulkUpdateExpenses: builder.mutation<
      { ok: boolean },
      { date: string; items: ExpenseItem[] }
    >({
      query: (body) => ({
        url: "expenses",
        method: "POST",
        body: { type: "bulk_update", ...body },
      }),
      invalidatesTags: ["Expenses"],
    }),

    // POST: granular update with operations array
    granularUpdateExpenses: builder.mutation<
      { ok: boolean; itemsCount: number },
      { 
        date: string; 
        operations: Array<{
          type: 'add' | 'update' | 'delete';
          index?: number;
          item?: ExpenseItem;
        }> 
      }
    >({
      query: (body) => ({
        url: "expenses",
        method: "POST",
        body: { type: "granular_update", ...body },
      }),
      invalidatesTags: ["Expenses"],
    }),

    // PUT: update a specific expense item by index
    updateExpenseItem: builder.mutation<
      { ok: boolean },
      { date: string; index: number; item: ExpenseItem }
    >({
      query: (body) => ({
        url: "expenses",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Expenses"],
    }),

    // DELETE: delete a specific expense item by index
    deleteExpenseItem: builder.mutation<
      { ok: boolean },
      { date: string; index: number }
    >({
      query: ({ date, index }) => ({
        url: `expenses?date=${encodeURIComponent(date)}&index=${index}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),

    // DELETE: delete entire day
    deleteExpenseDay: builder.mutation<
      { ok: boolean },
      { date: string }
    >({
      query: ({ date }) => ({
        url: `expenses?date=${encodeURIComponent(date)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),

    // POST: update target
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

    // Get a single custom expense by ID or slug
    getCustomExpenseByIdentifier: builder.query<
      { item: CustomExpense },
      { identifier: string }
    >({
      query: ({ identifier }) => ({ 
        url: `custom_expenses?identifier=${encodeURIComponent(identifier)}`, 
        method: "GET" 
      }),
      providesTags: ["CustomExpenses"],
    }),

    // Dashboard: Add a custom project
    addCustomExpense: builder.mutation<
      { ok: boolean; id: string; slug?: string },
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
    deleteCustomExpense: builder.mutation<{ ok: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `custom_expenses?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomExpenses"],
    }),

    // Custom Expense Transactions: Get transactions for a custom expense
    getCustomExpenseTransactions: builder.query<
      { items: CustomExpenseTransaction[] },
      { customExpenseId: string }
    >({
      query: ({ customExpenseId }) => `custom_expense_transactions?customExpenseId=${customExpenseId}`,
      providesTags: ["CustomExpenseTransactions"],
    }),

    // Custom Expense Transactions: Add a transaction
    addCustomExpenseTransaction: builder.mutation<
      { ok: boolean; id: string },
      {
        customExpenseId: string;
        category: string;
        amount: number;
        note?: string;
        date: string;
      }
    >({
      query: (body) => ({
        url: "custom_expense_transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomExpenseTransactions"],
    }),

    // Custom Expense Transactions: Update a transaction
    updateCustomExpenseTransaction: builder.mutation<
      { ok: boolean },
      {
        id: string;
        category: string;
        amount: number;
        note?: string;
        date: string;
      }
    >({
      query: (body) => ({
        url: "custom_expense_transactions",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CustomExpenseTransactions"],
    }),

    // Custom Expense Transactions: Granular update with operations array
    granularUpdateCustomExpenseTransactions: builder.mutation<
      { ok: boolean; processed: { added: number; updated: number; deleted: number; total: number } },
      {
        customExpenseId: string;
        operations: Array<{
          type: 'add' | 'update' | 'delete';
          id?: string;
          transaction?: {
            category: string;
            amount: number;
            note?: string;
            date: string;
          };
        }>;
      }
    >({
      query: (body) => ({
        url: "custom_expense_transactions",
        method: "POST",
        body: { type: "granular_update", ...body },
      }),
      invalidatesTags: ["CustomExpenseTransactions"],
    }),

    // Custom Expense Transactions: Delete a transaction
    deleteCustomExpenseTransaction: builder.mutation<
      { ok: boolean },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `custom_expense_transactions?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomExpenseTransactions"],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpensesByMonthQuery,
  useUpdateMutation,
  useBulkUpdateExpensesMutation,
  useGranularUpdateExpensesMutation,
  useUpdateExpenseItemMutation,
  useDeleteExpenseItemMutation,
  useDeleteExpenseDayMutation,
  useUpdateTargetMutation,
  useGetCustomExpensesQuery,
  useGetCustomExpenseByIdentifierQuery,
  useAddCustomExpenseMutation,
  useDeleteCustomExpenseMutation,
  useGetCustomExpenseTransactionsQuery,
  useAddCustomExpenseTransactionMutation,
  useUpdateCustomExpenseTransactionMutation,
  useGranularUpdateCustomExpenseTransactionsMutation,
  useDeleteCustomExpenseTransactionMutation,
} = expenseApi;
