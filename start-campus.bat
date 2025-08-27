@echo off
REM IIT Hyderabad Scopus Dashboard Startup Script
REM For campus deployment with IP-based Scopus subscription

echo 🏫 Starting IIT Hyderabad Research Analytics Dashboard...
echo 📊 Campus IP-based Scopus subscription detected
echo 🚀 Dashboard will be available at: http://localhost:5175
echo.

REM Start the development server
npm run dev
