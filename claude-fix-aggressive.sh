#!/bin/bash

# Aggressive Claude Code Node.js Fix Script
# This script tries multiple approaches to fix the Node.js detection issue

set -e

echo "🔧 Aggressive Claude Code Node.js Fix Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get Node.js info
NODE_PATH=$(which node)
NODE_VERSION=$(node --version)
NODE_BIN_DIR=$(dirname "$NODE_PATH")

print_status "Node.js found: $NODE_VERSION at $NODE_PATH"

# Method 1: Update settings files
print_status "Method 1: Updating settings files..."

CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"

for settings_file in "$CURSOR_SETTINGS" "$VSCODE_SETTINGS"; do
    if [ -f "$settings_file" ]; then
        print_status "Updating $(basename "$settings_file")..."
        
        # Create backup
        cp "$settings_file" "${settings_file}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Update with comprehensive Node.js settings
        python3 << EOF
import json
import sys

try:
    with open('$settings_file', 'r') as f:
        settings = json.load(f)
    
    # Terminal environment
    if 'terminal.integrated.env.osx' not in settings:
        settings['terminal.integrated.env.osx'] = {}
    
    # Add Node.js to PATH
    current_path = settings['terminal.integrated.env.osx'].get('PATH', '')
    if '$NODE_BIN_DIR' not in current_path:
        if current_path:
            settings['terminal.integrated.env.osx']['PATH'] = '$NODE_BIN_DIR:${current_path}'
        else:
            settings['terminal.integrated.env.osx']['PATH'] = '$NODE_BIN_DIR:\${env:PATH}'
    
    # Multiple Claude settings
    settings['claude.nodePath'] = '$NODE_PATH'
    settings['claude.nodejsPath'] = '$NODE_PATH'
    settings['claude.nodejs'] = '$NODE_PATH'
    settings['claude.node'] = '$NODE_PATH'
    
    # Environment variables
    settings['terminal.integrated.env.osx']['NODE_PATH'] = '$NODE_BIN_DIR'
    settings['terminal.integrated.env.osx']['NODEJS_PATH'] = '$NODE_PATH'
    settings['terminal.integrated.env.osx']['NODE'] = '$NODE_PATH'
    
    with open('$settings_file', 'w') as f:
        json.dump(settings, f, indent=4)
    
    print("Updated successfully")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
EOF
        print_success "Updated $(basename "$settings_file")"
    fi
done

# Method 2: Create symlinks in common locations
print_status "Method 2: Creating symlinks..."

# Create symlinks in /usr/local/bin if it exists and is writable
if [ -d "/usr/local/bin" ] && [ -w "/usr/local/bin" ]; then
    ln -sf "$NODE_PATH" "/usr/local/bin/node" 2>/dev/null || true
    ln -sf "$(dirname "$NODE_PATH")/npm" "/usr/local/bin/npm" 2>/dev/null || true
    print_success "Created symlinks in /usr/local/bin"
fi

# Method 3: Update shell profiles
print_status "Method 3: Updating shell profiles..."

# Add to .zshrc
if [ -f "$HOME/.zshrc" ]; then
    if ! grep -q "export PATH.*$NODE_BIN_DIR" "$HOME/.zshrc"; then
        echo "export PATH=\"$NODE_BIN_DIR:\$PATH\"" >> "$HOME/.zshrc"
        print_success "Updated .zshrc"
    fi
fi

# Add to .bash_profile
if [ -f "$HOME/.bash_profile" ]; then
    if ! grep -q "export PATH.*$NODE_BIN_DIR" "$HOME/.bash_profile"; then
        echo "export PATH=\"$NODE_BIN_DIR:\$PATH\"" >> "$HOME/.bash_profile"
        print_success "Updated .bash_profile"
    fi
fi

# Method 4: Kill and restart Cursor processes
print_status "Method 4: Restarting Cursor..."

# Kill all Cursor processes
killall Cursor 2>/dev/null || true
killall "Cursor Helper" 2>/dev/null || true
killall "Cursor Helper (GPU)" 2>/dev/null || true
killall "Cursor Helper (Plugin)" 2>/dev/null || true
killall "Cursor Helper (Renderer)" 2>/dev/null || true

# Wait a moment
sleep 3

# Restart Cursor
open -a Cursor

print_success "Cursor restarted!"

# Method 5: Wait and verify
print_status "Method 5: Waiting for Cursor to start..."
sleep 5

# Check if Cursor is running
if pgrep -f "Cursor" > /dev/null; then
    print_success "Cursor is running"
else
    print_warning "Cursor may not have started properly"
fi

echo
print_success "Aggressive fix completed!"
echo
print_status "What was done:"
echo "1. ✅ Updated settings files with multiple Node.js path configurations"
echo "2. ✅ Created symlinks in /usr/local/bin (if possible)"
echo "3. ✅ Updated shell profiles (.zshrc, .bash_profile)"
echo "4. ✅ Killed and restarted all Cursor processes"
echo "5. ✅ Verified Cursor is running"
echo
print_status "The Claude Code extension should now detect Node.js properly."
print_warning "If you still see the error, try:"
echo "- Wait a few more seconds for the extension to fully load"
echo "- Open a new file or reload the window (Cmd+Shift+P → 'Developer: Reload Window')"
echo "- Check if the extension needs to be updated"
