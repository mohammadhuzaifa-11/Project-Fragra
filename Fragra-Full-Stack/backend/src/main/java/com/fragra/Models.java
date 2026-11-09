package com.fragra;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="customers")
class Customer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false) public String name;
    @Column(nullable=false,unique=true) public String email;
    @Column(nullable=false) public String passwordHash;
    protected Customer() {}
    Customer(String name, String email, String hash) { this.name=name; this.email=email; this.passwordHash=hash; }
}

@Entity @Table(name="login_sessions")
class LoginSession {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false,unique=true,length=64) public String tokenHash;
    @ManyToOne(optional=false,fetch=FetchType.EAGER) public Customer customer;
    @Column(nullable=false) public Instant expiresAt;
    protected LoginSession() {}
    LoginSession(String tokenHash, Customer customer, Instant expiresAt) { this.tokenHash=tokenHash;this.customer=customer;this.expiresAt=expiresAt; }
}

@Entity @Table(name="products")
class Product {
    @Id public Long id;
    @Column(nullable=false) public String brand;
    @Column(nullable=false) public String name;
    @Column(length=3000) public String description;
    public String category;
    public String fragrance;
    public String size;
    @Column(nullable=false,precision=12,scale=2) public BigDecimal price;
    @Column(precision=12,scale=2) public BigDecimal mrp;
    public String image;
    @Column(nullable=false) public int stock;
    @Column(nullable=false) public boolean active=true;
    protected Product() {}
}

@Entity @Table(name="customer_orders")
class CustomerOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false,unique=true) public String publicId;
    @ManyToOne(optional=false,fetch=FetchType.LAZY) public Customer customer;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public String status;
    @Column(nullable=false) public String recipient;
    @Column(nullable=false) public String mobile;
    @Column(nullable=false,length=500) public String address;
    @Column(nullable=false) public String city;
    @Column(nullable=false) public String state;
    @Column(nullable=false) public String pincode;
    @Column(nullable=false) public String paymentMethod;
    @Column(nullable=false,precision=12,scale=2) public BigDecimal total;
    @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER)
    public List<OrderLine> items=new ArrayList<>();
    protected CustomerOrder() {}
}

@Entity @Table(name="order_items")
class OrderLine {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) public CustomerOrder order;
    public Long productId;
    @Column(nullable=false) public String name;
    @Column(nullable=false) public int quantity;
    @Column(nullable=false,precision=12,scale=2) public BigDecimal unitPrice;
    @Column(nullable=false,precision=12,scale=2) public BigDecimal lineTotal;
    public String image;
    protected OrderLine() {}
}

@Entity @Table(name="support_messages")
class SupportMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false) public String name;
    @Column(nullable=false) public String email;
    @Column(nullable=false,length=2000) public String message;
    @Column(nullable=false) public Instant createdAt;
    protected SupportMessage() {}
    SupportMessage(String name,String email,String message) { this.name=name;this.email=email;this.message=message;this.createdAt=Instant.now(); }
}
