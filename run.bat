@echo off
title Ecommerce-shop-server By flebedev77

echo "---------------------"
echo "|   by flebedev77   |"
echo "---------------------"
echo Booting up the server... (CTRL+C to exit)

:forever
node server.js
goto forever