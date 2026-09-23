@echo off

start cmd /k cd "frontend" ^& call run.bat
start cmd /k cd "game-server" ^& call run.bat
start cmd /k cd "RCCServicerender" ^& call run.bat
start cmd /k cd "Roblox\Roblox.Website" ^& call run.bat
start cmd /k cd "AssetValidationServiceV2" ^& call run.bat