const BASE_URL = 'http://localhost:8080/api';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  createAccount: (payload) =>
    fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getAllAccounts: () => fetch(`${BASE_URL}/accounts`).then(handleResponse),

  getAccount: (accountNumber) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}`).then(handleResponse),

  deposit: (accountNumber, amount) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    }).then(handleResponse),

  withdraw: (accountNumber, amount) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    }).then(handleResponse),

  transfer: (sourceAccountNumber, destinationAccountNumber, amount) =>
    fetch(`${BASE_URL}/accounts/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceAccountNumber,
        destinationAccountNumber,
        amount: Number(amount),
      }),
    }).then(handleResponse),

  checkDormant: (accountNumber) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}/dormant-check`).then(handleResponse),

  deleteDormantAccount: (accountNumber) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}`, { method: 'DELETE' }).then(handleResponse),

  getTransactions: (accountNumber) =>
    fetch(`${BASE_URL}/accounts/${accountNumber}/transactions`).then(handleResponse),

  getAllTransactions: () =>
    fetch(`${BASE_URL}/accounts/audit/transactions`).then(handleResponse),

  disburseLoan: (accountNumber, amount) =>
    fetch(`${BASE_URL}/loans/${accountNumber}/disburse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) }),
    }).then(handleResponse),

  getLoans: (accountNumber) =>
    fetch(`${BASE_URL}/loans/${accountNumber}`).then(handleResponse),
};
