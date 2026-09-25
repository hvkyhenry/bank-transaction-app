import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { api } from './api';

import Navbar from './components/Navbar';
import CustomerPortal from './components/CustomerPortal';
import AdminDashboard from './components/AdminDashboard';

import DepositModal from './components/modals/DepositModal';
import WithdrawModal from './components/modals/WithdrawModal';
import TransferModal from './components/modals/TransferModal';
import LoanModal from './components/modals/LoanModal';
import CreateAccountModal from './components/modals/CreateAccountModal';
import DeleteDormantModal from './components/modals/DeleteDormantModal';
import StatementModal from './components/modals/StatementModal';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [currentMode, setCurrentMode] = useState('customer'); // 'customer' or 'admin'
  const [toast, setToast] = useState(null);

  // Modals state
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState(null);
  const [statementData, setStatementData] = useState(null); // { account, transactions }

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 4500);
  };

  const refreshAccounts = useCallback(async () => {
    try {
      const data = await api.getAllAccounts();
      const accountList = Array.isArray(data) ? data : [];
      setAccounts(accountList);

      // Keep selectedAccount synced or default to the first active account
      setSelectedAccount((prev) => {
        if (!prev && accountList.length > 0) {
          const firstActive = accountList.find((a) => a.status === 'ACTIVE') || accountList[0];
          return firstActive;
        }
        if (prev) {
          const updated = accountList.find((a) => a.accountNumber === prev.accountNumber);
          return updated || (accountList.length > 0 ? accountList[0] : null);
        }
        return null;
      });
    } catch (err) {
      // Backend may be starting up
      console.warn('Could not fetch accounts:', err);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const handleSelectAccountAndSwitchToCustomer = (acc) => {
    setSelectedAccount(acc);
    setCurrentMode('customer');
    notify(`Switched to ${acc.accountHolderName}'s Customer Banking`, 'info');
  };

  const handleAccountCreated = (newAcc) => {
    refreshAccounts();
    setSelectedAccount(newAcc);
  };

  return (
    <div className="app-container">
      {/* Background ambient lighting */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast-alert ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Notice' : 'Information'}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        setMode={setCurrentMode}
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
        onOpenCreateAccount={() => setCreateAccountOpen(true)}
      />

      {/* Main Views */}
      <main>
        {currentMode === 'customer' ? (
          <CustomerPortal
            account={selectedAccount}
            allAccounts={accounts}
            onOpenDeposit={() => setDepositOpen(true)}
            onOpenWithdraw={() => setWithdrawOpen(true)}
            onOpenTransfer={() => setTransferOpen(true)}
            onOpenLoan={() => setLoanOpen(true)}
            onOpenStatement={(acc, txs) => setStatementData({ account: acc, transactions: txs })}
            onOpenCreateAccount={() => setCreateAccountOpen(true)}
            onRefresh={refreshAccounts}
            notify={notify}
          />
        ) : (
          <AdminDashboard
            accounts={accounts}
            onSelectAccountAndSwitchToCustomer={handleSelectAccountAndSwitchToCustomer}
            onOpenCreateAccount={() => setCreateAccountOpen(true)}
            onOpenDeleteDormant={(acc) => setDeleteAccountTarget(acc)}
            onOpenStatement={(acc, txs) => setStatementData({ account: acc, transactions: txs })}
            onRefresh={refreshAccounts}
            notify={notify}
          />
        )}
      </main>

      {/* Interactive Service Modals */}
      <DepositModal
        account={selectedAccount}
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSuccess={refreshAccounts}
        notify={notify}
      />

      <WithdrawModal
        account={selectedAccount}
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onSuccess={refreshAccounts}
        notify={notify}
      />

      <TransferModal
        account={selectedAccount}
        allAccounts={accounts}
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={refreshAccounts}
        notify={notify}
      />

      <LoanModal
        account={selectedAccount}
        isOpen={loanOpen}
        onClose={() => setLoanOpen(false)}
        onSuccess={refreshAccounts}
        notify={notify}
      />

      <CreateAccountModal
        isOpen={createAccountOpen}
        onClose={() => setCreateAccountOpen(false)}
        onSuccess={handleAccountCreated}
        notify={notify}
      />

      <DeleteDormantModal
        account={deleteAccountTarget}
        isOpen={Boolean(deleteAccountTarget)}
        onClose={() => setDeleteAccountTarget(null)}
        onSuccess={refreshAccounts}
        notify={notify}
      />

      <StatementModal
        account={statementData ? statementData.account : null}
        transactions={statementData ? statementData.transactions : []}
        isOpen={Boolean(statementData)}
        onClose={() => setStatementData(null)}
      />

      <footer style={{ marginTop: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <p>Apex Core Bank • High-Performance Transactional Banking Interface • Spring Boot & React</p>
        <p style={{ marginTop: 4, fontSize: 11 }}>
          Core API: <code>http://localhost:8080/api</code> • Swagger UI: <code>http://localhost:8080/swagger-ui.html</code> • H2 Console: <code>http://localhost:8080/h2-console</code>
        </p>
      </footer>
    </div>
  );
}
