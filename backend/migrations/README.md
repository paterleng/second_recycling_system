Generic single-database configuration for Alembic.

This directory contains Alembic migration scripts for the AI Phone Inspection System.

## Directory Structure

- `env.py` - Migration environment configuration
- `script.py.mako` - Template for generating migration scripts
- `versions/` - Directory containing migration version files
- `alembic.ini` - Alembic configuration file (in parent directory)

## Usage

### Initialize database
```bash
cd backend
alembic upgrade head
```

### Create new migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

### View migration history
```bash
alembic history
```

### View current version
```bash
alembic current
```

## Migration Best Practices

1. Always review auto-generated migrations before applying
2. Test migrations on development database first
3. Backup production database before major migrations
4. Use descriptive messages for migration revisions
5. Keep migrations atomic and reversible when possible