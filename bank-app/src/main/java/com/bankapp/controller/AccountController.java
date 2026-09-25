package com.bankapp.controller;

import com.bankapp.dto.AmountRequest;
import com.bankapp.dto.CreateAccountRequest;
import com.bankapp.dto.TransferRequest;
import com.bankapp.model.Account;
import com.bankapp.model.Transaction;
import com.bankapp.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Accounts", description = "Create accounts and perform deposits, withdrawals, transfers and deletions")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @Operation(summary = "Create a new bank account")
    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @Operation(summary = "List all bank accounts")
    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @Operation(summary = "Get a single account by account number")
    @GetMapping("/{accountNumber}")
    public ResponseEntity<Account> getAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }

    @Operation(summary = "Deposit funds into an account")
    @PostMapping("/{accountNumber}/deposit")
    public ResponseEntity<Account> deposit(@PathVariable String accountNumber,
                                            @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.deposit(accountNumber, request.getAmount()));
    }

    @Operation(summary = "Withdraw funds from an account")
    @PostMapping("/{accountNumber}/withdraw")
    public ResponseEntity<Account> withdraw(@PathVariable String accountNumber,
                                             @Valid @RequestBody AmountRequest request) {
        return ResponseEntity.ok(accountService.withdraw(accountNumber, request.getAmount()));
    }

    @Operation(summary = "Transfer funds from one account to another")
    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transfer(@Valid @RequestBody TransferRequest request) {
        accountService.transfer(request);
        return ResponseEntity.ok(Map.of("message", "Transfer completed successfully"));
    }

    @Operation(summary = "Delete a dormant account (no activity for 90+ days and zero balance)")
    @DeleteMapping("/{accountNumber}")
    public ResponseEntity<Map<String, String>> deleteDormantAccount(@PathVariable String accountNumber) {
        accountService.deleteDormantAccount(accountNumber);
        return ResponseEntity.ok(Map.of("message", "Dormant account " + accountNumber + " deleted successfully"));
    }

    @Operation(summary = "Check whether an account currently qualifies as dormant")
    @GetMapping("/{accountNumber}/dormant-check")
    public ResponseEntity<Map<String, Boolean>> checkDormant(@PathVariable String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(Map.of("dormant", accountService.isDormant(account)));
    }

    @Operation(summary = "Get transaction history for an account")
    @GetMapping("/{accountNumber}/transactions")
    public ResponseEntity<List<Transaction>> getTransactionHistory(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getTransactionHistory(accountNumber));
    }

    @Operation(summary = "Get all recent transactions across the bank for auditing")
    @GetMapping("/audit/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(accountService.getAllRecentTransactions());
    }
}
