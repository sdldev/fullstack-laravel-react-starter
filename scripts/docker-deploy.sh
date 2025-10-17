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
    
    # Ask deployment mode
    echo ""
    echo "Deployment mode:"
    echo "1) Production (use pre-built images from GitHub)"
    echo "2) Development (build images locally)"
    read -p "Enter mode [1-2]: " mode
    
    # Set compose files based on mode
    if [ "$mode" == "2" ]; then
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
        print_info "Using development mode (local build)"
    else
        COMPOSE_FILES=""
        print_info "Using production mode (pre-built images)"
    fi
    
    # Ask user which services to deploy
    echo ""
    echo "Which services do you want to deploy?"
    echo "1) Application only (app, redis, queue, scheduler)"
    echo "2) Infrastructure only (mysql, minio, npmplus)"
    echo "3) All services (application + infrastructure)"
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            print_info "Deploying application services..."
            if [ "$mode" == "2" ]; then
                docker compose $COMPOSE_FILES build app queue scheduler
            fi
            docker compose $COMPOSE_FILES up -d
            ;;
        2)
            print_info "Deploying infrastructure services..."
            docker compose -f docker-compose.infrastructure.yml up -d
            ;;
        3)
            print_info "Deploying all services..."
            docker compose -f docker-compose.infrastructure.yml up -d
            print_info "Waiting for infrastructure to be ready..."
            sleep 10
            if [ "$mode" == "2" ]; then
                docker compose $COMPOSE_FILES build app queue scheduler
            fi
            docker compose $COMPOSE_FILES up -d
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    print_success "Services deployed"
    
    echo ""
    echo "Services status:"
    if [ "$choice" == "1" ] || [ "$choice" == "3" ]; then
        docker compose ps
    fi
    if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
        docker compose -f docker-compose.infrastructure.yml ps
    fi
    
    echo ""
    echo "URLs:"
    echo "  App: http://localhost:8000"
    echo "  Health: http://localhost:8000/health"
    if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
        echo "  MinIO Console: http://localhost:9001"
        echo "  NPMplus Admin: http://localhost:81"
    fi
    echo ""
}

main
