"""
main.py

Backend module for the Student Loan Calculator web app.

This module defines a FastAPI application that exposes a single POST endpoint
`/calculate`. It receives loan input parameters from the user and returns a
year-by-year projection of loan repayment, interest, and remaining balance.

Author: Daniel Skerman
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from calculator import calculate_loan, summarize_loan_rows

app = FastAPI()

# Allow your frontend origin to make requests
origins = [
    "http://localhost:3000",  # Next.js dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allow only your frontend
    allow_credentials=True,
    allow_methods=["*"],          # allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],          # allow all headers
)

class LoanInput(BaseModel):
    """
    Pydantic model representing the user input for the loan calculator.

    Attributes:
        plan (str): The type of UK student loan plan (default "plan_2").
        outstanding (float): Current outstanding loan balance (default 53000).
        salary (float): User's current annual salary (default 37000).
        bonus_rate (float): Optional bonus rate as a fraction of salary (default 0.5).
        salary_growth (float): Expected annual salary growth (default 0.05).
        graduation_year (int): The year the user graduated, used to determine repayment start.
        birth_year (int): The user's year of birth, used to calculate age for loan write-off.
    """
    plan: str = "plan_2"
    outstanding: float = 50000
    salary: float = 30000.0
    bonus_rate: float = 0.1
    salary_growth: float = 0.05
    graduation_year: int = 2021
    birth_year: int = 2000

@app.post("/calculate")
def calculate(input_data: LoanInput):
    """
    Calculate the yearly student loan projections.

    This endpoint receives loan parameters, calls the core calculation function,
    and returns a list of dictionaries containing yearly projections including:
    - salary
    - bonus
    - total income
    - income above threshold
    - repayment amount
    - loan outstanding
    - interest accrued
    - loan after interest
    - loan after repayment

    The calculation considers graduation year and birth year for accurate repayment 
    and write-off logic, reflecting realistic loan conditions.

    Args:
        input_data (LoanInput): User-provided loan parameters.

    Returns:
        List[Dict]: A list of dictionaries, one per year, with the calculated
        fields as described above.
    """
    result = calculate_loan(
        input_data.plan,
        input_data.outstanding,
        input_data.salary,
        input_data.bonus_rate,
        input_data.salary_growth,
        input_data.graduation_year,
        input_data.birth_year
    )
    # Adjust the 'Year' field to start at 0 instead of 1
    for i, year_data in enumerate(result):
        year_data['Year'] = i
     
    return result

@app.post("/calculate-summary")
def calculate_summary(input_data: LoanInput):
    """
    Calculate loan summary with principal and interest totals.

    This endpoint receives loan parameters and returns a summary of the total
    principal loan amount, total outstanding balance, and total interest accrued.

    Args:
        input_data (LoanInput): User-provided loan parameters.

    Returns:
        Dict: A dictionary containing:
            - PrincipalLoanAmount: Initial outstanding loan balance
            - TotalOutstanding: Total remaining balance
            - TotalInterest: Total interest accrued
    """
    result = calculate_loan(
        input_data.plan,
        input_data.outstanding,
        input_data.salary,
        input_data.bonus_rate,
        input_data.salary_growth,
        input_data.graduation_year,
        input_data.birth_year
    )
    
    summary = summarize_loan_rows(result, principal_loan_amount=input_data.outstanding)
    return summary
