rem yarn  lint --fix
rem yarn build:prod



echo update bh4tdv  ....
ssh root@101.34.62.67 "rm -fr /nrllink/www/*"
scp -r dist/* root@101.34.62.67:/nrllink/www/

