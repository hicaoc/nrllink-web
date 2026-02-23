#!/usr/bin/env bash

set -euo pipefail

# hostlist='bh4tdv.nrlptt.com'
hostlist='182.92.158.141 nrlptt.com ba1gm.nrlptt.com nrlptt.bd4vki.xyz bd4vki.nrlptt.com ah.nrlptt.com nrl.bd4two.site ptt.nrlptt.com bh1osw.nrlptt.com yz.hamoa.cn ham.73ham.com bd4two.nrlptt.com js.nrlptt.com bg1vif.nrlptt.com usa.nrlptt.com yz.hamuv.com'

# 调试单机时可覆盖：
hostlist=''
#hostlist="ptt.nrlptt.com"
#hostlist='nrl.bd4two.site'

#hostlist='bh1osw.nrlptt.com'
#hostlist='nrlptt.bd4vki.xyz'
#hostlist='nrlptt.com'
#hostlist='bd4vki.nrlptt.com'
#hostlist='yz.hamuv.com'

#hostlist="182.92.158.141"

timestamp="$(date '+%Y%m%d%H%M%S')"
release_name="www.${timestamp}"
dist_pkg="/tmp/nrllink-dist.${timestamp}.tar.gz"
remote_pkg="/tmp/$(basename "${dist_pkg}")"

# 可选：打包并同步当前工程到内网机
docker_host="192.168.35.40"
docker_target="/root/nrllink/nrllink/www"

# 可选：yarn lint --fix
# 可选：yarn build:prod

if [ ! -d dist ]; then
  echo "dist 目录不存在，先执行构建  yarn build:prod）"
  yarn build:prod
fi

cleanup() {
  rm -f "${dist_pkg}"
}
trap cleanup EXIT

echo "packing dist once: ${dist_pkg} ..."
tar -C dist -czf "${dist_pkg}" .

 
echo "deploying to ${docker_host} ..."
scp "${dist_pkg}" "root@${docker_host}:${remote_pkg}"
echo ssh "root@${docker_host}" "rm -rf '${docker_target}' && mkdir -p '${docker_target}' && tar -xzf '${remote_pkg}' -C '${docker_target}' && rm -f '${remote_pkg}'"

for host in $hostlist; do
  echo "deploying to ${host} ..."

 
  scp "${dist_pkg}" "root@${host}:${remote_pkg}"
  ssh "root@${host}" "mkdir -p '/nrllink/${release_name}' && tar -xzf '${remote_pkg}' -C '/nrllink/${release_name}' && rm -f '${remote_pkg}'"

  # 原子切换：先备份旧目录，再把新版本切成 www
  ssh "root@${host}" "
    set -e
    cd /nrllink
    if [ -d www ]; then mv www 'www.bak.${timestamp}'; fi
    mv '${release_name}' www
  "
done

echo "deploy finished."
