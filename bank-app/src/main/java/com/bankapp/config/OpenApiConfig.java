package com.bankapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bankAppOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Banking Transaction Interface API")
                .description("A simple banking API: create accounts, deposit, withdraw, transfer, "
                        + "delete dormant accounts, and disburse loans.")
                .version("1.0.0")
                .contact(new Contact().name("Bank Transaction App")));
    }
}
