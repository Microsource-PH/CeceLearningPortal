#!/bin/bash

echo "Fixing file encoding issues..."

# Function to check if file is binary
is_binary() {
    file -b --mime-encoding "$1" | grep -q "binary"
}

# Function to remove BOM from UTF-8 files
remove_bom() {
    local file="$1"
    if [ -f "$file" ] && ! is_binary "$file"; then
        # Check if file has UTF-8 BOM
        if head -c 3 "$file" | grep -q $'\xef\xbb\xbf'; then
            echo "Removing BOM from: $file"
            # Remove BOM
            tail -c +4 "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        fi
    fi
}

# Convert CRLF to LF (optional - uncomment if needed)
# convert_line_endings() {
#     local file="$1"
#     if [ -f "$file" ] && ! is_binary "$file"; then
#         dos2unix "$file" 2>/dev/null || sed -i 's/\r$//' "$file"
#     fi
# }

# Find and fix all text files
find . -type f \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" -o \
    -name "*.css" -o \
    -name "*.scss" -o \
    -name "*.html" -o \
    -name "*.md" -o \
    -name "*.txt" -o \
    -name "*.yml" -o \
    -name "*.yaml" -o \
    -name "*.xml" -o \
    -name "*.cs" -o \
    -name "*.csproj" -o \
    -name "*.sln" \
\) -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r file; do
    remove_bom "$file"
    # convert_line_endings "$file"  # Uncomment if you want to convert line endings
done

echo "Encoding fix completed!"
echo "Please restart VSCode to see the changes."