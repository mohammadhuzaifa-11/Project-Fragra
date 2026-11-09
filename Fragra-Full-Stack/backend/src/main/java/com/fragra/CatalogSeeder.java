package com.fragra;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
class CatalogSeeder implements CommandLineRunner {
    private final ProductRepository repo;
    private final ObjectMapper mapper;

    CatalogSeeder(ProductRepository repo, ObjectMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @Override
    public void run(String... args) throws Exception {
        try (InputStream stream = getClass().getResourceAsStream("/catalog.json")) {
            if (stream == null)
                throw new IllegalStateException("Missing catalog.json");
            List<Map<String, Object>> records = mapper.readValue(stream, new TypeReference<>() {
            });
            for (Map<String, Object> row : records) {
                long id = ((Number) row.get("id")).longValue();
                Product p = repo.findById(id).orElseGet(Product::new);
                boolean isNew = p.id == null;
                p.id = id;
                p.name = (String) row.get("name");
                p.brand = (String) row.get("brand");
                p.description = (String) row.get("description");
                p.category = (String) row.get("category");
                p.fragrance = (String) row.get("fragrance");
                p.size = (String) row.get("size");
                p.image = (String) row.get("image");
                p.price = new BigDecimal(row.get("price").toString());
                p.mrp = new BigDecimal(row.get("mrp").toString());
                p.active = Boolean.TRUE.equals(row.get("active"));
                if (isNew)
                    p.stock = ((Number) row.get("stock")).intValue();
                repo.save(p);
            }
        }
    }
}
