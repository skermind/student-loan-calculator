'use client';
import { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

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
  bonus_rate: string;
  salary_growth: string;
}

export default function Home() {
  const [form, setForm] = useState<LoanForm>({
    plan: 'plan_2',
    outstanding: 50000,
    salary: 30000,
    bonus_rate: '10',
    salary_growth: '5',
  });

  const [results, setResults] = useState<LoanYear[]>([]);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'bonus_rate' || name === 'salary_growth') {
      // Allow free typing, storing as string
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        // keep plan as string, parse numbers for other fields
        [name]: name === 'plan' ? value : parseFloat(value),
      }));
    }
  };

  // Submit form and fetch calculation from FastAPI
  const handleSubmit = async () => {
    try {
      // Convert bonus_rate and salary_growth from strings to numbers
      const bonusRateNum = parseFloat(form.bonus_rate);
      const salaryGrowthNum = parseFloat(form.salary_growth);

      // Validate bonus_rate and salary_growth are numbers within 0-100
      if (
        isNaN(bonusRateNum) ||
        bonusRateNum < 0 ||
        bonusRateNum > 100 ||
        isNaN(salaryGrowthNum) ||
        salaryGrowthNum < 0 ||
        salaryGrowthNum > 100
      ) {
        alert('Bonus Rate and Salary Growth must be numbers between 0 and 100.');
        return;
      }

      // Convert bonus_rate and salary_growth from percentages to decimals if >1
      const payload = {
        ...form,
        bonus_rate: bonusRateNum > 1 ? bonusRateNum / 100 : bonusRateNum,
        salary_growth: salaryGrowthNum > 1 ? salaryGrowthNum / 100 : salaryGrowthNum,
      };
      const res = await axios.post<LoanYear[]>('http://127.0.0.1:8000/calculate', payload);
      setResults(res.data);
    } catch (error) {
      console.error('Error fetching loan data:', error);
    }
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen flex items-center justify-center bg-[#0f1117] text-[#fcffe9] p-8`}>
      <div className="max-w-3xl w-full">
        <h1 className="text-[#1DB954] text-4xl font-bold text-center mb-8">Student Loan Calculator</h1>

        <div className="bg-[var(--card-bg,#1a1d29)] border border-[var(--border-color,#2a2f3d)] rounded-2xl p-8 shadow mb-8">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-x-4 mb-10 relative group">
              <label htmlFor="plan" className="text-[#a9b3c1] w-44">Repayment Plan</label>
              <select
                id="plan"
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="flex-1 min-w-[180px] bg-[#1a1d29] text-[#fcffe9] border border-[#2a2f3d] rounded-md p-2 focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50 transition"
              >
                <option value="plan_1">Plan 1</option>
                <option value="plan_2">Plan 2</option>
                <option value="plan_4">Plan 4</option>
                <option value="postgraduate">Postgraduate</option>
              </select>

              <div className="absolute top-full left-[calc(11rem+1rem)] mt-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-auto z-10">
                Enter your student loan plan{' '}
                <a href="https://www.gov.uk/sign-in-to-manage-your-student-loan-balance" target="_blank" rel="noopener noreferrer" className="underline text-[#1DB954] hover:text-[#17a74b]">
                  find here
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-x-4 mb-10 relative group">
              <label htmlFor="outstanding" className="text-[#a9b3c1] w-44">Outstanding (£)</label>
              <input
                id="outstanding"
                name="outstanding"
                value={form.outstanding}
                onChange={handleChange}
                type="number"
                className="flex-1 min-w-[180px] bg-[#1a1d29] text-[#fcffe9] border border-[#2a2f3d] rounded-md p-2 focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50 transition"
              />
              <div className="absolute top-full left-[calc(11rem+1rem)] mt-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-auto z-10">
                Enter your outstanding student loan  balance {' '}
                <a href="https://www.gov.uk/sign-in-to-manage-your-student-loan-balance" target="_blank" rel="noopener noreferrer" className="underline text-[#1DB954] hover:text-[#17a74b]">
                  find here
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-x-4 mb-10 relative group">
              <label htmlFor="salary" className="text-[#a9b3c1] w-44">Salary (£)</label>
              <input
                id="salary"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                type="number"
                className="flex-1 min-w-[180px] bg-[#1a1d29] text-[#fcffe9] border border-[#2a2f3d] rounded-md p-2 focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50 transition"
              />
              <div className="absolute top-full left-[calc(11rem+1rem)] mt-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                Enter you take home salary before tax
              </div>
            </div>

            <div className="flex items-center justify-between gap-x-4 group relative mb-10">
              <label htmlFor="bonus_rate" className="text-[#a9b3c1] w-44 cursor-default">Bonus Rate (%)</label>
              <input
                id="bonus_rate"
                name="bonus_rate"
                value={form.bonus_rate}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="flex-1 min-w-[180px] bg-[#1a1d29] text-[#fcffe9] border border-[#2a2f3d] rounded-md p-2 focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50 transition"
              />
              <div className="absolute top-full left-[calc(11rem+1rem)] mt-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                Enter bonus rate as a percentage (0-100)
              </div>
            </div>

            <div className="flex items-center justify-between gap-x-4 group relative mb-8">
              <label htmlFor="salary_growth" className="text-[#a9b3c1] w-44 cursor-default">Salary Growth (%)</label>
              <input
                id="salary_growth"
                name="salary_growth"
                value={form.salary_growth}
                onChange={handleChange}
                type="number"
                step="0.01"
                className="flex-1 min-w-[180px] bg-[#1a1d29] text-[#fcffe9] border border-[#2a2f3d] rounded-md p-2 focus:outline-none focus:border-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-opacity-50 transition"
              />
              <div className="absolute top-full left-[calc(11rem+1rem)] mt-2 w-max bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                Enter salary growth as a percentage (0-100)
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-[#1DB954] hover:bg-[#17a74b] text-[#0f1117] font-semibold py-2 rounded-md transition"
          >
            Calculate
          </button>

          {/* Conditionally render results table */}
          {results.length > 0 && (
            <div className="mt-8">
              <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
                <thead className="bg-[#1a1d29] text-[#1DB954]">
                  <tr>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Year</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Salary</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Bonus</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Total Income</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Above Threshold</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Repayment</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Interest</th>
                    <th className="border border-[#2a2f3d] px-3 py-2 text-left">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.Year} className={i % 2 === 0 ? 'bg-[#161924]' : ''}>
                      <td className="border border-[#2a2f3d] px-3 py-1">{r.Year}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.Salary.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.Bonus.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.TotalIncome.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.AboveThreshold.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.Repayment.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.Interest.toFixed(0)}</td>
                      <td className="border border-[#2a2f3d] px-3 py-1">£{r.Outstanding.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}