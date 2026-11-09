package com.fragra;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import java.util.*;

@Controller
class HomeController {

    @GetMapping("/")
    String home() {
        return "redirect:/Fragra.html";
    }
}

@RestController
@RequestMapping("/api")
class ApiController {

    private final ProductRepository products;
    private final AuthService auth;
    private final OrdersService orderService;
    private final SupportRepository support;

    ApiController(ProductRepository products, AuthService auth, OrdersService orders, SupportRepository support) {
        this.products = products;
        this.auth = auth;
        this.orderService = orders;
        this.support = support;
    }

    record Credentials(String name, String email, String password) {
    }

    record Contact(String name, String email, String message) {
    }

    @GetMapping("/health")
    Map<String, String> health() {
        return Map.of("status", "ok", "application", "Fragra");
    }

    @GetMapping("/products")
    List<Product> list(@RequestParam(required = false) String brand, @RequestParam(required = false) String q) {
        String b = brand == null ? "" : brand.trim().toLowerCase(Locale.ROOT);
        String search = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return products.findByActiveTrueOrderByIdAsc().stream()
                .filter(p -> (b.isEmpty() || p.brand.toLowerCase(Locale.ROOT).contains(b)
                        || (p.category != null && p.category.toLowerCase(Locale.ROOT).contains(b)))
                        && (search.isEmpty()
                                || (p.name + " " + p.brand + " " + p.category + " " + p.fragrance + " " + p.description)
                                        .toLowerCase(Locale.ROOT).contains(search)))
                .toList();
    }

    @GetMapping("/products/{id}")
    Product one(@PathVariable Long id) {
        Product p = products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
        if (!p.active) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found.");
        }
        return p;
    }

    @PostMapping("/auth/signup")
    Map<String, Object> signup(@RequestBody Credentials data) {
        return auth.signup(data.name(), data.email(), data.password());
    }

    @PostMapping("/auth/login")
    Map<String, Object> login(@RequestBody Credentials data) {
        return auth.login(data.email(), data.password());
    }

    @GetMapping("/auth/me")
    Map<String, Object> me(@RequestHeader(value = "Authorization", required = false) String token) {
        Customer c = auth.require(token);
        return Map.of("name", c.name, "email", c.email);
    }

    @PostMapping("/auth/logout")
    Map<String, String> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        auth.logout(token);
        return Map.of("message", "Signed out.");
    }

    @PostMapping("/orders")
    @ResponseStatus(HttpStatus.CREATED)
    Map<String, Object> create(@RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody OrdersService.OrderRequest request) {
        return orderService.place(auth.require(token), request);
    }

    @GetMapping("/orders")
    List<Map<String, Object>> orders(@RequestHeader(value = "Authorization", required = false) String token) {
        return orderService.all(auth.require(token));
    }

    @GetMapping("/orders/{id}")
    Map<String, Object> order(@RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable String id) {
        return orderService.one(auth.require(token), id);
    }

    @PostMapping("/orders/{id}/cancel")
    Map<String, Object> cancel(@RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable String id) {
        return orderService.cancel(auth.require(token), id);
    }

    @PostMapping("/support")
    Map<String, String> contact(@RequestBody Contact form) {
        String name = OrdersService.required(form.name(), "name", 100);
        String email = auth.normalizeEmail(form.email());
        String message = OrdersService.required(form.message(), "message", 2000);
        if (message.length() < 10) {
            throw new IllegalArgumentException("Please write a message of at least 10 characters.");
        }
        support.save(new SupportMessage(name, email, message));
        return Map.of("message", "Your message has been recorded. This demo does not send emails automatically.");
    }
}

@RestControllerAdvice
class ApiErrors {

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> invalid(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("message", e.getReason() == null ? "Request failed." : e.getReason()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "A conflicting record already exists. Please try again."));
    }
}
