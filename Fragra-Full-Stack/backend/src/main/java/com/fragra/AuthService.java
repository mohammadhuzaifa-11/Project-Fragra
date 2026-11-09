package com.fragra;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Map;

@Service
class AuthService {
    private final CustomerRepository customers;
    private final SessionRepository sessions;
    private final BCryptPasswordEncoder encoder;
    private final SecureRandom random = new SecureRandom();

    AuthService(CustomerRepository customers, SessionRepository sessions, BCryptPasswordEncoder encoder) {
        this.customers = customers;
        this.sessions = sessions;
        this.encoder = encoder;
    }

    static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Transactional
    Map<String, Object> signup(String name, String email, String password) {
        if (name == null || name.trim().length() < 2 || name.length() > 100)
            throw new IllegalArgumentException("Enter your full name (2–100 characters).");
        email = normalizeEmail(email);
        if (password == null || password.length() < 8 || password.length() > 128)
            throw new IllegalArgumentException("Password must be 8–128 characters.");
        if (customers.findByEmail(email).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered. Please sign in.");
        return newSession(customers.save(new Customer(name.trim(), email, encoder.encode(password))));
    }

    @Transactional
    Map<String, Object> login(String email, String password) {
        Customer c = customers.findByEmail(normalizeEmail(email)).orElse(null);
        if (c == null || password == null || !encoder.matches(password, c.passwordHash))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password.");
        return newSession(c);
    }

    String normalizeEmail(String email) {
        if (email == null)
            throw new IllegalArgumentException("Enter a valid email address.");
        String e = email.trim().toLowerCase(java.util.Locale.ROOT);
        if (e.length() > 254 || !e.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new IllegalArgumentException("Enter a valid email address.");
        return e;
    }

    Map<String, Object> newSession(Customer c) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        sessions.save(new LoginSession(digest(token), c, Instant.now().plus(7, ChronoUnit.DAYS)));
        return Map.of("token", token, "name", c.name, "email", c.email);
    }

    Customer require(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        String token = authHeader.substring(7).trim();
        if (!token.matches("[0-9a-f]{64}"))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session is invalid. Sign in again.");
        LoginSession session = sessions.findByTokenHash(digest(token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in again."));
        if (session.expiresAt.isBefore(Instant.now()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired. Please sign in again.");
        return session.customer;
    }

    @Transactional
    void logout(String authHeader) {
        require(authHeader);
        sessions.findByTokenHash(digest(authHeader.substring(7).trim())).ifPresent(sessions::delete);
    }
}
