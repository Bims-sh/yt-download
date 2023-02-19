# /bin/sh

while true
do
echo Starting service...
node index.js
echo Service crashed.
echo Restarting service...
sleep 1
done
