package com.fragra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = { "spring.datasource.url=jdbc:h2:mem:fragra_test;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop" })
class FragraIntegrationTest {
  @Autowired
  MockMvc mvc;
  @Autowired
  ObjectMapper mapper;

  @Test
  void guestCanBrowseButCannotOrder() throws Exception {
    mvc.perform(get("/api/products")).andExpect(status().isOk()).andExpect(jsonPath("$[0].name").exists());
    mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON)
        .content("{}")).andExpect(status().isUnauthorized());
  }

  @Test
  void signupCheckoutAndCancelUsesDatabasePrices() throws Exception {
    String email = "customer-" + UUID.randomUUID() + "@example.com";
    String signup = "{\"name\":\"Fragra Tester\",\"email\":\"" + email + "\",\"password\":\"StrongPass123\"}";
    String auth = mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content(signup))
        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    String token = mapper.readTree(auth).get("token").asText();
    assertEquals(64, token.length());
    String orderJson = """
        {"recipient":"Demo Tester","mobile":"9876543210","address":"House 42 Main Street","city":"Pune","state":"Maharashtra","pincode":"411001","paymentMethod":"COD","items":[{"productId":1,"quantity":2}]}
        """;
    String orderResponse = mvc.perform(post("/api/orders").header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON).content(orderJson))
        .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(1398.0))
        .andReturn().getResponse().getContentAsString();
    JsonNode order = mapper.readTree(orderResponse);
    String orderId = order.get("orderId").asText();
    mvc.perform(get("/api/orders/" + orderId).header("Authorization", "Bearer " + token))
        .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].quantity").value(2));
    mvc.perform(post("/api/orders/" + orderId + "/cancel").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
    mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
    mvc.perform(get("/api/orders").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());
  }
}
