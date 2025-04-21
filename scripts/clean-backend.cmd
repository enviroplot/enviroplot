@echo off
echo 🧹 Cleaning backend...

cd apps\backend
if exist node_modules rd /s /q node_modules
if exist dist rd /s /q dist
if exist package-lock.json del /f package-lock.json

echo ✅ Backend cleaned.