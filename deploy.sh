#!/bin/bash
# yarn build:prod



echo  update ....
ssh root@150.158.20.247 "rm -fr /udphub/www/*"
scp -r dist/* root@150.158.20.247:/udphub/www/
