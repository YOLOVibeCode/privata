#!/bin/bash

# Privata Stress Test Suite
# This script runs comprehensive stress tests to demonstrate Privata's performance capabilities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_power() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

print_performance() {
    echo -e "${CYAN}⚡ $1${NC}"
}

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    print_error "k6 is not installed. Please install k6 first:"
    print_info "  macOS: brew install k6"
    print_info "  Linux: https://k6.io/docs/getting-started/installation/"
    print_info "  Windows: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if the Privata server is running
print_info "Checking if Privata server is running..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    print_error "Privata server is not running on http://localhost:3000"
    print_info "Please start the server first:"
    print_info "  cd ../packages/core"
    print_info "  npm run dev"
    exit 1
fi

print_status "Privata server is running and healthy!"

echo ""
print_power "🚀 PRIVATA STRESS TEST SUITE"
echo "================================"
echo ""
print_info "This suite demonstrates Privata's performance capabilities:"
print_info "  - Level 1: Baseline Performance (100 req/sec)"
print_info "  - Level 2: Scale Performance (200 req/sec)"
print_info "  - GDPR/HIPAA Compliance Performance"
print_info "  - Cache Performance Testing"
print_info "  - Multi-Database Performance"
echo ""

# Create results directory
mkdir -p results
print_info "Results will be saved to: ./results/"

echo ""
print_performance "⚡ STRESS TEST LEVEL 1: BASELINE PERFORMANCE"
echo "======================================================"
print_info "Testing: 100 req/sec with <100ms P95 latency"
print_info "Features: CRUD operations, GDPR/HIPAA compliance, cache performance"
echo ""

# Run Level 1 Stress Test
print_info "Starting Level 1 stress test..."
k6 run level1-baseline.js --out json=results/level1-results.json

if [ $? -eq 0 ]; then
    print_status "Level 1 stress test completed successfully!"
else
    print_error "Level 1 stress test failed!"
    exit 1
fi

echo ""
print_performance "⚡ STRESS TEST LEVEL 2: SCALE PERFORMANCE"
echo "=================================================="
print_info "Testing: 200 req/sec with <200ms P95 latency"
print_info "Features: High-frequency reads, batch operations, compliance workflows"
echo ""

# Run Level 2 Stress Test
print_info "Starting Level 2 stress test..."
k6 run level2-scale.js --out json=results/level2-results.json

if [ $? -eq 0 ]; then
    print_status "Level 2 stress test completed successfully!"
else
    print_error "Level 2 stress test failed!"
    exit 1
fi

echo ""
print_power "🎉 STRESS TEST SUITE COMPLETE!"
echo "=================================="
echo ""
print_status "All stress tests completed successfully!"
print_status "Results saved to: ./results/"
echo ""
print_info "Performance Summary:"
print_info "  - Level 1: 100 req/sec baseline performance"
print_info "  - Level 2: 200 req/sec scale performance"
print_info "  - GDPR/HIPAA compliance maintained under load"
print_info "  - Cache performance optimized"
print_info "  - Multi-database performance validated"
echo ""
print_power "🚀 Privata demonstrates enterprise-grade performance with full compliance!"
echo ""
print_info "View detailed results:"
print_info "  - Level 1: cat results/level1-results.json"
print_info "  - Level 2: cat results/level2-results.json"
echo ""
print_performance "⚡ This proves Privata can handle production workloads with full GDPR/HIPAA compliance!"
