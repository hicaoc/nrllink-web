rem yarn  lint --fix
rem yarn build:prod



echo update bg6fcs  ....
ssh root@121.5.149.170 "rm -fr /udphub/www/*"
scp -r dist/* root@121.5.149.170:/udphub/www/


echo update bh4aiu....
ssh -p 9022 root@bh4aiu.cn "rm -fr /udphub/www/*"
scp -p 9022 -r dist/* root@bh4aiu.cn:/udphub/www/



echo update bh4tih....
ssh   root@bh4tih.nrllink.net "rm -fr /udphub/www/*"
scp  -r dist/* root@bh4tih.nrllink.net:/udphub/www/

