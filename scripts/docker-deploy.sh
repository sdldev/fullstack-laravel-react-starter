#!/bin/bash
# Docker Deployment Helper Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

check_docker() {
    if ! command -v docker &> /dev/null || ! command -v docker compose &> /dev/null; then
        print_error "Docker or Docker Compose not installed"
        exit 1
    fi
    print_success "Docker installed"
}

check_env() {
    if [ ! -f .env ]; then
        if [ -f .env.docker ]; then
            cp .env.docker .env
            print_warning "Created .env from template - please review and update"
            exit 0
        fi
        print_error ".env file not found"
        exit 1
    fi
    print_success ".env file exists"
}

main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Laravel Docker Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_docker
    check_env
    
    print_info "Building Docker images..."
    docker compose build app
    print_success "Images built"
    
    print_info "Starting services..."
    docker compose up -d
    print_success "Services started"
    
    echo ""
    echo "Services:"
    docker compose ps
    echo ""
    echo "URLs:"
    echo "  App: http://localhost:8000"
    echo "  Health: http://localhost:8000/health"
    echo ""
}

main
