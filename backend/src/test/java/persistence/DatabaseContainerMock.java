package persistence;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Collections;
import java.util.Map;

public class DatabaseContainerMock implements QuarkusTestResourceLifecycleManager {
    private static final PostgreSQLContainer<?> POSTGRES_CONTAINER = new PostgreSQLContainer<>("postgres:latest")
            .withDatabaseName("ase_db")
            .withUsername("postgres")
            .withPassword("ase")
            .withInitScript("db_setup.sql");

    @Override
    public Map<String, String> start() {
        POSTGRES_CONTAINER.start();
        return Collections.singletonMap("quarkus.datasource.jdbc.url", POSTGRES_CONTAINER.getJdbcUrl());
    }

    @Override
    public void stop() {
        POSTGRES_CONTAINER.stop();
    }
}
