#!/bin/bash
serverUrl="https://portal.revsw.net:3000"

echo "Creating Heat map Job details"
curl -X POST -H "Content-Type: application/json" -T accessToken.json $serverUrl/domain/addAllDomainsHeatMapJobDetails
echo ""
