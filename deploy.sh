#!/bin/bash

# hostlist='bh4tdv.nrlptt.com'

hostlist='182.92.158.141 nrlptt.com  ba1gm.nrlptt.com nrlptt.bd4vki.xyz bd4vki.nrlptt.com ah.nrlptt.com nrl.bd4two.site ptt.nrlptt.com bh1osw.nrlptt.com yz.hamoa.cn ham.73ham.com bd4two.nrlptt.com js.nrlptt.com bg1vif.nrlptt.com usa.nrlptt.com nrl.bd4two.site yz.hamuv.com'

#hostlist='js.nrlptt.com'
#hostlist="ptt.nrlptt.com"
#hostlist='nrl.bd4two.site'

#hostlist='bh1osw.nrlptt.com'
#hostlist='nrlptt.bd4vki.xyz'
#hostlist='nrlptt.com'
#hostlist='bd4vki.nrlptt.com'
#hostlist='yz.hamuv.com'

hostlist="182.92.158.141"

time=`date "+%Y%m%d%H%M%S"`

#yarn lint --fix
#yarn build:prod

ssh root@192.168.35.40 "cd /root/nrllink/nrllink; rm -rf www; mkdir www "
scp -r *  root@192.168.35.40:/root/nrllink/nrllink/www/

for i in $hostlist ; do
echo "deploying to $i"
 ssh root@$i "cd /nrllink; mv www www.$time; mkdir www "
 scp -r dist/* root@$i:/nrllink/www/


done

