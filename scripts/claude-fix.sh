#!/bin/bash

# Claude Code Node.js Fix Script
# This script fixes the "Node.js version 18 or higher" error in Claude Code/Cursor
# Usage: ./claude-fix.sh or bash claude-fix.sh

set -e

echo "🔧 Claude Code Node.js Fix Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        NODE_PATH=$(which node)
        print_success "Node.js found: $NODE_VERSION at $NODE_PATH"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version is compatible (v$NODE_MAJOR_VERSION >= 18)"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            return 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        return 1
    fi
}

# Find VS Code/Cursor settings files
find_settings_files() {
    print_status "Looking for VS Code/Cursor settings files..."
    
    SETTINGS_FILES=()
    
    # Check for VS Code
    VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
    if [ -f "$VSCODE_SETTINGS" ]; then
        SETTINGS_FILES+=("$VSCODE_SETTINGS")
        print_success "Found VS Code settings: $VSCODE_SETTINGS"
    fi
    
    # Check for Cursor
    CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
    if [ -f "$CURSOR_SETTINGS" ]; then
        SETTINGS_FILES+=("$CURSOR_SETTINGS")
        print_success "Found Cursor settings: $CURSOR_SETTINGS"
    fi
    
    if [ ${#SETTINGS_FILES[@]} -eq 0 ]; then
        print_warning "No VS Code or Cursor settings files found."
        return 1
    fi
    
    return 0
}

# Backup settings file
backup_settings() {
    local settings_file="$1"
    local backup_file="${settings_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    print_status "Creating backup: $backup_file"
    cp "$settings_file" "$backup_file"
    print_success "Backup created successfully"
}

# Update settings file
update_settings() {
    local settings_file="$1"
    local node_path="$2"
    local node_bin_dir=$(dirname "$node_path")
    
    print_status "Updating settings file: $settings_file"
    
    # Create a temporary file for the updated settings
    local temp_file=$(mktemp)
    
    # Check if the file is valid JSON
    if ! python3 -m json.tool "$settings_file" > /dev/null 2>&1; then
        print_error "Invalid JSON in settings file. Please fix manually."
        return 1
    fi
    
    # Use Python to update the JSON
    python3 << EOF
import json
import sys

try:
    with open('$settings_file', 'r') as f:
        settings = json.load(f)
    
    # Update terminal.integrated.env.osx
    if 'terminal.integrated.env.osx' not in settings:
        settings['terminal.integrated.env.osx'] = {}
    
    # Add Node.js path to PATH
    current_path = settings['terminal.integrated.env.osx'].get('PATH', '')
    if '$node_bin_dir' not in current_path:
        if current_path:
            settings['terminal.integrated.env.osx']['PATH'] = '$node_bin_dir:${current_path}'
        else:
            settings['terminal.integrated.env.osx']['PATH'] = '$node_bin_dir:\${env:PATH}'
    
    # Add multiple Claude-related settings
    settings['claude.nodePath'] = '$node_path'
    settings['claude.nodejsPath'] = '$node_path'
    settings['claude.nodejs'] = '$node_path'
    
    # Add environment variables for Node.js (multiple variations for compatibility)
    settings['terminal.integrated.env.osx']['NODE_PATH'] = '$node_bin_dir'      # Node.js module path
    settings['terminal.integrated.env.osx']['NODEJS_PATH'] = '$node_path'       # Node.js executable path
    settings['terminal.integrated.env.osx']['NODE'] = '$node_path'              # Direct Node.js reference
    
    with open('$settings_file', 'w') as f:
        json.dump(settings, f, indent=4)
    
    print("Settings updated successfully")
    
except Exception as e:
    print(f"Error updating settings: {e}")
    sys.exit(1)
EOF
    
    if [ $? -eq 0 ]; then
        print_success "Settings updated successfully"
        return 0
    else
        print_error "Failed to update settings"
        return 1
    fi
}

# Main function
main() {
    echo
    print_status "Starting Claude Code Node.js fix..."
    echo
    
    # Check Node.js
    if ! check_node; then
        print_error "Node.js check failed. Please install Node.js 18 or higher first."
        exit 1
    fi
    
    # Find settings files
    if ! find_settings_files; then
        print_error "No settings files found. Please make sure VS Code or Cursor is installed."
        exit 1
    fi
    
    # Update each settings file
    for settings_file in "${SETTINGS_FILES[@]}"; do
        echo
        print_status "Processing: $(basename "$settings_file")"
        
        # Create backup
        backup_settings "$settings_file"
        
        # Update settings
        if update_settings "$settings_file" "$NODE_PATH"; then
            print_success "Successfully updated $(basename "$settings_file")"
        else
            print_error "Failed to update $(basename "$settings_file")"
        fi
    done
    
    echo
    print_success "Claude Code Node.js fix completed!"
    echo
    print_status "Next steps:"
    echo "1. Reload your editor window (Cmd+Shift+P → 'Developer: Reload Window')"
    echo "2. Or fully restart VS Code/Cursor"
    echo "3. The Claude Code extension should now detect Node.js properly"
    echo
    print_warning "Backup files were created with timestamp in case you need to restore"
    
    # Ask if user wants to restart Cursor
    echo
    read -p "Would you like to restart Cursor now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restarting Cursor..."
        killall Cursor 2>/dev/null || true
        sleep 2
        open -a Cursor
        print_success "Cursor restarted!"
    fi
}

# Run main function
main "$@"


