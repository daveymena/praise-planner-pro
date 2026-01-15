#!/bin/bash
# Praise Planner Pro - Management Script

case "$1" in
  backup)
    echo "Creating backup of database..."
    cp server/database.sqlite server/database.sqlite.bak
    echo "Backup created: server/database.sqlite.bak"
    ;;
  update)
    echo "Updating application from Git..."
    git pull origin main
    npm install
    cd server && npm install
    cd ..
    npm run build
    echo "Update complete. Please restart the service if needed."
    ;;
  reset-admin)
    echo "Resetting admin user..."
    cd server && node reset-admin.js
    ;;
  seed)
    echo "Seeding database with initial data..."
    cd server && npm run seed
    ;;
  logs)
    echo "Showing backend logs..."
    tail -f server/server.log 2>/dev/null || echo "Logs not found. Check Easypanel container logs."
    ;;
  *)
    echo "Usage: ./manage.sh {backup|update|reset-admin|seed|logs}"
    exit 1
    ;;
esac
