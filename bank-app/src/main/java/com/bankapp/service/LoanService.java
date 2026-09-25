package com.bankapp.service;

import com.bankapp.exception.AccountNotFoundException;
import com.bankapp.exception.InvalidOperationException;
import com.bankapp.model.*;
import com.bankapp.repository.AccountRepository;
import com.bankapp.repository.LoanRepository;
import com.bankapp.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {

    private final AccountRepository accountRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;

    public LoanService(AccountRepository accountRepository, LoanRepository loanRepository,
                        TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.loanRepository = loanRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Creates a loan account for the given bank account and immediately disburses
     * the loan amount into the account's balance.
     */
    @Transactional
    public Loan createAndDisburseLoan(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidOperationException("Cannot disburse a loan to a closed account");
        }

        Loan loan = new Loan();
        loan.setAccount(account);
        loan.setPrincipalAmount(amount);
        loan.setOutstandingBalance(amount);
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setDisbursedAt(LocalDateTime.now());
        loanRepository.save(loan);

        // Disbursement credits the account balance directly
        account.setBalance(account.getBalance().add(amount));
        account.setStatus(AccountStatus.ACTIVE);
        account.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(account);

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(TransactionType.LOAN_DISBURSEMENT);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setDescription("Loan disbursement (Loan #" + loan.getId() + ")");
        transactionRepository.save(transaction);

        return loan;
    }

    public List<Loan> getLoansForAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return loanRepository.findByAccountId(account.getId());
    }
}
