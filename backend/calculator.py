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

def calculate_loan(plan, outstanding, salary, bonus_rate, salary_growth, graduation_year, birth_year):
    """
    Calculate yearly loan projections for a given loan plan.

    Args:
        plan (str): The loan plan key (e.g., "plan_2") to use from the loan_plans.json configuration.
        outstanding (float): Current outstanding loan balance.
        salary (float): User's current annual salary.
        bonus_rate (float): Fraction of salary added as bonus each year (e.g., 0.1 = 10%).
        salary_growth (float): Expected annual salary growth rate (e.g., 0.02 = 2%).
        graduation_year (int): The year the student graduated.
        birth_year (int): The birth year of the student.

    Returns:
        List[Dict]: A list of dictionaries, one per year, each containing:
            - "Year" (int): The current year number starting from 0
            - "Salary" (float): Base salary for the year
            - "Bonus" (float): Calculated bonus for the year
            - "TotalIncome" (float): Total income including salary and bonus
            - "Repayment" (float): Amount repaid this year
            - "Interest" (float): Interest accrued this year
            - "Outstanding" (float): Remaining loan balance after repayment and interest
            - "TimeToPayOff" (int, optional): The year the loan balance reaches 0, included in the final year's entry only.

    Notes:
        - The calculation starts from the current year and stops early if the loan is fully repaid before the write-off period.
        - Loan plan thresholds, interest rates, repayment rates, and write-off period
          are loaded from `data/loan_plans.json`.
        - Salary is compounded each year using `salary_growth`.
        - The calculation splits the salary and bonus across nominal and bonus periods
          for more accurate repayment calculation.
        - Write-off year determination logic has been updated to follow the latest UK government rules.
        - For Plan 1, Plan 4, Plan 2, Plan 5, and Postgraduate loans, the write-off year now considers both graduation year and birth year to determine the appropriate write-off date.
    """
    # Load config
    with open("data/loan_plans.json") as f:
        config = json.load(f)[plan]

    threshold = config["threshold"]
    interest_rate = config["interest_rate"]
    repayment_rate = config["repayment_rate"]

    # Determine write-off year based on plan and UK government rules
    if plan == "plan_1":
        # Plan 1 loans are written off 25 years after April following graduation
        if graduation_year >= 2009:
            write_off_year = graduation_year + 25
        else:
            write_off_year = min(graduation_year + 25, birth_year + 65)
    elif plan == "plan_2":
        # Plan 2 loans are written off 30 years after April following graduation
        write_off_year = graduation_year + 30
    elif plan == "plan_4":
        # Plan 4 loans are written off 30 years after April following graduation
        if graduation_year >= 2011:
            write_off_year = graduation_year + 30
        else:
            write_off_year = min(graduation_year + 30, birth_year + 65)
    elif plan == "plan_5":
        # Plan 5 loans are written off 30 years after April following graduation
        write_off_year = graduation_year + 40
    elif plan == "postgraduate":
        # Postgraduate loans are written off 30 years after April following graduation
        write_off_year = graduation_year + 30
    else:
        # Default to write_off_year from config if plan not recognized
        write_off_year = graduation_year + config.get("write_off_years", 30)

    rows = []
    time_to_payoff = None
    current_year = pd.Timestamp.now().year
    year_number = 0
    while current_year <= write_off_year:
        salary_year = salary
        bonus = salary_year * bonus_rate
        nomimal_period_rate = 11/12
        bonus_period_rate = 1/12
        total_income = salary_year + bonus
        income_above_nominal_period = max(0, (salary_year*nomimal_period_rate - threshold*nomimal_period_rate))
        repayment_nominal_period = income_above_nominal_period * repayment_rate
        income_above_bonus_period = max(0, (salary_year*bonus_period_rate + bonus - threshold*bonus_period_rate))
        repayment_bonus_period = income_above_bonus_period * repayment_rate
        repayment = repayment_nominal_period + repayment_bonus_period
        interest = outstanding * interest_rate
        
        # Prevent overpaying in the final year. The repayment cannot exceed
        # the balance owed after interest has been applied.
        balance_due = outstanding + interest
        repayment = min(repayment, balance_due)

        outstanding = max(0, balance_due - repayment)
        
        rows.append({
            "Year": year_number,
            "Salary": salary_year,
            "Bonus": bonus,
            "TotalIncome": total_income,
            "Repayment": repayment,
            "Interest": interest,
            "Outstanding": outstanding
        })
        if outstanding <= 0 and time_to_payoff is None:
            time_to_payoff = year_number
            outstanding = 0
            break
        salary *= (1 + salary_growth)
        current_year += 1
        year_number += 1

    if time_to_payoff is None:
        time_to_payoff = year_number - 1 if rows else 0
    # Add TimeToPayOff to the final year's dictionary for frontend compatibility
    if rows:
        rows[-1]["TimeToPayOff"] = time_to_payoff
    return rows