'use client';
import { useState, ChangeEvent } from 'react';
import axios from 'axios';

// Define a TypeScript interface for a single year's loan data
interface LoanYear {
  Year: number;
  Salary: number;
  Bonus: number;
  TotalIncome: number;
  AboveThreshold: number;
  Repayment: number;
  Interest: number;
  Outstanding: number;
}

// Define the form state type
interface LoanForm {
  plan: string;
  outstanding: number;
  salary: number;
  bonus_rate: number;
  salary_growth: number;
}

export default function Home() {
  const [form, setForm] = useState<LoanForm>({
    plan: "plan_2",
    outstanding: 50000,
    salary: 30000,
    bonus_rate: 0.1,
    salary_growth: 0.05,
  });

  const [results, setResults] = useState<LoanYear[]>([]);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'plan' ? value : parseFloat(value),
    }));
  };

  // Submit form and fetch calculation from FastAPI
  const handleSubmit = async () => {
    try {
      const res = await axios.post<LoanYear[]>("http://127.0.0.1:8000/calculate", form);
      setResults(res.data);
    } catch (error) {
      console.error("Error fetching loan data:", error);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Student Loan Calculator</h1>
      <div className="grid gap-3 mb-4">
        <input name="plan" value={form.plan} onChange={handleChange} placeholder="Plan" className="border p-2" />
        <input name="outstanding" value={form.outstanding} onChange={handleChange} placeholder="Outstanding" type="number" className="border p-2" />
        <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" type="number" className="border p-2" />
        <input name="bonus_rate" value={form.bonus_rate} onChange={handleChange} placeholder="Bonus Rate" type="number" step="0.01" className="border p-2" />
        <input name="salary_growth" value={form.salary_growth} onChange={handleChange} placeholder="Salary Growth" type="number" step="0.01" className="border p-2" />
        <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">Calculate</button>
      </div>

      {results.length > 0 && (
        <table className="w-full text-sm border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th>Year</th>
              <th>Salary</th>
              <th>Bonus</th>
              <th>Total Income</th>
              <th>Above Threshold</th>
              <th>Repayment</th>
              <th>Interest</th>
              <th>Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.Year}>
                <td>{r.Year}</td>
                <td>£{r.Salary.toFixed(0)}</td>
                <td>£{r.Bonus.toFixed(0)}</td>
                <td>£{r.TotalIncome.toFixed(0)}</td>
                <td>£{r.AboveThreshold.toFixed(0)}</td>
                <td>£{r.Repayment.toFixed(0)}</td>
                <td>£{r.Interest.toFixed(0)}</td>
                <td>£{r.Outstanding.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}