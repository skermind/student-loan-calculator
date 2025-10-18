"""
calculator.py

Core loan calculation logic for the Student Loan Calculator app.

This module contains the `calculate_loan` function, which computes a
year-by-year projection of a student's loan repayment based on UK
student loan plans, salary, bonus, and salary growth. The output is
a list of dictionaries suitable for returning as JSON in a FastAPI
endpoint or displaying in a frontend table.

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
            - "Year" (int): The current year number
            - "Salary" (float): Base salary for the year
            - "Bonus" (float): Calculated bonus for the year
            - "TotalIncome" (float): Total income including salary and bonus
            - "Repayment" (float): Amount repaid this year
            - "Interest" (float): Interest accrued this year
            - "Outstanding" (float): Remaining loan balance after repayment and interest
            - "TimeToPayOff" (int, optional): The year the loan balance reaches 0, included in the final year's entry only.

    Notes:
        - The calculation stops early if the loan is fully repaid before the write-off period.
        - Loan plan thresholds, interest rates, repayment rates, and write-off period
          are loaded from `data/loan_plans.json`.
        - Salary is compounded each year using `salary_growth`.
        - The calculation splits the salary and bonus across nominal and bonus periods
          for more accurate repayment calculation.
    """
    # Load config
    with open("data/loan_plans.json") as f:
        config = json.load(f)[plan]

    threshold = config["threshold"]
    interest_rate = config["interest_rate"]
    years = config["write_off_years"]
    repayment_rate = config["repayment_rate"]

    rows = []
    time_to_payoff = None
    for year in range(1, years + 1):
        salary = salary
        bonus = salary * bonus_rate
        nomimal_period_rate = 11/12
        bonus_period_rate = 1/12
        total_income = salary + bonus
        income_above_nominal_period = max(0, (salary*nomimal_period_rate - threshold*nomimal_period_rate))
        repayment_nominal_period = income_above_nominal_period * repayment_rate
        income_above_bonus_period = max(0, (salary*bonus_period_rate + bonus - threshold*bonus_period_rate))
        repayment_bonus_period = income_above_bonus_period * repayment_rate
        repayment = repayment_nominal_period + repayment_bonus_period
        interest = outstanding * interest_rate
        outstanding = max(0,outstanding + interest - repayment)
        rows.append({
            "Year": year,
            "Salary": salary,
            "Bonus": bonus,
            "TotalIncome": total_income,
            "Repayment": repayment,
            "Interest": interest,
            "Outstanding": outstanding
        })
        if outstanding <= 0 and time_to_payoff is None:
            time_to_payoff = year
            outstanding = 0
            break
        salary *= (1 + salary_growth)
    if time_to_payoff is None:
        time_to_payoff = years
    # Add TimeToPayOff to the final year's dictionary for frontend compatibility
    if rows:
        rows[-1]["TimeToPayOff"] = time_to_payoff
    return rows