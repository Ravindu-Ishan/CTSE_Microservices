# OTSS Kafka — Local Development

Kafka in **KRaft mode** (no ZooKeeper) with a web UI for local development.

## Stack

| Service | Image | Port |
|---|---|---|
| Kafka broker | `confluentinc/cp-kafka:7.8.0` | `9092` (external) |
| Kafka UI | `provectuslabs/kafka-ui:latest` | `8080` |

## Usage

```bash
# Start Kafka + UI
docker compose up -d

# Check status
docker compose ps

# Stop (keeps volume data)
docker compose down

# Full teardown including data
docker compose down -v
```

## Topics

Topics are auto-created by the `kafka-init` service on startup:

| Topic | Producer | Consumers |
|---|---|---|
| `ticket.created` | Ticket Service | Queue Service, Notification Service |
| `ticket.updated` | Ticket Service | Notification Service |
| `ticket.closed` | Ticket Service | Queue Service, Notification Service |

## Connecting your services

### From your local machine (running services with `npm run start:dev`)
```
KAFKA_BROKERS=localhost:9092
```

### From within Docker network (other compose stacks)
```
KAFKA_BROKERS=kafka:29092
```

The `otss_kafka_net` network is declared as external so any other
`docker-compose.yml` in this project can join it by adding:

```yaml
networks:
  otss_kafka_net:
    external: true
```

## Kafka UI

Open **http://localhost:8080** to browse:
- Topics and messages
- Consumer groups and lag
- Broker health
- Produce test messages
