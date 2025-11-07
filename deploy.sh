#!/bin/bash

# hostlist='bh4tdv.nrlptt.com'

hostlist='nrlptt.com  ba1gm.nrlptt.com nrlptt.bd4vki.xyz bd4vki.nrlptt.com ah.nrlptt.com nrl.bd4two.site ptt.nrlptt.com bh1osw.nrlptt.com yz.hamoa.cn ham.73ham.com bd4two.nrlptt.com js.nrlptt.com bg1vif.nrlptt.com usa.nrlptt.com nrl.bd4two.site'

#hostlist='js.nrlptt.com'
#hostlist="ptt.nrlptt.com"
#hostlist='nrl.bd4two.site'

#hostlist='bh1osw.nrlptt.com'
#hostlist='nrlptt.bd4vki.xyz'

time=`date "+%Y%m%d%H%M%S"`

yarn lint --fix
yarn build:prod


for i in $hostlist ; do
echo "deploying to $i"
 ssh root@$i "cd /nrllink; mv www www.$time; mkdir www "
 scp -r dist/* root@$i:/nrllink/www/


done

