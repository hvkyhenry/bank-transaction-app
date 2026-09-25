package com.bankapp.config;

import com.bankapp.model.*;
import com.bankapp.repository.AccountRepository;
import com.bankapp.repository.LoanRepository;
import com.bankapp.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;

    public DataInitializer(AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           LoanRepository loanRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
    }

    @Override
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            return;
        }

        // 1. Jane Wanjiru - Active Premium Account
        Account acc1 = new Account();
        acc1.setAccountNumber("KE108492019");
        acc1.setAccountHolderName("Jane Wanjiru");
        acc1.setNationalId("28491023");
        acc1.setPhoneNumber("+254 712 345 678");
        acc1.setBalance(new BigDecimal("65000.00"));
        acc1.setStatus(AccountStatus.ACTIVE);
        acc1.setCreatedAt(LocalDateTime.now().minusDays(45));
        acc1.setLastTransactionAt(LocalDateTime.now().minusHours(3));
        accountRepository.save(acc1);

        Transaction t1 = new Transaction();
        t1.setAccount(acc1);
        t1.setType(TransactionType.DEPOSIT);
        t1.setAmount(new BigDecimal("70000.00"));
        t1.setBalanceAfter(new BigDecimal("70000.00"));
        t1.setDescription("Initial deposit via M-Pesa");
        t1.setTimestamp(LocalDateTime.now().minusDays(10));
        transactionRepository.save(t1);

        Transaction t2 = new Transaction();
        t2.setAccount(acc1);
        t2.setType(TransactionType.WITHDRAWAL);
        t2.setAmount(new BigDecimal("5000.00"));
        t2.setBalanceAfter(new BigDecimal("65000.00"));
        t2.setDescription("ATM Cash Withdrawal");
        t2.setTimestamp(LocalDateTime.now().minusHours(3));
        transactionRepository.save(t2);

        // 2. David Kamau - Active Account with Loan
        Account acc2 = new Account();
        acc2.setAccountNumber("KE209183421");
        acc2.setAccountHolderName("David Kamau");
        acc2.setNationalId("31245678");
        acc2.setPhoneNumber("+254 722 987 654");
        acc2.setBalance(new BigDecimal("35000.00"));
        acc2.setStatus(AccountStatus.ACTIVE);
        acc2.setCreatedAt(LocalDateTime.now().minusDays(30));
        acc2.setLastTransactionAt(LocalDateTime.now().minusDays(1));
        accountRepository.save(acc2);

        Transaction t3 = new Transaction();
        t3.setAccount(acc2);
        t3.setType(TransactionType.DEPOSIT);
        t3.setAmount(new BigDecimal("25000.00"));
        t3.setBalanceAfter(new BigDecimal("25000.00"));
        t3.setDescription("Direct salary credit");
        t3.setTimestamp(LocalDateTime.now().minusDays(5));
        transactionRepository.save(t3);

        Transaction t4 = new Transaction();
        t4.setAccount(acc2);
        t4.setType(TransactionType.LOAN_DISBURSEMENT);
        t4.setAmount(new BigDecimal("10000.00"));
        t4.setBalanceAfter(new BigDecimal("35000.00"));
        t4.setDescription("Personal growth loan disbursed");
        t4.setTimestamp(LocalDateTime.now().minusDays(1));
        transactionRepository.save(t4);

        Loan loan = new Loan();
        loan.setAccount(acc2);
        loan.setPrincipalAmount(new BigDecimal("10000.00"));
        loan.setOutstandingBalance(new BigDecimal("11000.00"));
        loan.setInterestRate(new BigDecimal("10.00"));
        loan.setStatus(LoanStatus.ACTIVE);
        loan.setDisbursedAt(LocalDateTime.now().minusDays(1));
        loanRepository.save(loan);

        // 3. Brian Ochieng - Dormant Account for testing dormancy & deletion
        Account acc3 = new Account();
        acc3.setAccountNumber("KE300552199");
        acc3.setAccountHolderName("Brian Ochieng");
        acc3.setNationalId("19874523");
        acc3.setPhoneNumber("+254 733 112 233");
        acc3.setBalance(BigDecimal.ZERO);
        acc3.setStatus(AccountStatus.DORMANT);
        acc3.setCreatedAt(LocalDateTime.now().minusDays(150));
        acc3.setLastTransactionAt(LocalDateTime.now().minusDays(120));
        accountRepository.save(acc3);
    }
}
