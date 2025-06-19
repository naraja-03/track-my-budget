import { useEffect } from "react";
import { useRouter } from "next/router";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthExpenseIndex() {
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const month = monthNames[now.getMonth()];
    router.replace(`/monthExpense/${month}`);
  }, [router]);

  return null;
}