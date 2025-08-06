#!/bin/bash

echo "Building CeceLearningPortal Backend..."
echo "======================================"

cd CeceLearningPortal.Backend

# Build the solution
dotnet build CeceLearningPortal.sln

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Build successful!"
    echo ""
    echo "To run the backend API:"
    echo "  cd CeceLearningPortal.Backend/CeceLearningPortal.Api"
    echo "  dotnet run"
else
    echo ""
    echo "✗ Build failed. Please check the error messages above."
    exit 1
fi