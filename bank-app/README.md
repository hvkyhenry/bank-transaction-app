# Banking Transaction Interface

A simple full-stack banking demo built to showcase backend + frontend engineering skills.

**Stack:** Spring Boot 3 (Java 17, Maven) · PostgreSQL · React · springdoc-openapi (Swagger UI)

## Features
1. Create a bank account
2. Deposit funds
3. Withdraw funds
4. Transfer funds between accounts
5. Delete a dormant account (no activity for 90+ days and zero balance)
6. **Bonus:** Create a loan account and disburse a loan (e.g. 10,000 KES) straight into an account's balance

Every deposit, withdrawal, transfer and loan disbursement is recorded as a `Transaction`, so each account has a full audit trail.

---

## 1. Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+ and npm (for the frontend)

## 2. Database setup

The backend supports both **H2 (in-memory, zero-setup default)** and **PostgreSQL**.

### Option A: H2 Database (Default - No setup required)
The application defaults to H2 in-memory mode (`spring.profiles.active=h2`). All tables are created automatically and you can inspect data directly in your browser:
- H2 Web Console: **http://localhost:8080/h2-console**
  - **JDBC URL:** `jdbc:h2:mem:bankdb`
  - **User Name:** `sa`
  - **Password:** *(leave blank)*

### Option B: PostgreSQL
If you want persistent storage in PostgreSQL:
1. Create the database:
```sql
CREATE DATABASE bankdb;
```
2. Activate the PostgreSQL profile in `src/main/resources/application.properties`:
```properties
spring.profiles.active=postgres
```
3. Update `src/main/resources/application-postgres.properties` with your PostgreSQL credentials (default is user `postgres`, password `postgres`).

Hibernate uses `ddl-auto=update`, so tables (`accounts`, `transactions`, `loans`) are created automatically on first run in either database.

## 3. Run the backend

```bash
cd bank-app
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

### Swagger UI (API testing)
Once running, open:

- Swagger UI: **http://localhost:8080/swagger-ui.html**
- Raw OpenAPI spec: **http://localhost:8080/v3/api-docs**

You can exercise every endpoint (create account, deposit, withdraw, transfer, delete, loan disbursement) directly from Swagger UI — no frontend or Postman needed. You can also import the OpenAPI JSON into Postman/Insomnia if you prefer.

## 4. Run the frontend

```bash
cd bank-app/frontend
npm install
npm start
```

Opens on **http://localhost:3000** and talks to the backend at `http://localhost:8080`.

---

## API Reference

| Action | Method | Endpoint |
|---|---|---|
| Create account | POST | `/api/accounts` |
| List accounts | GET | `/api/accounts` |
| Get one account | GET | `/api/accounts/{accountNumber}` |
| Deposit | POST | `/api/accounts/{accountNumber}/deposit` |
| Withdraw | POST | `/api/accounts/{accountNumber}/withdraw` |
| Transfer | POST | `/api/accounts/transfer` |
| Check dormancy | GET | `/api/accounts/{accountNumber}/dormant-check` |
| Delete dormant account | DELETE | `/api/accounts/{accountNumber}` |
| Transaction history | GET | `/api/accounts/{accountNumber}/transactions` |
| Disburse loan | POST | `/api/loans/{accountNumber}/disburse` |
| List loans | GET | `/api/loans/{accountNumber}` |

### Example: Create account
```bash
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountHolderName":"Jane Wanjiru","nationalId":"12345678","phoneNumber":"0712345678"}'
```

### Example: Disburse a 10,000 KES loan
```bash
curl -X POST http://localhost:8080/api/loans/KE123456789/disburse \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000}'
```

---

## Design notes (for your write-up / demo)
- **Dormancy rule:** an account is dormant if it has had no deposit/withdrawal/transfer activity for 90+ days *and* currently holds a zero balance. This is intentionally conservative — you can't delete an account that still has money in it. Any transaction on a dormant account automatically reactivates it.
- **Account numbers** are system-generated (`KE` + 9 digits) rather than user-supplied, to mimic a real bank.
- **Loans** are modeled as their own entity (`Loan`) linked to an `Account`, separate from the deposit/withdrawal flow, so the loan book can be extended later (repayments, interest accrual, defaults) without touching core account logic.
- **Validation & error handling:** Bean Validation (`@Valid`) on all request DTOs, plus a `GlobalExceptionHandler` that returns clean JSON errors (404 for missing accounts, 400 for insufficient funds/bad input, 409 for invalid operations like deleting a non-dormant account).
- **Monetary values** use `BigDecimal` throughout to avoid floating-point rounding errors.

## Project structure
```
bank-app/
├── pom.xml
├── src/main/java/com/bankapp/
│   ├── model/          Account, Transaction, Loan (+ enums)
│   ├── repository/     Spring Data JPA repositories
│   ├── service/        AccountService, LoanService (business logic)
│   ├── controller/     REST controllers (Swagger-annotated)
│   ├── dto/            Request DTOs with validation
│   ├── exception/      Custom exceptions + global handler
│   └── config/         OpenAPI/Swagger config
├── src/main/resources/application.properties
└── frontend/            React app (Create/Deposit/Withdraw/Transfer/Delete/Loan UI)
```
