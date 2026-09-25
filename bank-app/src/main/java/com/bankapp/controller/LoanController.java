package com.bankapp.controller;

import com.bankapp.dto.AmountRequest;
import com.bankapp.model.Loan;
import com.bankapp.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@Tag(name = "Loans", description = "Create a loan account and disburse funds to a bank account")
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @Operation(summary = "Create a loan account and disburse the loan amount to a bank account")
    @PostMapping("/{accountNumber}/disburse")
    public ResponseEntity<Loan> disburseLoan(@PathVariable String accountNumber,
                                              @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(loanService.createAndDisburseLoan(accountNumber, request.getAmount()));
    }

    @Operation(summary = "List loans for an account")
    @GetMapping("/{accountNumber}")
    public ResponseEntity<List<Loan>> getLoans(@PathVariable String accountNumber) {
        return ResponseEntity.ok(loanService.getLoansForAccount(accountNumber));
    }
}
