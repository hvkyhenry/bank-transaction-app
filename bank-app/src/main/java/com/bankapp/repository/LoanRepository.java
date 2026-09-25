package com.bankapp.repository;

import com.bankapp.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByAccountId(Long accountId);
}
