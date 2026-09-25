package com.bankapp.service;

import com.bankapp.dto.CreateAccountRequest;
import com.bankapp.dto.TransferRequest;
import com.bankapp.exception.AccountNotFoundException;
import com.bankapp.exception.InsufficientFundsException;
import com.bankapp.exception.InvalidOperationException;
import com.bankapp.model.Account;
import com.bankapp.model.AccountStatus;
import com.bankapp.model.Transaction;
import com.bankapp.model.TransactionType;
import com.bankapp.repository.AccountRepository;
import com.bankapp.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AccountService {

    // An account with no activity for this many days is considered dormant
    private static final long DORMANCY_THRESHOLD_DAYS = 90;

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final SecureRandom random = new SecureRandom();

    public AccountService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Account createAccount(CreateAccountRequest request) {
        Account account = new Account();
        account.setAccountHolderName(request.getAccountHolderName());
        account.setNationalId(request.getNationalId());
        account.setPhoneNumber(request.getPhoneNumber());
        account.setAccountNumber(generateUniqueAccountNumber());
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setLastTransactionAt(LocalDateTime.now());
        return accountRepository.save(account);
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "KE" + (100000000 + random.nextInt(900000000));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Transactional
    public Account deposit(String accountNumber, BigDecimal amount) {
        Account account = getAccountByNumber(accountNumber);
        assertActive(account);

        account.setBalance(account.getBalance().add(amount));
        touchActivity(account);
        accountRepository.save(account);

        recordTransaction(account, TransactionType.DEPOSIT, amount, null, "Cash deposit");
        return account;
    }

    @Transactional
    public Account withdraw(String accountNumber, BigDecimal amount) {
        Account account = getAccountByNumber(accountNumber);
        assertActive(account);

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in account " + accountNumber);
        }

        account.setBalance(account.getBalance().subtract(amount));
        touchActivity(account);
        accountRepository.save(account);

        recordTransaction(account, TransactionType.WITHDRAWAL, amount, null, "Cash withdrawal");
        return account;
    }

    @Transactional
    public void transfer(TransferRequest request) {
        if (request.getSourceAccountNumber().equals(request.getDestinationAccountNumber())) {
            throw new InvalidOperationException("Source and destination accounts must be different");
        }

        Account source = getAccountByNumber(request.getSourceAccountNumber());
        Account destination = getAccountByNumber(request.getDestinationAccountNumber());
        assertActive(source);
        assertActive(destination);

        BigDecimal amount = request.getAmount();
        if (source.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in source account " + source.getAccountNumber());
        }

        source.setBalance(source.getBalance().subtract(amount));
        destination.setBalance(destination.getBalance().add(amount));
        touchActivity(source);
        touchActivity(destination);

        accountRepository.save(source);
        accountRepository.save(destination);

        recordTransaction(source, TransactionType.TRANSFER_OUT, amount, destination.getAccountNumber(),
                "Transfer to " + destination.getAccountNumber());
        recordTransaction(destination, TransactionType.TRANSFER_IN, amount, source.getAccountNumber(),
                "Transfer from " + source.getAccountNumber());
    }

    @Transactional
    public void deleteDormantAccount(String accountNumber) {
        Account account = getAccountByNumber(accountNumber);

        if (!isDormant(account)) {
            throw new InvalidOperationException(
                    "Account " + accountNumber + " is not dormant. Only accounts inactive for "
                            + DORMANCY_THRESHOLD_DAYS + "+ days with a zero balance can be deleted.");
        }

        accountRepository.delete(account);
    }

    public boolean isDormant(Account account) {
        LocalDateTime referencePoint = account.getLastTransactionAt() != null
                ? account.getLastTransactionAt()
                : account.getCreatedAt();

        long daysInactive = ChronoUnit.DAYS.between(referencePoint, LocalDateTime.now());

        boolean inactiveLongEnough = daysInactive >= DORMANCY_THRESHOLD_DAYS;
        boolean zeroBalance = account.getBalance().compareTo(BigDecimal.ZERO) == 0;

        return account.getStatus() == AccountStatus.DORMANT || (inactiveLongEnough && zeroBalance);
    }

    public List<Transaction> getTransactionHistory(String accountNumber) {
        Account account = getAccountByNumber(accountNumber);
        return transactionRepository.findByAccountIdOrderByTimestampDesc(account.getId());
    }

    public List<Transaction> getAllRecentTransactions() {
        return transactionRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"));
    }

    private void assertActive(Account account) {
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidOperationException("Account " + account.getAccountNumber() + " is closed");
        }
        if (account.getStatus() == AccountStatus.DORMANT) {
            // Any transaction activity automatically reactivates a dormant account
            account.setStatus(AccountStatus.ACTIVE);
        }
    }

    private void touchActivity(Account account) {
        account.setLastTransactionAt(LocalDateTime.now());
    }

    private void recordTransaction(Account account, TransactionType type, BigDecimal amount,
                                    String relatedAccountNumber, String description) {
        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setRelatedAccountNumber(relatedAccountNumber);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }
}
