rem yarn  lint --fix
rem yarn build:prod

echo update   ....
ssh root@121.5.120.167 "rm -fr /udphub/www/*"
scp -r dist/* root@121.5.120.167:/udphub/www/



