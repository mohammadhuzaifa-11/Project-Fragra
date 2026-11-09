package com.fragra;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
class OrdersService {
    private final ProductRepository products;
    private final OrderRepository orders;

    OrdersService(ProductRepository products, OrderRepository orders) {
        this.products = products;
        this.orders = orders;
    }

    record CartItem(Long productId, Integer quantity) {
    }

    record OrderRequest(String recipient, String mobile, String address, String city, String state, String pincode,
            String paymentMethod, List<CartItem> items) {
    }

    static String required(String value, String field, int max) {
        if (value == null || value.trim().isEmpty() || value.trim().length() > max)
            throw new IllegalArgumentException("Please enter a valid " + field + ".");
        return value.trim();
    }

    @Transactional
    Map<String, Object> place(Customer customer, OrderRequest input) {
        if (input == null)
            throw new IllegalArgumentException("Missing order details.");
        String recipient = required(input.recipient(), "full name", 100);
        String mobile = required(input.mobile(), "mobile number", 20);
        if (!mobile.matches("[0-9+() -]{10,20}"))
            throw new IllegalArgumentException("Enter a valid mobile number.");
        String address = required(input.address(), "delivery address", 500);
        String city = required(input.city(), "city", 120);
        String state = required(input.state(), "state", 120);
        String pincode = required(input.pincode(), "PIN code", 10);
        if (!pincode.matches("[0-9]{6}"))
            throw new IllegalArgumentException("Enter a valid six-digit Indian PIN code.");
        if (!"COD".equals(input.paymentMethod()))
            throw new IllegalArgumentException("Only Cash on Delivery is supported in this demo.");
        if (input.items() == null || input.items().isEmpty() || input.items().size() > 40)
            throw new IllegalArgumentException("Your cart is empty or contains too many different products.");
        HashSet<Long> distinct = new HashSet<>();
        List<CartItem> sorted = new ArrayList<>(input.items());
        sorted.sort(Comparator.comparing(item -> item.productId() == null ? -1L : item.productId()));
        CustomerOrder order = new CustomerOrder();
        order.customer = customer;
        order.publicId = "FRG-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT);
        order.createdAt = Instant.now();
        order.status = "PLACED";
        order.recipient = recipient;
        order.mobile = mobile;
        order.address = address;
        order.city = city;
        order.state = state;
        order.pincode = pincode;
        order.paymentMethod = "COD";
        order.total = BigDecimal.ZERO;
        for (CartItem ci : sorted) {
            if (ci.productId() == null || ci.quantity() == null || ci.quantity() < 1 || ci.quantity() > 20
                    || !distinct.add(ci.productId()))
                throw new IllegalArgumentException("Invalid cart item or quantity.");
            Product p = products.lockById(ci.productId())
                    .orElseThrow(() -> new IllegalArgumentException("One product is no longer available."));
            if (!p.active)
                throw new IllegalArgumentException(p.name + " is unavailable.");
            if (p.stock < ci.quantity())
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Only " + p.stock + " units of " + p.name + " are available.");
            p.stock -= ci.quantity();
            OrderLine line = new OrderLine();
            line.order = order;
            line.productId = p.id;
            line.name = p.name;
            line.image = p.image;
            line.quantity = ci.quantity();
            line.unitPrice = p.price;
            line.lineTotal = p.price.multiply(BigDecimal.valueOf(ci.quantity()));
            order.items.add(line);
            order.total = order.total.add(line.lineTotal);
        }
        orders.save(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    List<Map<String, Object>> all(Customer c) {
        return orders.findByCustomerIdOrderByCreatedAtDesc(c.id).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    Map<String, Object> one(Customer c, String id) {
        return toResponse(findOwned(c, id));
    }

    CustomerOrder findOwned(Customer c, String id) {
        return orders.findByPublicIdAndCustomerId(id, c.id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
    }

    @Transactional
    Map<String, Object> cancel(Customer c, String id) {
        CustomerOrder order = orders.lockOwned(id, c.id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));
        if (!"PLACED".equals(order.status))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order can no longer be cancelled.");
        // Restore inventory. Locks are acquired in ascending product ID order.
        List<OrderLine> lines = new ArrayList<>(order.items);
        lines.sort(Comparator.comparing(line -> line.productId));
        for (OrderLine line : lines)
            products.lockById(line.productId).ifPresent(product -> product.stock += line.quantity);
        order.status = "CANCELLED";
        return toResponse(orders.save(order));
    }

    Map<String, Object> toResponse(CustomerOrder order) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("orderId", order.publicId);
        out.put("createdAt", order.createdAt);
        out.put("status", order.status);
        out.put("total", order.total);
        out.put("recipient", order.recipient);
        out.put("mobile", order.mobile);
        out.put("address", order.address);
        out.put("city", order.city);
        out.put("state", order.state);
        out.put("pincode", order.pincode);
        out.put("paymentMethod", order.paymentMethod);
        out.put("items",
                order.items.stream()
                        .map(line -> Map.of("productId", line.productId, "name", line.name, "quantity", line.quantity,
                                "unitPrice", line.unitPrice, "lineTotal", line.lineTotal, "image",
                                line.image == null ? "" : line.image))
                        .toList());
        return out;
    }
}
