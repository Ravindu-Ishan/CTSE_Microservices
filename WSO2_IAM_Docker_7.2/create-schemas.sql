-- ============================================================
-- init-db/01-schemas.sql
-- Runs once on first postgres container boot.
-- Creates all schemas needed by WSO2 IS and user-service.
-- ============================================================

-- WSO2 Identity Server schemas (single DB, multiple schemas)
CREATE SCHEMA IF NOT EXISTS wso2_identity;
CREATE SCHEMA IF NOT EXISTS wso2_shared;
CREATE SCHEMA IF NOT EXISTS wso2_consent;
