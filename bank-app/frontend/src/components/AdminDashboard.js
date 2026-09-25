import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export default function AdminDashboard({
  accounts,
  onSelectAccountAndSwitchToCustomer,
  onOpenCreateAccount,
  onOpenDeleteDormant,
  onOpenStatement,
  onRefresh,
  notify,
}) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [allTransactions, setAllTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dormancyCheckMap, setDormancyCheckMap] = useState({});

  // Fetch all bank-wide transactions for the audit trail
  const loadGlobalTransactions = useCallback(() => {
    setLoadingTx(true);
    api.getAllTransactions()
      .then((txs) => {
        setAllTransactions(txs || []);
      })
      .catch(() => {
        setAllTransactions([]);
      })
      .finally(() => {
        setLoadingTx(false);
      });
  }, []);

  useEffect(() => {
    loadGlobalTransactions();
  }, [loadGlobalTransactions]);

  // Compute KPI metrics
  const totalLiquidity = (accounts || []).reduce(
    (acc, cur) => acc + Number(cur.balance || 0),
    0
  );
  const totalActive = (accounts || []).filter((a) => a.status === 'ACTIVE').length;
  const totalDormant = (accounts || []).filter((a) => a.status === 'DORMANT').length;

  // Filter accounts
  const filteredAccounts = (accounts || []).filter((acc) => {
    const matchesSearch =
      !searchQuery ||
      acc.accountHolderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.nationalId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || acc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Check dormancy live
  const handleCheckDormancy = async (accountNumber) => {
    try {
      const res = await api.checkDormant(accountNumber);
      setDormancyCheckMap((prev) => ({
        ...prev,
        [accountNumber]: res.dormant ? 'DORMANT' : 'ACTIVE',
      }));
      if (res.dormant) {
        notify(`Account ${accountNumber} qualifies as DORMANT (90+ days inactive & zero balance)`, 'info');
      } else {
        notify(`Account ${accountNumber} is in good standing and not dormant`, 'success');
      }
    } catch (err) {
      notify('Could not evaluate dormancy: ' + err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Treasury & Operations
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-white)' }}>
            Bank Administration Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Monitor accounts, audit transaction ledgers, enforce dormancy policies, and manage banking liquidity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => { onRefresh(); loadGlobalTransactions(); }}>
            🔄 Refresh Core
          </button>
          <button className="btn-primary-action" onClick={onOpenCreateAccount}>
            + Onboard Customer
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpis-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box vault">🏛</div>
          <div>
            <div className="kpi-title">Total Bank Liquidity</div>
            <div className="kpi-value">
              KES {totalLiquidity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="kpi-subtitle">Total deposits across all accounts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box users">👥</div>
          <div>
            <div className="kpi-title">Registered Accounts</div>
            <div className="kpi-value">{(accounts || []).length}</div>
            <div className="kpi-subtitle">
              <span style={{ color: '#34d399' }}>{totalActive} Active</span> •{' '}
              <span style={{ color: '#fbbf24' }}>{totalDormant} Dormant</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box activity">⚡</div>
          <div>
            <div className="kpi-title">Recorded Transactions</div>
            <div className="kpi-value">{allTransactions.length}</div>
            <div className="kpi-subtitle">Total historical ledger records</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box loans">🛡</div>
          <div>
            <div className="kpi-title">Compliance & Dormancy</div>
            <div className="kpi-value">{totalDormant > 0 ? `${totalDormant} Actionable` : 'Compliant'}</div>
            <div className="kpi-subtitle">90-day inactivity threshold</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="content-section">
        <div className="section-tabs-header">
          <div className="tab-nav-group">
            <button
              className={`tab-item-btn ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <span>👥</span> Account Management Hub
              <span className="tab-badge">{(accounts || []).length}</span>
            </button>
            <button
              className={`tab-item-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span>📜</span> Live Transaction Audit Trail
              <span className="tab-badge">{allTransactions.length}</span>
            </button>
          </div>

          {activeTab === 'accounts' && (
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <span className="search-icon-placeholder">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, account, ID..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="DORMANT">Dormant Only</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Account Management Table */}
        {activeTab === 'accounts' && (
          <div>
            {filteredAccounts.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">👥</div>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No Accounts Match Query</h4>
                <p>Try clearing your search or status filter.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Customer Details</th>
                      <th>Account Number</th>
                      <th style={{ textAlign: 'right' }}>Current Balance</th>
                      <th>Status</th>
                      <th>Last Activity</th>
                      <th style={{ textAlign: 'right' }}>Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => {
                      const evaluatedStatus = dormancyCheckMap[acc.accountNumber] || acc.status;
                      const isDormant = evaluatedStatus === 'DORMANT';
                      const isZeroBalance = Number(acc.balance) === 0;

                      return (
                        <tr key={acc.accountNumber}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 12 }}>
                                {acc.accountHolderName.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {acc.accountHolderName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  ID: {acc.nationalId} • Tel: {acc.phoneNumber}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {acc.accountNumber}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--text-white)' }}>
                              KES {Number(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td>
                            <span className={`card-status-badge ${evaluatedStatus.toLowerCase()}`}>
                              {evaluatedStatus}
                            </span>
                          </td>

                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {acc.lastTransactionAt
                              ? new Date(acc.lastTransactionAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Never'}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              {/* Switch to customer view */}
                              <button
                                className="action-pill-btn"
                                onClick={() => onSelectAccountAndSwitchToCustomer(acc)}
                                title="Switch to Customer Banking for this account"
                              >
                                👤 Customer Portal
                              </button>

                              {/* Statement */}
                              <button
                                className="action-pill-btn"
                                onClick={async () => {
                                  try {
                                    const txs = await api.getTransactions(acc.accountNumber);
                                    onOpenStatement(acc, txs);
                                  } catch (err) {
                                    notify('Could not load statement: ' + err.message, 'error');
                                  }
                                }}
                                title="View official statement"
                              >
                                📄 Statement
                              </button>

                              {/* Check Dormancy */}
                              <button
                                className="action-pill-btn"
                                onClick={() => handleCheckDormancy(acc.accountNumber)}
                                title="Run automated 90-day inactivity check"
                              >
                                🛡 Check Dormancy
                              </button>

                              {/* Delete Dormant */}
                              <button
                                className="action-pill-btn danger"
                                onClick={() => onOpenDeleteDormant(acc)}
                                disabled={!isDormant || !isZeroBalance}
                                title={
                                  !isDormant
                                    ? 'Account is active - cannot delete'
                                    : !isZeroBalance
                                    ? 'Account holds funds - balance must be 0'
                                    : 'Purge qualified dormant account'
                                }
                                style={{
                                  opacity: isDormant && isZeroBalance ? 1 : 0.4,
                                  cursor: isDormant && isZeroBalance ? 'pointer' : 'not-allowed',
                                }}
                              >
                                🗑 Purge
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Global Audit Ledger */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 15 }}>Master Transaction Ledger</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Immutable audit trail of all deposits, withdrawals, transfers and loan disbursements
                </p>
              </div>
              <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px' }} onClick={loadGlobalTransactions}>
                🔄 Refresh Ledger
              </button>
            </div>

            {loadingTx ? (
              <div className="empty-state-box">Loading master ledger...</div>
            ) : allTransactions.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">📜</div>
                <h4>No transactions recorded yet in the core bank ledger.</h4>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Account #</th>
                      <th>Type & Description</th>
                      <th>Counterparty / Ref</th>
                      <th>Timestamp</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map((tx) => {
                      const isCredit =
                        tx.type === 'DEPOSIT' ||
                        tx.type === 'TRANSFER_IN' ||
                        tx.type === 'LOAN_DISBURSEMENT';

                      const dateStr = new Date(tx.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr key={tx.id}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                              {tx.accountNumber || '—'}
                            </span>
                          </td>
                          <td>
                            <div className="tx-type-cell">
                              <div className={`tx-icon-pill ${tx.type.toLowerCase()}`}>
                                {isCredit ? '↙' : '↗'}
                              </div>
                              <div>
                                <div className="tx-desc-title">{tx.description || tx.type}</div>
                                <div className="tx-desc-meta">{tx.type}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {tx.relatedAccountNumber ? (
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                                {tx.relatedAccountNumber}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {dateStr}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                              {isCredit ? '+' : '-'} KES {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }} className="tx-balance">
                            KES {Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
