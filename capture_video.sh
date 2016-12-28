#!/bin/bash

DATE=$(date +"%Y-%m-%d_%H:%M")
RAW_PATH=/home/pi/Projects/spybot/captures/video/$DATE.h264
PATH=/home/pi/Projects/spybot/captures/video/$DATE.mp4

/usr/bin/raspivid -t 10000 -w 640 -h 480 -o $RAW_PATH
/usr/bin/MP4Box -fps 30 -add $RAW_PATH $PATH
/bin/rm $RAW_PATH

echo $PATH
