#!/bin/bash

DATE=$(date +"%Y-%m-%d_%H:%M")

PATH=/home/pi/Projects/spybot/captures/$DATE.jpg

/usr/bin/raspistill -vf -hf -a 12 -w 800 -h 600 -o $PATH

echo $PATH

