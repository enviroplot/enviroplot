@echo off
echo 🧹 Cleaning frontend...

cd apps\frontend
if exist node_modules rd /s /q node_modules
if exist .next rd /s /q .next
if exist package-lock.json del /f package-lock.json

echo ✅ Frontend cleaned.
