@echo off
echo Starting OR Board...
start http://localhost:5000
caddy_windows_amd64.exe file-server --root app/dist --listen :5000