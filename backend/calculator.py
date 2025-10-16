"""
calculator.py

Core loan calculation logic for the Student Loan Calculator app.

This module contains the `calculate_loan` function, which computes a year-by-year
projection of a student's loan repayment based on UK student loan plans, salary,
bonus, and salary growth. The output is a list of dictionaries suitable for
returning as JSON in a FastAPI endpoint or displaying in a frontend table.

Author: Daniel Skerman
"""

import json
import pandas as pd

def calculate_loan(plan, outstanding, salary, bonus_rate, salary_growth):
    """
    Calculate yearly loan projections for a given loan plan.

    Args:
        plan (str): The loan plan key (e.g., "plan_2") to use from the loan_plans.json configuration.
        outstanding (float): Current outstanding loan balance.
        salary (float): User's current annual salary.
        bonus_rate (float): Fraction of salary added as bonus each year (e.g., 0.1 = 10%).
        salary_growth (float): Expected annual salary growth rate (e.g., 0.02 = 2%).

    Returns:
        List[Dict]: A list of dictionaries, one per year, each containing:
            - "Year": int, the current year number
            - "Salary": float, the base salary for the year
            - "Bonus": float, calculated bonus for the year
            - "TotalIncome": float, salary + bonus
            - "AboveThreshold": float, income above the repayment threshold
            - "Repayment": float, amount repaid this year
            - "Interest": float, interest accrued this year
            - "Outstanding": float, remaining loan balance after repayment and interest

    Notes:
        - The loan plan thresholds, interest rates, write-off period, and repayment rates are loaded from `data/loan_plans.json`.
        - The salary is compounded each year using the salary_growth rate.
    """
    # Load config
    with open("data/loan_plans.json") as f:
        config = json.load(f)[plan]

    threshold = config["threshold"]
    interest_rate = config["interest_rate"]
    years = config["write_off_years"]
    repayment_rate = config["repayment_rate"]

    rows = []
    for year in range(1, years + 1):
        salary = salary
        bonus = salary * bonus_rate
        total_income = salary + bonus
        income_above = max(0, total_income - threshold)
        repayment = income_above * repayment_rate
        interest = outstanding * interest_rate
        outstanding = outstanding + interest - repayment
        rows.append({
            "Year": year,
            "Salary": salary,
            "Bonus": bonus,
            "TotalIncome": total_income,
            "AboveThreshold": income_above,
            "Repayment": repayment,
            "Interest": interest,
            "Outstanding": outstanding
        })
        salary *= (1 + salary_growth)
    return rows