rem yarn  lint --fix
rem yarn build:prod



echo update bh4tdv  ....
ssh root@nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@nrlptt.com:/nrllink/www/

echo update ba1gm  ....
ssh root@ba1gm.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@ba1gm.nrlptt.com:/nrllink/www/

echo update bh4tdv  ....
ssh root@bh4tdv.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@bh4tdv.nrlptt.com:/nrllink/www/

echo update bd4two  ....
ssh root@bd4two.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@bd4two.nrlptt.com:/nrllink/www/

echo update bd4vki  ....
ssh root@bd4vki.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@bd4vki.nrlptt.com:/nrllink/www/

echo update bg6fcs ah  ....
ssh root@ah.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@ah.nrlptt.com:/nrllink/www/

echo update bg6fcs ptt  ....
ssh root@ptt.nrlptt.com "rm -fr /nrllink/www/*"
scp -r dist/* root@ptt.nrlptt.com:/nrllink/www/

echo update bh1osw  ....
ssh root@www.bh1osw.com "rm -fr /nrllink/www/*"
scp -r dist/* root@www.bh1osw.com:/nrllink/www/

echo update bi4umd  ....
ssh root@yz.hamoa.cn "rm -fr /nrllink/www/*"
scp -r dist/* root@yz.hamoa.cn:/nrllink/www/





