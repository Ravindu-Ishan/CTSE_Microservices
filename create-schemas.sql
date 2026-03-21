-- ----------------------------------------------------------------
-- OTSS Microservice databases
-- ----------------------------------------------------------------
CREATE DATABASE otss_user_service;
CREATE DATABASE otss_ticket_service;
CREATE DATABASE otss_queue_service;
CREATE DATABASE otss_notification_service;

-- ----------------------------------------------------------------
-- WSO2 Identity Server database
-- Schemas separate logical concerns inside one DB.
-- ----------------------------------------------------------------
CREATE DATABASE otss_wso2_iam;

-- ----------------------------------------------------------------
-- WSO2 schemas inside otss_wso2_iam
-- Must connect to otss_wso2_iam to create these.
-- ----------------------------------------------------------------
\connect otss_wso2_iam;

CREATE SCHEMA IF NOT EXISTS wso2_identity;
CREATE SCHEMA IF NOT EXISTS wso2_shared;
CREATE SCHEMA IF NOT EXISTS wso2_consent;