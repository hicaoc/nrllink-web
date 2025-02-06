rem yarn  lint --fix
rem yarn build:prod



echo update bh4tdv  ....
ssh root@nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@nrlptt.com:/nrllink/www/

echo update ba1gm  ....
ssh root@ba1gm.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@ba1gm.nrlptt.com:/nrllink/www/

