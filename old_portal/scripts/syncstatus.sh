 #!/bin/bash
#curl -sw '' "http://$1:3000/syncstatus/sync_failed_job?appName=$2&&token=$3"
curl -sw '' "https://$1:3000/syncstatus/sync_failed_job?appName=$2&&token=$3"
echo ""
